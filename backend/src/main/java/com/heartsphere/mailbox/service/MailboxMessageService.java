package com.heartsphere.mailbox.service;

import com.heartsphere.entity.ChronosLetter;
import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.dto.MessageQueryRequest;
import com.heartsphere.mailbox.dto.UnreadCountResponse;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.service.ChronosLetterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 跨时空信箱消息服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailboxMessageService {
    
    private final MailboxMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChronosLetterService chronosLetterService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 获取消息列表
     */
    @Transactional(readOnly = true)
    public Page<MailboxMessage> getMessages(Long userId, MessageQueryRequest request) {
        // 构建分页参数
        Pageable pageable = PageRequest.of(
            request.getPage() != null ? request.getPage() : 0,
            request.getSize() != null ? request.getSize() : 20
        );
        
        // 如果有搜索关键词，使用搜索方法
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            return searchMessages(userId, request.getKeyword(), request);
        }
        
        // 根据查询条件筛选
        Page<MailboxMessage> result;
        
        if (request.getCategory() != null && request.getIsRead() != null) {
            // 分类 + 已读状态：先按分类查询，然后在内存中过滤已读状态
            Page<MailboxMessage> categoryMessages = messageRepository.findByReceiverIdAndMessageCategoryOrderByCreatedAtDesc(
                userId, request.getCategory(), pageable
            );
            // 过滤已读状态（注意：这种方法在大量数据时性能不好，后续需要在Repository中优化）
            List<MailboxMessage> filtered = categoryMessages.getContent().stream()
                .filter(msg -> msg.getIsRead().equals(request.getIsRead()))
                .toList();
            result = new PageImpl<>(
                filtered, 
                pageable, 
                categoryMessages.getTotalElements()
            );
        } else if (request.getCategory() != null) {
            // 仅分类
            result = messageRepository.findByReceiverIdAndMessageCategoryOrderByCreatedAtDesc(
                userId, request.getCategory(), pageable
            );
        } else if (request.getIsRead() != null) {
            // 仅已读状态
            result = messageRepository.findByReceiverIdAndIsReadOrderByCreatedAtDesc(
                userId, request.getIsRead(), pageable
            );
        } else if (request.getIsImportant() != null && request.getIsImportant()) {
            // 重要消息（暂时使用查询筛选，后续可以优化）
            Page<MailboxMessage> allMessages = messageRepository.findNotDeletedByReceiverId(userId, pageable);
            // 过滤重要消息
            List<MailboxMessage> filtered = allMessages.getContent().stream()
                .filter(msg -> Boolean.TRUE.equals(msg.getIsImportant()))
                .toList();
            result = new PageImpl<>(
                filtered, 
                pageable, 
                allMessages.getTotalElements()
            );
        } else if (request.getIsStarred() != null && request.getIsStarred()) {
            // 收藏消息
            result = messageRepository.findByReceiverIdAndIsStarredTrueOrderByCreatedAtDesc(userId, pageable);
        } else if (request.getStartDate() != null && request.getEndDate() != null) {
            // 时间范围
            result = messageRepository.findByReceiverIdAndDateRange(
                userId, request.getStartDate(), request.getEndDate(), pageable
            );
        } else {
            // 默认：所有未删除的消息
            result = messageRepository.findNotDeletedByReceiverId(userId, pageable);
        }
        
        // 确保所有消息的receiver字段不会触发懒加载
        // 通过显式设置receiver为null来避免Jackson序列化时访问懒加载代理
        result.getContent().forEach(msg -> {
            // 如果receiverId已经有值，就不需要receiver对象
            // 设置receiver为null，确保不会触发懒加载
            if (msg.getReceiverId() != null) {
                msg.setReceiver(null);
            }
        });
        
        // 整合 chronos_letters 表的数据（用户反馈和管理员回复）
        List<MailboxMessage> chronosMessages = convertChronosLettersToMailboxMessages(userId, request);
        log.info("[MailboxMessageService] 整合chronos_letters数据 - userId={}, chronosCount={}, mailboxCount={}", 
            userId, chronosMessages.size(), result.getContent().size());
        
        // 合并两个列表并按时间排序
        List<MailboxMessage> allMessages = new ArrayList<>(result.getContent());
        allMessages.addAll(chronosMessages);
        
        // 按创建时间倒序排序
        allMessages.sort(Comparator.comparing((MailboxMessage msg) -> 
            msg.getCreatedAt() != null ? msg.getCreatedAt() : LocalDateTime.MIN).reversed());
        
        // 应用分页
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allMessages.size());
        List<MailboxMessage> pagedMessages = allMessages.subList(start, end);
        
        return new PageImpl<>(pagedMessages, pageable, allMessages.size());
    }
    
    /**
     * 将 ChronosLetter 转换为 MailboxMessage
     */
    private List<MailboxMessage> convertChronosLettersToMailboxMessages(Long userId, MessageQueryRequest request) {
        List<ChronosLetter> chronosLetters = chronosLetterService.getUserLetters(userId);
        log.info("[MailboxMessageService] 获取chronos_letters - userId={}, count={}", userId, chronosLetters.size());
        List<MailboxMessage> result = new ArrayList<>();
        
        for (ChronosLetter letter : chronosLetters) {
            // 根据分类筛选
            if (request.getCategory() != null) {
                // 用户反馈 -> USER_MESSAGE
                // 管理员回复 -> SYSTEM
                if (letter.getType().equals("user_feedback") && 
                    request.getCategory() != MessageCategory.USER_MESSAGE) {
                    continue;
                }
                if (letter.getType().equals("admin_reply") && 
                    request.getCategory() != MessageCategory.SYSTEM) {
                    continue;
                }
            }
            
            // 根据已读状态筛选
            if (request.getIsRead() != null && 
                letter.getIsRead().equals(request.getIsRead()) == false) {
                continue;
            }
            
            MailboxMessage message = new MailboxMessage();
            // 使用负数ID来区分（避免与mailbox_messages表的ID冲突）
            // 前端可以通过ID的正负来判断消息来源
            // 注意：这里使用简单的哈希来生成负数ID，确保唯一性
            long hashId = letter.getId().hashCode();
            message.setId(hashId < 0 ? hashId : -hashId);
            message.setReceiverId(userId);
            
            // 设置发送者信息
            if (letter.getType().equals("user_feedback")) {
                message.setSenderType(SenderType.USER);
                message.setSenderId(userId);
                message.setMessageCategory(MessageCategory.USER_MESSAGE);
                message.setMessageType(MessageType.USER_FEEDBACK);
            } else if (letter.getType().equals("admin_reply")) {
                message.setSenderType(SenderType.SYSTEM);
                message.setSenderId(null);
                message.setMessageCategory(MessageCategory.SYSTEM);
                message.setMessageType(MessageType.ADMIN_REPLY);
            }
            
            message.setSenderName(letter.getSenderName());
            message.setSenderAvatar(letter.getSenderAvatarUrl());
            message.setTitle(letter.getSubject());
            message.setContent(letter.getContent());
            message.setIsRead(letter.getIsRead());
            message.setIsImportant(false);
            message.setIsStarred(false);
            
            // 转换时间戳为LocalDateTime
            if (letter.getTimestamp() != null) {
                LocalDateTime createdAt = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(letter.getTimestamp()),
                    ZoneId.systemDefault()
                );
                message.setCreatedAt(createdAt);
            } else if (letter.getCreatedAt() != null) {
                message.setCreatedAt(letter.getCreatedAt());
            }
            
            // 设置关联信息
            if (letter.getParentLetterId() != null) {
                long parentHashId = letter.getParentLetterId().hashCode();
                message.setReplyToId(parentHashId < 0 ? parentHashId : -parentHashId);
            }
            
            // 在contentData中存储原始ChronosLetter ID，用于后续操作
            try {
                Map<String, String> contentData = new HashMap<>();
                contentData.put("chronosLetterId", letter.getId());
                contentData.put("source", "chronos_letters");
                message.setContentData(objectMapper.writeValueAsString(contentData));
            } catch (Exception e) {
                log.warn("设置contentData失败 - letterId={}", letter.getId(), e);
            }
            
            result.add(message);
        }
        
        return result;
    }
    
    /**
     * 根据ID获取消息详情
     */
    public MailboxMessage getMessageById(Long messageId, Long userId) {
        // 如果是负数ID，说明是chronos_letters的消息
        if (messageId < 0) {
            return getChronosLetterAsMailboxMessage(messageId, userId);
        }
        
        return messageRepository.findByIdAndReceiverId(messageId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("消息不存在: " + messageId));
    }
    
    /**
     * 从chronos_letters获取消息并转换为MailboxMessage
     */
    private MailboxMessage getChronosLetterAsMailboxMessage(Long messageId, Long userId) {
        List<ChronosLetter> letters = chronosLetterService.getUserLetters(userId);
        
        // 找到对应的ChronosLetter
        ChronosLetter targetLetter = null;
        for (ChronosLetter letter : letters) {
            long hashId = letter.getId().hashCode();
            long expectedId = hashId < 0 ? hashId : -hashId;
            
            if (expectedId == messageId) {
                targetLetter = letter;
                break;
            }
        }
        
        if (targetLetter == null) {
            throw new ResourceNotFoundException("消息不存在: " + messageId);
        }
        
        // 转换为MailboxMessage
        return convertChronosLetterToMailboxMessage(targetLetter, userId);
    }
    
    /**
     * 将单个ChronosLetter转换为MailboxMessage
     */
    private MailboxMessage convertChronosLetterToMailboxMessage(ChronosLetter letter, Long userId) {
        MailboxMessage message = new MailboxMessage();
        
        // 使用负数ID
        long hashId = letter.getId().hashCode();
        message.setId(hashId < 0 ? hashId : -hashId);
        message.setReceiverId(userId);
        
        // 设置发送者信息
        if (letter.getType().equals("user_feedback")) {
            message.setSenderType(SenderType.USER);
            message.setSenderId(userId);
            message.setMessageCategory(MessageCategory.USER_MESSAGE);
            message.setMessageType(MessageType.USER_FEEDBACK);
        } else if (letter.getType().equals("admin_reply")) {
            message.setSenderType(SenderType.SYSTEM);
            message.setSenderId(null);
            message.setMessageCategory(MessageCategory.SYSTEM);
            message.setMessageType(MessageType.ADMIN_REPLY);
        }
        
        message.setSenderName(letter.getSenderName());
        message.setSenderAvatar(letter.getSenderAvatarUrl());
        message.setTitle(letter.getSubject());
        message.setContent(letter.getContent());
        message.setIsRead(letter.getIsRead());
        message.setIsImportant(false);
        message.setIsStarred(false);
        
        // 转换时间戳为LocalDateTime
        if (letter.getTimestamp() != null) {
            LocalDateTime createdAt = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(letter.getTimestamp()),
                ZoneId.systemDefault()
            );
            message.setCreatedAt(createdAt);
        } else if (letter.getCreatedAt() != null) {
            message.setCreatedAt(letter.getCreatedAt());
        }
        
        // 设置关联信息
        if (letter.getParentLetterId() != null) {
            long parentHashId = letter.getParentLetterId().hashCode();
            message.setReplyToId(parentHashId < 0 ? parentHashId : -parentHashId);
        }
        
        // 在contentData中存储原始ChronosLetter ID
        try {
            Map<String, String> contentData = new HashMap<>();
            contentData.put("chronosLetterId", letter.getId());
            contentData.put("source", "chronos_letters");
            message.setContentData(objectMapper.writeValueAsString(contentData));
        } catch (Exception e) {
            log.warn("设置contentData失败 - letterId={}", letter.getId(), e);
        }
        
        return message;
    }
    
    /**
     * 获取未读消息数量（保留此方法以向后兼容）
     * @deprecated 使用 NotificationService.getUnreadCount() 代替
     */
    @Deprecated
    public UnreadCountResponse getUnreadCount(Long userId) {
        Long totalUnread = messageRepository.countUnreadMessagesByReceiverId(userId);
        
        Map<MessageCategory, Long> categoryUnread = new HashMap<>();
        for (MessageCategory category : MessageCategory.values()) {
            Long count = messageRepository.countUnreadMessagesByReceiverIdAndCategory(userId, category);
            categoryUnread.put(category, count);
        }
        
        return UnreadCountResponse.builder()
            .totalUnread(totalUnread)
            .categoryUnread(categoryUnread)
            .build();
    }
    
    /**
     * 创建消息
     */
    @Transactional
    public MailboxMessage createMessage(CreateMessageRequest request) {
        // 验证接收者用户存在
        Long receiverId = request.getReceiverId();
        if (receiverId == null) {
            throw new IllegalArgumentException("接收者ID不能为空");
        }
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new ResourceNotFoundException("用户不存在: " + receiverId));
        
        // 创建消息实体
        MailboxMessage message = new MailboxMessage();
        message.setReceiver(receiver);
        message.setReceiverId(receiver.getId());
        message.setSenderType(request.getSenderType());
        message.setSenderId(request.getSenderId());
        message.setSenderName(request.getSenderName());
        message.setSenderAvatar(request.getSenderAvatar());
        message.setMessageType(request.getMessageType());
        message.setMessageCategory(request.getMessageCategory());
        message.setTitle(request.getTitle());
        message.setContent(request.getContent());
        message.setContentData(request.getContentData());
        message.setRelatedId(request.getRelatedId());
        message.setRelatedType(request.getRelatedType());
        message.setReplyToId(request.getReplyToId());
        message.setIsRead(false);
        message.setIsImportant(false);
        message.setIsStarred(false);
        
        MailboxMessage saved = messageRepository.save(message);
        log.info("创建消息 - receiverId={}, messageId={}, type={}", 
            request.getReceiverId(), saved.getId(), request.getMessageType());
        
        return saved;
    }
    
    /**
     * 标记消息为已读
     */
    @Transactional
    public MailboxMessage markAsRead(Long messageId, Long userId) {
        // 如果是负数ID，说明是chronos_letters的消息
        if (messageId < 0) {
            return markChronosLetterAsRead(messageId, userId);
        }
        
        MailboxMessage message = getMessageById(messageId, userId);
        message.markAsRead();
        MailboxMessage saved = messageRepository.save(message);
        log.info("标记消息为已读 - userId={}, messageId={}", userId, messageId);
        return saved;
    }
    
    /**
     * 标记chronos_letters消息为已读
     */
    private MailboxMessage markChronosLetterAsRead(Long messageId, Long userId) {
        // 找到对应的ChronosLetter ID
        String chronosLetterId = findChronosLetterIdByMessageId(messageId, userId);
        
        // 标记为已读
        chronosLetterService.markAsRead(chronosLetterId, userId);
        log.info("标记chronos_letters消息为已读 - userId={}, messageId={}, letterId={}", 
            userId, messageId, chronosLetterId);
        
        // 返回转换后的MailboxMessage
        return getChronosLetterAsMailboxMessage(messageId, userId);
    }
    
    /**
     * 根据messageId查找对应的ChronosLetter ID
     */
    private String findChronosLetterIdByMessageId(Long messageId, Long userId) {
        List<ChronosLetter> letters = chronosLetterService.getUserLetters(userId);
        
        for (ChronosLetter letter : letters) {
            long hashId = letter.getId().hashCode();
            long expectedId = hashId < 0 ? hashId : -hashId;
            
            if (expectedId == messageId) {
                return letter.getId();
            }
        }
        
        throw new ResourceNotFoundException("消息不存在: " + messageId);
    }
    
    /**
     * 标记/取消标记消息为重要
     */
    @Transactional
    public MailboxMessage markAsImportant(Long messageId, Long userId, boolean important) {
        MailboxMessage message = getMessageById(messageId, userId);
        message.setIsImportant(important);
        MailboxMessage saved = messageRepository.save(message);
        log.info("标记消息为重要 - userId={}, messageId={}, important={}", userId, messageId, important);
        return saved;
    }
    
    /**
     * 标记/取消标记消息为收藏
     */
    @Transactional
    public MailboxMessage markAsStarred(Long messageId, Long userId, boolean starred) {
        MailboxMessage message = getMessageById(messageId, userId);
        message.setIsStarred(starred);
        MailboxMessage saved = messageRepository.save(message);
        log.info("标记消息为收藏 - userId={}, messageId={}, starred={}", userId, messageId, starred);
        return saved;
    }
    
    /**
     * 删除消息（软删除）
     */
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        // 如果是负数ID，说明是chronos_letters的消息
        if (messageId < 0) {
            deleteChronosLetter(messageId, userId);
            return;
        }
        
        MailboxMessage message = getMessageById(messageId, userId);
        message.softDelete();
        messageRepository.save(message);
        log.info("删除消息 - userId={}, messageId={}", userId, messageId);
    }
    
    /**
     * 删除chronos_letters消息
     */
    private void deleteChronosLetter(Long messageId, Long userId) {
        // 找到对应的ChronosLetter ID
        String chronosLetterId = findChronosLetterIdByMessageId(messageId, userId);
        
        // 删除信件
        chronosLetterService.deleteLetter(chronosLetterId, userId);
        log.info("删除chronos_letters消息 - userId={}, messageId={}, letterId={}", 
            userId, messageId, chronosLetterId);
    }
    
    /**
     * 批量删除消息
     */
    @Transactional
    public int batchDeleteMessages(List<Long> messageIds, Long userId) {
        if (messageIds == null || messageIds.isEmpty()) {
            return 0;
        }
        List<MailboxMessage> messages = messageRepository.findByIdInAndReceiverId(messageIds, userId);
        for (MailboxMessage message : messages) {
            message.softDelete();
        }
        messageRepository.saveAll(messages);
        log.info("批量删除消息 - userId={}, count={}", userId, messages.size());
        return messages.size();
    }
    
    /**
     * 搜索消息
     */
    public Page<MailboxMessage> searchMessages(Long userId, String keyword, MessageQueryRequest request) {
        Pageable pageable = PageRequest.of(
            request.getPage() != null ? request.getPage() : 0,
            request.getSize() != null ? request.getSize() : 20
        );
        
        return messageRepository.searchMessages(userId, keyword, pageable);
    }
}

