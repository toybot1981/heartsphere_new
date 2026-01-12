package com.heartsphere.mailbox.dto;

import lombok.Data;

/**
 * 创建对话请求DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class CreateConversationRequest {
    /**
     * 另一个参与者ID（用户ID或系统ID）
     */
    private Long participant2Id;
    
    /**
     * 对话类型（可选，默认USER_TO_USER）
     */
    private String conversationType;
    
    /**
     * 初始消息内容（可选）
     */
    private String initialMessage;
    
    /**
     * 是否在收件箱创建通知（可选，默认false）
     */
    private Boolean createMailboxNotification;
}


