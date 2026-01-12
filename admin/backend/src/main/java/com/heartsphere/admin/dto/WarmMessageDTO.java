package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 暖心留言DTO（管理端）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarmMessageDTO {
    
    private Long id;
    
    // 留言者信息
    private Long senderId;
    private String senderUsername;
    private String senderEmail;
    
    // 接收者信息
    private Long receiverId;
    private String receiverUsername;
    private String receiverEmail;
    
    // 留言信息
    private String messageType; // WARM_MESSAGE/REPLY
    private String content; // 留言内容（脱敏后）
    private String status; // PENDING/APPROVED/REJECTED/DELETED
    private Instant createdAt;
    private Instant updatedAt;
    
    // 审核信息
    private String reviewedBy; // 审核人
    private Instant reviewedAt; // 审核时间
    private String reviewReason; // 审核原因
    
    // 关联信息
    private Long connectionId;
    private Long accessRecordId;
    
    // 回复信息
    private Long replyToId; // 如果是回复，关联的原留言ID
    private Integer replyCount; // 回复数量
}




