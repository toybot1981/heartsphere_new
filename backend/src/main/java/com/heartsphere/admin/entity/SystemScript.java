package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 系统预设剧本实体（用于展示给用户）
 */
@Data
@Entity
@Table(name = "system_scripts")
public class SystemScript {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content; // JSON格式的剧本内容

    @Column(name = "scene_count", nullable = false)
    private Integer sceneCount = 1;

    @ManyToOne
    @JoinColumn(name = "system_era_id")
    private SystemEra systemEra;

    @Column(name = "character_ids", columnDefinition = "TEXT")
    private String characterIds; // JSON数组格式的角色ID列表

    @Column(length = 200)
    private String tags;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}



