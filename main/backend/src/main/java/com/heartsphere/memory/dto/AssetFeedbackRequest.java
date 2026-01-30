package com.heartsphere.memory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 知识资产反馈请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "知识资产反馈请求")
public class AssetFeedbackRequest {
    
    @Schema(description = "反馈类型: positive/negative", example = "positive", required = true)
    private String feedbackType;
    
    @Schema(description = "反馈说明（可选）")
    private String comment;
}
