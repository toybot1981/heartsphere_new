package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MultiAgentAgentDTO;
import com.heartsphere.admin.dto.MultiAgentAgentMetricsDTO;
import com.heartsphere.admin.service.MultiAgentAgentAdminService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 多智能体 Agent 管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/multi-agent/agents")
@RequiredArgsConstructor
@Tag(name = "Multi-Agent Agent Admin", description = "多智能体 Agent 管理 API")
public class MultiAgentAgentAdminController extends BaseAdminController {
    
    private final MultiAgentAgentAdminService agentService;
    
    /**
     * 获取 Agent 列表
     */
    @Operation(summary = "获取 Agent 列表")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MultiAgentAgentDTO>>> getAllAgents(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        validateAdmin(authHeader);
        
        List<MultiAgentAgentDTO> agents = agentService.getAllAgents();
        return ResponseEntity.ok(ApiResponse.success(agents));
    }
    
    /**
     * 获取 Agent 详情
     */
    @Operation(summary = "获取 Agent 详情")
    @GetMapping("/{agentId}")
    public ResponseEntity<ApiResponse<MultiAgentAgentDTO>> getAgentById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String agentId) {
        
        validateAdmin(authHeader);
        
        MultiAgentAgentDTO agent = agentService.getAgentById(agentId);
        return ResponseEntity.ok(ApiResponse.success(agent));
    }
    
    /**
     * 获取 Agent 性能指标
     */
    @Operation(summary = "获取 Agent 性能指标")
    @GetMapping("/{agentId}/metrics")
    public ResponseEntity<ApiResponse<MultiAgentAgentMetricsDTO>> getAgentMetrics(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String agentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        validateAdmin(authHeader);
        
        MultiAgentAgentMetricsDTO metrics = agentService.getAgentMetrics(agentId, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }
}
