package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 提示词模板版本实体
 */
@Data
@Entity
@Table(name = "prompt_versions")
public class PromptVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "system_prompt", columnDefinition = "TEXT")
    private String systemPrompt;

    @Column(name = "user_prompt", columnDefinition = "TEXT")
    private String userPrompt;

    @Column(columnDefinition = "JSON")
    private String variables; // JSON格式的变量定义

    @Column(name = "change_log", columnDefinition = "TEXT")
    private String changeLog;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
}
