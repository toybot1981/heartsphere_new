package com.heartsphere.plugin.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 插件元数据
 * 
 * 描述插件的基本信息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginMetadata {
    
    /**
     * 插件唯一标识
     */
    @JsonProperty("pluginId")
    private String pluginId;
    
    /**
     * 插件名称
     */
    @JsonProperty("name")
    private String name;
    
    /**
     * 插件版本
     */
    @JsonProperty("version")
    private String version;
    
    /**
     * 插件描述
     */
    @JsonProperty("description")
    private String description;
    
    /**
     * 作者
     */
    @JsonProperty("author")
    private String author;
    
    /**
     * 插件图标URL
     */
    @JsonProperty("iconUrl")
    private String iconUrl;
    
    /**
     * 插件分类
     * 如：lifestyle（生活方式）、education（教育）、entertainment（娱乐）等
     */
    @JsonProperty("category")
    private String category;
    
    /**
     * 所需权限列表
     */
    @JsonProperty("permissions")
    @Builder.Default
    private List<String> permissions = new ArrayList<>();
    
    /**
     * 依赖的其他插件ID列表
     */
    @JsonProperty("dependencies")
    @Builder.Default
    private List<String> dependencies = new ArrayList<>();
    
    /**
     * 最低系统版本要求
     */
    @JsonProperty("minSystemVersion")
    private String minSystemVersion;
    
    /**
     * 配置模式定义（JSON Schema格式）
     */
    @JsonProperty("configSchema")
    private String configSchema;
}
