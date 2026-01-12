package com.heartsphere.controller;

import com.heartsphere.dto.SystemResourceDTO;
import com.heartsphere.service.SystemResourceService;
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
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private SystemResourceService systemResourceService;

    /**
     * 获取所有资源（按分类筛选）
     * 需要用户登录，但不需要管理员权限
     */
    @GetMapping(produces = "application/json;charset=UTF-8")
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
        List<SystemResourceDTO> resources;
        if (category != null && !category.isEmpty()) {
            resources = systemResourceService.getResourcesByCategory(category);
        } else {
            resources = systemResourceService.getAllResources();
        }
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(resources);
    }

    /**
     * 根据ID获取资源详情
     * 需要用户登录，但不需要管理员权限
     */
    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
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
        
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(systemResourceService.getResourceById(id));
    }
}

