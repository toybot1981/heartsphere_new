package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.logging.Logger;

/**
 * 管理员初始化服务
 * 在应用启动时创建默认管理员账号
 */
@Service
public class AdminInitializationService {

    private static final Logger logger = Logger.getLogger(AdminInitializationService.class.getName());

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initDefaultAdmin() {
        // 检查是否已存在管理员
        if (adminRepository.findByUsername("admin").isEmpty()) {
            SystemAdmin admin = new SystemAdmin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("123456")); // 默认密码
            admin.setEmail("admin@heartsphere.com");
            admin.setRole("SUPER_ADMIN"); // 默认管理员为超级管理员
            admin.setIsActive(true);
            adminRepository.save(admin);
            logger.info("默认超级管理员账号已创建: admin");
        }
    }
}

