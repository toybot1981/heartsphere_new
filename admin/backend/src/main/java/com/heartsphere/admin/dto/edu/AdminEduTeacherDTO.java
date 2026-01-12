package com.heartsphere.admin.dto.edu;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 教育版教师管理DTO
 */
@Data
public class AdminEduTeacherDTO {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String school;
    private String subject;
    private String status; // "pending", "approved", "rejected", "disabled"
    private String rejectReason;
    private Boolean isEnabled;
    private Map<String, Object> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    
    // 统计信息
    private Long studentsCount;
    private Long coursesCreatedCount;
    private Long homeworkAssignedCount;
}
