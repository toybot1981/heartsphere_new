package com.heartsphere.admin.controller;

import com.heartsphere.plugin.dto.*;
import com.heartsphere.plugin.service.PluginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 插件管理控制器（管理员专用）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@RestController
@RequestMapping("/api/admin/plugins")
public class AdminPluginController extends BaseAdminController {
    
    @Autowired
    private PluginService pluginService;
    
    /**
     * 获取插件列表
     * GET /api/admin/plugins
     */
    @GetMapping
    public ResponseEntity<PluginListResponse> getPluginList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String sort,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PluginListRequest request = PluginListRequest.builder()
            .keyword(keyword)
            .category(category)
            .status(status)
            .type(type)
            .page(page)
            .size(size)
            .sort(sort)
            .build();
        
        PluginListResponse response = pluginService.getPluginList(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取插件详情
     * GET /api/admin/plugins/{pluginId}
     */
    @GetMapping("/{pluginId}")
    public ResponseEntity<PluginDTO> getPluginById(
            @PathVariable String pluginId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PluginDTO plugin = pluginService.getPluginById(pluginId);
        return ResponseEntity.ok(plugin);
    }
    
    /**
     * 启用插件
     * POST /api/admin/plugins/{pluginId}/enable
     */
    @PostMapping("/{pluginId}/enable")
    public ResponseEntity<Void> enablePlugin(
            @PathVariable String pluginId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        pluginService.enablePlugin(pluginId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 禁用插件
     * POST /api/admin/plugins/{pluginId}/disable
     */
    @PostMapping("/{pluginId}/disable")
    public ResponseEntity<Void> disablePlugin(
            @PathVariable String pluginId,
            @RequestParam(required = false, defaultValue = "false") boolean force,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        pluginService.disablePlugin(pluginId, force);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 更新插件配置
     * PUT /api/admin/plugins/{pluginId}/config
     */
    @PutMapping("/{pluginId}/config")
    public ResponseEntity<Void> updatePluginConfig(
            @PathVariable String pluginId,
            @RequestBody PluginConfigRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        pluginService.updatePluginConfig(pluginId, request);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 获取插件预览信息
     * GET /api/admin/plugins/{pluginId}/preview
     */
    @GetMapping("/{pluginId}/preview")
    public ResponseEntity<PluginPreviewDTO> getPluginPreview(
            @PathVariable String pluginId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PluginPreviewDTO preview = pluginService.getPluginPreview(pluginId);
        return ResponseEntity.ok(preview);
    }
    
    /**
     * 发布插件
     * POST /api/admin/plugins/{pluginId}/publish
     */
    @PostMapping("/{pluginId}/publish")
    public ResponseEntity<Void> publishPlugin(
            @PathVariable String pluginId,
            @RequestBody(required = false) PluginPublishRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        String publishNote = request != null ? request.getPublishNote() : null;
        pluginService.publishPlugin(pluginId, publishNote);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 取消发布插件
     * POST /api/admin/plugins/{pluginId}/unpublish
     */
    @PostMapping("/{pluginId}/unpublish")
    public ResponseEntity<Void> unpublishPlugin(
            @PathVariable String pluginId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        pluginService.unpublishPlugin(pluginId);
        return ResponseEntity.ok().build();
    }
}
