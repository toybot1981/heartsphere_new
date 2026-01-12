package com.heartsphere.admin.entity.plugin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 插件实体
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "plugins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plugin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "plugin_id", unique = true, nullable = false, length = 100)
    private String pluginId;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "version", nullable = false, length = 50)
    private String version;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "author", length = 255)
    private String author;
    
    @Column(name = "icon_url", length = 500)
    private String iconUrl;
    
    @Column(name = "category", length = 100)
    private String category;
    
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "INACTIVE";
    
    @Column(name = "publish_status", length = 20)
    @Builder.Default
    private String publishStatus = "DRAFT";
    
    @Column(name = "preview_url", length = 500)
    private String previewUrl;
    
    @Column(name = "publish_note", columnDefinition = "TEXT")
    private String publishNote;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "permissions", columnDefinition = "JSON")
    private String permissions;  // JSON字符串
    
    @Column(name = "dependencies", columnDefinition = "JSON")
    private String dependencies;  // JSON字符串
    
    @Column(name = "min_system_version", length = 50)
    private String minSystemVersion;
    
    @Column(name = "config_schema", columnDefinition = "TEXT")
    private String configSchema;
    
    @Column(name = "default_config", columnDefinition = "JSON")
    private String defaultConfig;  // JSON字符串
    
    @Column(name = "is_system_plugin", nullable = false)
    @Builder.Default
    private Boolean isSystemPlugin = false;
    
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;
    
    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
