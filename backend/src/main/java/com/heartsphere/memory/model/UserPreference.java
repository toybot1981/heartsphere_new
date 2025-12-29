package com.heartsphere.memory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

/**
 * 用户偏好模型
 * 用于长期记忆存储
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_preferences")
public class UserPreference {
    @Id
    private String id;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 偏好键
     */
    private String key;
    
    /**
     * 偏好值
     */
    private Object value;
    
    /**
     * 偏好类型
     */
    private PreferenceType type;
    
    /**
     * 置信度 (0.0-1.0)
     */
    private Double confidence;
    
    /**
     * 更新时间
     */
    private Instant updatedAt;
    
    /**
     * 访问次数
     */
    private Integer accessCount;
    
    /**
     * 最后访问时间
     */
    private Instant lastAccessedAt;
    
    /**
     * 扩展元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 记录访问
     */
    public void recordAccess() {
        this.lastAccessedAt = Instant.now();
        this.accessCount = (this.accessCount == null ? 0 : this.accessCount) + 1;
    }
}

