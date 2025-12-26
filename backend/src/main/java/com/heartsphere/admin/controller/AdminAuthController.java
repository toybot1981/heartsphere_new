package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.AdminLoginRequest;
import com.heartsphere.admin.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.logging.Logger;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private static final Logger logger = Logger.getLogger(AdminAuthController.class.getName());

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AdminLoginRequest request) {
        try {
            logger.info("管理员登录请求，用户名: " + request.getUsername());

            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                logger.warning("登录失败: 用户名为空");
                return ResponseEntity.status(401).body(Map.of("error", "用户名不能为空"));
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                logger.warning("登录失败: 密码为空");
                return ResponseEntity.status(401).body(Map.of("error", "密码不能为空"));
            }

            Map<String, Object> response = adminAuthService.login(request.getUsername(), request.getPassword());
            logger.info("管理员登录成功，用户名: " + request.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warning("管理员登录失败: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}

