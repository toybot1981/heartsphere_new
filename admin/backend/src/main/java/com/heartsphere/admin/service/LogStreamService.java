package com.heartsphere.admin.service;

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
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * SSE 日志流服务
 * 管理脚本执行的实时日志推送
 */
@Service
public class LogStreamService {
    
    private static final Logger logger = LoggerFactory.getLogger(LogStreamService.class);
    
    @Autowired
    private SseEmitterManager sseEmitterManager;
    
    // 存储每个执行任务的 SSE 连接列表
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    
    /**
     * 添加 SSE 连接
     */
    public void addEmitter(Long executionId, SseEmitter emitter) {
        emitters.computeIfAbsent(executionId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        // 设置连接完成和超时回调
        emitter.onCompletion(() -> removeEmitter(executionId, emitter));
        emitter.onTimeout(() -> {
            logger.info("SSE connection timeout for execution: {}", executionId);
            removeEmitter(executionId, emitter);
        });
        
        logger.info("Added SSE emitter for execution: {}, total emitters: {}", 
                executionId, emitters.get(executionId).size());
    }
    
    /**
     * 推送日志消息
     */
    public void pushLog(Long executionId, String logLine, String level) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters == null || executionEmitters.isEmpty()) {
            return;
        }
        
        // 构建日志消息 JSON
        String jsonMessage = String.format(
            "{\"timestamp\":%d,\"level\":\"%s\",\"message\":%s}",
            System.currentTimeMillis(),
            level,
            escapeJson(logLine)
        );
        
        // 推送给所有连接的客户端
        for (SseEmitter emitter : executionEmitters) {
            try {
                SseUtils.sendEvent(emitter, "log", jsonMessage);
            } catch (Exception e) {
                logger.info("Failed to send log event: {}", e.getMessage());
            }
        }
    }
    
    /**
     * 推送执行状态更新
     */
    public void pushStatus(Long executionId, String status) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters == null || executionEmitters.isEmpty()) {
            return;
        }
        
        // 构建状态消息 JSON
        String jsonMessage = String.format(
            "{\"timestamp\":%d,\"status\":\"%s\"}",
            System.currentTimeMillis(),
            status
        );
        
        // 推送给所有连接的客户端
        for (SseEmitter emitter : executionEmitters) {
            try {
                SseUtils.sendEvent(emitter, "status", jsonMessage);
            } catch (Exception e) {
                logger.info("Failed to send status event: {}", e.getMessage());
            }
        }
    }
    
    /**
     * 移除连接
     */
    private void removeEmitter(Long executionId, SseEmitter emitter) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters != null) {
            executionEmitters.remove(emitter);
            if (executionEmitters.isEmpty()) {
                emitters.remove(executionId);
                logger.info("Removed all emitters for execution: {}", executionId);
            }
        }
    }
    
    /**
     * 清理执行任务的所有连接
     */
    public void cleanup(Long executionId) {
        List<SseEmitter> executionEmitters = emitters.remove(executionId);
        if (executionEmitters != null) {
            executionEmitters.forEach(emitter -> {
                sseEmitterManager.complete(emitter);
            });
            logger.info("Cleaned up {} emitters for execution: {}", 
                    executionEmitters.size(), executionId);
        }
    }
    
    /**
     * JSON 字符串转义
     */
    private String escapeJson(String str) {
        if (str == null) {
            return "null";
        }
        return "\"" + str
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }
}
