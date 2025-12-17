package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.AdminLoginRequest;
import com.heartsphere.admin.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AdminLoginRequest request) {
        try {
            // 添加日志记录
            System.out.println("========== [AdminAuthController] 管理员登录请求 ==========");
            System.out.println("[AdminAuthController] 接收到的用户名: " + (request.getUsername() != null ? request.getUsername() : "null"));
            System.out.println("[AdminAuthController] 接收到的密码长度: " + (request.getPassword() != null ? request.getPassword().length() : 0));
            
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                System.out.println("[AdminAuthController] 错误: 用户名为空");
                return ResponseEntity.status(401).body(Map.of("error", "用户名不能为空"));
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                System.out.println("[AdminAuthController] 错误: 密码为空");
                return ResponseEntity.status(401).body(Map.of("error", "密码不能为空"));
            }
            
            Map<String, Object> response = adminAuthService.login(request.getUsername(), request.getPassword());
            System.out.println("[AdminAuthController] 登录成功");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("[AdminAuthController] 登录失败: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}



