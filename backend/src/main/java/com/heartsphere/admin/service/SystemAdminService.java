package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
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
        SystemAdmin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        // 验证旧密码
        if (!passwordEncoder.matches(dto.getOldPassword(), admin.getPassword())) {
            throw new RuntimeException("旧密码错误");
        }

        // 设置新密码
        admin.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        adminRepository.save(admin);
        logger.info("修改密码成功: ID={}, username={}", admin.getId(), admin.getUsername());
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


