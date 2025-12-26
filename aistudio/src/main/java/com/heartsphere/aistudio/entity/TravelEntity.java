package com.heartsphere.aistudio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 行程实体
 * 存储用户的旅行计划
 */
@Data
@Entity
@Table(name = "travels")
public class TravelEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String travelId; // 唯一标识
    
    @Column(nullable = false)
    private String userId; // 用户 ID
    
    @Column(nullable = false)
    private String destination; // 目的地
    
    @Column(nullable = false)
    private LocalDateTime startDate; // 出发日期
    
    @Column(nullable = false)
    private LocalDateTime endDate; // 返回日期
    
    @Column
    private String flightNumber; // 航班号
    
    @Column
    private LocalDateTime flightDepartureTime; // 航班起飞时间
    
    @Column
    private String hotelId; // 酒店 ID
    
    @Column
    private String hotelName; // 酒店名称
    
    @Column(columnDefinition = "TEXT")
    private String itinerary; // 行程安排（JSON 格式）
    
    @Column(columnDefinition = "TEXT")
    private String notes; // 备注
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private Boolean flightReminderSent = false; // 航班提醒是否已发送
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (travelId == null) {
            travelId = "TRAVEL_" + System.currentTimeMillis();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}








