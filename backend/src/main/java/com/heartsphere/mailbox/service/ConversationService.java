package com.heartsphere.mailbox.service;

import com.heartsphere.mailbox.dto.ConversationQueryRequest;
import com.heartsphere.mailbox.dto.CreateConversationRequest;
import com.heartsphere.mailbox.dto.SendMessageRequest;
import com.heartsphere.mailbox.entity.Conversation;
import com.heartsphere.mailbox.entity.ConversationMessage;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.ConversationType;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import com.heartsphere.mailbox.repository.ConversationMessageRepository;
import com.heartsphere.mailbox.repository.ConversationRepository;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 对话服务
 * 负责用户间对话的管理和消息处理
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MailboxMessageService mailboxMessageService;
    
    /**
     * 获取对话列表
     */
    public Page<Conversation> getConversations(Long userId, ConversationQueryRequest request) {
        Pageable pageable = PageRequest.of(
            request.getPage() != null ? request.getPage() : 0,
            request.getSize() != null ? request.getSize() : 20
        );
        
        if (request.getConversationType() != null) {
            ConversationType type = ConversationType.valueOf(request.getConversationType());
            return conversationRepository.findByParticipantIdAndType(userId, type, pageable);
        }
        
        return conversationRepository.findByParticipantId(userId, pageable);
    }
    
    /**
     * 根据ID获取对话详情
     */
    public Conversation getConversationById(Long conversationId, Long userId) {
        return conversationRepository.findByIdAndParticipantId(conversationId, userId)
            .orElseThrow(() -> new RuntimeException("对话不存在或无权限访问"));
    }
    
    /**
     * 创建对话
     */
    @Transactional
    public Conversation createConversation(Long userId1, CreateConversationRequest request) {
        Long userId2 = request.getParticipant2Id();
        
        // 检查对话是否已存在
        Optional<Conversation> existing = conversationRepository.findConversationBetweenUsers(userId1, userId2);
        if (existing.isPresent()) {
            log.info("对话已存在 - conversationId={}, userId1={}, userId2={}", 
                existing.get().getId(), userId1, userId2);
            return existing.get();
        }
        
        // 创建新对话
        Conversation conversation = new Conversation();
        // 注意：实体使用@ManyToOne关联，需要先加载User实体
        conversation.setParticipant1(userRepository.findById(userId1)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + userId1)));
        conversation.setParticipant2(userRepository.findById(userId2)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + userId2)));
        conversation.setConversationType(
            request.getConversationType() != null 
                ? ConversationType.valueOf(request.getConversationType())
                : ConversationType.USER_TO_USER
        );
        
        conversation = conversationRepository.save(conversation);
        
        // 如果有初始消息，发送它
        if (request.getInitialMessage() != null && !request.getInitialMessage().trim().isEmpty()) {
            SendMessageRequest sendRequest = new SendMessageRequest();
            sendRequest.setContent(request.getInitialMessage());
            sendRequest.setMessageType(null); // 使用默认值 "text"
            sendMessage(conversation.getId(), userId1, sendRequest);
        }
        
        // 可选：在收件箱创建通知
        if (Boolean.TRUE.equals(request.getCreateMailboxNotification())) {
            createMailboxNotification(conversation, userId2);
        }
        
        log.info("创建对话成功 - conversationId={}, userId1={}, userId2={}", 
            conversation.getId(), userId1, userId2);
        
        return conversation;
    }
    
    /**
     * 发送消息
     */
    @Transactional
    public ConversationMessage sendMessage(Long conversationId, Long senderId, SendMessageRequest request) {
        // 验证对话和权限
        Conversation conversation = getConversationById(conversationId, senderId);
        
        // 创建消息
        ConversationMessage message = new ConversationMessage();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setSenderType(senderId.equals(0L) ? "system" : "user");
        message.setMessageType(
            request.getMessageType() != null && !request.getMessageType().isEmpty()
                ? request.getMessageType()  // messageType已经是String类型
                : "text"
        );
        message.setContent(request.getContent());
        message.setContentData(request.getContentData());
        message.setReplyToId(request.getReplyToId());
        message.setIsDeleted(false);
        message.setIsEdited(false);
        
        message = messageRepository.save(message);
        
        // 更新对话的最后消息信息
        conversation.setLastMessageId(message.getId());
        conversation.setLastMessageAt(LocalDateTime.now());
        
        // 更新接收者的未读数量
        Long receiverId = conversation.getParticipant1Id().equals(senderId) 
            ? conversation.getParticipant2Id() 
            : conversation.getParticipant1Id();
        
        updateUnreadCount(conversation, receiverId, 1);
        conversationRepository.save(conversation);
        
        log.info("发送消息成功 - conversationId={}, messageId={}, senderId={}", 
            conversationId, message.getId(), senderId);
        
        return message;
    }
    
    /**
     * 获取消息列表
     */
    public Page<ConversationMessage> getMessages(Long conversationId, Long userId, 
                                                  Integer page, Integer size, Long beforeMessageId) {
        // 验证权限
        getConversationById(conversationId, userId);
        
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);
        
        // 如果指定了beforeMessageId，可以实现基于ID的分页（后续优化）
        return messageRepository.findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(
            conversationId, pageable
        );
    }
    
    /**
     * 标记对话为已读
     */
    @Transactional
    public Conversation markAsRead(Long conversationId, Long userId) {
        Conversation conversation = getConversationById(conversationId, userId);
        
        if (conversation.getParticipant1Id().equals(userId)) {
            conversation.setUnreadCount1(0);
        } else {
            conversation.setUnreadCount2(0);
        }
        
        return conversationRepository.save(conversation);
    }
    
    /**
     * 置顶/取消置顶对话
     */
    @Transactional
    public Conversation pinConversation(Long conversationId, Long userId, boolean pinned) {
        Conversation conversation = getConversationById(conversationId, userId);
        
        if (conversation.getParticipant1Id().equals(userId)) {
            conversation.setIsPinned1(pinned);
        } else {
            conversation.setIsPinned2(pinned);
        }
        
        return conversationRepository.save(conversation);
    }
    
    /**
     * 设置对话免打扰
     */
    @Transactional
    public Conversation muteConversation(Long conversationId, Long userId, boolean muted) {
        Conversation conversation = getConversationById(conversationId, userId);
        
        if (conversation.getParticipant1Id().equals(userId)) {
            conversation.setIsMuted1(muted);
        } else {
            conversation.setIsMuted2(muted);
        }
        
        return conversationRepository.save(conversation);
    }
    
    /**
     * 删除对话（软删除）
     */
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = getConversationById(conversationId, userId);
        
        // 软删除：清空未读数量，标记为已删除（可以扩展实体添加deletedAt字段）
        if (conversation.getParticipant1Id().equals(userId)) {
            conversation.setUnreadCount1(0);
            // TODO: 如果Conversation实体有deletedAt字段，设置它
        } else {
            conversation.setUnreadCount2(0);
            // TODO: 如果Conversation实体有deletedAt字段，设置它
        }
        
        conversationRepository.save(conversation);
        
        log.info("删除对话 - conversationId={}, userId={}", conversationId, userId);
    }
    
    /**
     * 更新未读数量
     */
    private void updateUnreadCount(Conversation conversation, Long userId, int increment) {
        if (conversation.getParticipant1Id().equals(userId)) {
            int current = conversation.getUnreadCount1() != null ? conversation.getUnreadCount1() : 0;
            conversation.setUnreadCount1(current + increment);
        } else {
            int current = conversation.getUnreadCount2() != null ? conversation.getUnreadCount2() : 0;
            conversation.setUnreadCount2(current + increment);
        }
    }
    
    /**
     * 在收件箱创建通知
     */
    private void createMailboxNotification(Conversation conversation, Long receiverId) {
        try {
            com.heartsphere.mailbox.dto.CreateMessageRequest request = 
                new com.heartsphere.mailbox.dto.CreateMessageRequest();
            request.setReceiverId(receiverId);
            request.setSenderType(SenderType.USER);
            request.setSenderId(conversation.getParticipant1Id());
            userRepository.findById(conversation.getParticipant1Id()).ifPresent(user -> {
                request.setSenderName(user.getUsername());
                request.setSenderAvatar(user.getAvatar());
            });
            request.setMessageType(MessageType.USER_PRIVATE_MESSAGE);
            request.setMessageCategory(MessageCategory.USER_MESSAGE);
            request.setTitle("新对话");
            request.setContent("有人想和你开始对话");
            request.setRelatedId(conversation.getId());
            request.setRelatedType("conversation");
            
            mailboxMessageService.createMessage(request);
        } catch (Exception e) {
            log.warn("创建收件箱通知失败", e);
        }
    }
}

