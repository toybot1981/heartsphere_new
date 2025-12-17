package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 积分记录实体
 */
@Data
@Entity
@Table(name = "point_transactions")
public class PointTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "membership_id")
    private Long membershipId;

    @Column(nullable = false, length = 20)
    private String type; // earn, use, expire, refund

    @Column(nullable = false)
    private Integer amount; // 正数为获得，负数为使用

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(length = 500)
    private String description;

    @Column(name = "related_order_id")
    private Long relatedOrderId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", insertable = false, updatable = false)
    private Membership membership;
}

