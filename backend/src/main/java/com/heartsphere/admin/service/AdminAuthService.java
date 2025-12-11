package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminAuthService {

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 管理员登录
     */
    public Map<String, Object> login(String username, String password) {
        SystemAdmin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("管理员用户名或密码错误"));

        if (!admin.getIsActive()) {
            throw new RuntimeException("管理员账号已被禁用");
        }

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("管理员用户名或密码错误");
        }

        // 更新最后登录时间
        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);

        // 生成JWT token
        String token = jwtUtils.generateJwtTokenFromUsername(admin.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", admin.getUsername());
        response.put("email", admin.getEmail());
        response.put("adminId", admin.getId());

        return response;
    }

    /**
     * 验证管理员token
     */
    public SystemAdmin validateToken(String token) {
        try {
            if (!jwtUtils.validateJwtToken(token)) {
                throw new RuntimeException("无效的管理员token");
            }
            String username = jwtUtils.getUserNameFromJwtToken(token);
            SystemAdmin admin = adminRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("管理员不存在"));

            if (!admin.getIsActive()) {
                throw new RuntimeException("管理员账号已被禁用");
            }

            return admin;
        } catch (Exception e) {
            throw new RuntimeException("无效的管理员token");
        }
    }
}

