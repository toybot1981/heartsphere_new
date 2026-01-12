package com.heartsphere.memory.entity;

import com.heartsphere.memory.model.PreferenceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 用户偏好实体（MySQL）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_preferences", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_key", columnList = "preference_key"),
    @Index(name = "idx_user_key", columnList = "user_id,preference_key", unique = true)
})
public class UserPreferenceEntity {
    
    @Id
    @Column(length = 64)
    private String id;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;
    
    /**
     * 偏好键
     */
    @Column(name = "preference_key", nullable = false, length = 100)
    private String key;
    
    /**
     * 偏好值
     */
    @Column(name = "preference_value", columnDefinition = "TEXT", nullable = false)
    private String value;
    
    /**
     * 偏好类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "preference_type", length = 30)
    private PreferenceType type;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


