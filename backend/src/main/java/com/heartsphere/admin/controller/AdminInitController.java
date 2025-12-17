package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员初始化控制器
 * 用于重置管理员密码（仅用于开发/紧急情况）
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/init")
public class AdminInitController {

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 重置管理员密码（仅用于开发环境）
     * 警告：生产环境应该禁用此端点
     */
    @PostMapping("/reset-admin-password")
    public ResponseEntity<Map<String, Object>> resetAdminPassword(@RequestParam(required = false, defaultValue = "123456") String password) {
        try {
            SystemAdmin admin = adminRepository.findByUsername("admin")
                    .orElseGet(() -> {
                        // 如果不存在，创建新管理员
                        SystemAdmin newAdmin = new SystemAdmin();
                        newAdmin.setUsername("admin");
                        newAdmin.setEmail("admin@heartsphere.com");
                        newAdmin.setIsActive(true);
                        return newAdmin;
                    });

            // 使用 PasswordEncoder 生成正确的密码哈希
            admin.setPassword(passwordEncoder.encode(password));
            admin.setIsActive(true);
            adminRepository.save(admin);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "管理员密码已重置");
            response.put("username", "admin");
            response.put("password", password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "重置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

