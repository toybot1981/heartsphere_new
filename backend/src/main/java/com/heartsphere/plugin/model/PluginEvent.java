package com.heartsphere.plugin.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 插件事件
 * 
 * 用于插件间和插件与系统的通信
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginEvent {
    
    /**
     * 事件类型
     */
    @JsonProperty("eventType")
    private String eventType;
    
    /**
     * 事件源（发布事件的插件ID）
     */
    @JsonProperty("source")
    private String source;
    
    /**
     * 事件目标（订阅事件的插件ID，如果为null则广播给所有订阅者）
     */
    @JsonProperty("target")
    private String target;
    
    /**
     * 事件数据
     */
    @JsonProperty("data")
    @Builder.Default
    private Map<String, Object> data = new HashMap<>();
    
    /**
     * 事件时间戳
     */
    @JsonProperty("timestamp")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    /**
     * 获取事件数据
     * 
     * @param key 数据键
     * @return 数据值
     */
    @SuppressWarnings("unchecked")
    public <T> T getData(String key) {
        return (T) data.get(key);
    }
    
    /**
     * 设置事件数据
     * 
     * @param key 数据键
     * @param value 数据值
     */
    public void setData(String key, Object value) {
        data.put(key, value);
    }
}
