package com.heartsphere.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.shared.sse.SseEmitterManager;
import com.heartsphere.shared.sse.SseUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 流程执行状态流服务
 * 用于推送流程执行状态更新到前端
 */
@Service
public class PipelineStreamService {
    
    private static final Logger logger = LoggerFactory.getLogger(PipelineStreamService.class);
    
    @Autowired
    private SseEmitterManager sseEmitterManager;
    
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 添加SSE连接
     */
    public void addEmitter(Long executionId, SseEmitter emitter) {
        emitters.computeIfAbsent(executionId, k -> new java.util.concurrent.CopyOnWriteArrayList<>()).add(emitter);
        
        emitter.onCompletion(() -> removeEmitter(executionId, emitter));
        emitter.onTimeout(() -> removeEmitter(executionId, emitter));
        emitter.onError((ex) -> {
            // 使用 SseEmitterManager 的统一错误处理逻辑
            // 客户端断开连接是正常情况，不应该记录为错误
            boolean isClientDisconnect = false;
            String errorMessage = ex != null ? ex.getMessage() : null;
            Throwable cause = ex != null ? ex.getCause() : null;
            
            // 检查是否是 ClientAbortException 或 Broken pipe
            if (ex instanceof org.apache.catalina.connector.ClientAbortException || 
                (cause != null && cause instanceof org.apache.catalina.connector.ClientAbortException)) {
                isClientDisconnect = true;
            }
            
            if (ex instanceof java.io.IOException || (cause != null && cause instanceof java.io.IOException)) {
                String message = errorMessage != null ? errorMessage : 
                    (cause != null ? cause.getMessage() : "");
                if (message != null && (message.contains("Broken pipe") || 
                    message.contains("Connection reset by peer") ||
                    message.contains("Connection closed") ||
                    message.contains("Connection reset"))) {
                    isClientDisconnect = true;
                }
            }
            
            if (isClientDisconnect) {
                logger.info("SSE client disconnected (normal) for execution {}: {}", 
                    executionId, errorMessage != null ? errorMessage : (ex != null ? ex.getClass().getSimpleName() : "unknown"));
            } else {
                logger.error("SSE emitter error for execution {}", executionId, ex);
            }
            removeEmitter(executionId, emitter);
        });
    }
    
    /**
     * 推送流程状态更新
     */
    public void pushStatus(Long executionId, String status) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters == null || executionEmitters.isEmpty()) {
            return;
        }
        
        try {
            String message = formatStatusMessage(status);
            for (SseEmitter emitter : executionEmitters) {
                SseUtils.sendEvent(emitter, "status", message);
            }
        } catch (Exception e) {
            logger.error("Error pushing status for execution {}", executionId, e);
        }
    }
    
    /**
     * 推送步骤状态更新
     */
    public void pushStepStatus(Long executionId, Long stepId, String status, String stepName) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters == null || executionEmitters.isEmpty()) {
            return;
        }
        
        try {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("stepId", stepId);
            data.put("status", status);
            data.put("stepName", stepName);
            data.put("timestamp", System.currentTimeMillis());
            
            String message = objectMapper.writeValueAsString(data);
            for (SseEmitter emitter : executionEmitters) {
                SseUtils.sendEvent(emitter, "step-status", message);
            }
        } catch (Exception e) {
            logger.error("Error pushing step status for execution {}", executionId, e);
        }
    }
    
    /**
     * 推送流程执行更新
     */
    public void pushExecutionUpdate(Long executionId, Map<String, Object> executionData) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters == null || executionEmitters.isEmpty()) {
            return;
        }
        
        try {
            String message = objectMapper.writeValueAsString(executionData);
            for (SseEmitter emitter : executionEmitters) {
                SseUtils.sendEvent(emitter, "execution-update", message);
            }
        } catch (Exception e) {
            logger.error("Error pushing execution update for execution {}", executionId, e);
        }
    }
    
    /**
     * 移除SSE连接
     */
    private void removeEmitter(Long executionId, SseEmitter emitter) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters != null) {
            executionEmitters.remove(emitter);
            if (executionEmitters.isEmpty()) {
                emitters.remove(executionId);
            }
        }
    }
    
    /**
     * 清理所有连接
     */
    public void cleanup(Long executionId) {
        List<SseEmitter> executionEmitters = emitters.remove(executionId);
        if (executionEmitters != null) {
            for (SseEmitter emitter : executionEmitters) {
                sseEmitterManager.complete(emitter);
            }
        }
    }
    
    /**
     * 格式化状态消息
     */
    private String formatStatusMessage(String status) {
        try {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("status", status);
            data.put("timestamp", System.currentTimeMillis());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{\"status\":\"" + status + "\"}";
        }
    }
}
