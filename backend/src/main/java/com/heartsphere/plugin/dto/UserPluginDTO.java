package com.heartsphere.plugin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户插件DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPluginDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("pluginId")
    private String pluginId;
    
    @JsonProperty("pluginName")
    private String pluginName;  // 冗余字段，方便前端显示
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("config")
    private Object config;
    
    @JsonProperty("installedAt")
    private LocalDateTime installedAt;
    
    @JsonProperty("activatedAt")
    private LocalDateTime activatedAt;
}
