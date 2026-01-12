package com.heartsphere.plugin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 场景插件DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenePluginDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("pluginInstanceId")
    private Long pluginInstanceId;  // 与id相同，前端使用此字段
    
    @JsonProperty("sceneId")
    private String sceneId;
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("pluginId")
    private String pluginId;
    
    @JsonProperty("pluginName")
    private String pluginName;  // 冗余字段，方便前端显示
    
    @JsonProperty("positionX")
    private Integer positionX;
    
    @JsonProperty("positionY")
    private Integer positionY;
    
    @JsonProperty("width")
    private Integer width;
    
    @JsonProperty("height")
    private Integer height;
    
    @JsonProperty("zIndex")
    private Integer zIndex;
    
    @JsonProperty("isVisible")
    private Boolean isVisible;
    
    @JsonProperty("visible")
    private Boolean visible;  // 前端使用此字段，与isVisible相同
    
    @JsonProperty("config")
    private Object config;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
