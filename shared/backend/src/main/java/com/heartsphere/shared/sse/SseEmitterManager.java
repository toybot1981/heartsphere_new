package com.heartsphere.shared.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import org.apache.catalina.connector.ClientAbortException;

/**
 * SSE Emitter管理器
 * 统一管理SSE连接的生命周期，提供安全的发送方法
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Component
@Slf4j
public class SseEmitterManager {
    
    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    
    /**
     * 创建SSE Emitter
     * 
     * @param timeout 超时时间（毫秒），默认5分钟
     * @return SseEmitter
     */
    public SseEmitter createEmitter(long timeout) {
        SseEmitter emitter = new SseEmitter(timeout);
        
        // 设置完成回调
        emitter.onCompletion(() -> {
            log.info("SSE emitter completed");
        });
        
        // 设置超时回调
        emitter.onTimeout(() -> {
            log.warn("SSE emitter timeout");
        });
        
        // 设置错误回调
        emitter.onError((ex) -> {
            // 检查是否是客户端断开连接（正常情况，不应该记录为错误）
            boolean isClientDisconnect = false;
            String errorMessage = ex != null ? ex.getMessage() : null;
            Throwable cause = ex != null ? ex.getCause() : null;
            
            // 检查是否是 ClientAbortException（Tomcat 的异常）
            if (ex instanceof ClientAbortException || 
                (cause != null && cause instanceof ClientAbortException)) {
                isClientDisconnect = true;
            }
            
            // 检查是否是 Broken pipe 或 Connection reset
            if (ex instanceof IOException || (cause != null && cause instanceof IOException)) {
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
                // 客户端断开连接是正常情况，只记录为 DEBUG
                log.info("SSE client disconnected (normal): {}", 
                    errorMessage != null ? errorMessage : (ex != null ? ex.getClass().getSimpleName() : "unknown"));
            } else {
                // 其他异常才记录为错误
                log.error("SSE emitter error", ex);
            }
        });
        
        return emitter;
    }
    
    /**
     * 创建SSE Emitter（使用默认超时时间：5分钟）
     */
    public SseEmitter createEmitter() {
        return createEmitter(300000L); // 5分钟
    }
    
    /**
     * 安全发送SSE事件
     * 自动处理已完成、超时、错误等异常情况
     * 
     * @param emitter SSE Emitter
     * @param action 发送动作
     */
    public void safeSend(SseEmitter emitter, Consumer<SseEmitter> action) {
        if (emitter == null) {
            log.warn("Attempted to send to null emitter");
            return;
        }
        
        try {
            action.accept(emitter);
        } catch (IllegalStateException e) {
            // Emitter已经完成
            if (e.getMessage() != null && e.getMessage().contains("already completed")) {
                log.info("SSE emitter already completed, skipping send");
            } else {
                log.warn("SSE emitter state exception: {}", e.getMessage());
            }
        } catch (Exception e) {
            // 检查是否是客户端断开连接（正常情况，不应该记录为错误）
            boolean isClientDisconnect = false;
            String errorMessage = e.getMessage();
            Throwable cause = e.getCause();
            
            // 检查是否是 ClientAbortException（Tomcat 的异常）
            if (e instanceof ClientAbortException || 
                (cause != null && cause instanceof ClientAbortException)) {
                isClientDisconnect = true;
            }
            
            // 检查是否是 Broken pipe 或 Connection reset
            if (e instanceof IOException || (cause != null && cause instanceof IOException)) {
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
                // 客户端断开连接是正常情况，只记录为 DEBUG
                log.info("SSE client disconnected (normal): {}", 
                    errorMessage != null ? errorMessage : e.getClass().getSimpleName());
            } else {
                // 其他异常才记录为错误
                log.error("Unexpected error sending SSE event", e);
                try {
                    if (e instanceof IOException) {
                        emitter.completeWithError((IOException) e);
                    } else {
                        emitter.completeWithError(new IOException("SSE send error", e));
                    }
                } catch (Exception ex) {
                    log.error("Failed to complete emitter with error", ex);
                }
            }
        }
    }
    
    /**
     * 完成SSE连接
     * 
     * @param emitter SSE Emitter
     */
    public void complete(SseEmitter emitter) {
        if (emitter == null) {
            return;
        }
        
        safeSend(emitter, em -> {
            try {
                em.complete();
            } catch (Exception e) {
                log.error("Failed to complete SSE emitter", e);
            }
        });
    }
    
    /**
     * 注册emitter（可选，用于统一管理）
     * 
     * @param id 唯一标识
     * @param emitter SSE Emitter
     */
    public void register(String id, SseEmitter emitter) {
        emitters.put(id, emitter);
        
        // 设置完成回调时自动移除
        emitter.onCompletion(() -> remove(id));
        emitter.onTimeout(() -> remove(id));
        emitter.onError((ex) -> remove(id));
    }
    
    /**
     * 移除emitter
     * 
     * @param id 唯一标识
     */
    public void remove(String id) {
        emitters.remove(id);
    }
    
    /**
     * 获取emitter
     * 
     * @param id 唯一标识
     * @return SSE Emitter，如果不存在返回null
     */
    public SseEmitter get(String id) {
        return emitters.get(id);
    }
    
    /**
     * 获取所有活跃连接数
     */
    public int getActiveConnectionCount() {
        return emitters.size();
    }
}
