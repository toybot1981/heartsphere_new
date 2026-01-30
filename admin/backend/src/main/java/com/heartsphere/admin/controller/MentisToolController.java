package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.MentisToolConfigService;
import com.heartsphere.admin.service.ToolTestService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Mentis 工具管理控制器
 * 提供工具配置管理功能，作为 Mentis 管理的一部分
 */
@RestController
@RequestMapping("/api/admin/mentis/tools")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Mentis Tool Management", description = "Mentis 工具管理 API")
public class MentisToolController extends BaseAdminController {
    
    private final MentisToolConfigService mentisToolConfigService;
    private final ToolTestService toolTestService;
    
    /**
     * 获取工具列表
     * GET /api/admin/mentis/tools
     */
    @Operation(summary = "获取工具列表", description = "获取所有工具配置列表，支持分类筛选和搜索")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTools(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<MentisToolConfigService.MentisToolConfigDTO> configs;
        if (category != null && !category.trim().isEmpty()) {
            configs = mentisToolConfigService.getConfigsByCategory(category);
        } else {
            configs = mentisToolConfigService.getAllActiveConfigs();
        }
        
        // 如果有关键词，进行过滤
        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowerKeyword = keyword.toLowerCase();
            configs = configs.stream()
                .filter(config -> 
                    (config.getToolName() != null && config.getToolName().toLowerCase().contains(lowerKeyword)) ||
                    (config.getDescription() != null && config.getDescription().toLowerCase().contains(lowerKeyword))
                )
                .toList();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("tools", configs);
        response.put("total", configs.size());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 获取工具详情
     * GET /api/admin/mentis/tools/{toolName}
     */
    @Operation(summary = "获取工具详情", description = "根据工具名称获取工具配置详情")
    @GetMapping("/{toolName}")
    public ResponseEntity<ApiResponse<MentisToolConfigService.MentisToolConfigDTO>> getTool(
            @PathVariable String toolName,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Optional<MentisToolConfigService.MentisToolConfigDTO> config = mentisToolConfigService.getConfigByToolName(toolName);
        if (config.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(404, "工具配置不存在: " + toolName));
        }
        
        return ResponseEntity.ok(ApiResponse.success(config.get()));
    }
    
    /**
     * 更新工具配置
     * PUT /api/admin/mentis/tools/{toolName}/config
     */
    @Operation(summary = "更新工具配置", description = "更新指定工具的配置信息")
    @PutMapping("/{toolName}/config")
    public ResponseEntity<ApiResponse<MentisToolConfigService.MentisToolConfigDTO>> updateToolConfig(
            @PathVariable String toolName,
            @RequestBody MentisToolConfigService.MentisToolConfigDTO config,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        // 确保 toolName 匹配
        config.setToolName(toolName);
        
        MentisToolConfigService.MentisToolConfigDTO savedConfig = mentisToolConfigService.saveConfig(config);
        return ResponseEntity.ok(ApiResponse.success(savedConfig));
    }
    
    /**
     * 初始化工具配置
     * POST /api/admin/mentis/tools/init
     */
    @Operation(summary = "初始化工具配置", description = "扫描所有已注册的工具，为每个工具创建默认配置")
    @PostMapping("/init")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initializeToolConfigs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        // TODO: 调用 ToolConfigInitializer 进行初始化
        // 需要从 mentis 模块获取 ToolConfigInitializer
        Map<String, Object> result = new HashMap<>();
        result.put("message", "工具配置初始化功能需要从 mentis 模块调用");
        result.put("status", "pending");
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 测试工具执行
     * POST /api/admin/mentis/tools/{toolName}/test
     */
    @Operation(summary = "测试工具执行", description = "在测试环境中执行工具，返回执行结果")
    @PostMapping("/{toolName}/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testTool(
            @PathVariable String toolName,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        // 调用 mentis 后端的工具测试接口
        return toolTestService.testTool(toolName, request);
    }
}
