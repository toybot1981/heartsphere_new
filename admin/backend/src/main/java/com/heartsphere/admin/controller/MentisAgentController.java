package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.AgentRoleDTO;
import com.heartsphere.admin.dto.MentisAgentConfigDTO;
import com.heartsphere.admin.service.MentisAgentService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Mentis Agent 管理控制器
 * 提供 Agent 角色配置管理功能
 */
@RestController
@RequestMapping("/api/admin/mentis/agents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Mentis Agent Management", description = "Mentis Agent 角色管理 API")
public class MentisAgentController {
    
    private final MentisAgentService mentisAgentService;
    
    /**
     * 获取可用的 agent 列表（从 main 后端）
     */
    @Operation(summary = "获取可用 Agent 列表", description = "从 main 后端获取可用的角色列表，已过滤出具备丰富能力的角色")
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<AgentRoleDTO>>> getAvailableAgents() {
        List<AgentRoleDTO> agents = mentisAgentService.fetchAvailableAgents();
        return ResponseEntity.ok(ApiResponse.success(agents));
    }
    
    /**
     * 获取已配置的 agent 列表
     */
    @GetMapping("/configured")
    public ResponseEntity<ApiResponse<List<MentisAgentConfigDTO>>> getConfiguredAgents() {
        List<MentisAgentConfigDTO> agents = mentisAgentService.getConfiguredAgents();
        return ResponseEntity.ok(ApiResponse.success(agents));
    }
    
    /**
     * 配置 agent 用于 Mentis
     */
    @PostMapping("/configure")
    public ResponseEntity<ApiResponse<MentisAgentConfigDTO>> configureAgent(
            @RequestBody Map<String, Object> request) {
        Long agentId = Long.valueOf(request.get("agentId").toString());
        @SuppressWarnings("unchecked")
        Map<String, Object> configuration = (Map<String, Object>) request.get("configuration");
        
        MentisAgentConfigDTO config = mentisAgentService.configureAgentForMentis(agentId, configuration);
        return ResponseEntity.ok(ApiResponse.success(config));
    }
    
    /**
     * 移除 agent 配置
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeAgentConfig(@PathVariable Long id) {
        mentisAgentService.removeAgentConfig(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 获取 agent 能力详情
     */
    @GetMapping("/{id}/capabilities")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAgentCapabilities(@PathVariable Long id) {
        Map<String, Object> capabilities = mentisAgentService.getAgentCapabilities(id);
        return ResponseEntity.ok(ApiResponse.success(capabilities));
    }
    
    /**
     * 启用/禁用 agent 配置
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleAgentConfig(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        boolean enabled = request.getOrDefault("enabled", true);
        mentisAgentService.toggleAgentConfig(id, enabled);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
