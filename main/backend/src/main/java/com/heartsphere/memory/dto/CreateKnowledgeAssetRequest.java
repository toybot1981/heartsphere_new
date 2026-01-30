package com.heartsphere.memory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建知识资产请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "创建知识资产请求")
public class CreateKnowledgeAssetRequest {
    
    @Schema(description = "资产类型", example = "DOMAIN_KNOWLEDGE", required = true)
    private String assetType;
    
    @Schema(description = "资产标题", example = "财务投资的风险管理原则", required = true)
    private String title;
    
    @Schema(description = "完整内容", required = true)
    private String content;
    
    @Schema(description = "摘要（可选）")
    private String summary;
    
    @Schema(description = "来源对话ID（可选）")
    private Long sourceConversationId;
}
