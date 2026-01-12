package com.heartsphere.admin.dto.plugin;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 插件DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("pluginId")
    private String pluginId;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("version")
    private String version;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("author")
    private String author;
    
    @JsonProperty("iconUrl")
    private String iconUrl;
    
    @JsonProperty("category")
    private String category;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("publishStatus")
    private String publishStatus;  // DRAFT, PENDING, PUBLISHED, ARCHIVED
    
    @JsonProperty("previewUrl")
    private String previewUrl;
    
    @JsonProperty("publishNote")
    private String publishNote;
    
    @JsonProperty("publishedAt")
    private LocalDateTime publishedAt;
    
    @JsonProperty("permissions")
    private List<String> permissions;
    
    @JsonProperty("dependencies")
    private List<String> dependencies;
    
    @JsonProperty("minSystemVersion")
    private String minSystemVersion;
    
    @JsonProperty("configSchema")
    private String configSchema;
    
    @JsonProperty("defaultConfig")
    private Object defaultConfig;
    
    @JsonProperty("isSystemPlugin")
    private Boolean isSystemPlugin;
    
    @JsonProperty("usageCount")
    private Integer usageCount;
    
    @JsonProperty("rating")
    private BigDecimal rating;
    
    @JsonProperty("userCount")
    private Long userCount;  // 安装此插件的用户数
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
