package com.heartsphere.mailbox.dto;

import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import lombok.Data;

/**
 * 创建消息请求DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class CreateMessageRequest {
    /**
     * 接收者用户ID
     */
    private Long receiverId;
    
    /**
     * 发送者类型
     */
    private SenderType senderType;
    
    /**
     * 发送者ID
     */
    private Long senderId;
    
    /**
     * 发送者名称
     */
    private String senderName;
    
    /**
     * 发送者头像URL
     */
    private String senderAvatar;
    
    /**
     * 消息类型
     */
    private MessageType messageType;
    
    /**
     * 消息分类
     */
    private MessageCategory messageCategory;
    
    /**
     * 消息标题
     */
    private String title;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 消息扩展数据（JSON格式）
     */
    private String contentData;
    
    /**
     * 关联对象ID
     */
    private Long relatedId;
    
    /**
     * 关联对象类型
     */
    private String relatedType;
    
    /**
     * 回复的消息ID
     */
    private Long replyToId;
}

