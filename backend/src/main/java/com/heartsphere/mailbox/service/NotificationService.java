package com.heartsphere.mailbox.service;

import com.heartsphere.mailbox.dto.UnreadCountResponse;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.entity.NotificationSettings;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.mailbox.repository.NotificationSettingsRepository;
import com.heartsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 提醒服务
 * 负责提醒设置管理和未读消息统计
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationSettingsRepository settingsRepository;
    private final MailboxMessageRepository messageRepository;
    private final UserRepository userRepository;
    
    /**
     * 获取或创建用户的提醒设置
     */
    @Transactional
    public NotificationSettings getOrCreateSettings(Long userId) {
        Optional<NotificationSettings> existing = settingsRepository.findByUserId(userId);
        if (existing.isPresent()) {
            NotificationSettings settings = existing.get();
            // 确保userId字段已设置
            if (settings.getUserId() == null) {
                settings.setUserId(userId);
            }
            return settings;
        }
        
        // 创建默认设置
        NotificationSettings settings = new NotificationSettings();
        settings.setUser(userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + userId)));
        settings.setUserId(userId);  // 设置userId字段
        settings.setEnableNotifications(true);
        settings.setEsoulLetterEnabled(true);
        settings.setResonanceEnabled(true);
        settings.setSystemMessageEnabled(true);
        settings.setUserMessageEnabled(true);
        settings.setSoundEnabled(true);
        
        return settingsRepository.save(settings);
    }
    
    /**
     * 更新提醒设置
     */
    @Transactional
    public NotificationSettings updateSettings(Long userId, NotificationSettings newSettings) {
        NotificationSettings settings = getOrCreateSettings(userId);
        
        if (newSettings.getEnableNotifications() != null) {
            settings.setEnableNotifications(newSettings.getEnableNotifications());
        }
        if (newSettings.getEsoulLetterEnabled() != null) {
            settings.setEsoulLetterEnabled(newSettings.getEsoulLetterEnabled());
        }
        if (newSettings.getResonanceEnabled() != null) {
            settings.setResonanceEnabled(newSettings.getResonanceEnabled());
        }
        if (newSettings.getSystemMessageEnabled() != null) {
            settings.setSystemMessageEnabled(newSettings.getSystemMessageEnabled());
        }
        if (newSettings.getUserMessageEnabled() != null) {
            settings.setUserMessageEnabled(newSettings.getUserMessageEnabled());
        }
        if (newSettings.getQuietHoursStart() != null) {
            settings.setQuietHoursStart(newSettings.getQuietHoursStart());
        }
        if (newSettings.getQuietHoursEnd() != null) {
            settings.setQuietHoursEnd(newSettings.getQuietHoursEnd());
        }
        if (newSettings.getSoundEnabled() != null) {
            settings.setSoundEnabled(newSettings.getSoundEnabled());
        }
        
        return settingsRepository.save(settings);
    }
    
    /**
     * 获取未读消息统计
     */
    public UnreadCountResponse getUnreadCount(Long userId) {
        long total = messageRepository.countByReceiverIdAndIsReadFalse(userId);
        
        Map<MessageCategory, Long> categoryUnread = new HashMap<>();
        categoryUnread.put(MessageCategory.ESOUL_LETTER, 
            messageRepository.countByReceiverIdAndMessageCategoryAndIsReadFalse(userId, MessageCategory.ESOUL_LETTER));
        categoryUnread.put(MessageCategory.RESONANCE, 
            messageRepository.countByReceiverIdAndMessageCategoryAndIsReadFalse(userId, MessageCategory.RESONANCE));
        categoryUnread.put(MessageCategory.SYSTEM, 
            messageRepository.countByReceiverIdAndMessageCategoryAndIsReadFalse(userId, MessageCategory.SYSTEM));
        categoryUnread.put(MessageCategory.USER_MESSAGE, 
            messageRepository.countByReceiverIdAndMessageCategoryAndIsReadFalse(userId, MessageCategory.USER_MESSAGE));
        
        return UnreadCountResponse.builder()
            .totalUnread(total)
            .categoryUnread(categoryUnread)
            .build();
    }
    
    /**
     * 检查是否应该发送提醒
     */
    public boolean shouldNotify(Long userId, String messageCategory) {
        NotificationSettings settings = getOrCreateSettings(userId);
        return settings.isEnabledForCategory(messageCategory);
    }
}

