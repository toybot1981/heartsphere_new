package com.heartsphere.aiagent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 创作作品实体
 * 用于存储所有生成的作品（图片、视频、音频）
 */
@Data
@Entity
@Table(name = "creations")
public class CreationEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String creationId; // 唯一标识
    
    @Column(nullable = false)
    private String type; // image, video, audio
    
    @Column(nullable = false)
    private String title; // 作品标题
    
    @Column(columnDefinition = "TEXT")
    private String prompt; // 生成时使用的提示词
    
    @Column(nullable = false)
    private String fileUrl; // 文件 URL
    
    @Column
    private String thumbnailUrl; // 缩略图 URL（视频/音频用）
    
    @Column
    private String metadata; // JSON 格式的元数据（画幅、分辨率、音色等）
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private String userId; // 用户 ID（可选）
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (creationId == null) {
            creationId = "creation_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
        }
    }
}





