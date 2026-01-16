package com.heartsphere.mentis.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Mentis消息实体
 * 表示用户和Mentis之间的对话消息
 */
@Entity
@Table(name = "mentis_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 消息唯一标识
     */
    @Column(unique = true, nullable = false)
    private String messageId;

    /**
     * 关联的会话
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore // 避免序列化时的无限递归
    private MentisSession session;

    /**
     * 消息角色：USER, MENTIS, SYSTEM
     */
    @Column(nullable = false, length = 20)
    private String role;

    /**
     * 消息内容
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * 消息类型：TEXT, COMMAND, RESULT, ERROR, ACTION
     */
    @Column(nullable = false, length = 20)
    private String messageType = "TEXT";

    /**
     * 关联的任务ID（如果消息与任务相关）
     */
    @Column(length = 100)
    private String taskId;

    /**
     * 元数据（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (messageId == null) {
            messageId = "msg_" + System.currentTimeMillis() + "_" + (session != null ? session.getId() : 0);
        }
    }
}
