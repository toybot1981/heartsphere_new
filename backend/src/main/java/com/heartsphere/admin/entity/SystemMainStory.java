package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 系统主线剧情实体
 */
@Data
@Entity
@Table(name = "system_main_stories")
public class SystemMainStory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "system_era_id", nullable = false)
    private SystemEra systemEra;

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

