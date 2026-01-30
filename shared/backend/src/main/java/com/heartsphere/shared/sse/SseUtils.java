package com.heartsphere.shared.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.apache.catalina.connector.ClientAbortException;

import java.io.IOException;
import java.util.function.Consumer;

/**
 * SSE工具类
 * 提供常用的SSE操作方法
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class SseUtils {
    
    /**
     * 安全发送SSE事件（静态方法，方便使用）
     * 
     * @param emitter SSE Emitter
     * @param action 发送动作
     */
    public static void safeSend(SseEmitter emitter, Consumer<SseEmitter> action) {
        if (emitter == null) {
            log.warn("Attempted to send to null emitter");
            return;
        }
        
        try {
            action.accept(emitter);
        } catch (IllegalStateException e) {
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
     * 发送标准格式的事件
     * 
     * @param emitter SSE Emitter
     * @param eventType 事件类型
     * @param data 事件数据
     */
    public static void sendEvent(SseEmitter emitter, String eventType, Object data) {
        safeSend(emitter, em -> {
            try {
                SseEventBuilder event = SseEventBuilder.create()
                        .type(eventType)
                        .data(data);
                SseEmitter.SseEventBuilder sseEvent = event.build();
                em.send(sseEvent);
            } catch (IllegalStateException e) {
                // Emitter 已经完成，不需要记录错误
                if (e.getMessage() != null && e.getMessage().contains("already completed")) {
                    log.info("SSE emitter already completed, skipping send");
                } else {
                    throw e; // 重新抛出其他 IllegalStateException
                }
            }
        });
    }
    
    /**
     * 发送消息事件
     */
    public static void sendMessage(SseEmitter emitter, Object data) {
        sendEvent(emitter, "message", data);
    }
    
    /**
     * 发送完成事件
     */
    public static void sendComplete(SseEmitter emitter, Object data) {
        sendEvent(emitter, "complete", data);
        safeSend(emitter, SseEmitter::complete);
    }
    
    /**
     * 发送错误事件
     */
    public static void sendError(SseEmitter emitter, Object data) {
        sendEvent(emitter, "error", data);
    }
    
    /**
     * 发送进度事件
     */
    public static void sendProgress(SseEmitter emitter, Object data) {
        sendEvent(emitter, "progress", data);
    }
}
