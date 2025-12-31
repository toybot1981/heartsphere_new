package com.heartsphere.memory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 用户记忆模型
 * 用于长期记忆存储
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMemory {
    @Id
    private String id;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 记忆类型
     */
    private MemoryType type;
    
    /**
     * 重要性
     */
    private MemoryImportance importance;
    
    /**
     * 记忆内容
     */
    private String content;
    
    /**
     * 结构化数据
     */
    private Map<String, Object> structuredData;
    
    /**
     * 记忆来源
     */
    private MemorySource source;
    
    /**
     * 来源ID
     */
    private String sourceId;
    
    /**
     * 创建时间
     */
    private Instant createdAt;
    
    /**
     * 最后访问时间
     */
    private Instant lastAccessedAt;
    
    /**
     * 访问次数
     */
    private Integer accessCount;
    
    /**
     * 提取置信度
     */
    private Double confidence;
    
    /**
     * 标签
     */
    private List<String> tags;
    
    /**
     * 扩展元数据
     */
    private Map<String, Object> metadata;
}



