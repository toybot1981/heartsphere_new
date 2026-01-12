package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 同步的笔记实体
 * 存储从外部笔记服务同步过来的笔记
 */
@Data
@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "note_sync_id")
    private Long noteSyncId; // 关联的笔记同步配置ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_sync_id", insertable = false, updatable = false)
    private NoteSync noteSync;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // 笔记服务提供商

    @Column(name = "provider_note_id", nullable = false, length = 255)
    private String providerNoteId; // 在笔记服务中的笔记ID

    @Column(name = "title", nullable = false, length = 500)
    private String title; // 笔记标题

    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content; // 笔记内容

    @Column(name = "content_type", length = 50)
    private String contentType; // 内容类型：text, html, markdown等

    @Column(name = "notebook_name", length = 255)
    private String notebookName; // 笔记本名称

    @Column(name = "tags", length = 1000)
    private String tags; // 标签（逗号分隔）

    @Column(name = "url", length = 1000)
    private String url; // 笔记在原始服务中的URL

    @Column(name = "created_at_provider")
    private LocalDateTime createdAtProvider; // 在笔记服务中的创建时间

    @Column(name = "updated_at_provider")
    private LocalDateTime updatedAtProvider; // 在笔记服务中的更新时间

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false; // 是否已删除

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}




