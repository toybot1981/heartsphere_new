package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.Transient;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "characters")
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;

    @Column(name = "role")
    private String role;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "background_url", length = 500)
    private String backgroundUrl;

    @Column(name = "theme_color")
    private String themeColor;

    @Column(name = "color_accent")
    private String colorAccent;

    @Column(name = "first_message")
    private String firstMessage;

    @Column(name = "system_instruction", columnDefinition = "TEXT")
    private String systemInstruction;

    @Column(name = "voice_name")
    private String voiceName;

    @Column(name = "mbti")
    private String mbti;

    @Column(name = "tags")
    private String tags;

    @Column(name = "speech_style")
    private String speechStyle;

    @Column(name = "catchphrases")
    private String catchphrases;

    @Column(name = "secrets", columnDefinition = "TEXT")
    private String secrets;

    @Column(name = "motivations", columnDefinition = "TEXT")
    private String motivations;

    @Column(name = "relationships", columnDefinition = "TEXT")
    private String relationships;

    @ManyToOne
    @JoinColumn(name = "world_id", nullable = false)
    private World world;

    @ManyToOne
    @JoinColumn(name = "era_id")
    private Era era;

    // 为前端提供worldId字段
    @Transient
    public Long getWorldId() {
        return world != null ? world.getId() : null;
    }

    // 为前端提供eraId字段
    @Transient
    public Long getEraId() {
        return era != null ? era.getId() : null;
    }

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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
}