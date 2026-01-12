package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 超量付费记录实体
 */
@Data
@Entity
@Table(name = "overage_charges")
public class OverageCharge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    @Column(name = "quota_type", nullable = false, length = 50)
    private String quotaType; // text_token, image, video

    @Column(name = "amount_used", nullable = false)
    private Long amountUsed; // 超量使用量

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal unitPrice; // 单价

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount; // 总金额

    @Column(name = "order_id")
    private Long orderId; // 支付订单ID

    @Column(name = "status", nullable = false, length = 20)
    private String status = "pending"; // pending, paid, failed, cancelled

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt; // 支付时间
}
