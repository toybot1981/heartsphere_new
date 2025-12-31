package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 投诉DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDTO {
    
    private Long id;
    private Long userId;
    private String username;
    private String userEmail;
    private String complaintType;
    private String complaintContent;
    private String status; // PENDING/PROCESSING/RESOLVED
    private Long handlerId;
    private String handlerName;
    private String handleResult;
    private String feedback; // 处理反馈
    private Instant createdAt;
    private Instant updatedAt;
}



