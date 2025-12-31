package com.heartsphere.memory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;

/**
 * 记忆向量
 * 存储记忆的向量嵌入，用于语义搜索
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryVector {
    
    @Id
    private String id;
    
    /**
     * 记忆ID
     */
    private String memoryId;
    
    /**
     * 记忆类型
     */
    private MemoryType memoryType;
    
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
     * 向量数据（存储为数组）
     */
    private float[] vector;
    
    /**
     * 向量维度
     */
    private Integer dimension;
    
    /**
     * 创建时间
     */
    private Instant createdAt;
    
    /**
     * 更新时间
     */
    private Instant updatedAt;
}



