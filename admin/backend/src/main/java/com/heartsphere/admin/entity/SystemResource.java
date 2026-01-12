package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 系统资源实体（预置图片资源）
 */
@Data
@Entity
@Table(name = "system_resources")
public class SystemResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // 资源名称

    @Column(nullable = false, length = 500)
    private String url; // 资源URL

    @Column(nullable = false, length = 50)
    private String category; // 分类：avatar, character, era, scenario, journal, general

    @Column(length = 500)
    private String description; // 资源描述

    @Column(columnDefinition = "TEXT")
    private String prompt; // AI生成图片的提示词

    @Column(length = 50)
    private String tags; // 标签（逗号分隔）

    @Column(name = "file_size")
    private Long fileSize; // 文件大小（字节）

    @Column(name = "mime_type", length = 100)
    private String mimeType; // MIME类型

    @Column(name = "width")
    private Integer width; // 图片宽度

    @Column(name = "height")
    private Integer height; // 图片高度

    @Column(name = "created_by_admin_id")
    private Long createdByAdminId; // 创建者管理员ID

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

