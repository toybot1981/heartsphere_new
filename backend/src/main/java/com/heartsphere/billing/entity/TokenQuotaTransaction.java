package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Token配额变动记录实体
 */
@Data
@Entity
@Table(name = "token_quota_transaction")
public class TokenQuotaTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType; // grant, consume, purchase, refund

    @Column(name = "quota_type", nullable = false, length = 50)
    private String quotaType; // text_token, image, audio, video

    @Column(nullable = false)
    private Long amount;

    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter;

    @Column(length = 100)
    private String source; // membership, purchase, admin_grant, usage

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
}

