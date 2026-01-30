package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.agentmind.AgentIdentityDTO;
import com.heartsphere.admin.dto.agentmind.AgentStateHistoryDTO;
import com.heartsphere.admin.dto.agentmind.AgentStateStatisticsDTO;
import com.heartsphere.admin.service.AgentMindManagementService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Agent Mind 管理控制器
 * 提供智能体身份认知、状态监控和能力管理功能
 */
@RestController
@RequestMapping("/api/admin/agent-mind")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Agent Mind Management", description = "Agent Mind 管理 API")
public class AgentMindManagementController {
    
    private final AgentMindManagementService agentMindManagementService;
    
    // ========== 身份认知管理 ==========
    
    /**
     * 获取智能体身份认知列表
     */
    @Operation(summary = "获取智能体身份认知列表", description = "支持分页和搜索")
    @GetMapping("/identities")
    public ResponseEntity<ApiResponse<Page<AgentIdentityDTO>>> getAgentIdentities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AgentIdentityDTO> identities = agentMindManagementService.getAgentIdentities(pageable, search);
        return ResponseEntity.ok(ApiResponse.success(identities));
    }
    
    /**
     * 根据角色ID获取智能体身份认知信息
     */
    @Operation(summary = "获取智能体身份认知", description = "根据角色ID获取身份认知信息，如果不存在则自动初始化")
    @GetMapping("/identities/{characterId}")
    public ResponseEntity<ApiResponse<AgentIdentityDTO>> getAgentIdentity(@PathVariable Long characterId) {
        AgentIdentityDTO identity = agentMindManagementService.getAgentIdentity(characterId);
        return ResponseEntity.ok(ApiResponse.success(identity));
    }
    
    /**
     * 更新智能体身份认知信息
     */
    @Operation(summary = "更新智能体身份认知", description = "更新指定角色的身份认知信息")
    @PutMapping("/identities/{characterId}")
    public ResponseEntity<ApiResponse<AgentIdentityDTO>> updateAgentIdentity(
            @PathVariable Long characterId,
            @RequestBody AgentIdentityDTO dto) {
        AgentIdentityDTO updated = agentMindManagementService.updateAgentIdentity(characterId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
    
    /**
     * 初始化智能体身份认知
     */
    @Operation(summary = "初始化智能体身份认知", description = "从Character信息构建身份认知")
    @PostMapping("/identities/{characterId}/initialize")
    public ResponseEntity<ApiResponse<AgentIdentityDTO>> initializeAgentIdentity(@PathVariable Long characterId) {
        AgentIdentityDTO identity = agentMindManagementService.initializeAgentIdentity(characterId);
        return ResponseEntity.ok(ApiResponse.success(identity));
    }
    
    // ========== 状态监控 ==========
    
    /**
     * 获取智能体当前状态
     */
    @Operation(summary = "获取智能体当前状态", description = "获取指定角色的最新状态")
    @GetMapping("/states/{characterId}")
    public ResponseEntity<ApiResponse<AgentStateHistoryDTO>> getCurrentState(@PathVariable Long characterId) {
        AgentStateHistoryDTO state = agentMindManagementService.getCurrentState(characterId);
        return ResponseEntity.ok(ApiResponse.success(state));
    }
    
    /**
     * 获取智能体状态历史
     */
    @Operation(summary = "获取智能体状态历史", description = "支持分页查询")
    @GetMapping("/states/{characterId}/history")
    public ResponseEntity<ApiResponse<Page<AgentStateHistoryDTO>>> getStateHistory(
            @PathVariable Long characterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AgentStateHistoryDTO> history = agentMindManagementService.getStateHistory(characterId, pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
    
    /**
     * 根据时间范围获取状态历史
     */
    @Operation(summary = "根据时间范围获取状态历史", description = "获取指定时间范围内的状态历史记录")
    @GetMapping("/states/{characterId}/history/range")
    public ResponseEntity<ApiResponse<List<AgentStateHistoryDTO>>> getStateHistoryByTimeRange(
            @PathVariable Long characterId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<AgentStateHistoryDTO> history = agentMindManagementService.getStateHistoryByTimeRange(
                characterId, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
    
    /**
     * 获取智能体状态统计信息
     */
    @Operation(summary = "获取智能体状态统计", description = "获取状态类型统计、平均持续时间等信息")
    @GetMapping("/states/{characterId}/statistics")
    public ResponseEntity<ApiResponse<AgentStateStatisticsDTO>> getStateStatistics(@PathVariable Long characterId) {
        AgentStateStatisticsDTO statistics = agentMindManagementService.getStateStatistics(characterId);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
    
    // ========== 能力管理 ==========
    
    /**
     * 获取智能体能力列表
     */
    @Operation(summary = "获取智能体能力列表", description = "获取指定角色的能力列表")
    @GetMapping("/capabilities/{characterId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCapabilities(@PathVariable Long characterId) {
        List<Map<String, Object>> capabilities = agentMindManagementService.getCapabilities(characterId);
        return ResponseEntity.ok(ApiResponse.success(capabilities));
    }
    
    /**
     * 更新智能体能力列表
     */
    @Operation(summary = "更新智能体能力列表", description = "更新指定角色的能力列表")
    @PutMapping("/capabilities/{characterId}")
    public ResponseEntity<ApiResponse<AgentIdentityDTO>> updateCapabilities(
            @PathVariable Long characterId,
            @RequestBody List<Map<String, Object>> capabilities) {
        AgentIdentityDTO updated = agentMindManagementService.updateCapabilities(characterId, capabilities);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
    
    /**
     * 获取智能体能力边界
     */
    @Operation(summary = "获取智能体能力边界", description = "获取指定角色的能力边界")
    @GetMapping("/limitations/{characterId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLimitations(@PathVariable Long characterId) {
        List<Map<String, Object>> limitations = agentMindManagementService.getLimitations(characterId);
        return ResponseEntity.ok(ApiResponse.success(limitations));
    }
    
    /**
     * 更新智能体能力边界
     */
    @Operation(summary = "更新智能体能力边界", description = "更新指定角色的能力边界")
    @PutMapping("/limitations/{characterId}")
    public ResponseEntity<ApiResponse<AgentIdentityDTO>> updateLimitations(
            @PathVariable Long characterId,
            @RequestBody List<Map<String, Object>> limitations) {
        AgentIdentityDTO updated = agentMindManagementService.updateLimitations(characterId, limitations);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
