package com.heartsphere.memory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 角色学习统计响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "角色学习统计")
public class CharacterLearningStatsResponse {
    
    @Schema(description = "角色ID")
    private Long characterId;
    
    @Schema(description = "经验等级 (1-5)")
    private Integer experienceLevel;
    
    @Schema(description = "经验等级名称")
    private String experienceLevelName;
    
    @Schema(description = "总资产数")
    private Long totalAssets;
    
    @Schema(description = "已批准资产数")
    private Long approvedAssets;
    
    @Schema(description = "待审核资产数")
    private Long pendingAssets;
    
    @Schema(description = "平均信任度")
    private Double averageTrustScore;
    
    @Schema(description = "等级描述")
    private String levelDescription;
    
    @Schema(description = "晋升到下一等级需要的资产数")
    private Long nextLevelAssetRequirement;
    
    @Schema(description = "晋升到下一等级需要的信任度")
    private Integer nextLevelTrustRequirement;
    
    @Schema(description = "当前等级的进度百分比 (0-100)")
    private Integer progressPercentage;
}
