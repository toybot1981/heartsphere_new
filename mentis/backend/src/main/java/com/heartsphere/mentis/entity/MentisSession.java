package com.heartsphere.mentis.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Mentis会话实体
 * 表示一次用户与Mentis智能体的完整对话会话
 */
@Entity
@Table(name = "mentis_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 会话唯一标识
     */
    @Column(unique = true, nullable = false, length = 200)
    private String sessionId;

    /**
     * 用户ID
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * 会话标题
     */
    @Column(length = 500)
    private String title;

    /**
     * 会话状态：ACTIVE, PAUSED, COMPLETED, ARCHIVED
     */
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    /**
     * 虚拟机状态：IDLE, RUNNING, ERROR
     */
    @Column(nullable = false, length = 20)
    private String vmStatus = "IDLE";

    /**
     * 虚拟机镜像ID或标识
     */
    @Column(length = 200)
    private String vmImageId;

    /**
     * 虚拟机配置信息（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String vmConfig;

    /**
     * 会话上下文信息（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String context;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 最后活跃时间
     */
    private LocalDateTime lastActiveAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MentisTask> tasks;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MentisMessage> messages;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastActiveAt = LocalDateTime.now();
        if (sessionId == null) {
            sessionId = "mentis_" + System.currentTimeMillis() + "_" + userId;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
