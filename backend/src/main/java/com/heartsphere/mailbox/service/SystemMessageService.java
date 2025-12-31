package com.heartsphere.mailbox.service;

import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 系统消息服务
 * 负责系统通知、反馈请求和系统对话的处理
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemMessageService {
    
    private final MailboxMessageService messageService;
    
    /**
     * 发送系统通知
     */
    @Transactional
    public MailboxMessage sendNotification(Long receiverId, String title, String content) {
        log.info("发送系统通知 - receiverId={}, title={}", receiverId, title);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.SYSTEM);
        request.setSenderId(0L); // 系统ID为0
        request.setSenderName("系统");
        request.setMessageType(MessageType.SYSTEM_NOTIFICATION);
        request.setMessageCategory(MessageCategory.SYSTEM);
        request.setTitle(title);
        request.setContent(content);
        
        return messageService.createMessage(request);
    }
    
    /**
     * 发送系统反馈请求
     */
    @Transactional
    public MailboxMessage sendFeedbackRequest(Long receiverId, String title, String content) {
        log.info("发送系统反馈请求 - receiverId={}, title={}", receiverId, title);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.SYSTEM);
        request.setSenderId(0L);
        request.setSenderName("系统");
        request.setMessageType(MessageType.SYSTEM_FEEDBACK);
        request.setMessageCategory(MessageCategory.SYSTEM);
        request.setTitle(title);
        request.setContent(content);
        
        return messageService.createMessage(request);
    }
    
    /**
     * 发送系统对话消息
     */
    @Transactional
    public MailboxMessage sendSystemDialogue(Long receiverId, String content) {
        log.info("发送系统对话 - receiverId={}", receiverId);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.SYSTEM);
        request.setSenderId(0L);
        request.setSenderName("系统助手");
        request.setMessageType(MessageType.SYSTEM_DIALOGUE);
        request.setMessageCategory(MessageCategory.SYSTEM);
        request.setTitle("系统消息");
        request.setContent(content);
        
        return messageService.createMessage(request);
    }
}

