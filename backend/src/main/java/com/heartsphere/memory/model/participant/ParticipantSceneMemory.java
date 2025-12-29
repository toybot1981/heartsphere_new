package com.heartsphere.memory.model.participant;

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
 * 参与者场景记忆
 * 存储参与者在特定场景中的记忆，支持多参与者场景
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "participant_scene_memories")
public class ParticipantSceneMemory {
    
    @Id
    private String id;
    
    /**
     * 参与者ID
     */
    private String participantId;
    
    /**
     * 场景ID
     */
    private String sceneId;
    
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
     * 场景上下文
     */
    private String sceneContext;
    
    /**
     * 相关参与者ID列表
     */
    private List<String> relatedParticipantIds;
    
    /**
     * 是否可继承到其他场景
     */
    private Boolean inheritable;
    
    /**
     * 结构化数据
     */
    private Map<String, Object> structuredData;
    
    /**
     * 标签
     */
    private List<String> tags;
    
    /**
     * 来源
     */
    private MemorySource source;
    
    /**
     * 置信度
     */
    private Double confidence;
    
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
     * 元数据
     */
    private Map<String, Object> metadata;
}

