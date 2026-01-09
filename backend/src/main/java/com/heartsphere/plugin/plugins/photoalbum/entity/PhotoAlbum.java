package com.heartsphere.plugin.plugins.photoalbum.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 相册实体类
 */
@Entity
@Table(name = "photo_albums")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoAlbum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "plugin_instance_id", nullable = false)
    private Long pluginInstanceId;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "cover_photo_id")
    private Long coverPhotoId;
    
    @Column(name = "cover_photo_url", length = 500)
    private String coverPhotoUrl;
    
    @Column(name = "photo_count", nullable = false)
    @Builder.Default
    private Integer photoCount = 0;
    
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // 存储为 JSON 字符串，暂时简化处理
    
    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;
    
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
