package com.heartsphere.memory.dto;

import com.heartsphere.memory.model.FactCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 保存用户事实请求DTO
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Schema(description = "保存用户事实请求")
public class SaveFactRequest {
    
    @Schema(description = "事实描述", requiredMode = Schema.RequiredMode.REQUIRED, example = "名字: 张三")
    private String fact;
    
    @Schema(description = "事实类别", requiredMode = Schema.RequiredMode.REQUIRED, example = "PERSONAL")
    private FactCategory category;
    
    @Schema(description = "重要性 (0.0-1.0)", example = "0.9")
    private Double importance;
    
    @Schema(description = "置信度 (0.0-1.0)", example = "0.8")
    private Double confidence;
    
    @Schema(description = "标签", example = "[\"基本信息\"]")
    private List<String> tags;
    
    @Schema(description = "扩展元数据", example = "{}")
    private Map<String, Object> metadata;
}

