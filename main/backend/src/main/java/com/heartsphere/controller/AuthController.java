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
import com.heartsphere.shared.util.JwtUtils;
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
import java.util.Optional;

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
    com.heartsphere.service.InviteCodeService inviteCodeService;

    @Autowired
    com.heartsphere.service.SystemConfigService systemConfigService;

    @Autowired
    com.heartsphere.service.EmailService emailService;

    @Autowired
    com.heartsphere.service.EmailVerificationCodeService emailVerificationCodeService;

    @Autowired
    com.heartsphere.mailbox.listener.ESoulLetterTriggerListener esoulLetterTriggerListener;

    @Autowired
    com.heartsphere.service.MembershipService membershipService;

    @Autowired
    com.heartsphere.service.GuestInitializationService guestInitializationService;

    @Autowired
    com.heartsphere.repository.SubscriptionPlanRepository subscriptionPlanRepository;

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
            @Valid @RequestBody RegisterRequest registerRequest,
            Authentication authentication) {
        
        // 检查当前用户是否为游客（体验会员）
        User existingGuestUser = null;
        boolean isGuestUpgrade = false;
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            existingGuestUser = userRepository.findById(userDetails.getId()).orElse(null);
            
            if (existingGuestUser != null) {
                // 检查是否为体验会员
                Optional<com.heartsphere.entity.Membership> membership = 
                    membershipService.getUserMembership(existingGuestUser.getId());
                if (membership.isPresent() && "trial".equals(membership.get().getPlanType())) {
                    isGuestUpgrade = true;
                }
            }
        }
        
        // 如果是游客升级，跳过用户名和邮箱唯一性检查（允许更新）
        if (!isGuestUpgrade) {
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
        } else {
            // 游客升级：检查新用户名和邮箱是否与其他用户冲突（排除当前游客用户）
            if (userRepository.existsByUsername(registerRequest.getUsername()) && 
                !existingGuestUser.getUsername().equals(registerRequest.getUsername())) {
                throw new BusinessException("用户名已被使用");
            }

            if (userRepository.existsByEmail(registerRequest.getEmail()) && 
                !existingGuestUser.getEmail().equals(registerRequest.getEmail())) {
                throw new BusinessException("邮箱已被使用");
            }
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

        User user;
        boolean isFirstLogin;
        
        if (isGuestUpgrade) {
            // 游客升级：更新现有用户信息
            user = existingGuestUser;
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(encoder.encode(registerRequest.getPassword()));
            user.setNickname(registerRequest.getNickname() != null && !registerRequest.getNickname().trim().isEmpty() 
                ? registerRequest.getNickname().trim() 
                : registerRequest.getUsername());
            user.setIsEnabled(true);
            userRepository.save(user);
            
            // 升级会员类型为免费会员（或用户选择的会员）
            membershipService.getOrCreateFreeMembership(user.getId());
            
            // 检查是否需要初始化（如果用户还没有世界数据）
            List<World> existingWorlds = worldRepository.findByUserId(user.getId());
            if (existingWorlds.isEmpty()) {
                initializationService.initializeUserData(user);
            }
            isFirstLogin = existingWorlds.isEmpty();
        } else {
            // 新用户注册
            user = new User();
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
            boolean inviteCodeRequired = systemConfigService.isInviteCodeRequired();
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
            isFirstLogin = true;
        }

        // 重新认证（使用新密码）
        Authentication newAuthentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(newAuthentication);
        String jwt = jwtUtils.generateJwtToken(newAuthentication);

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

    /**
     * 游客注册为正式用户 - 独立接口
     */
    @PostMapping("/guest-register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> guestRegister(
            @Valid @RequestBody RegisterRequest registerRequest,
            Authentication authentication) {
        try {
            // 检查当前用户是否为游客（体验会员）
            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                throw new UnauthorizedException("请先以游客身份登录");
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User existingGuestUser = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("用户", userDetails.getId()));
            
            // 检查是否为体验会员
            Optional<com.heartsphere.entity.Membership> membership = 
                membershipService.getUserMembership(existingGuestUser.getId());
            if (membership.isEmpty() || !"trial".equals(membership.get().getPlanType())) {
                throw new BusinessException("当前用户不是游客，请使用正式用户注册接口");
            }
            
            // 检查新用户名和邮箱是否与其他用户冲突（排除当前游客用户）
            if (userRepository.existsByUsername(registerRequest.getUsername()) && 
                !existingGuestUser.getUsername().equals(registerRequest.getUsername())) {
                throw new BusinessException("用户名已被使用");
            }

            if (userRepository.existsByEmail(registerRequest.getEmail()) && 
                !existingGuestUser.getEmail().equals(registerRequest.getEmail())) {
                throw new BusinessException("邮箱已被使用");
            }
            
            // 检查是否需要邮箱验证码
            boolean emailVerificationRequired = systemConfigService.isEmailVerificationRequired();
            if (emailVerificationRequired) {
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
            
            // 更新游客用户信息
            existingGuestUser.setUsername(registerRequest.getUsername());
            existingGuestUser.setEmail(registerRequest.getEmail());
            existingGuestUser.setPassword(encoder.encode(registerRequest.getPassword()));
            existingGuestUser.setNickname(registerRequest.getNickname() != null && !registerRequest.getNickname().trim().isEmpty() 
                ? registerRequest.getNickname().trim() 
                : registerRequest.getUsername());
            existingGuestUser.setIsEnabled(true);
            userRepository.save(existingGuestUser);
            
            // 升级会员类型为免费会员
            membershipService.getOrCreateFreeMembership(existingGuestUser.getId());
            
            // 初始化个人场景和角色（首次创建）
            List<World> existingWorlds = worldRepository.findByUserId(existingGuestUser.getId());
            boolean isFirstLogin = existingWorlds.isEmpty();
            if (isFirstLogin) {
                initializationService.initializeUserData(existingGuestUser);
            }
            
            // 重新认证（使用新密码）
            Authentication newAuthentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(newAuthentication);
            String jwt = jwtUtils.generateJwtToken(newAuthentication);

            // 查询初始化生成的世界列表
            List<World> userWorlds = worldRepository.findByUserId(existingGuestUser.getId());
            List<WorldDTO> worldDTOs = userWorlds.stream()
                .map(DTOMapper::toWorldDTO)
                .collect(Collectors.toList());

            Map<String, Object> resp = new HashMap<>();
            resp.put("token", jwt);
            resp.put("id", existingGuestUser.getId());
            resp.put("username", existingGuestUser.getUsername());
            resp.put("email", existingGuestUser.getEmail());
            resp.put("nickname", existingGuestUser.getNickname());
            resp.put("avatar", existingGuestUser.getAvatar());
            resp.put("isGuest", false);
            resp.put("isFirstLogin", isFirstLogin);
            resp.put("worlds", worldDTOs);

            return ResponseEntity.ok(ApiResponse.success("注册成功，已升级为正式用户", resp));
        } catch (Exception e) {
            java.util.logging.Logger.getLogger(AuthController.class.getName())
                .severe("游客注册失败: " + e.getMessage());
            e.printStackTrace();
            if (e instanceof BusinessException || e instanceof UnauthorizedException) {
                throw e;
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("注册失败: " + e.getMessage()));
        }
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

    /**
     * 游客登录 - 访客名称即昵称并参与构成用户名；同名称再次进入则直接返回原账号 token
     */
    @PostMapping("/guest-login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> guestLogin(
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String nickname = (request != null && request.containsKey("nickname") && request.get("nickname") != null && !request.get("nickname").trim().isEmpty())
                ? request.get("nickname").trim()
                : "游客";

            // 再次进入：按昵称查找已存在的 guest（username 以 guest_ 开头），且为体验会员
            java.util.List<User> existingList = userRepository.findTop1ByNicknameAndUsernameStartingWithOrderByIdDesc(nickname, "guest_");
            if (!existingList.isEmpty()) {
                User existingGuest = existingList.get(0);
                Optional<com.heartsphere.entity.Membership> membership = membershipService.getUserMembership(existingGuest.getId());
                if (membership.isPresent() && "trial".equals(membership.get().getPlanType())) {
                    com.heartsphere.entity.Membership trialMembership = membership.get();
                    com.heartsphere.entity.SubscriptionPlan trialPlan = subscriptionPlanRepository.findByTypeAndIsActiveTrueOrderBySortOrderAsc("trial")
                        .stream().findFirst().orElse(null);
                    String jwt = jwtUtils.generateJwtTokenFromUsername(existingGuest.getUsername());
                    UserDetailsImpl userDetails = UserDetailsImpl.build(existingGuest);
                    SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
                    Map<String, Object> resp = buildGuestLoginResponse(existingGuest, jwt, trialMembership, trialPlan, false);
                    return ResponseEntity.ok(ApiResponse.success("游客登录成功", resp));
                }
            }

            // 新建访客：用户名由名称构成 guest_<slug>_<唯一后缀>
            String guestUsername = generateUniqueGuestUsername(nickname);
            String guestEmail = guestUsername + "@guest.temp";
            String randomPassword = java.util.UUID.randomUUID().toString();
            User guestUser = new User();
            guestUser.setUsername(guestUsername);
            guestUser.setEmail(guestEmail);
            guestUser.setPassword(encoder.encode(randomPassword));
            guestUser.setNickname(nickname);
            guestUser.setIsEnabled(true);
            guestUser = userRepository.save(guestUser);

            com.heartsphere.entity.Membership trialMembership = membershipService.getOrCreateTrialMembership(guestUser.getId());
            com.heartsphere.entity.SubscriptionPlan trialPlan = subscriptionPlanRepository.findByTypeAndIsActiveTrueOrderBySortOrderAsc("trial")
                .stream().findFirst().orElse(null);

            try {
                guestInitializationService.initializeForGuest(guestUser);
            } catch (Exception e) {
                java.util.logging.Logger.getLogger(AuthController.class.getName())
                    .warning("游客默认场景初始化失败: " + e.getMessage());
            }

            String jwt = jwtUtils.generateJwtTokenFromUsername(guestUser.getUsername());
            UserDetailsImpl userDetails = UserDetailsImpl.build(guestUser);
            SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
            Map<String, Object> resp = buildGuestLoginResponse(guestUser, jwt, trialMembership, trialPlan, true);
            return ResponseEntity.ok(ApiResponse.success("游客登录成功", resp));
        } catch (Exception e) {
            java.util.logging.Logger.getLogger(AuthController.class.getName())
                .severe("游客登录失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("游客登录失败: " + e.getMessage()));
        }
    }

    private Map<String, Object> buildGuestLoginResponse(User guestUser, String jwt,
            com.heartsphere.entity.Membership trialMembership,
            com.heartsphere.entity.SubscriptionPlan trialPlan, boolean isFirstLogin) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", jwt);
        resp.put("id", guestUser.getId());
        resp.put("username", guestUser.getUsername());
        resp.put("email", guestUser.getEmail());
        resp.put("nickname", guestUser.getNickname());
        resp.put("avatar", guestUser.getAvatar());
        resp.put("isGuest", true);
        resp.put("isFirstLogin", isFirstLogin);
        Map<String, Object> membershipInfo = new HashMap<>();
        membershipInfo.put("type", "trial");
        membershipInfo.put("planType", trialMembership.getPlanType());
        if (trialPlan != null) {
            membershipInfo.put("textTokenQuota", trialPlan.getTextTokenQuota());
        }
        resp.put("membership", membershipInfo);
        resp.put("worlds", new java.util.ArrayList<>());
        resp.put("presetEraId", 50L);
        resp.put("presetCharacterIds", java.util.Arrays.asList(315L, 316L, 317L, 318L, 319L, 320L));
        return resp;
    }

    /**
     * 生成唯一的游客用户名：guest_<名称的规范化>_<唯一后缀>
     */
    private String generateUniqueGuestUsername(String nickname) {
        String slug = nickname.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5_]", "_");
        if (slug.length() > 20) slug = slug.substring(0, 20);
        if (slug.isEmpty()) slug = "guest";
        String suffix = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String username = "guest_" + slug + "_" + suffix;
        int attempts = 0;
        while (userRepository.existsByUsername(username) && attempts < 10) {
            suffix = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            username = "guest_" + slug + "_" + suffix;
            attempts++;
        }
        if (attempts >= 10) {
            throw new BusinessException("无法生成唯一的游客用户名，请稍后重试");
        }
        return username;
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