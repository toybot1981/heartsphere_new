package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.agent.BaseAgent;
import com.heartsphere.aiagent.model.AgentDefinition;
import com.heartsphere.aiagent.service.AgentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Agent 管理 API
 */
@Slf4j
@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {
    
    private final AgentService agentService;
    
    /**
     * 注册 Agent
     */
    @PostMapping
    public ResponseEntity<AgentResponse> registerAgent(@RequestBody AgentDefinition definition) {
        agentService.registerAgent(definition);
        return ResponseEntity.ok(new AgentResponse(definition.getId(), "Agent 注册成功"));
    }
    
    /**
     * 执行 Agent
     */
    @PostMapping("/{agentId}/execute")
    public ResponseEntity<ExecutionResponse> executeAgent(
            @PathVariable String agentId,
            @RequestBody ExecutionRequest request) {
        try {
            Object result = agentService.executeAgent(agentId, request.getInput());
            return ResponseEntity.ok(new ExecutionResponse(true, result, null));
        } catch (Exception e) {
            log.error("执行 Agent 失败", e);
            return ResponseEntity.ok(new ExecutionResponse(false, null, e.getMessage()));
        }
    }
    
    /**
     * 获取 Agent 列表
     */
    @GetMapping
    public ResponseEntity<List<AgentInfo>> listAgents() {
        Map<String, BaseAgent> agents = agentService.listAgents();
        List<AgentInfo> agentInfos = agents.entrySet().stream()
            .map(entry -> {
                AgentDefinition def = entry.getValue().getDefinition();
                return new AgentInfo(def.getId(), def.getName(), def.getDescription(), def.getType().name());
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(agentInfos);
    }
    
    /**
     * 获取 Agent 详情
     */
    @GetMapping("/{agentId}")
    public ResponseEntity<AgentDefinition> getAgent(@PathVariable String agentId) {
        BaseAgent agent = agentService.getAgent(agentId);
        if (agent == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agent.getDefinition());
    }
    
    /**
     * 删除 Agent
     */
    @DeleteMapping("/{agentId}")
    public ResponseEntity<AgentResponse> deleteAgent(@PathVariable String agentId) {
        agentService.removeAgent(agentId);
        return ResponseEntity.ok(new AgentResponse(agentId, "Agent 删除成功"));
    }
    
    @Data
    public static class AgentResponse {
        private String agentId;
        private String message;
        
        public AgentResponse(String agentId, String message) {
            this.agentId = agentId;
            this.message = message;
        }
    }
    
    @Data
    public static class ExecutionRequest {
        private Object input;
    }
    
    @Data
    public static class ExecutionResponse {
        private boolean success;
        private Object result;
        private String error;
        
        public ExecutionResponse(boolean success, Object result, String error) {
            this.success = success;
            this.result = result;
            this.error = error;
        }
    }
    
    @Data
    public static class AgentInfo {
        private String id;
        private String name;
        private String description;
        private String type;
        
        public AgentInfo(String id, String name, String description, String type) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.type = type;
        }
    }
}

