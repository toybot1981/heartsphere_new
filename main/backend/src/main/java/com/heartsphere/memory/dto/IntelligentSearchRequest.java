package com.heartsphere.memory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 智能检索请求DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntelligentSearchRequest {
    
    /**
     * 查询文本
     */
    private String query;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 角色ID（可选）
     */
    private String characterId;
    
    /**
     * 参与者ID（可选）
     */
    private String participantId;
    
    /**
     * 上下文信息（可选）
     */
    private Map<String, Object> context;
    
    /**
     * 返回数量限制，默认10
     */
    @lombok.Builder.Default
    private Integer limit = 10;
    
    /**
     * 语义检索权重，默认0.4
     */
    @lombok.Builder.Default
    private Double semanticWeight = 0.4;
    
    /**
     * 关键词检索权重，默认0.4
     */
    @lombok.Builder.Default
    private Double keywordWeight = 0.4;
    
    /**
     * 关联检索权重，默认0.2
     */
    @lombok.Builder.Default
    private Double associationWeight = 0.2;
}

