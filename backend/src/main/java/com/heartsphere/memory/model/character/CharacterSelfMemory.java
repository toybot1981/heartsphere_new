package com.heartsphere.memory.model.character;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 角色自身记忆
 * 存储角色的背景、性格、经历等信息
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "character_self_memories")
public class CharacterSelfMemory {
    
    @Id
    private String id;
    
    /**
     * 角色ID
     */
    private String characterId;
    
    /**
     * 记忆类型
     * PERSONALITY: 性格记忆
     * BACKGROUND: 背景记忆
     * EXPERIENCE: 经历记忆
     * TRAIT: 特点记忆
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
     * 如：性格特点、背景信息等
     */
    private Map<String, Object> structuredData;
    
    /**
     * 标签
     */
    private List<String> tags;
    
    /**
     * 扩展元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 创建时间
     */
    private Instant createdAt;
    
    /**
     * 更新时间
     */
    private Instant updatedAt;
    
    /**
     * 最后访问时间
     */
    private Instant lastAccessedAt;
    
    /**
     * 访问次数
     */
    private Integer accessCount;
    
    /**
     * 记忆来源
     */
    private MemorySource source;
    
    /**
     * 来源ID
     */
    private String sourceId;
    
    /**
     * 置信度
     */
    private Double confidence;
}

