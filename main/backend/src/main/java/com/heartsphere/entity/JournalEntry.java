package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "journal_entries")
@org.hibernate.annotations.DynamicUpdate  // 只更新变更的字段，避免NULL覆盖
public class JournalEntry {
    @Id
    private String id;
    
    @PrePersist
    public void generateIdAndTimestamp() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = System.currentTimeMillis();
        }
    }

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String tags; // 标签（逗号分隔，如：#灵感,#梦境,#工作）

    @Column(columnDefinition = "TEXT")
    private String insight; // 本我镜像（Mirror of Truth）分析结果

    @Column(name = "image_url", length = 2000)
    private String imageUrl; // 日志配图URL

    @Column(name = "entry_date")
    private LocalDateTime entryDate;

    @Column(nullable = false)
    private Long timestamp;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "world_id")
    private World world;

    @ManyToOne
    @JoinColumn(name = "era_id")
    private Era era;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character character;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}