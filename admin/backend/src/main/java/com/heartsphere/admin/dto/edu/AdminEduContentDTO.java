package com.heartsphere.admin.dto.edu;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 教育版内容管理DTO
 */
@Data
public class AdminEduContentDTO {
    private Long id;
    private String type; // "scene", "character", "course"
    private String title;
    private String description;
    private String content;
    private String status; // "pending", "approved", "rejected"
    private String rejectReason;
    private String category;
    private String ageGroup; // "elementary", "middle", "all"
    private Boolean isRecommended;
    private Long creatorId;
    private String creatorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
    
    // 使用统计
    private Long usageCount;
    private Long likesCount;
    private Map<String, Object> metadata;
}
