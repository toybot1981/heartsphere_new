package com.heartsphere.plugin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 场景插件实体
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "scene_plugins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenePlugin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "scene_id", nullable = false, length = 100)
    private String sceneId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "plugin_id", nullable = false, length = 100)
    private String pluginId;
    
    @Column(name = "position_x")
    private Integer positionX;
    
    @Column(name = "position_y")
    private Integer positionY;
    
    @Column(name = "width")
    private Integer width;
    
    @Column(name = "height")
    private Integer height;
    
    @Column(name = "z_index", nullable = false)
    @Builder.Default
    private Integer zIndex = 0;
    
    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private Boolean isVisible = true;
    
    @Column(name = "config", columnDefinition = "JSON")
    private String config;  // JSON字符串
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // 关联关系
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plugin_id", referencedColumnName = "plugin_id", insertable = false, updatable = false)
    private Plugin plugin;
}
