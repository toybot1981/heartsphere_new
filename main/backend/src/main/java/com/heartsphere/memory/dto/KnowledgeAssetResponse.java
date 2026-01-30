package com.heartsphere.memory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 知识资产响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "知识资产响应")
public class KnowledgeAssetResponse {
    
    @Schema(description = "资产ID")
    private Long id;
    
    @Schema(description = "角色ID")
    private Long characterId;
    
    @Schema(description = "资产类型")
    private String assetType;
    
    @Schema(description = "资产标题")
    private String title;
    
    @Schema(description = "完整内容")
    private String content;
    
    @Schema(description = "摘要")
    private String summary;
    
    @Schema(description = "信任度评分 (0-100)")
    private Integer trustScore;
    
    @Schema(description = "被使用次数")
    private Integer usageCount;
    
    @Schema(description = "正面评价数")
    private Integer positiveFeedbackCount;
    
    @Schema(description = "负面评价数")
    private Integer negativeFeedbackCount;
    
    @Schema(description = "是否自动升级")
    private Boolean isAutoPromoted;
    
    @Schema(description = "是否已批准")
    private Boolean isApproved;
    
    @Schema(description = "审核者ID")
    private String approvedBy;
    
    @Schema(description = "创建时间")
    private String createdAt;
    
    @Schema(description = "更新时间")
    private String updatedAt;
    
    @Schema(description = "最后使用时间")
    private String lastUsedAt;
}
