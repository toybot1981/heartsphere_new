package com.heartsphere.service;

import com.heartsphere.dto.UserProfileStatisticsDTO;
import com.heartsphere.entity.User;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * 用户资料服务
 * 提供用户个人信息管理和统计数据查询功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final CharacterRepository characterRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final EraRepository eraRepository;
    private final ScriptRepository scriptRepository;

    /**
     * 获取用户信息
     */
    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));
    }

    /**
     * 更新用户昵称
     */
    @Transactional
    public User updateNickname(Long userId, String nickname) {
        User user = getUserProfile(userId);
        user.setNickname(nickname);
        return userRepository.save(user);
    }

    /**
     * 更新用户头像
     */
    @Transactional
    public User updateAvatar(Long userId, String avatarUrl) {
        User user = getUserProfile(userId);
        user.setAvatar(avatarUrl);
        return userRepository.save(user);
    }

    /**
     * 更新用户资料（昵称和/或头像）
     */
    @Transactional
    public User updateProfile(Long userId, String nickname, String avatar) {
        User user = getUserProfile(userId);
        
        if (nickname != null && !nickname.trim().isEmpty()) {
            user.setNickname(nickname.trim());
        }
        
        if (avatar != null && !avatar.trim().isEmpty()) {
            user.setAvatar(avatar.trim());
        }
        
        return userRepository.save(user);
    }

    /**
     * 获取用户统计数据
     */
    public UserProfileStatisticsDTO getStatistics(Long userId) {
        // 验证用户存在
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("用户", userId);
        }

        // 统计场景数（访问过的场景）
        // 注意：这里需要根据实际业务逻辑来判断"访问过"的定义
        // 暂时统计用户拥有的场景（通过Era查询）
        Long scenesCount = (long) eraRepository.findByUser_Id(userId).size();
        
        // 统计角色数（用户创建的自定义角色）
        Long charactersCount = (long) characterRepository.findByUser_Id(userId).size();
        
        // 统计消息数（这个需要通过对话记录表，如果有的话）
        // 目前暂时返回0，后续可以根据实际需求添加消息统计表
        Long totalMessages = 0L;
        
        // 计算活跃天数（从注册时间到现在）
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));
        LocalDateTime createdAt = user.getCreatedAt();
        Long activeDays = createdAt != null 
                ? ChronoUnit.DAYS.between(createdAt, LocalDateTime.now()) + 1
                : 1L;
        
        // 统计日记条目数
        Long journalEntriesCount = (long) journalEntryRepository.findByUser_Id(userId).size();
        
        // 统计自定义角色数（同上面的charactersCount）
        Long customCharactersCount = charactersCount;
        
        // 统计自定义场景数（用户创建的场景）
        Long customScenesCount = scenesCount;
        
        // 统计自定义剧本数
        Long customScriptsCount = (long) scriptRepository.findByUser_Id(userId).size();
        
        // 社交互动统计（目前暂时返回0，后续可以添加信件功能）
        Long totalMails = 0L;
        Long unreadMails = 0L;
        
        return new UserProfileStatisticsDTO(
                scenesCount,
                charactersCount,
                totalMessages,
                activeDays,
                journalEntriesCount,
                customCharactersCount,
                customScenesCount,
                customScriptsCount,
                totalMails,
                unreadMails
        );
    }
}

