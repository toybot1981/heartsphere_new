package com.heartsphere.memory.dto;

import com.heartsphere.memory.model.PreferenceType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

/**
 * 保存用户偏好请求DTO
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Schema(description = "保存用户偏好请求")
public class SavePreferenceRequest {
    
    @Schema(description = "偏好键", requiredMode = Schema.RequiredMode.REQUIRED, example = "favorite_food")
    private String key;
    
    @Schema(description = "偏好值", requiredMode = Schema.RequiredMode.REQUIRED, example = "火锅")
    private Object value;
    
    @Schema(description = "偏好类型", requiredMode = Schema.RequiredMode.REQUIRED, example = "STRING")
    private PreferenceType type;
    
    @Schema(description = "置信度 (0.0-1.0)", example = "0.8")
    private Double confidence;
    
    @Schema(description = "扩展元数据", example = "{}")
    private Map<String, Object> metadata;
}




