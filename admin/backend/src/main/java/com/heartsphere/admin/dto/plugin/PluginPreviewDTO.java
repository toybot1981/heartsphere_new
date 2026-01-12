package com.heartsphere.admin.dto.plugin;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 插件预览DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginPreviewDTO {
    
    @JsonProperty("plugin")
    private PluginDTO plugin;
    
    @JsonProperty("previewUrl")
    private String previewUrl;
    
    @JsonProperty("canPublish")
    private Boolean canPublish;  // 是否可以发布
}
