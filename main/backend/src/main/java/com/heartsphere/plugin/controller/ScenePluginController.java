package com.heartsphere.plugin.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.plugin.dto.ScenePluginDTO;
import com.heartsphere.plugin.entity.ScenePlugin;
import com.heartsphere.plugin.repository.ScenePluginRepository;
import com.heartsphere.plugin.repository.PluginRepository;
import com.heartsphere.plugin.entity.Plugin;
import com.heartsphere.security.UserDetailsImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 场景插件控制器
 * 提供场景插件的增删改查接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/scenes")
@RequiredArgsConstructor
public class ScenePluginController {
    
    private final ScenePluginRepository scenePluginRepository;
    private final PluginRepository pluginRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取场景插件列表
     */
    @GetMapping("/{sceneId}/plugins")
    public ResponseEntity<ApiResponse<List<ScenePluginDTO>>> getScenePlugins(
            @PathVariable String sceneId,
            Authentication authentication) {
        
        log.info("获取场景插件列表: sceneId={}", sceneId);
        
        try {
            Long userId = getUserId(authentication);
            
            // 根据场景ID和用户ID查找（确保用户只能看到自己的插件）
            List<ScenePlugin> scenePlugins;
            if (userId != null && userId > 0) {
                scenePlugins = scenePluginRepository.findBySceneIdAndUserId(sceneId, userId);
            } else {
                // 如果没有用户ID，只按场景ID查找（可能用于公开场景）
                scenePlugins = scenePluginRepository.findBySceneId(sceneId);
            }
            
            List<ScenePluginDTO> dtos = scenePlugins.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("获取场景插件列表失败: sceneId={}", sceneId, e);
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
    }
    
    /**
     * 添加插件到场景
     */
    @PostMapping("/{sceneId}/plugins/{pluginId}/add")
    public ResponseEntity<ApiResponse<ScenePluginDTO>> addPluginToScene(
            @PathVariable String sceneId,
            @PathVariable String pluginId,
            @RequestBody(required = false) Map<String, Object> request,
            Authentication authentication) {
        
        log.info("添加插件到场景: sceneId={}, pluginId={}", sceneId, pluginId);
        
        try {
            Long userId = getUserId(authentication);
            
            if (userId == null || userId <= 0) {
                return ResponseEntity.ok(ApiResponse.error("需要登录才能添加插件"));
            }
            
            // 检查是否已存在（同一用户在同一场景中不能重复添加同一插件）
            Optional<ScenePlugin> existing = scenePluginRepository.findBySceneIdAndPluginIdAndUserId(sceneId, pluginId, userId);
            if (existing.isPresent()) {
                log.info("插件已存在于场景中，返回现有实例");
                return ResponseEntity.ok(ApiResponse.success(convertToDTO(existing.get())));
            }
            
            // 创建新的场景插件
            ScenePlugin scenePlugin = ScenePlugin.builder()
                .sceneId(sceneId)
                .pluginId(pluginId)
                .userId(userId)
                .positionX(request != null ? getIntValue(request, "positionX", 100) : 100)
                .positionY(request != null ? getIntValue(request, "positionY", 100) : 100)
                .width(request != null ? getIntValue(request, "width", 400) : 400)
                .height(request != null ? getIntValue(request, "height", 300) : 300)
                .zIndex(request != null ? getIntValue(request, "zIndex", 0) : 0)
                .isVisible(true)
                .config(request != null && request.get("config") != null ? 
                    objectMapper.writeValueAsString(request.get("config")) : "{}")
                .build();
            
            scenePlugin = scenePluginRepository.save(scenePlugin);
            
            return ResponseEntity.ok(ApiResponse.success(convertToDTO(scenePlugin)));
        } catch (Exception e) {
            log.error("添加插件到场景失败: sceneId={}, pluginId={}", sceneId, pluginId, e);
            return ResponseEntity.ok(ApiResponse.error("添加插件失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新插件位置（使用pluginInstanceId）
     */
    @PutMapping("/{sceneId}/plugins/{pluginInstanceId}/position")
    public ResponseEntity<ApiResponse<ScenePluginDTO>> updatePluginPosition(
            @PathVariable String sceneId,
            @PathVariable Long pluginInstanceId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        log.info("更新插件位置: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId);
        
        try {
            Long userId = getUserId(authentication);
            Optional<ScenePlugin> optPlugin = scenePluginRepository.findById(pluginInstanceId);
            
            if (optPlugin.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("插件不存在"));
            }
            
            ScenePlugin scenePlugin = optPlugin.get();
            
            // 验证场景ID和用户ID
            if (!scenePlugin.getSceneId().equals(sceneId)) {
                return ResponseEntity.ok(ApiResponse.error("场景ID不匹配"));
            }
            if (userId != null && userId > 0 && !scenePlugin.getUserId().equals(userId)) {
                return ResponseEntity.ok(ApiResponse.error("无权访问此插件"));
            }
            
            if (request.containsKey("positionX")) {
                scenePlugin.setPositionX(((Number) request.get("positionX")).intValue());
            }
            if (request.containsKey("positionY")) {
                scenePlugin.setPositionY(((Number) request.get("positionY")).intValue());
            }
            if (request.containsKey("width")) {
                scenePlugin.setWidth(((Number) request.get("width")).intValue());
            }
            if (request.containsKey("height")) {
                scenePlugin.setHeight(((Number) request.get("height")).intValue());
            }
            if (request.containsKey("zIndex")) {
                scenePlugin.setZIndex(((Number) request.get("zIndex")).intValue());
            }
            
            scenePlugin = scenePluginRepository.save(scenePlugin);
            
            return ResponseEntity.ok(ApiResponse.success(convertToDTO(scenePlugin)));
        } catch (Exception e) {
            log.error("更新插件位置失败: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId, e);
            return ResponseEntity.ok(ApiResponse.error("更新位置失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新插件可见性（使用pluginInstanceId）
     */
    @PutMapping("/{sceneId}/plugins/{pluginInstanceId}/visibility")
    public ResponseEntity<ApiResponse<ScenePluginDTO>> updatePluginVisibility(
            @PathVariable String sceneId,
            @PathVariable Long pluginInstanceId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        log.info("更新插件可见性: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId);
        
        try {
            Long userId = getUserId(authentication);
            Optional<ScenePlugin> optPlugin = scenePluginRepository.findById(pluginInstanceId);
            
            if (optPlugin.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("插件不存在"));
            }
            
            ScenePlugin scenePlugin = optPlugin.get();
            
            // 验证场景ID和用户ID
            if (!scenePlugin.getSceneId().equals(sceneId)) {
                return ResponseEntity.ok(ApiResponse.error("场景ID不匹配"));
            }
            if (userId != null && userId > 0 && !scenePlugin.getUserId().equals(userId)) {
                return ResponseEntity.ok(ApiResponse.error("无权访问此插件"));
            }
            
            scenePlugin.setIsVisible((Boolean) request.getOrDefault("visible", true));
            scenePlugin = scenePluginRepository.save(scenePlugin);
            
            return ResponseEntity.ok(ApiResponse.success(convertToDTO(scenePlugin)));
        } catch (Exception e) {
            log.error("更新插件可见性失败: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId, e);
            return ResponseEntity.ok(ApiResponse.error("更新可见性失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新插件配置（使用pluginInstanceId）
     */
    @PutMapping("/{sceneId}/plugins/{pluginInstanceId}/config")
    public ResponseEntity<ApiResponse<ScenePluginDTO>> updatePluginConfig(
            @PathVariable String sceneId,
            @PathVariable Long pluginInstanceId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        log.info("更新插件配置: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId);
        
        try {
            Long userId = getUserId(authentication);
            Optional<ScenePlugin> optPlugin = scenePluginRepository.findById(pluginInstanceId);
            
            if (optPlugin.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("插件不存在"));
            }
            
            ScenePlugin scenePlugin = optPlugin.get();
            
            // 验证场景ID和用户ID
            if (!scenePlugin.getSceneId().equals(sceneId)) {
                return ResponseEntity.ok(ApiResponse.error("场景ID不匹配"));
            }
            if (userId != null && userId > 0 && !scenePlugin.getUserId().equals(userId)) {
                return ResponseEntity.ok(ApiResponse.error("无权访问此插件"));
            }
            
            // 更新配置
            Object config = request.get("config");
            if (config != null) {
                scenePlugin.setConfig(objectMapper.writeValueAsString(config));
            }
            
            scenePlugin = scenePluginRepository.save(scenePlugin);
            
            return ResponseEntity.ok(ApiResponse.success(convertToDTO(scenePlugin)));
        } catch (Exception e) {
            log.error("更新插件配置失败: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId, e);
            return ResponseEntity.ok(ApiResponse.error("更新配置失败: " + e.getMessage()));
        }
    }
    
    /**
     * 从场景移除插件（使用pluginInstanceId）
     */
    @DeleteMapping("/{sceneId}/plugins/{pluginInstanceId}")
    public ResponseEntity<ApiResponse<Void>> removePluginFromScene(
            @PathVariable String sceneId,
            @PathVariable Long pluginInstanceId,
            Authentication authentication) {
        
        log.info("从场景移除插件: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId);
        
        try {
            Long userId = getUserId(authentication);
            Optional<ScenePlugin> optPlugin = scenePluginRepository.findById(pluginInstanceId);
            
            if (optPlugin.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("插件不存在"));
            }
            
            ScenePlugin scenePlugin = optPlugin.get();
            
            // 验证场景ID和用户ID
            if (!scenePlugin.getSceneId().equals(sceneId)) {
                return ResponseEntity.ok(ApiResponse.error("场景ID不匹配"));
            }
            if (userId != null && !scenePlugin.getUserId().equals(userId)) {
                return ResponseEntity.ok(ApiResponse.error("无权删除此插件"));
            }
            
            scenePluginRepository.delete(scenePlugin);
            
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("从场景移除插件失败: sceneId={}, pluginInstanceId={}", sceneId, pluginInstanceId, e);
            return ResponseEntity.ok(ApiResponse.error("移除插件失败: " + e.getMessage()));
        }
    }
    
    /**
     * 转换为DTO
     */
    private ScenePluginDTO convertToDTO(ScenePlugin scenePlugin) {
        String pluginName = "";
        try {
            Optional<Plugin> plugin = pluginRepository.findByPluginId(scenePlugin.getPluginId());
            if (plugin.isPresent()) {
                pluginName = plugin.get().getName();
            }
        } catch (Exception e) {
            log.warn("获取插件名称失败: pluginId={}", scenePlugin.getPluginId());
        }
        
        Object config = null;
        try {
            if (scenePlugin.getConfig() != null && !scenePlugin.getConfig().isEmpty()) {
                config = objectMapper.readValue(scenePlugin.getConfig(), Object.class);
            }
        } catch (Exception e) {
            log.warn("解析插件配置失败: {}", e.getMessage());
            config = scenePlugin.getConfig();
        }
        
        return ScenePluginDTO.builder()
            .id(scenePlugin.getId())
            .pluginInstanceId(scenePlugin.getId())  // 前端使用此字段
            .sceneId(scenePlugin.getSceneId())
            .userId(scenePlugin.getUserId())
            .pluginId(scenePlugin.getPluginId())
            .pluginName(pluginName)
            .positionX(scenePlugin.getPositionX())
            .positionY(scenePlugin.getPositionY())
            .width(scenePlugin.getWidth())
            .height(scenePlugin.getHeight())
            .zIndex(scenePlugin.getZIndex())
            .isVisible(scenePlugin.getIsVisible())
            .visible(scenePlugin.getIsVisible())  // 前端使用此字段
            .config(config)
            .createdAt(scenePlugin.getCreatedAt())
            .updatedAt(scenePlugin.getUpdatedAt())
            .build();
    }
    
    /**
     * 获取用户ID
     */
    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }
    
    /**
     * 安全地从Map中获取整数值
     */
    private Integer getIntValue(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
