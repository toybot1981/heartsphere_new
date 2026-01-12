package com.heartsphere.admin.entity.plugin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 用户插件实体
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "user_plugins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPlugin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "plugin_id", nullable = false, length = 100)
    private String pluginId;
    
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "INACTIVE";
    
    @Column(name = "config", columnDefinition = "JSON")
    private String config;  // JSON字符串
    
    @CreationTimestamp
    @Column(name = "installed_at", nullable = false, updatable = false)
    private LocalDateTime installedAt;
    
    @Column(name = "activated_at")
    private LocalDateTime activatedAt;
    
    // 关联关系
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plugin_id", referencedColumnName = "plugin_id", insertable = false, updatable = false)
    private Plugin plugin;
}
