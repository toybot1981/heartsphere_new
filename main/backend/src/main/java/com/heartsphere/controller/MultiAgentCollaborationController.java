package com.heartsphere.controller;

import com.heartsphere.character.multiagent.LifeAssistantOrchestrator;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 多智能体协作 API 控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/multi-agent")
@RequiredArgsConstructor
public class MultiAgentCollaborationController {
    
    private final LifeAssistantOrchestrator lifeAssistantOrchestrator;
    
    /**
     * 创建协作请求
     */
    @PostMapping("/collaborate")
    public ResponseEntity<Map<String, Object>> collaborate(
            @RequestBody CollaborationRequest request,
            @AuthenticationPrincipal String userId) {
        
        log.info("Collaboration request: userId={}, request={}", userId, request.getRequest());
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(
                request.getRequest(),
                userId,
                request.getSessionId() != null ? request.getSessionId() : "default"
            );
        
        // 异步处理，立即返回协作 ID
        CollaborationOrchestrator.CollaborationResult result = future.join();
        
        return ResponseEntity.ok(Map.of(
            "collaborationId", result.getCollaborationId(),
            "status", "running",
            "message", "协作已启动"
        ));
    }
    
    /**
     * 获取协作状态
     */
    @GetMapping("/collaboration/{collaborationId}/status")
    public ResponseEntity<Map<String, Object>> getStatus(
            @PathVariable String collaborationId) {
        
        CollaborationOrchestrator.CollaborationStatus status = 
            lifeAssistantOrchestrator.getStatus(collaborationId);
        
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(Map.of(
            "collaborationId", collaborationId,
            "status", status.name()
        ));
    }
    
    /**
     * 获取协作结果
     */
    @PostMapping("/collaboration/{collaborationId}/execute")
    public ResponseEntity<Map<String, Object>> execute(
            @PathVariable String collaborationId) {
        
        // 重新执行或获取结果
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate("", "", "");
        
        CollaborationOrchestrator.CollaborationResult result = future.join();
        
        return ResponseEntity.ok(Map.of(
            "collaborationId", result.getCollaborationId(),
            "success", result.isSuccess(),
            "result", result.getResult() != null ? result.getResult() : "",
            "agentResults", result.getAgentResults() != null ? result.getAgentResults() : Map.of(),
            "errors", result.getErrors() != null ? result.getErrors() : java.util.List.of()
        ));
    }
    
    /**
     * 取消协作
     */
    @DeleteMapping("/collaboration/{collaborationId}")
    public ResponseEntity<Map<String, Object>> cancel(
            @PathVariable String collaborationId) {
        
        lifeAssistantOrchestrator.cancel(collaborationId);
        
        return ResponseEntity.ok(Map.of(
            "collaborationId", collaborationId,
            "status", "cancelled",
            "message", "协作已取消"
        ));
    }
    
    /**
     * 协作请求 DTO
     */
    public static class CollaborationRequest {
        private String request;
        private String sessionId;
        
        // Getters and Setters
        public String getRequest() {
            return request;
        }
        
        public void setRequest(String request) {
            this.request = request;
        }
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
    }
}
