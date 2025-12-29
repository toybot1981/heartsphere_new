package com.heartsphere.emotion.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 情绪记录实体
 */
@Entity
@Table(name = "emotion_records")
@Data
public class EmotionRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 50)
    private String emotionType; // happy, sad, anxious, etc.
    
    @Column(nullable = false, length = 20)
    private String emotionIntensity; // mild, moderate, strong
    
    @Column(columnDefinition = "TEXT")
    private String emotionTags; // JSON array
    
    @Column(nullable = false)
    private Double confidence; // 0-1
    
    @Column(nullable = false, length = 50)
    private String source; // conversation, journal, behavior, manual
    
    @Column(columnDefinition = "TEXT")
    private String context; // 触发情绪的上下文
    
    @Column(length = 100)
    private String conversationId;
    
    @Column(length = 100)
    private String journalEntryId;
    
    @Column(columnDefinition = "TEXT")
    private String triggerText;
    
    @Column(columnDefinition = "TEXT")
    private String keyPhrases; // JSON array
    
    @Column(columnDefinition = "TEXT")
    private String reasoning; // 分析理由
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

