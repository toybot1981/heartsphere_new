package com.heartsphere.admin.entity.billing;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 配额使用记录实体
 */
@Data
@Entity
@Table(name = "quota_usage_records")
public class QuotaUsageRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    @Column(name = "quota_type", nullable = false, length = 50)
    private String quotaType; // text_token, image, video, api_call

    @Column(name = "amount_used", nullable = false)
    private Long amountUsed; // 使用量

    @Column(name = "quota_before", nullable = false)
    private Long quotaBefore; // 使用前配额

    @Column(name = "quota_after", nullable = false)
    private Long quotaAfter; // 使用后配额

    @Column(name = "related_record_id")
    private Long relatedRecordId; // 关联记录ID（如对话ID、图片ID等）

    @Column(name = "related_record_type", length = 50)
    private String relatedRecordType; // 关联记录类型：conversation, image_generation, video_generation, api_call

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
