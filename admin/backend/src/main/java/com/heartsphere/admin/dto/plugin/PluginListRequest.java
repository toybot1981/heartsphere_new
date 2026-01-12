package com.heartsphere.admin.dto.plugin;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 插件列表查询请求
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginListRequest {
    
    @JsonProperty("keyword")
    private String keyword;
    
    @JsonProperty("category")
    private String category;
    
    @JsonProperty("status")
    private String status;  // ACTIVE, INACTIVE, ALL
    
    @JsonProperty("type")
    private String type;  // SYSTEM, USER, ALL
    
    @JsonProperty("page")
    @Builder.Default
    private Integer page = 0;
    
    @JsonProperty("size")
    @Builder.Default
    private Integer size = 20;
    
    @JsonProperty("sort")
    private String sort;  // name, usage_count, rating, created_at
}
