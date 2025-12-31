package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 访问记录DTO（管理端）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessRecordDTO {
    
    private Long id;
    
    // 访问者信息
    private Long visitorId;
    private String visitorUsername;
    private String visitorEmail;
    
    // 被访问者信息
    private Long ownerId;
    private String ownerUsername;
    private String ownerEmail;
    
    // 访问信息
    private Long connectionId;
    private String accessType; // EXPERIENCE/NORMAL
    private Instant accessTime;
    private Long durationSeconds; // 访问时长（秒）
    
    // 访问统计
    private Integer conversationRounds; // 对话轮数
    private Integer accessedErasCount; // 访问的场景数
    
    // 关联信息
    private Long shareConfigId;
}



