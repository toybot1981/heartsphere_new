package com.heartsphere.mentis.demo.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 演示事件服务
 * 用于推送工具调用和虚拟机状态变更事件
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class DemoEventService {
    
    // 存储所有活跃的 SSE 连接，key 为 sessionId
    private final Map<String, SseEmitter> sessionEmitters = new ConcurrentHashMap<>();
    
    // 存储所有活跃的 SSE 连接（用于管理端全局监控），key 为连接ID
    private final Map<String, SseEmitter> globalEmitters = new ConcurrentHashMap<>();
    
    /**
     * 注册会话的 SSE 连接
     */
    public SseEmitter registerSessionEmitter(String sessionId) {
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        // 设置超时处理
        emitter.onTimeout(() -> {
            log.info("SSE connection timeout for session: {}", sessionId);
            sessionEmitters.remove(sessionId);
        });
        
        // 设置错误处理
        emitter.onError((ex) -> {
            log.error("SSE connection error for session: {}", sessionId, ex);
            sessionEmitters.remove(sessionId);
        });
        
        // 设置完成处理
        emitter.onCompletion(() -> {
            log.info("SSE connection completed for session: {}", sessionId);
            sessionEmitters.remove(sessionId);
        });
        
        sessionEmitters.put(sessionId, emitter);
        log.info("Registered SSE emitter for session: {}", sessionId);
        
        return emitter;
    }
    
    /**
     * 注册全局 SSE 连接（用于管理端）
     */
    public SseEmitter registerGlobalEmitter(String connectionId) {
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        emitter.onTimeout(() -> {
            log.info("Global SSE connection timeout: {}", connectionId);
            globalEmitters.remove(connectionId);
        });
        
        emitter.onError((ex) -> {
            log.error("Global SSE connection error: {}", connectionId, ex);
            globalEmitters.remove(connectionId);
        });
        
        emitter.onCompletion(() -> {
            log.info("Global SSE connection completed: {}", connectionId);
            globalEmitters.remove(connectionId);
        });
        
        globalEmitters.put(connectionId, emitter);
        log.info("Registered global SSE emitter: {}", connectionId);
        
        return emitter;
    }
    
    /**
     * 推送工具调用开始事件
     */
    public void pushToolCallStart(String sessionId, ToolCallEvent event) {
        pushToSession(sessionId, "tool_call_start", event);
        pushToGlobal("tool_call_start", event);
    }
    
    /**
     * 推送工具调用结束事件
     */
    public void pushToolCallEnd(String sessionId, ToolCallEvent event) {
        pushToSession(sessionId, "tool_call_end", event);
        pushToGlobal("tool_call_end", event);
    }
    
    /**
     * 推送工具调用错误事件
     */
    public void pushToolCallError(String sessionId, ToolCallEvent event) {
        pushToSession(sessionId, "tool_call_error", event);
        pushToGlobal("tool_call_error", event);
    }
    
    /**
     * 推送虚拟机状态变更事件
     */
    public void pushVmStatusChange(String sessionId, VmStatusEvent event) {
        pushToSession(sessionId, "vm_status_change", event);
        pushToGlobal("vm_status_change", event);
    }
    
    /**
     * 推送到指定会话的 SSE 连接
     */
    private void pushToSession(String sessionId, String eventName, Object data) {
        SseEmitter emitter = sessionEmitters.get(sessionId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(data));
                log.info("Pushed {} event to session: {}", eventName, sessionId);
            } catch (IOException e) {
                log.error("Failed to push {} event to session: {}", eventName, sessionId, e);
                sessionEmitters.remove(sessionId);
            } catch (Exception e) {
                log.error("Unexpected error pushing {} event to session: {}", eventName, sessionId, e);
                sessionEmitters.remove(sessionId);
            }
        } else {
            log.info("No SSE emitter found for session: {}", sessionId);
        }
    }
    
    /**
     * 推送到所有全局 SSE 连接（管理端）
     */
    private void pushToGlobal(String eventName, Object data) {
        globalEmitters.entrySet().removeIf(entry -> {
            try {
                entry.getValue().send(SseEmitter.event()
                    .name(eventName)
                    .data(data));
                return false;
            } catch (IOException e) {
                log.error("Failed to push {} event to global emitter: {}", eventName, entry.getKey(), e);
                return true; // 移除失败的连接
            } catch (Exception e) {
                log.error("Unexpected error pushing {} event to global emitter: {}", eventName, entry.getKey(), e);
                return true;
            }
        });
    }
    
    /**
     * 工具调用事件
     */
    @Data
    public static class ToolCallEvent {
        private String sessionId;
        private Long logId;
        private String toolName;
        private Map<String, Object> parameters;
        private Object result;
        private String status;
        private Long duration;
        private String errorMessage;
        private LocalDateTime timestamp;
        
        public ToolCallEvent() {
            this.timestamp = LocalDateTime.now();
        }
    }
    
    /**
     * 虚拟机状态变更事件
     */
    @Data
    public static class VmStatusEvent {
        private String sessionId;
        private String vmId;
        private String status;
        private String previousStatus;
        private LocalDateTime timestamp;
        
        public VmStatusEvent() {
            this.timestamp = LocalDateTime.now();
        }
    }
}
