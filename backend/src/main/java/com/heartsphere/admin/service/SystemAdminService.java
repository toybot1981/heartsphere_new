package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 系统管理员服务
 */
@Service
public class SystemAdminService {
    
    private static final Logger logger = LoggerFactory.getLogger(SystemAdminService.class);

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 获取所有管理员
     */
    public List<SystemAdminDTO> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取管理员
     */
    public SystemAdminDTO getAdminById(Long id) {
        SystemAdmin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));
        return convertToDTO(admin);
    }

    /**
     * 创建管理员
     */
    @Transactional
    public SystemAdminDTO createAdmin(CreateSystemAdminDTO dto) {
        // 检查用户名是否已存在
        if (adminRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (adminRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }

        // 验证角色
        if (dto.getRole() == null || (!dto.getRole().equals("SUPER_ADMIN") && !dto.getRole().equals("ADMIN"))) {
            throw new RuntimeException("无效的角色，必须是 SUPER_ADMIN 或 ADMIN");
        }

        SystemAdmin admin = new SystemAdmin();
        admin.setUsername(dto.getUsername());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setEmail(dto.getEmail());
        admin.setRole(dto.getRole());
        admin.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        admin = adminRepository.save(admin);
        logger.info("创建管理员成功: ID={}, username={}, role={}", admin.getId(), admin.getUsername(), admin.getRole());
        return convertToDTO(admin);
    }

    /**
     * 更新管理员
     */
    @Transactional
    public SystemAdminDTO updateAdmin(Long id, UpdateSystemAdminDTO dto) {
        SystemAdmin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        // 检查邮箱是否被其他管理员使用
        if (dto.getEmail() != null && !dto.getEmail().equals(admin.getEmail())) {
            if (adminRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("邮箱已被使用");
            }
            admin.setEmail(dto.getEmail());
        }

        // 更新角色
        if (dto.getRole() != null) {
            if (!dto.getRole().equals("SUPER_ADMIN") && !dto.getRole().equals("ADMIN")) {
                throw new RuntimeException("无效的角色，必须是 SUPER_ADMIN 或 ADMIN");
            }
            admin.setRole(dto.getRole());
        }

        // 更新状态
        if (dto.getIsActive() != null) {
            admin.setIsActive(dto.getIsActive());
        }

        admin = adminRepository.save(admin);
        logger.info("更新管理员成功: ID={}, username={}, role={}", admin.getId(), admin.getUsername(), admin.getRole());
        return convertToDTO(admin);
    }

    /**
     * 删除管理员
     */
    @Transactional
    public void deleteAdmin(Long id) {
        SystemAdmin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        // 不能删除自己
        // 注意：这里需要通过当前登录的管理员ID来判断，暂时先允许删除
        
        adminRepository.delete(admin);
        logger.info("删除管理员成功: ID={}, username={}", admin.getId(), admin.getUsername());
    }

    /**
     * 修改密码
     */
    @Transactional
    public void changePassword(Long id, ChangePasswordDTO dto) {
        logger.info("========== 修改管理员密码 ==========");
        logger.info("管理员ID: {}", id);
        
        try {
            if (dto == null) {
                logger.error("请求参数为 null");
                throw new BusinessException(400, "请求参数不能为空");
            }
            
            if (dto.getOldPassword() == null || dto.getOldPassword().trim().isEmpty()) {
                logger.error("旧密码为空");
                throw new BusinessException(400, "旧密码不能为空");
            }
            
            if (dto.getNewPassword() == null || dto.getNewPassword().trim().isEmpty()) {
                logger.error("新密码为空");
                throw new BusinessException(400, "新密码不能为空");
            }
            
            logger.info("开始查询管理员: ID={}", id);
            SystemAdmin admin = adminRepository.findById(id)
                    .orElseThrow(() -> {
                        logger.error("管理员不存在: ID={}", id);
                        return new BusinessException(404, "管理员不存在");
                    });

            logger.info("找到管理员: ID={}, username={}", admin.getId(), admin.getUsername());

            if (admin.getPassword() == null) {
                logger.error("管理员密码字段为 null: ID={}", id);
                throw new BusinessException(500, "管理员密码数据异常");
            }

            if (passwordEncoder == null) {
                logger.error("PasswordEncoder 为 null");
                throw new BusinessException(500, "密码编码器未初始化");
            }

            // 验证旧密码
            logger.info("开始验证旧密码...");
            boolean passwordMatches = passwordEncoder.matches(dto.getOldPassword(), admin.getPassword());
            logger.info("旧密码验证结果: {}", passwordMatches);
            
            if (!passwordMatches) {
                logger.error("旧密码验证失败: ID={}", id);
                throw new BusinessException(400, "旧密码错误，请检查后重试");
            }

            // 设置新密码
            logger.info("开始加密新密码...");
            String encodedPassword = passwordEncoder.encode(dto.getNewPassword());
            if (encodedPassword == null || encodedPassword.trim().isEmpty()) {
                logger.error("密码加密结果为 null 或空");
                throw new BusinessException(500, "密码加密失败，请稍后重试");
            }
            
            logger.info("密码加密成功，开始保存...");
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);
            logger.info("========== 修改密码成功 ==========");
            logger.info("管理员ID: {}, username: {}", admin.getId(), admin.getUsername());
        } catch (BusinessException e) {
            // BusinessException 直接抛出，由全局异常处理器处理
            logger.error("修改密码失败: {}", e.getMessage() != null ? e.getMessage() : "未知错误", e);
            throw e;
        } catch (Exception e) {
            logger.error("修改密码异常: {}", e.getMessage() != null ? e.getMessage() : "未知错误", e);
            throw new BusinessException(500, "修改密码失败: " + (e.getMessage() != null ? e.getMessage() : "服务器内部错误"));
        }
    }

    /**
     * 检查是否为超级管理员
     */
    public boolean isSuperAdmin(String username) {
        return adminRepository.findByUsername(username)
                .map(admin -> "SUPER_ADMIN".equals(admin.getRole()))
                .orElse(false);
    }

    /**
     * 转换为DTO
     */
    private SystemAdminDTO convertToDTO(SystemAdmin admin) {
        SystemAdminDTO dto = new SystemAdminDTO();
        dto.setId(admin.getId());
        dto.setUsername(admin.getUsername());
        dto.setEmail(admin.getEmail());
        dto.setRole(admin.getRole());
        dto.setIsActive(admin.getIsActive());
        dto.setLastLogin(admin.getLastLogin());
        dto.setCreatedAt(admin.getCreatedAt());
        dto.setUpdatedAt(admin.getUpdatedAt());
        return dto;
    }
}





