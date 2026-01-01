package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.admin.service.SystemAdminService;
import com.heartsphere.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
        logger.info("========== 修改密码请求 ==========");
        logger.info("管理员ID: {}", id);
        
        try {
            // 验证授权头
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("授权头无效或为空");
                throw new RuntimeException("未授权访问");
            }

            // 验证请求体
            if (dto == null) {
                logger.error("请求体为 null");
                throw new RuntimeException("请求体不能为空");
            }
            logger.info("请求体验证通过");
            
            if (dto.getOldPassword() == null || dto.getOldPassword().trim().isEmpty()) {
                logger.error("旧密码为空");
                throw new RuntimeException("旧密码不能为空");
            }
            
            if (dto.getNewPassword() == null || dto.getNewPassword().trim().isEmpty()) {
                logger.error("新密码为空");
                throw new RuntimeException("新密码不能为空");
            }
            logger.info("密码字段验证通过");

            // 验证 token
            if (adminAuthService == null) {
                logger.error("adminAuthService 为 null");
                throw new RuntimeException("认证服务未初始化");
            }
            
            String token = authHeader.substring(7);
            logger.info("开始验证 token，长度: {}", token != null ? token.length() : 0);
            
            SystemAdmin currentAdmin;
            try {
                currentAdmin = adminAuthService.validateToken(token);
            } catch (Exception e) {
                logger.error("Token 验证失败: {}", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName(), e);
                throw new RuntimeException("Token 验证失败: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
            }
            
            if (currentAdmin == null) {
                logger.error("validateToken 返回 null");
                throw new RuntimeException("无法验证管理员身份");
            }
            
            logger.info("Token 验证成功，管理员: ID={}, username={}, role={}", 
                    currentAdmin.getId(), currentAdmin.getUsername(), currentAdmin.getRole());
            
            if (currentAdmin.getId() == null) {
                logger.error("管理员ID为 null");
                throw new RuntimeException("管理员ID无效");
            }

            // 检查角色
            String currentRole = currentAdmin.getRole();
            if (currentRole == null) {
                logger.warn("管理员角色为 null，使用默认值 ADMIN");
                currentRole = "ADMIN";
            }

            // 只能修改自己的密码，或者超级管理员可以修改任何人的密码
            boolean isSelf = currentAdmin.getId().equals(id);
            boolean isSuperAdmin = "SUPER_ADMIN".equals(currentRole);
            
            logger.info("权限检查: isSelf={}, isSuperAdmin={}, currentId={}, targetId={}", 
                    isSelf, isSuperAdmin, currentAdmin.getId(), id);
            
            if (!isSelf && !isSuperAdmin) {
                logger.error("权限不足: 当前管理员ID={}, 目标ID={}, 角色={}", 
                        currentAdmin.getId(), id, currentRole);
                throw new RuntimeException("只能修改自己的密码");
            }

            logger.info("开始调用 service 修改密码...");
            
            if (systemAdminService == null) {
                logger.error("systemAdminService 为 null");
                throw new RuntimeException("系统服务未初始化");
            }
            
            systemAdminService.changePassword(id, dto);
            logger.info("========== 修改密码成功 ==========");
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "密码修改成功");
            response.put("data", null);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            // BusinessException 会被全局异常处理器处理，重新抛出以返回标准的 ApiResponse 格式
            String errorMsg = e.getMessage() != null ? e.getMessage() : "未知错误";
            logger.error("修改密码失败 (BusinessException): {}", errorMsg, e);
            // 重新抛出，让全局异常处理器统一处理，返回标准的 ApiResponse 格式
            throw e;
        } catch (RuntimeException e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "未知错误";
            logger.error("修改密码失败 (RuntimeException): {}", errorMsg, e);
            // 转换为 BusinessException，让全局异常处理器处理
            throw new BusinessException(400, errorMsg);
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : ("服务器内部错误: " + e.getClass().getSimpleName());
            logger.error("修改密码异常 (Exception): {}", errorMessage, e);
            logger.error("异常堆栈:", e);
            // 转换为 BusinessException，让全局异常处理器处理
            throw new BusinessException(500, errorMessage);
        }
    }
}

