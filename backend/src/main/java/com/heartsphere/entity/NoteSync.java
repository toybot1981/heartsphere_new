package com.heartsphere.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 笔记同步授权信息实体
 * 存储用户对不同笔记服务的授权信息
 */
@Data
@Entity
@Table(name = "note_syncs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NoteSync {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // 笔记服务提供商：evernote, notion, obsidian等

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken; // OAuth访问令牌

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken; // OAuth刷新令牌

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt; // 令牌过期时间

    @Column(name = "provider_user_id")
    private String providerUserId; // 在笔记服务中的用户ID

    @Column(name = "provider_username")
    private String providerUsername; // 在笔记服务中的用户名

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 是否启用同步

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt; // 最后同步时间

    @Column(name = "sync_status", length = 50)
    private String syncStatus; // 同步状态：success, error, syncing

    @Column(name = "sync_error", columnDefinition = "TEXT")
    private String syncError; // 同步错误信息

    @Column(name = "extra_data", columnDefinition = "TEXT")
    private String extraData; // 额外的配置数据（JSON格式）

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}




