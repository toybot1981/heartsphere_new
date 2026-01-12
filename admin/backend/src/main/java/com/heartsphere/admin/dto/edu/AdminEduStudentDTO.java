package com.heartsphere.admin.dto.edu;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 教育版学生管理DTO
 */
@Data
public class AdminEduStudentDTO {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private Integer age;
    private String ageGroup; // "elementary" or "middle"
    private String grade;
    private String school;
    private String schoolClass;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 统计信息
    private Long learningRecordsCount;
    private Long homeworkSubmittedCount;
    private Long scenesCreatedCount;
    private Long charactersCreatedCount;
    private Long counselingSessionsCount;
}
