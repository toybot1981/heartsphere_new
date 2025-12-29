package com.heartsphere.heartconnect.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 连接请求实体
 */
@Entity
@Table(name = "heartsphere_connection_request")
@Data
public class HeartSphereConnectionRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "share_config_id", nullable = false)
    private Long shareConfigId;
    
    @Column(name = "requester_id", nullable = false)
    private Long requesterId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "request_status", nullable = false)
    private RequestStatus requestStatus = RequestStatus.PENDING;
    
    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;
    
    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;
    
    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }
    
    /**
     * 请求状态枚举
     */
    public enum RequestStatus {
        PENDING,    // 待审批
        APPROVED,   // 已批准
        REJECTED,   // 已拒绝
        CANCELLED   // 已取消
    }
}

