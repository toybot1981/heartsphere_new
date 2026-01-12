package com.heartsphere.mailbox.dto;

import com.heartsphere.mailbox.enums.MessageType;
import lombok.Data;

/**
 * 发送消息请求DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class SendMessageRequest {
    /**
     * 消息类型（字符串形式，如 "text", "image", "voice" 等）
     */
    private String messageType;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 消息扩展数据（JSON格式）
     */
    private String contentData;
    
    /**
     * 回复的消息ID
     */
    private Long replyToId;
}

