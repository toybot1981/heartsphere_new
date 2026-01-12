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
 * 插件数据
 * 
 * 用于插件的导入/导出
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginData {
    
    /**
     * 插件ID
     */
    @JsonProperty("pluginId")
    private String pluginId;
    
    /**
     * 插件版本
     */
    @JsonProperty("version")
    private String version;
    
    /**
     * 导出时间
     */
    @JsonProperty("exportTime")
    private LocalDateTime exportTime;
    
    /**
     * 数据内容（JSON格式，存储为Map）
     */
    @JsonProperty("data")
    @Builder.Default
    private Map<String, Object> data = new HashMap<>();
    
    /**
     * 获取数据
     * 
     * @param key 数据键
     * @return 数据值
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) data.get(key);
    }
    
    /**
     * 设置数据
     * 
     * @param key 数据键
     * @param value 数据值
     */
    public void set(String key, Object value) {
        data.put(key, value);
    }
}
