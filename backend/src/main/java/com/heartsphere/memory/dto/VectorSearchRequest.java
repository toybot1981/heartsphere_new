package com.heartsphere.memory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 向量搜索请求DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorSearchRequest {
    
    /**
     * 查询文本
     */
    private String query;
    
    /**
     * 用户ID（可选）
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
     * 返回数量限制，默认10
     */
    @lombok.Builder.Default
    private Integer limit = 10;
    
    /**
     * 相似度阈值（0.0-1.0），默认0.6
     */
    @lombok.Builder.Default
    private Double threshold = 0.6;
}

