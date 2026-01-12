package com.heartsphere.plugin.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * 插件配置
 * 
 * 存储插件的配置信息（JSON格式）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginConfig {
    
    /**
     * 配置数据（JSON格式，存储为Map）
     */
    @JsonProperty("config")
    @Builder.Default
    private Map<String, Object> config = new HashMap<>();
    
    /**
     * 获取配置值
     * 
     * @param key 配置键
     * @return 配置值
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) config.get(key);
    }
    
    /**
     * 获取配置值（带默认值）
     * 
     * @param key 配置键
     * @param defaultValue 默认值
     * @return 配置值，如果不存在返回默认值
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key, T defaultValue) {
        T value = (T) config.get(key);
        return value != null ? value : defaultValue;
    }
    
    /**
     * 设置配置值
     * 
     * @param key 配置键
     * @param value 配置值
     */
    public void set(String key, Object value) {
        config.put(key, value);
    }
    
    /**
     * 合并配置
     * 
     * @param other 其他配置
     */
    public void merge(PluginConfig other) {
        if (other != null && other.config != null) {
            config.putAll(other.config);
        }
    }
}
