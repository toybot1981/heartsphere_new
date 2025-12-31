package com.heartsphere.memory.dto;

import com.heartsphere.memory.model.MessageRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

/**
 * 保存消息请求DTO
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Schema(description = "保存消息请求")
public class SaveMessageRequest {
    
    @Schema(description = "消息角色", requiredMode = Schema.RequiredMode.REQUIRED, example = "USER")
    private MessageRole role;
    
    @Schema(description = "消息内容", requiredMode = Schema.RequiredMode.REQUIRED, example = "你好，我叫张三")
    private String content;
    
    @Schema(description = "元数据", example = "{}")
    private Map<String, Object> metadata;
    
    @Schema(description = "重要性评分 (0.0-1.0)", example = "0.5")
    private Double importance;
}



