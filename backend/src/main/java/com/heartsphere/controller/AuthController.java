package com.heartsphere.controller;

import com.heartsphere.dto.AuthResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

            // 查询用户的世界，若为空则初始化，再次查询以返回最新数据
            List<World> userWorlds = worldRepository.findByUserId(user.getId());
            boolean isFirstLogin = userWorlds.isEmpty();
            if (isFirstLogin) {
                initializationService.initializeUserData(user);
                userWorlds = worldRepository.findByUserId(user.getId());
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
            // 转换为DTO列表
            List<WorldDTO> worldDTOs = userWorlds.stream()
                .map(DTOMapper::toWorldDTO)
                .collect(Collectors.toList());
            resp.put("worlds", worldDTOs); // 可直接返回初始化后的世界列表，方便前端首屏展示
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            // 捕获所有认证异常，返回具体的错误信息
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "用户名或密码错误"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Email is already in use!"));
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));
        user.setNickname(registerRequest.getUsername());
        user.setIsEnabled(true); // 确保用户是启用状态

        userRepository.save(user);
        
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

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(DTOMapper.toUserDTO(user));
        } catch (Exception e) {
            // 捕获所有异常，返回具体的错误信息
            return ResponseEntity
                    .status(401)
                    .body(Map.of("message", "Invalid authentication token"));
        }
    }
}