package com.heartsphere.mailbox.service;

import com.heartsphere.entity.Character;
import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.dto.ESoulLetterContent;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.ESoulLetterType;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.quickconnect.repository.AccessHistoryRepository;
import com.heartsphere.emotion.service.EmotionService;
import com.heartsphere.emotion.entity.EmotionRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * E-SOUL来信服务
 * 负责E-SOUL来信的触发、生成和管理
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ESoulLetterService {
    
    private final ESoulLetterGenerator letterGenerator;
    private final MailboxMessageService messageService;
    private final MailboxMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CharacterRepository characterRepository;
    private final AccessHistoryRepository accessHistoryRepository;
    private final EmotionService emotionService;
    
    /**
     * 触发来信
     */
    @Transactional
    public MailboxMessage triggerLetter(Long userId, ESoulLetterTrigger trigger) {
        log.info("触发E-SOUL来信 - userId={}, trigger={}", userId, trigger);
        
        // 检查触发条件
        if (!shouldTriggerLetter(userId)) {
            log.debug("不满足触发条件，跳过来信生成 - userId={}", userId);
            return null;
        }
        
        // 选择发件人（E-SOUL角色）
        Long characterId = selectSenderCharacter(userId);
        if (characterId == null) {
            log.warn("没有可用的角色，无法生成来信 - userId={}", userId);
            return null;
        }
        
        // 根据触发类型确定来信类型
        ESoulLetterType letterType = determineLetterType(userId, trigger);
        
        // 生成来信内容
        ESoulLetterContent letterContent = letterGenerator.generateLetterContent(
            userId, characterId, letterType
        );
        
        // 获取角色信息
        Character character = characterRepository.findById(characterId)
            .orElseThrow(() -> new RuntimeException("角色不存在: " + characterId));
        
        // 创建消息
        CreateMessageRequest createRequest = new CreateMessageRequest();
        createRequest.setReceiverId(userId);
        createRequest.setSenderType(SenderType.ESOUL);
        createRequest.setSenderId(characterId);
        createRequest.setSenderName(character.getName());
        createRequest.setSenderAvatar(character.getAvatarUrl());
        // 根据来信类型映射到MessageType
        MessageType messageType = switch (letterType) {
            case GREETING -> MessageType.ESOUL_GREETING;
            case CARE -> MessageType.ESOUL_CARE;
            case SHARE -> MessageType.ESOUL_SHARE;
            case REMINDER -> MessageType.ESOUL_REMINDER;
        };
        createRequest.setMessageType(messageType);
        createRequest.setMessageCategory(MessageCategory.ESOUL_LETTER);
        createRequest.setTitle(letterContent.getTitle());
        createRequest.setContent(letterContent.getContent());
        
        MailboxMessage message = messageService.createMessage(createRequest);
        log.info("E-SOUL来信生成成功 - userId={}, characterId={}, messageId={}", 
            userId, characterId, message.getId());
        
        return message;
    }
    
    /**
     * 检查是否应该触发来信
     */
    public boolean shouldTriggerLetter(Long userId) {
        // 检查用户是否存在
        if (!userRepository.existsById(userId)) {
            return false;
        }
        
        // 检查是否有可用角色
        List<Character> characters = characterRepository.findByUser_Id(userId);
        if (characters == null || characters.isEmpty()) {
            return false;
        }
        
        // 可以添加其他检查条件，比如：
        // - 最近是否已经收到过来信（避免频繁来信）
        // - 用户是否启用E-SOUL来信功能
        
        return true;
    }
    
    /**
     * 选择发件人角色
     * 优先选择最近聊过的角色，如果没有则选择第一个场景的第一个角色
     */
    private Long selectSenderCharacter(Long userId) {
        // 优先：最近聊过的角色
        List<com.heartsphere.quickconnect.entity.AccessHistory> recentHistory = 
            accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId);
        
        if (recentHistory != null && !recentHistory.isEmpty()) {
            // 去重，获取最近访问的角色ID
            List<Long> recentCharacterIds = recentHistory.stream()
                .map(ah -> ah.getCharacter().getId())
                .distinct()
                .limit(1)
                .collect(Collectors.toList());
            
            if (!recentCharacterIds.isEmpty()) {
                return recentCharacterIds.get(0);
            }
        }
        
        // 备选：第一个场景的第一个角色
        List<Character> characters = characterRepository.findByUser_Id(userId);
        if (characters != null && !characters.isEmpty()) {
            return characters.get(0).getId();
        }
        
        return null;
    }
    
    /**
     * 根据用户情绪和触发条件确定来信类型
     */
    private ESoulLetterType determineLetterType(Long userId, ESoulLetterTrigger trigger) {
        // 如果触发类型指定了来信类型，使用指定的类型
        if (trigger.getLetterType() != null) {
            return trigger.getLetterType();
        }
        
        // 根据用户当前情绪选择来信类型
        EmotionRecord currentEmotion = emotionService.getCurrentEmotion(userId);
        
        if (currentEmotion != null) {
            String emotionType = currentEmotion.getEmotionType();
            if (emotionType != null) {
                String lower = emotionType.toLowerCase();
                if (lower.contains("sad") || lower.contains("anxious") || 
                    lower.contains("angry") || lower.contains("lonely") || 
                    lower.contains("tired") || lower.contains("confused")) {
                    // 负面情绪，发送关怀型来信
                    return ESoulLetterType.CARE;
                } else if (lower.contains("happy") || lower.contains("excited") || 
                           lower.contains("content") || lower.contains("hopeful")) {
                    // 正面情绪，发送分享型来信
                    return ESoulLetterType.SHARE;
                }
            }
        }
        
        // 默认：问候型来信
        return ESoulLetterType.GREETING;
    }
    
    /**
     * 获取来信历史
     */
    public List<MailboxMessage> getLetterHistory(Long userId, Long esoulId) {
        // Repository方法接收String类型，需要转换
        List<MailboxMessage> allMessages = messageRepository.findBySenderTypeAndSenderIdOrderByCreatedAtDesc(
            SenderType.ESOUL.getCode(), 
            esoulId
        );
        return allMessages.stream()
            .filter(msg -> msg.getReceiverId() != null && msg.getReceiverId().equals(userId))
            .collect(Collectors.toList());
    }
    
    /**
     * E-SOUL来信触发信息
     */
    public static class ESoulLetterTrigger {
        private ESoulLetterType letterType;
        private String triggerReason;
        
        public ESoulLetterTrigger() {}
        
        public ESoulLetterTrigger(ESoulLetterType letterType, String triggerReason) {
            this.letterType = letterType;
            this.triggerReason = triggerReason;
        }
        
        public ESoulLetterType getLetterType() {
            return letterType;
        }
        
        public void setLetterType(ESoulLetterType letterType) {
            this.letterType = letterType;
        }
        
        public String getTriggerReason() {
            return triggerReason;
        }
        
        public void setTriggerReason(String triggerReason) {
            this.triggerReason = triggerReason;
        }
    }
}

