package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.admin.service.SystemAdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 系统管理员管理控制器
 * 只有超级管理员可以访问
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/system/admins")
public class SystemAdminController {

    private static final Logger logger = LoggerFactory.getLogger(SystemAdminController.class);

    @Autowired
    private SystemAdminService systemAdminService;

    @Autowired
    private AdminAuthService adminAuthService;

    /**
     * 验证管理员权限（必须是超级管理员）
     */
    private void validateSuperAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("未授权访问");
        }

        String token = authHeader.substring(7);
        SystemAdmin admin = adminAuthService.validateToken(token);

        if (!"SUPER_ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("只有超级管理员可以访问此功能");
        }
    }

    /**
     * 获取所有管理员
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAdmins(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateSuperAdmin(authHeader);
            List<SystemAdminDTO> admins = systemAdminService.getAllAdmins();
            return ResponseEntity.ok(Map.of("code", 200, "data", admins, "message", "success"));
        } catch (RuntimeException e) {
            logger.error("获取管理员列表失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of("code", 401, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            logger.error("获取管理员列表异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }

    /**
     * 根据ID获取管理员
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAdminById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateSuperAdmin(authHeader);
            SystemAdminDTO admin = systemAdminService.getAdminById(id);
            return ResponseEntity.ok(Map.of("code", 200, "data", admin, "message", "success"));
        } catch (RuntimeException e) {
            logger.error("获取管理员失败: {}", e.getMessage());
            return ResponseEntity.status(404).body(Map.of("code", 404, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            logger.error("获取管理员异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }

    /**
     * 创建管理员
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createAdmin(
            @RequestBody CreateSystemAdminDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateSuperAdmin(authHeader);
            SystemAdminDTO admin = systemAdminService.createAdmin(dto);
            return ResponseEntity.ok(Map.of("code", 200, "data", admin, "message", "创建成功"));
        } catch (RuntimeException e) {
            logger.error("创建管理员失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            logger.error("创建管理员异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }

    /**
     * 更新管理员
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAdmin(
            @PathVariable Long id,
            @RequestBody UpdateSystemAdminDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateSuperAdmin(authHeader);
            SystemAdminDTO admin = systemAdminService.updateAdmin(id, dto);
            return ResponseEntity.ok(Map.of("code", 200, "data", admin, "message", "更新成功"));
        } catch (RuntimeException e) {
            logger.error("更新管理员失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            logger.error("更新管理员异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }

    /**
     * 删除管理员
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAdmin(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateSuperAdmin(authHeader);
            systemAdminService.deleteAdmin(id);
            return ResponseEntity.ok(Map.of("code", 200, "message", "删除成功", "data", null));
        } catch (RuntimeException e) {
            logger.error("删除管理员失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            logger.error("删除管理员异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }

    /**
     * 修改密码（当前登录的管理员可以修改自己的密码）
     */
    @PutMapping("/{id}/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("未授权访问");
            }

            String token = authHeader.substring(7);
            SystemAdmin currentAdmin = adminAuthService.validateToken(token);

            // 只能修改自己的密码，或者超级管理员可以修改任何人的密码
            if (!currentAdmin.getId().equals(id) && !"SUPER_ADMIN".equals(currentAdmin.getRole())) {
                throw new RuntimeException("只能修改自己的密码");
            }

            systemAdminService.changePassword(id, dto);
            return ResponseEntity.ok(Map.of("code", 200, "message", "密码修改成功", "data", null));
        } catch (RuntimeException e) {
            logger.error("修改密码失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            logger.error("修改密码异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }
}

