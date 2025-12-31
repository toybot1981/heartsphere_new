package com.heartsphere.memory.model.character;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 角色场景记忆
 * 存储角色在特定场景切片中的记忆
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharacterSceneMemory {
    
    @Id
    private String id;
    
    /**
     * 角色ID
     */
    private String characterId;
    
    /**
     * 场景切片ID
     */
    private String eraId;
    
    /**
     * 记忆类型
     * SCENE_CONTEXT: 场景上下文
     * SCENE_EVENT: 场景事件
     * SCENE_STATE: 场景状态
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
     * 场景元数据
     */
    private Map<String, Object> sceneMetadata;
    
    /**
     * 结构化数据
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
     * 是否可跨场景继承
     * true: 场景切换时可以继承
     * false: 仅在该场景中有效
     */
    private Boolean inheritable;
    
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



