package com.heartsphere.memory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.Map;

/**
 * 归档记忆
 * 存储已归档的记忆数据
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivedMemory {
    
    @Id
    private String id;
    
    /**
     * 原始记忆ID
     */
    private String originalMemoryId;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 记忆类型
     */
    private MemoryType memoryType;
    
    /**
     * 记忆内容（可能已压缩）
     */
    private String content;
    
    /**
     * 元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 归档时间
     */
    private Instant archivedAt;
    
    /**
     * 归档原因
     */
    private String archiveReason;
    
    /**
     * 原始创建时间
     */
    private Instant originalCreatedAt;
    
    /**
     * 原始更新时间
     */
    private Instant originalUpdatedAt;
    
    /**
     * 最后访问时间
     */
    private Instant lastAccessedAt;
    
    /**
     * 是否已压缩
     */
    private Boolean compressed;
    
    /**
     * 重要性（归档时的重要性）
     */
    private MemoryImportance importance;
}


