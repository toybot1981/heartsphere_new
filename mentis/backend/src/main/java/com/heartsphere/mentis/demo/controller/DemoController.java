package com.heartsphere.mentis.demo.controller;

import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.mentis.demo.model.ToolCallLog;
import com.heartsphere.mentis.demo.service.DemoService;
import com.heartsphere.mentis.demo.service.ToolCallLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 演示 API 控制器
 * 提供演示相关的 API 接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Tag(name = "演示", description = "AgentScope Computer-Use 演示 API")
public class DemoController {
    
    private final ToolCallLogService toolCallLogService;
    private final DemoService demoService;
    
    /**
     * 查询工具调用日志
     */
    @GetMapping("/tool-calls")
    @Operation(summary = "查询工具调用日志", description = "根据条件查询工具调用日志")
    public ResponseEntity<ApiResponse<List<ToolCallLog>>> getToolCalls(
            @Parameter(description = "会话ID") @RequestParam(required = false) String sessionId,
            @Parameter(description = "工具名称") @RequestParam(required = false) String toolName,
            @Parameter(description = "开始时间") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        try {
            List<ToolCallLog> logs;
            
            if (sessionId != null && !sessionId.isEmpty()) {
                if (startTime != null && endTime != null) {
                    logs = toolCallLogService.getToolCallsBySessionAndTimeRange(
                        sessionId, startTime, endTime);
                } else {
                    logs = toolCallLogService.getToolCallsBySession(sessionId);
                }
                
                // 如果指定了工具名称，进一步过滤
                if (toolName != null && !toolName.isEmpty()) {
                    logs = logs.stream()
                        .filter(log -> toolName.equals(log.getToolName()))
                        .toList();
                }
            } else if (toolName != null && !toolName.isEmpty()) {
                logs = toolCallLogService.getToolCallsByToolName(toolName);
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("sessionId or toolName is required"));
            }
            
            return ResponseEntity.ok(ApiResponse.success(logs));
        } catch (Exception e) {
            log.error("Failed to get tool calls", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to get tool calls: " + e.getMessage()));
        }
    }
    
    /**
     * 获取虚拟机状态
     */
    @GetMapping("/vm-status/{sessionId}")
    @Operation(summary = "获取虚拟机状态", description = "根据会话ID获取虚拟机状态信息")
    public ResponseEntity<ApiResponse<DemoService.VmStatusInfo>> getVmStatus(
            @Parameter(description = "会话ID") @PathVariable String sessionId) {
        
        try {
            DemoService.VmStatusInfo status = demoService.getVmStatusInfo(sessionId);
            return ResponseEntity.ok(ApiResponse.success(status));
        } catch (Exception e) {
            log.error("Failed to get VM status for session: {}", sessionId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to get VM status: " + e.getMessage()));
        }
    }
    
    /**
     * 获取工具调用统计信息
     */
    @GetMapping("/tool-call-statistics/{sessionId}")
    @Operation(summary = "获取工具调用统计信息", description = "根据会话ID获取工具调用统计信息")
    public ResponseEntity<ApiResponse<DemoService.ToolCallStatistics>> getToolCallStatistics(
            @Parameter(description = "会话ID") @PathVariable String sessionId) {
        
        try {
            DemoService.ToolCallStatistics stats = demoService.getToolCallStatistics(sessionId);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Failed to get tool call statistics for session: {}", sessionId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to get statistics: " + e.getMessage()));
        }
    }
    
    /**
     * 获取按工具名称分组的统计信息
     */
    @GetMapping("/tool-call-statistics-by-tool/{sessionId}")
    @Operation(summary = "获取按工具分组的统计信息", description = "根据会话ID获取按工具名称分组的统计信息")
    public ResponseEntity<ApiResponse<Map<String, DemoService.ToolCallStatistics>>> getToolCallStatisticsByTool(
            @Parameter(description = "会话ID") @PathVariable String sessionId) {
        
        try {
            Map<String, DemoService.ToolCallStatistics> stats = 
                demoService.getToolCallStatisticsByTool(sessionId);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Failed to get tool call statistics by tool for session: {}", sessionId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to get statistics: " + e.getMessage()));
        }
    }
    
    /**
     * 获取演示场景列表
     */
    @GetMapping("/scenarios")
    @Operation(summary = "获取演示场景列表", description = "获取所有可用的演示场景")
    public ResponseEntity<ApiResponse<List<DemoScenario>>> getScenarios() {
        try {
            // TODO: 从配置文件或数据库加载场景
            List<DemoScenario> scenarios = List.of(
                new DemoScenario("command-simple", "简单命令执行", "命令执行", 
                    "执行 ls 命令查看当前目录文件"),
                new DemoScenario("command-complex", "复杂命令执行", "命令执行", 
                    "执行带管道的复杂命令"),
                new DemoScenario("script-python", "Python 脚本执行", "脚本执行", 
                    "执行一个简单的 Python 脚本"),
                new DemoScenario("script-javascript", "JavaScript 脚本执行", "脚本执行", 
                    "执行一个简单的 JavaScript 脚本"),
                new DemoScenario("gui-screenshot", "GUI 截图操作", "GUI 操作", 
                    "获取虚拟机屏幕截图"),
                new DemoScenario("vm-lifecycle", "虚拟机生命周期", "虚拟机管理", 
                    "创建虚拟机 → 执行操作 → 删除虚拟机")
            );
            
            return ResponseEntity.ok(ApiResponse.success(scenarios));
        } catch (Exception e) {
            log.error("Failed to get scenarios", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to get scenarios: " + e.getMessage()));
        }
    }
    
    /**
     * 演示场景
     */
    @Data
    public static class DemoScenario {
        private String id;
        private String name;
        private String category;
        private String description;
        
        public DemoScenario(String id, String name, String category, String description) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.description = description;
        }
    }
}
