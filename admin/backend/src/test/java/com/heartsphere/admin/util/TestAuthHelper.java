package com.heartsphere.admin.util;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.shared.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试认证辅助类
 * 用于在测试中生成有效的认证 Token
 */
@Component
public class TestAuthHelper {
    
    @Autowired
    private AdminAuthService adminAuthService;
    
    @Autowired
    private SystemAdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * 为测试管理员生成认证 Token
     */
    public String generateTokenForAdmin(SystemAdmin admin) {
        return jwtUtils.generateJwtTokenFromUsername(admin.getUsername());
    }
    
    /**
     * 创建测试管理员并返回 Token
     */
    public String createTestAdminAndGetToken() {
        SystemAdmin admin = PipelineTestDataBuilder.createTestAdmin();
        admin.setPassword(passwordEncoder.encode("test-password"));
        admin = adminRepository.save(admin);
        return generateTokenForAdmin(admin);
    }
    
    /**
     * 获取认证 Header 值
     */
    public String getAuthHeader(String token) {
        return "Bearer " + token;
    }
}
