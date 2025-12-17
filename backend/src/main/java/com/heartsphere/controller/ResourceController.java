package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemResourceDTO;
import com.heartsphere.admin.service.SystemResourceService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 资源控制器 - 供普通用户使用
 * 提供资源的只读访问，不需要管理员权限
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private SystemResourceService systemResourceService;

    /**
     * 获取所有资源（按分类筛选）
     * 需要用户登录，但不需要管理员权限
     */
    @GetMapping
    public ResponseEntity<List<SystemResourceDTO>> getAllResources(
            @RequestParam(required = false) String category) {
        // 验证用户是否已登录
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 检查 principal 是否是 UserDetailsImpl 类型（普通用户）
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        
        // 根据分类获取资源
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(systemResourceService.getResourcesByCategory(category));
        }
        return ResponseEntity.ok(systemResourceService.getAllResources());
    }

    /**
     * 根据ID获取资源详情
     * 需要用户登录，但不需要管理员权限
     */
    @GetMapping("/{id}")
    public ResponseEntity<SystemResourceDTO> getResourceById(@PathVariable Long id) {
        // 验证用户是否已登录
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 检查 principal 是否是 UserDetailsImpl 类型（普通用户）
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        
        return ResponseEntity.ok(systemResourceService.getResourceById(id));
    }
}

