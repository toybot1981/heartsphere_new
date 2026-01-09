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
 * 插件数据实体（通用存储）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "plugin_data",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"plugin_id", "user_id", "scene_id", "data_key"},
        name = "uk_plugin_data"
    )
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PluginDataEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "plugin_id", nullable = false, length = 100)
    private String pluginId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "scene_id", length = 100)
    private String sceneId;
    
    @Column(name = "data_key", nullable = false, length = 255)
    private String dataKey;
    
    @Column(name = "data_value", columnDefinition = "JSON")
    private String dataValue;  // JSON字符串
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
