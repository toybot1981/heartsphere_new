package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.AdminUserDTO;
import com.heartsphere.admin.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员用户管理控制器
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController extends BaseAdminController {

    @Autowired
    private AdminUserService adminUserService;

    /**
     * 获取用户列表（分页、搜索）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminUserDTO> users = adminUserService.getUsers(pageable, search);
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", users.getContent());
        response.put("totalElements", users.getTotalElements());
        response.put("totalPages", users.getTotalPages());
        response.put("currentPage", users.getNumber());
        response.put("pageSize", users.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDTO> getUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        AdminUserDTO user = adminUserService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * 启用/禁用用户
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Boolean> request
    ) {
        validateAdmin(authHeader);
        Boolean isEnabled = request.get("isEnabled");
        
        if (isEnabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        AdminUserDTO user = adminUserService.updateUserStatus(id, isEnabled);
        return ResponseEntity.ok(user);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminUserDTO> updateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody AdminUserDTO dto
    ) {
        validateAdmin(authHeader);
        AdminUserDTO user = adminUserService.updateUser(id, dto);
        return ResponseEntity.ok(user);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        adminUserService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 强制删除用户（先清空所有关联数据，再删除用户）
     */
    @DeleteMapping("/{id}/force")
    public ResponseEntity<Void> forceDeleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        adminUserService.forceDeleteUser(id);
        return ResponseEntity.ok().build();
    }
}

