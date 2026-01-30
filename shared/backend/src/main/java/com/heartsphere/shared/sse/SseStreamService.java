package com.heartsphere.shared.sse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

/**
 * SSE流式服务基类
 * 提供通用的流式处理模板方法
 * 
 * @param <T> 请求类型
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RequiredArgsConstructor
public abstract class SseStreamService<T> {
    
    protected final SseEmitterManager emitterManager;
    
    /**
     * 处理流式请求
     * 
     * @param request 请求对象
     * @param handler 流式处理器
     * @return SSE Emitter
     */
    public SseEmitter stream(T request, StreamHandler<T> handler) {
        SseEmitter emitter = emitterManager.createEmitter();
        
        // 异步处理，避免阻塞
        new Thread(() -> {
            try {
                processStream(request, handler);
                
                // 发送完成事件
                SseUtils.sendComplete(emitter, "Stream completed");
                
            } catch (Exception e) {
                log.error("Stream processing failed", e);
                SseUtils.sendError(emitter, "Stream processing failed: " + e.getMessage());
                try {
                    emitter.completeWithError(new IOException("Stream processing failed", e));
                } catch (Exception ex) {
                    log.error("Failed to complete emitter with error", ex);
                }
            }
        }).start();
        
        return emitter;
    }
    
    /**
     * 处理流式数据（子类实现）
     * 
     * @param request 请求对象
     * @param handler 流式处理器
     */
    protected abstract void processStream(T request, StreamHandler<T> handler);
}
