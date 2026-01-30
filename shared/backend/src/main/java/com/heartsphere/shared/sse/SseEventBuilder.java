package com.heartsphere.shared.sse;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * SSE事件构建器
 * 提供统一的事件格式和构建方法
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class SseEventBuilder {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    private String eventType;
    private Object data;
    private String eventId;
    private Long timestamp;
    
    private SseEventBuilder() {
        this.timestamp = System.currentTimeMillis();
    }
    
    /**
     * 创建事件构建器
     */
    public static SseEventBuilder create() {
        return new SseEventBuilder();
    }
    
    /**
     * 设置事件类型
     */
    public SseEventBuilder type(String eventType) {
        this.eventType = eventType;
        return this;
    }
    
    /**
     * 设置事件数据
     */
    public SseEventBuilder data(Object data) {
        this.data = data;
        return this;
    }
    
    /**
     * 设置事件ID
     */
    public SseEventBuilder id(String eventId) {
        this.eventId = eventId;
        return this;
    }
    
    /**
     * 设置时间戳
     */
    public SseEventBuilder timestamp(Long timestamp) {
        this.timestamp = timestamp;
        return this;
    }
    
    /**
     * 构建标准格式的事件数据（JSON）
     */
    public String buildJson() {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", eventType != null ? eventType : "message");
            event.put("timestamp", timestamp);
            event.put("data", data);
            if (eventId != null) {
                event.put("id", eventId);
            }
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            log.error("Failed to build SSE event JSON", e);
            return "{\"type\":\"error\",\"timestamp\":" + timestamp + ",\"data\":\"Failed to serialize event\"}";
        }
    }
    
    /**
     * 构建SseEmitter.SseEventBuilder
     */
    public SseEmitter.SseEventBuilder build() {
        SseEmitter.SseEventBuilder event = SseEmitter.event();
        
        if (eventType != null) {
            event.name(eventType);
        }
        
        if (eventId != null) {
            event.id(eventId);
        }
        
        // 使用标准JSON格式
        event.data(buildJson());
        
        return event;
    }
    
    /**
     * 快速创建消息事件
     */
    public static SseEventBuilder message(Object data) {
        return create().type("message").data(data);
    }
    
    /**
     * 快速创建完成事件
     */
    public static SseEventBuilder complete(Object data) {
        return create().type("complete").data(data);
    }
    
    /**
     * 快速创建错误事件
     */
    public static SseEventBuilder error(Object data) {
        return create().type("error").data(data);
    }
    
    /**
     * 快速创建进度事件
     */
    public static SseEventBuilder progress(Object data) {
        return create().type("progress").data(data);
    }
}
