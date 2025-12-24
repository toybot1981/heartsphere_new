package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.utils.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminAuthService.class);

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
        logger.info("========== 管理员登录请求 ==========");
        logger.info("用户名: {}", username);
        logger.info("开始查询管理员账户...");
        
        SystemAdmin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("管理员账户不存在: {}", username);
                    return new RuntimeException("管理员用户名或密码错误");
                });

        logger.info("找到管理员账户: ID={}, username={}, email={}, role={}, isActive={}", 
                admin.getId(), admin.getUsername(), admin.getEmail(), admin.getRole(), admin.getIsActive());

        if (!admin.getIsActive()) {
            logger.error("管理员账号已被禁用: {}", username);
            throw new RuntimeException("管理员账号已被禁用");
        }

        logger.info("开始验证密码...");
        logger.debug("输入的密码长度: {}", password != null ? password.length() : 0);
        logger.debug("数据库密码哈希前缀: {}", admin.getPassword() != null ? admin.getPassword().substring(0, Math.min(20, admin.getPassword().length())) : "null");
        
        boolean passwordMatches = passwordEncoder.matches(password, admin.getPassword());
        logger.info("密码验证结果: {}", passwordMatches);
        
        if (!passwordMatches) {
            logger.error("密码验证失败: username={}", username);
            throw new RuntimeException("管理员用户名或密码错误");
        }
        
        logger.info("密码验证成功");

        // 更新最后登录时间
        logger.info("更新最后登录时间...");
        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);
        logger.info("最后登录时间已更新");

        // 生成JWT token
        logger.info("生成JWT token...");
        String token = jwtUtils.generateJwtTokenFromUsername(admin.getUsername());
        logger.info("JWT token生成成功，长度: {}", token.length());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", admin.getUsername());
        response.put("email", admin.getEmail());
        response.put("adminId", admin.getId());
        
        // 确保role不为null，如果为null则使用默认值
        String role = admin.getRole();
        if (role == null || role.trim().isEmpty()) {
            // 如果role为null，根据用户名判断（admin默认为SUPER_ADMIN）
            role = "admin".equals(admin.getUsername()) ? "SUPER_ADMIN" : "ADMIN";
            logger.warn("管理员 {} 的role字段为null，使用默认值: {}", admin.getUsername(), role);
            // 更新数据库中的role
            admin.setRole(role);
            adminRepository.save(admin);
        }
        response.put("role", role); // 添加角色信息

        logger.info("========== 管理员登录成功 ==========");
        logger.info("返回响应: adminId={}, username={}, email={}, role={}", 
                admin.getId(), admin.getUsername(), admin.getEmail(), admin.getRole());
        
        return response;
    }

    /**
     * 验证管理员token
     */
    public SystemAdmin validateToken(String token) {
        logger.debug("========== 验证管理员token ==========");
        logger.debug("Token长度: {}", token != null ? token.length() : 0);
        
        try {
            if (token == null || token.trim().isEmpty()) {
                logger.error("Token为空");
                throw new RuntimeException("Token 为空");
            }
            
            logger.debug("开始验证JWT token...");
            if (!jwtUtils.validateJwtToken(token)) {
                logger.error("JWT token验证失败");
                throw new RuntimeException("无效的管理员token: JWT验证失败");
            }
            logger.debug("JWT token验证成功");
            
            String username = jwtUtils.getUserNameFromJwtToken(token);
            logger.debug("从token中提取的用户名: {}", username);
            
            if (username == null || username.trim().isEmpty()) {
                logger.error("无法从token中提取用户名");
                throw new RuntimeException("无效的管理员token: 无法从token中提取用户名");
            }
            
            logger.debug("开始查询管理员账户: {}", username);
            SystemAdmin admin = adminRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        logger.error("管理员不存在: {}", username);
                        return new RuntimeException("管理员不存在: " + username);
                    });
            
            logger.debug("找到管理员账户: ID={}, username={}, isActive={}", 
                    admin.getId(), admin.getUsername(), admin.getIsActive());
            
            if (!admin.getIsActive()) {
                logger.error("管理员账号已被禁用: {}", username);
                throw new RuntimeException("管理员账号已被禁用");
            }
            
            logger.debug("========== Token验证成功 ==========");
            return admin;
        } catch (RuntimeException e) {
            logger.error("Token验证失败: {}", e.getMessage());
            // 重新抛出RuntimeException，保留原始错误信息
            throw e;
        } catch (Exception e) {
            logger.error("Token验证异常: {}", e.getMessage(), e);
            throw new RuntimeException("无效的管理员token: " + e.getMessage(), e);
        }
    }
}

