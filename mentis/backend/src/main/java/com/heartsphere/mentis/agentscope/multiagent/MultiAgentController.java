package com.heartsphere.mentis.agentscope.multiagent;

import com.heartsphere.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 多智能体协作控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mentis/agentscope/multi-agent")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "mentis.agentscope.multi-agent", name = "enabled", havingValue = "true")
public class MultiAgentController {
    
    private final AgentRegistryService agentRegistry;
    private final MultiAgentCollaborationService collaborationService;
    
    /**
     * 注册智能体
     */
    @PostMapping("/agents")
    public ResponseEntity<ApiResponse<String>> registerAgent(@RequestBody AgentRegistryService.AgentInfo agentInfo) {
        String agentId = agentRegistry.registerAgent(agentInfo);
        return ResponseEntity.ok(ApiResponse.success(agentId));
    }
    
    /**
     * 注销智能体
     */
    @DeleteMapping("/agents/{agentId}")
    public ResponseEntity<ApiResponse<Void>> unregisterAgent(@PathVariable String agentId) {
        agentRegistry.unregisterAgent(agentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 查询智能体
     */
    @GetMapping("/agents")
    public ResponseEntity<ApiResponse<List<AgentRegistryService.AgentInfo>>> getAgents(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String capability) {
        List<AgentRegistryService.AgentInfo> agents;
        if (role != null) {
            agents = agentRegistry.findAgentsByRole(role);
        } else if (capability != null) {
            agents = agentRegistry.findAgentsByCapability(capability);
        } else {
            agents = agentRegistry.getAllAgents();
        }
        return ResponseEntity.ok(ApiResponse.success(agents));
    }
    
    /**
     * 创建协作任务
     */
    @PostMapping("/collaborations")
    public ResponseEntity<ApiResponse<String>> createCollaboration(
            @RequestBody CreateCollaborationRequest request) {
        String collaborationId = collaborationService.createCollaboration(
                request.getTaskDescription(),
                request.getAgentIds()
        );
        return ResponseEntity.ok(ApiResponse.success(collaborationId));
    }
    
    /**
     * 执行协作任务
     */
    @PostMapping("/collaborations/{collaborationId}/execute")
    public ResponseEntity<ApiResponse<MultiAgentCollaborationService.CollaborationResult>> executeCollaboration(
            @PathVariable String collaborationId) {
        MultiAgentCollaborationService.CollaborationResult result = 
                collaborationService.executeCollaboration(collaborationId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 获取协作任务状态
     */
    @GetMapping("/collaborations/{collaborationId}/status")
    public ResponseEntity<ApiResponse<MultiAgentCollaborationService.CollaborationStatus>> getCollaborationStatus(
            @PathVariable String collaborationId) {
        MultiAgentCollaborationService.CollaborationStatus status = 
                collaborationService.getCollaborationStatus(collaborationId);
        return ResponseEntity.ok(ApiResponse.success(status));
    }
    
    /**
     * 创建协作任务请求
     */
    public static class CreateCollaborationRequest {
        private String taskDescription;
        private List<String> agentIds;
        
        public String getTaskDescription() {
            return taskDescription;
        }
        
        public void setTaskDescription(String taskDescription) {
            this.taskDescription = taskDescription;
        }
        
        public List<String> getAgentIds() {
            return agentIds;
        }
        
        public void setAgentIds(List<String> agentIds) {
            this.agentIds = agentIds;
        }
    }
}
