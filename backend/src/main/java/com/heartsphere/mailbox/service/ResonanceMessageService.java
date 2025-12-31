package com.heartsphere.mailbox.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 共鸣消息服务
 * 负责处理来自心域连接系统的各种互动消息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResonanceMessageService {
    
    private final MailboxMessageService messageService;
    private final MailboxMessageRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 处理点赞消息
     */
    @Transactional
    public MailboxMessage handleLike(Long receiverId, Long senderId, String senderName, 
                                     String senderAvatar, Long relatedId, String relatedType) {
        log.info("处理点赞消息 - receiverId={}, senderId={}, relatedId={}, relatedType={}", 
            receiverId, senderId, relatedId, relatedType);
        
        // 检查是否已经有相同的点赞消息（同一天内）
        List<MailboxMessage> existingMessages = findExistingResonanceMessages(
            receiverId, MessageType.RESONANCE_LIKE, senderId, relatedId, relatedType
        );
        
        if (!existingMessages.isEmpty()) {
            // 聚合到现有消息
            return aggregateResonanceMessage(existingMessages.get(0), senderId, senderName, senderAvatar);
        }
        
        // 创建新的点赞消息
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.HEARTSPHERE);
        request.setSenderId(senderId);
        request.setSenderName(senderName);
        request.setSenderAvatar(senderAvatar);
        request.setMessageType(MessageType.RESONANCE_LIKE);
        request.setMessageCategory(MessageCategory.RESONANCE);
        request.setTitle(String.format("%s 赞了你的%s", senderName, getRelatedTypeName(relatedType)));
        request.setContent(String.format("%s 对你的%s表示了赞同", senderName, getRelatedTypeName(relatedType)));
        request.setRelatedId(relatedId);
        request.setRelatedType(relatedType);
        
        // 设置聚合数据（JSON字符串格式）
        try {
            Map<String, Object> aggregationData = new HashMap<>();
            aggregationData.put("count", 1);
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", senderId);
            userMap.put("name", senderName);
            userMap.put("avatar", senderAvatar != null ? senderAvatar : "");
            aggregationData.put("users", Arrays.asList(userMap));
            request.setContentData(objectMapper.writeValueAsString(aggregationData));
        } catch (Exception e) {
            log.warn("设置聚合数据失败", e);
        }
        
        return messageService.createMessage(request);
    }
    
    /**
     * 处理评论消息
     */
    @Transactional
    public MailboxMessage handleComment(Long receiverId, Long senderId, String senderName,
                                       String senderAvatar, Long relatedId, String relatedType,
                                       String commentContent) {
        log.info("处理评论消息 - receiverId={}, senderId={}, relatedId={}, relatedType={}", 
            receiverId, senderId, relatedId, relatedType);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.HEARTSPHERE);
        request.setSenderId(senderId);
        request.setSenderName(senderName);
        request.setSenderAvatar(senderAvatar);
        request.setMessageType(MessageType.RESONANCE_COMMENT);
        request.setMessageCategory(MessageCategory.RESONANCE);
        request.setTitle(String.format("%s 评论了你的%s", senderName, getRelatedTypeName(relatedType)));
        request.setContent(commentContent);
        request.setRelatedId(relatedId);
        request.setRelatedType(relatedType);
        
        return messageService.createMessage(request);
    }
    
    /**
     * 处理留言消息
     */
    @Transactional
    public MailboxMessage handleMessage(Long receiverId, Long senderId, String senderName,
                                       String senderAvatar, String messageContent) {
        log.info("处理留言消息 - receiverId={}, senderId={}, senderName={}", 
            receiverId, senderId, senderName);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.HEARTSPHERE);
        request.setSenderId(senderId);
        request.setSenderName(senderName);
        request.setSenderAvatar(senderAvatar);
        request.setMessageType(MessageType.RESONANCE_MESSAGE);
        request.setMessageCategory(MessageCategory.RESONANCE);
        request.setTitle(String.format("%s 给你留言了", senderName));
        request.setContent(messageContent);
        
        return messageService.createMessage(request);
    }
    
    /**
     * 处理分享消息
     */
    @Transactional
    public MailboxMessage handleShare(Long receiverId, Long senderId, String senderName,
                                     String senderAvatar, Long relatedId, String relatedType) {
        log.info("处理分享消息 - receiverId={}, senderId={}, relatedId={}, relatedType={}", 
            receiverId, senderId, relatedId, relatedType);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.HEARTSPHERE);
        request.setSenderId(senderId);
        request.setSenderName(senderName);
        request.setSenderAvatar(senderAvatar);
        request.setMessageType(MessageType.RESONANCE_SHARE);
        request.setMessageCategory(MessageCategory.RESONANCE);
        request.setTitle(String.format("%s 分享了你的%s", senderName, getRelatedTypeName(relatedType)));
        request.setContent(String.format("%s 觉得你的%s很棒，分享给了更多人", senderName, getRelatedTypeName(relatedType)));
        request.setRelatedId(relatedId);
        request.setRelatedType(relatedType);
        
        return messageService.createMessage(request);
    }
    
    /**
     * 处理连接请求消息
     */
    @Transactional
    public MailboxMessage handleConnectionRequest(Long receiverId, Long senderId, String senderName,
                                                  String senderAvatar, String requestMessage) {
        log.info("处理连接请求消息 - receiverId={}, senderId={}, senderName={}", 
            receiverId, senderId, senderName);
        
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(receiverId);
        request.setSenderType(SenderType.HEARTSPHERE);
        request.setSenderId(senderId);
        request.setSenderName(senderName);
        request.setSenderAvatar(senderAvatar);
        request.setMessageType(MessageType.RESONANCE_CONNECTION_REQUEST);
        request.setMessageCategory(MessageCategory.RESONANCE);
        request.setTitle(String.format("%s 想与你建立连接", senderName));
        request.setContent(requestMessage != null && !requestMessage.isEmpty() 
            ? requestMessage 
            : String.format("%s 希望与你建立心域连接", senderName));
        
        MailboxMessage message = messageService.createMessage(request);
        
        // 连接请求标记为重要
        message = messageService.markAsImportant(message.getId(), receiverId, true);
        
        return message;
    }
    
    /**
     * 聚合共鸣消息（用于点赞等可以聚合的消息类型）
     */
    private MailboxMessage aggregateResonanceMessage(MailboxMessage existingMessage,
                                                     Long newSenderId, String newSenderName,
                                                     String newSenderAvatar) {
        try {
            // 解析现有的聚合数据
            Map<String, Object> aggregationData;
            if (existingMessage.getContentData() != null && !existingMessage.getContentData().isEmpty()) {
                aggregationData = objectMapper.readValue(
                    existingMessage.getContentData(), 
                    new TypeReference<Map<String, Object>>() {}
                );
            } else {
                aggregationData = new HashMap<>();
                aggregationData.put("count", 1);
                aggregationData.put("users", new ArrayList<>());
            }
            
            // 更新聚合数据
            int count = (Integer) aggregationData.getOrDefault("count", 1);
            count++;
            aggregationData.put("count", count);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> users = (List<Map<String, Object>>) aggregationData.getOrDefault("users", new ArrayList<>());
            
            // 检查用户是否已在列表中
            boolean userExists = users.stream()
                .anyMatch(user -> user.get("id").equals(newSenderId));
            
            if (!userExists) {
                users.add(Map.of(
                    "id", newSenderId,
                    "name", newSenderName,
                    "avatar", newSenderAvatar != null ? newSenderAvatar : ""
                ));
                aggregationData.put("users", users);
            }
            
            // 更新消息内容
            String relatedType = existingMessage.getRelatedType();
            String relatedTypeName = getRelatedTypeName(relatedType);
            
            if (count == 2) {
                // 2个人点赞
                String firstName = users.get(0).get("name").toString();
                existingMessage.setTitle(String.format("%s 和 %s 赞了你的%s", firstName, newSenderName, relatedTypeName));
                existingMessage.setContent(String.format("%s 和 %s 对你的%s表示了赞同", firstName, newSenderName, relatedTypeName));
            } else {
                // 多人点赞
                String firstName = users.get(0).get("name").toString();
                existingMessage.setTitle(String.format("%s 等 %d 人赞了你的%s", firstName, count, relatedTypeName));
                existingMessage.setContent(String.format("%s 等 %d 人对你的%s表示了赞同", firstName, count, relatedTypeName));
            }
            
            // 保存聚合数据
            existingMessage.setContentData(objectMapper.writeValueAsString(aggregationData));
            
            return messageRepository.save(existingMessage);
            
        } catch (Exception e) {
            log.error("聚合共鸣消息失败 - messageId={}, newSenderId={}", existingMessage.getId(), newSenderId, e);
            // 如果聚合失败，创建新消息
            return existingMessage;
        }
    }
    
    /**
     * 查找现有的共鸣消息（用于聚合）
     */
    private List<MailboxMessage> findExistingResonanceMessages(Long receiverId, MessageType messageType,
                                                                Long senderId, Long relatedId, String relatedType) {
        // 查找同一天内，相同类型、相同关联对象的未读消息
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        
        return messageRepository.findByReceiverIdAndMessageCategoryAndMessageTypeAndRelatedIdAndRelatedTypeOrderByCreatedAtDesc(
            receiverId, MessageCategory.RESONANCE, messageType.name(), relatedId, relatedType
        ).stream()
        .filter(msg -> msg.getCreatedAt().isAfter(todayStart))
        .filter(msg -> !msg.getIsRead())
        .limit(1)
        .collect(Collectors.toList());
    }
    
    /**
     * 获取关联类型的中文名称
     */
    private String getRelatedTypeName(String relatedType) {
        if (relatedType == null) {
            return "内容";
        }
        
        return switch (relatedType.toLowerCase()) {
            case "heartsphere" -> "心域";
            case "journal" -> "日记";
            case "memory" -> "记忆";
            case "note" -> "笔记";
            default -> relatedType;
        };
    }
}

