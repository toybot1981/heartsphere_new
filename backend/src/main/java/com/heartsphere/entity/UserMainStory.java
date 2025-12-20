package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 用户主线剧情实体
 * 用于存储用户创建的主线剧情，结构类似于系统预置主线剧情
 */
@Data
@Entity
@Table(name = "user_main_stories")
public class UserMainStory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "era_id", nullable = false)
    private Era era;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "age")
    private Integer age;

    @Column(name = "role", length = 50)
    private String role = "叙事者";

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "background_url", columnDefinition = "TEXT")
    private String backgroundUrl;

    @Column(name = "theme_color", length = 50)
    private String themeColor;

    @Column(name = "color_accent", length = 20)
    private String colorAccent;

    @Column(name = "first_message", columnDefinition = "TEXT")
    private String firstMessage;

    @Column(name = "system_instruction", columnDefinition = "TEXT")
    private String systemInstruction;

    @Column(name = "voice_name", length = 50)
    private String voiceName;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "speech_style", columnDefinition = "TEXT")
    private String speechStyle;

    @Column(name = "catchphrases", columnDefinition = "TEXT")
    private String catchphrases;

    @Column(name = "secrets", columnDefinition = "TEXT")
    private String secrets;

    @Column(name = "motivations", columnDefinition = "TEXT")
    private String motivations;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // 为前端提供userId字段
    @org.springframework.data.annotation.Transient
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    // 为前端提供eraId字段
    @org.springframework.data.annotation.Transient
    public Long getEraId() {
        return era != null ? era.getId() : null;
    }
}




