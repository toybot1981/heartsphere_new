package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.model.AgentDefinition;
import com.heartsphere.aiagent.service.AgentService;
import com.heartsphere.aiagent.workflow.GraphWorkflowService;
import com.heartsphere.aiagent.workflow.WorkflowResult;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 工作流 API
 * 提供复杂工作流的执行接口
 */
@Slf4j
@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {
    
    private final GraphWorkflowService workflowService;
    private final AgentService agentService;
    
    /**
     * 执行顺序工作流
     */
    @PostMapping("/sequential/{agentId}")
    public ResponseEntity<WorkflowExecutionResponse> executeSequentialWorkflow(
            @PathVariable String agentId,
            @RequestBody WorkflowExecutionRequest request) {
        try {
            var agent = agentService.getAgent(agentId);
            if (agent == null) {
                return ResponseEntity.badRequest()
                    .body(new WorkflowExecutionResponse(false, null, "Agent 不存在"));
            }
            
            AgentDefinition definition = agent.getDefinition();
            CompletableFuture<WorkflowResult> future = workflowService.executeSequentialWorkflow(
                definition, request.getInput()
            );
            
            WorkflowResult result = future.get();
            
            WorkflowExecutionResponse response = new WorkflowExecutionResponse();
            response.setSuccess(result.isSuccess());
            response.setResult(result);
            response.setError(result.getError());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("执行顺序工作流失败", e);
            return ResponseEntity.ok(new WorkflowExecutionResponse(false, null, e.getMessage()));
        }
    }
    
    /**
     * 执行并行工作流
     */
    @PostMapping("/parallel/{agentId}")
    public ResponseEntity<WorkflowExecutionResponse> executeParallelWorkflow(
            @PathVariable String agentId,
            @RequestBody WorkflowExecutionRequest request) {
        try {
            var agent = agentService.getAgent(agentId);
            if (agent == null) {
                return ResponseEntity.badRequest()
                    .body(new WorkflowExecutionResponse(false, null, "Agent 不存在"));
            }
            
            AgentDefinition definition = agent.getDefinition();
            CompletableFuture<WorkflowResult> future = workflowService.executeParallelWorkflow(
                definition, request.getInput()
            );
            
            WorkflowResult result = future.get();
            
            WorkflowExecutionResponse response = new WorkflowExecutionResponse();
            response.setSuccess(result.isSuccess());
            response.setResult(result);
            response.setError(result.getError());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("执行并行工作流失败", e);
            return ResponseEntity.ok(new WorkflowExecutionResponse(false, null, e.getMessage()));
        }
    }
    
    /**
     * 执行路由工作流
     */
    @PostMapping("/routing/{agentId}")
    public ResponseEntity<WorkflowExecutionResponse> executeRoutingWorkflow(
            @PathVariable String agentId,
            @RequestBody WorkflowExecutionRequest request) {
        try {
            var agent = agentService.getAgent(agentId);
            if (agent == null) {
                return ResponseEntity.badRequest()
                    .body(new WorkflowExecutionResponse(false, null, "Agent 不存在"));
            }
            
            AgentDefinition definition = agent.getDefinition();
            CompletableFuture<WorkflowResult> future = workflowService.executeRoutingWorkflow(
                definition, request.getInput()
            );
            
            WorkflowResult result = future.get();
            
            WorkflowExecutionResponse response = new WorkflowExecutionResponse();
            response.setSuccess(result.isSuccess());
            response.setResult(result);
            response.setError(result.getError());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("执行路由工作流失败", e);
            return ResponseEntity.ok(new WorkflowExecutionResponse(false, null, e.getMessage()));
        }
    }
    
    @Data
    public static class WorkflowExecutionRequest {
        private Map<String, Object> input;
    }
    
    @Data
    public static class WorkflowExecutionResponse {
        private boolean success;
        private WorkflowResult result;
        private String error;
        
        public WorkflowExecutionResponse() {}
        
        public WorkflowExecutionResponse(boolean success, WorkflowResult result, String error) {
            this.success = success;
            this.result = result;
            this.error = error;
        }
    }
}

