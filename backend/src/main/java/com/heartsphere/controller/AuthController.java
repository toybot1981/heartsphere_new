package com.heartsphere.controller;

import com.heartsphere.dto.LoginRequest;
import com.heartsphere.dto.RegisterRequest;
import com.heartsphere.dto.WorldDTO;
import com.heartsphere.entity.User;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.entity.World;
import com.heartsphere.repository.WorldRepository;
import java.util.List;
import java.util.stream.Collectors;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.InitializationService;
import com.heartsphere.utils.JwtUtils;
import com.heartsphere.utils.DTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.exception.UnauthorizedException;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.dto.ApiResponse;

import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    InitializationService initializationService;

    @Autowired
    WorldRepository worldRepository;

    @Autowired
    com.heartsphere.admin.service.InviteCodeService inviteCodeService;

    @Autowired
    com.heartsphere.admin.service.SystemConfigService systemConfigService;

    @Autowired
    com.heartsphere.service.EmailService emailService;

    @Autowired
    com.heartsphere.service.EmailVerificationCodeService emailVerificationCodeService;

    @Autowired
    com.heartsphere.mailbox.listener.ESoulLetterTriggerListener esoulLetterTriggerListener;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("用户", null));

            // 获取上次登录时间（如果User实体有lastLoginTime字段）
            java.time.LocalDateTime lastLoginTime = null;
            try {
                // 尝试从User实体获取lastLoginTime字段
                // 如果User实体没有这个字段，可以查询最近一次登录日志或其他方式获取
                // 这里暂时设为null，表示首次登录或无法确定上次登录时间
                // TODO: 如果User实体添加了lastLoginTime字段，可以取消注释
                // lastLoginTime = user.getLastLoginTime();
                
                // 更新最后登录时间为当前时间（如果User实体有该字段）
                // user.setLastLoginTime(java.time.LocalDateTime.now());
                // userRepository.save(user);
            } catch (Exception e) {
                // 获取上次登录时间失败不影响登录流程
                java.util.logging.Logger.getLogger(AuthController.class.getName())
                    .warning("获取上次登录时间失败: " + e.getMessage());
            }

            // 查询用户的世界，若为空则初始化，再次查询以返回最新数据
            List<World> userWorlds = worldRepository.findByUserId(user.getId());
            boolean isFirstLogin = userWorlds.isEmpty();
            if (isFirstLogin) {
                try {
                    initializationService.initializeUserData(user);
                    userWorlds = worldRepository.findByUserId(user.getId());
                } catch (Exception e) {
                    // 初始化失败不影响登录，记录日志即可
                    java.util.logging.Logger.getLogger(AuthController.class.getName())
                        .warning("用户数据初始化失败: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            // 触发E-SOUL来信（异步执行，不阻塞登录流程）
            try {
                esoulLetterTriggerListener.handleUserLogin(user.getId(), lastLoginTime);
            } catch (Exception e) {
                // E-SOUL来信触发失败不影响登录，记录日志即可
                java.util.logging.Logger.getLogger(AuthController.class.getName())
                    .warning("E-SOUL来信触发失败: " + e.getMessage());
                e.printStackTrace();
            }

            // 返回登录响应，包含首次登录标识
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", jwt);
            resp.put("id", user.getId());
            resp.put("username", user.getUsername());
            resp.put("email", user.getEmail());
            resp.put("nickname", user.getNickname());
            resp.put("avatar", user.getAvatar()); // 允许为 null
            resp.put("isFirstLogin", isFirstLogin);
            
            // 转换为DTO列表，确保没有循环引用
            // 手动构建简单的DTO，将 LocalDateTime 转换为字符串
            List<Map<String, Object>> worldDTOs = new java.util.ArrayList<>();
            for (World world : userWorlds) {
                try {
                    Map<String, Object> worldMap = new HashMap<>();
                    worldMap.put("id", world.getId());
                    worldMap.put("name", world.getName());
                    worldMap.put("description", world.getDescription());
                    worldMap.put("userId", world.getUserId());
                    // 将 LocalDateTime 转换为字符串
                    worldMap.put("createdAt", world.getCreatedAt() != null ? world.getCreatedAt().toString() : null);
                    worldMap.put("updatedAt", world.getUpdatedAt() != null ? world.getUpdatedAt().toString() : null);
                    worldDTOs.add(worldMap);
                } catch (Exception e) {
                    // 跳过有问题的世界
                    java.util.logging.Logger.getLogger(AuthController.class.getName())
                        .warning("世界序列化失败: " + e.getMessage());
                }
            }
            resp.put("worlds", worldDTOs);
            
            return ResponseEntity.ok(ApiResponse.success("登录成功", resp));
        } catch (org.springframework.security.core.AuthenticationException e) {
            // 认证异常（用户名或密码错误）
            throw new UnauthorizedException("用户名或密码错误");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerUser(
            @Valid @RequestBody RegisterRequest registerRequest) {
        // 检查是否需要邀请码
        boolean inviteCodeRequired = systemConfigService.isInviteCodeRequired();
        if (inviteCodeRequired) {
            if (registerRequest.getInviteCode() == null || registerRequest.getInviteCode().trim().isEmpty()) {
                throw new BusinessException("邀请码是必需的");
            }
            // 验证邀请码（但不核销，等用户创建成功后再核销）
            try {
                inviteCodeService.validateInviteCode(registerRequest.getInviteCode().trim());
            } catch (RuntimeException e) {
                throw new BusinessException(e.getMessage());
            }
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BusinessException("用户名已被使用");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BusinessException("邮箱已被使用");
        }

        // 检查是否需要邮箱验证码
        boolean emailVerificationRequired = systemConfigService.isEmailVerificationRequired();
        if (emailVerificationRequired) {
            // 验证邮箱验证码
            if (registerRequest.getEmailVerificationCode() == null || 
                registerRequest.getEmailVerificationCode().trim().isEmpty()) {
                throw new BusinessException("邮箱验证码不能为空");
            }
            
            boolean codeValid = emailVerificationCodeService.verifyCode(
                registerRequest.getEmail(), 
                registerRequest.getEmailVerificationCode().trim()
            );
            if (!codeValid) {
                throw new BusinessException("邮箱验证码错误或已过期");
            }
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));
        // 如果提供了nickname则使用，否则使用username作为默认值
        user.setNickname(registerRequest.getNickname() != null && !registerRequest.getNickname().trim().isEmpty() 
            ? registerRequest.getNickname().trim() 
            : registerRequest.getUsername());
        user.setIsEnabled(true); // 确保用户是启用状态

        userRepository.save(user);

        // 如果使用了邀请码，核销它
        if (inviteCodeRequired && registerRequest.getInviteCode() != null) {
            try {
                inviteCodeService.useInviteCode(registerRequest.getInviteCode().trim(), user.getId());
            } catch (RuntimeException e) {
                // 如果核销失败，记录日志但不影响注册流程（因为已经验证过了）
                java.util.logging.Logger.getLogger(AuthController.class.getName())
                    .warning("邀请码核销失败: " + e.getMessage());
            }
        }
        
        // 初始化用户数据（世界、时代、角色）
        initializationService.initializeUserData(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 新注册用户一定是首次登录
        boolean isFirstLogin = true;

        // 注册完成后查询初始化生成的世界列表，便于前端首屏使用
        List<World> userWorlds = worldRepository.findByUserId(user.getId());
        List<WorldDTO> worldDTOs = userWorlds.stream()
            .map(DTOMapper::toWorldDTO)
            .collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", jwt);
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("email", user.getEmail());
        resp.put("nickname", user.getNickname());
        resp.put("avatar", user.getAvatar()); // 允许为 null
        resp.put("isFirstLogin", isFirstLogin);
        resp.put("worlds", worldDTOs);

        return ResponseEntity.ok(ApiResponse.success("注册成功", resp));
    }

    @GetMapping("/invite-code-required")
    public ResponseEntity<Map<String, Object>> isInviteCodeRequired() {
        boolean required = systemConfigService.isInviteCodeRequired();
        return ResponseEntity.ok(Map.of("inviteCodeRequired", required));
    }

    @GetMapping("/email-verification-required")
    public ResponseEntity<Map<String, Object>> isEmailVerificationRequired() {
        boolean required = systemConfigService.isEmailVerificationRequired();
        return ResponseEntity.ok(Map.of("emailVerificationRequired", required));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(Authentication authentication) {
        try {
            // 检查认证信息是否存在
            if (authentication == null || authentication.getPrincipal() == null) {
                java.util.logging.Logger.getLogger(AuthController.class.getName())
                    .warning("getCurrentUser: authentication is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未授权：请重新登录"));
            }
            
            // 检查是否是匿名用户
            if (authentication.getPrincipal() instanceof String && 
                authentication.getPrincipal().equals("anonymousUser")) {
                java.util.logging.Logger.getLogger(AuthController.class.getName())
                    .warning("getCurrentUser: anonymous user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未授权：请重新登录"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("用户", null));

            return ResponseEntity.ok(ApiResponse.success(DTOMapper.toUserDTO(user)));
        } catch (ClassCastException e) {
            // 认证信息类型不匹配
            java.util.logging.Logger.getLogger(AuthController.class.getName())
                .warning("getCurrentUser: ClassCastException - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("未授权：请重新登录"));
        } catch (Exception e) {
            // 记录错误日志
            java.util.logging.Logger.getLogger(AuthController.class.getName())
                .severe("getCurrentUser: Exception - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("服务器内部错误"));
        }
    }
}