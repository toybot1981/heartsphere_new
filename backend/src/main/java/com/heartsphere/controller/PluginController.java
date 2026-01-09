package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.plugin.dto.PluginDTO;
import com.heartsphere.plugin.dto.PluginListRequest;
import com.heartsphere.plugin.dto.PluginListResponse;
import com.heartsphere.plugin.service.PluginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 用户端插件控制器
 * 提供用户可用的插件列表和操作接口
 */
@Slf4j
@RestController
@RequestMapping("/api/plugins")
@RequiredArgsConstructor
public class PluginController {
    
    private final PluginService pluginService;
    
    /**
     * 获取可用的插件列表（用户端）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PluginListResponse>> getAvailablePlugins(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String publishStatus,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        try {
            log.debug("获取可用插件列表 - status: {}, publishStatus: {}, category: {}, keyword: {}, page: {}, size: {}", 
                status, publishStatus, category, keyword, page, size);
            
            // 默认只返回已发布且启用的插件
            final String finalStatus = status != null ? status : "ACTIVE";
            final String finalPublishStatus = publishStatus != null ? publishStatus : "PUBLISHED";
            
            // 构建查询请求
            PluginListRequest request = PluginListRequest.builder()
                .status(finalStatus)
                .category(category)
                .keyword(keyword)
                .page(page)
                .size(size)
                .build();
            
            // 获取插件列表（直接在Repository层过滤publishStatus）
            PluginListResponse response = pluginService.getPluginList(request, finalPublishStatus);
            
            log.debug("获取插件列表成功，共 {} 个插件", response.getTotal());
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("获取可用插件列表失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取插件列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * 根据ID获取插件详情（用户端）
     */
    @GetMapping("/{pluginId}")
    public ResponseEntity<ApiResponse<PluginDTO>> getPluginById(
            @PathVariable String pluginId) {
        
        try {
            log.debug("获取插件详情 - pluginId: {}", pluginId);
            
            PluginDTO plugin = pluginService.getPluginById(pluginId);
            
            // 只返回已发布且启用的插件
            if (plugin == null || 
                !"ACTIVE".equals(plugin.getStatus()) || 
                !"PUBLISHED".equals(plugin.getPublishStatus())) {
                return ResponseEntity.ok(ApiResponse.error("插件不存在或未发布"));
            }
            
            return ResponseEntity.ok(ApiResponse.success(plugin));
            
        } catch (Exception e) {
            log.error("获取插件详情失败: pluginId={}", pluginId, e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取插件详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 执行插件功能
     * 
     * @param pluginId 插件ID
     * @param sceneId 场景ID（可选）
     * @param action 执行的动作（可选，如 "open", "execute", "refresh" 等）
     * @param params 执行参数（可选）
     */
    @PostMapping("/{pluginId}/execute")
    public ResponseEntity<ApiResponse<Object>> executePlugin(
            @PathVariable String pluginId,
            @RequestParam(required = false) String sceneId,
            @RequestParam(required = false, defaultValue = "execute") String action,
            @RequestBody(required = false) java.util.Map<String, Object> params,
            org.springframework.security.core.Authentication authentication) {
        
        try {
            log.info("执行插件功能 - pluginId: {}, sceneId: {}, action: {}", pluginId, sceneId, action);
            
            // 获取插件信息
            PluginDTO plugin = pluginService.getPluginById(pluginId);
            if (plugin == null || !"ACTIVE".equals(plugin.getStatus()) || !"PUBLISHED".equals(plugin.getPublishStatus())) {
                return ResponseEntity.ok(ApiResponse.error("插件不存在或未发布"));
            }
            
            // 根据插件类型执行不同的逻辑
            String category = plugin.getCategory();
            Object result = null;
            
            // 这里可以根据不同的插件类型实现不同的执行逻辑
            // 目前先返回一个通用的响应
            if ("photo_album".equals(category) || "相册".equals(category)) {
                // 相册插件：打开相册界面
                result = java.util.Map.of(
                    "action", "open_album",
                    "message", "正在打开相册插件...",
                    "pluginId", pluginId
                );
            } else if ("journal".equals(category) || "日记".equals(category)) {
                // 日记插件：打开日记界面
                result = java.util.Map.of(
                    "action", "open_journal",
                    "message", "正在打开日记插件...",
                    "pluginId", pluginId
                );
            } else {
                // 通用插件执行
                result = java.util.Map.of(
                    "action", action,
                    "message", "插件功能执行成功",
                    "pluginId", pluginId,
                    "pluginName", plugin.getName(),
                    "params", params != null ? params : java.util.Map.of()
                );
            }
            
            log.info("插件执行成功 - pluginId: {}, result: {}", pluginId, result);
            return ResponseEntity.ok(ApiResponse.success(result));
            
        } catch (Exception e) {
            log.error("执行插件功能失败: pluginId={}", pluginId, e);
            return ResponseEntity.status(500).body(ApiResponse.error("执行插件功能失败: " + e.getMessage()));
        }
    }
}
