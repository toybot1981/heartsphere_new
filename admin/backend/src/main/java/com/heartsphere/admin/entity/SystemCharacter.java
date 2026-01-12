package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 系统预设角色实体（用于初始化用户数据）
 */
@Data
@Entity
@Table(name = "system_characters")
public class SystemCharacter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "role", length = 50)
    private String role;

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

    @Column(name = "mbti", length = 10)
    private String mbti;

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

    @Column(name = "relationships", columnDefinition = "TEXT")
    private String relationships;

    @ManyToOne
    @JoinColumn(name = "system_era_id")
    private SystemEra systemEra;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}



