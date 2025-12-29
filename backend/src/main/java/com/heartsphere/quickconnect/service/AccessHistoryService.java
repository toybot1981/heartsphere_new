package com.heartsphere.quickconnect.service;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.quickconnect.dto.AccessHistoryDTO;
import com.heartsphere.quickconnect.entity.AccessHistory;
import com.heartsphere.quickconnect.repository.AccessHistoryRepository;
import com.heartsphere.quickconnect.util.QuickConnectDTOMapper;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 访问历史服务
 * 提供用户访问E-SOUL历史记录的业务逻辑
 */
@Service
public class AccessHistoryService {
    
    private static final Logger logger = Logger.getLogger(AccessHistoryService.class.getName());
    
    @Autowired
    private AccessHistoryRepository accessHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    /**
     * 记录访问历史
     */
    @Transactional
    public AccessHistoryDTO recordAccess(Long userId, Long characterId, Integer accessDuration, Integer conversationRounds, String sessionId) {
        logger.info(String.format("[AccessHistoryService] 记录访问历史 - userId: %d, characterId: %d, duration: %d, rounds: %d", 
                userId, characterId, accessDuration, conversationRounds));
        
        // 验证用户存在
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));
        
        // 验证角色存在
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("角色", characterId));
        
        // 验证角色属于当前用户
        if (!character.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问该角色");
        }
        
        // 创建访问历史记录
        AccessHistory accessHistory = new AccessHistory();
        accessHistory.setUser(user);
        accessHistory.setCharacter(character);
        accessHistory.setAccessDuration(accessDuration != null ? accessDuration : 0);
        accessHistory.setConversationRounds(conversationRounds != null ? conversationRounds : 0);
        accessHistory.setSessionId(sessionId);
        
        AccessHistory saved = accessHistoryRepository.save(accessHistory);
        logger.info(String.format("[AccessHistoryService] 访问历史记录成功 - id: %d", saved.getId()));
        
        return QuickConnectDTOMapper.toAccessHistoryDTO(saved);
    }
    
    /**
     * 获取用户的访问历史
     */
    public List<AccessHistoryDTO> getAccessHistory(Long userId, Long characterId, Integer limit) {
        logger.info(String.format("[AccessHistoryService] 获取访问历史 - userId: %d, characterId: %s, limit: %s", 
                userId, characterId, limit));
        
        List<AccessHistory> history;
        
        if (characterId != null) {
            // 获取特定角色的访问历史
            history = accessHistoryRepository.findByUserIdAndCharacterIdOrderByAccessTimeDesc(userId, characterId);
        } else {
            // 获取所有角色的访问历史
            history = accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId);
        }
        
        // 限制数量
        if (limit != null && limit > 0) {
            history = history.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        }
        
        List<AccessHistoryDTO> result = history.stream()
                .map(QuickConnectDTOMapper::toAccessHistoryDTO)
                .collect(Collectors.toList());
        
        logger.info(String.format("[AccessHistoryService] 获取到 %d 条访问历史", result.size()));
        return result;
    }
    
    /**
     * 分页获取访问历史
     */
    public Page<AccessHistoryDTO> getAccessHistoryPage(Long userId, Long characterId, Integer page, Integer size) {
        logger.info(String.format("[AccessHistoryService] 分页获取访问历史 - userId: %d, characterId: %s, page: %d, size: %d", 
                userId, characterId, page, size));
        
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);
        Page<AccessHistory> historyPage;
        
        if (characterId != null) {
            historyPage = accessHistoryRepository.findByUserIdAndCharacterIdOrderByAccessTimeDesc(
                    userId, characterId, pageable);
        } else {
            historyPage = accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId, pageable);
        }
        
        Page<AccessHistoryDTO> result = historyPage.map(QuickConnectDTOMapper::toAccessHistoryDTO);
        
        logger.info(String.format("[AccessHistoryService] 获取到 %d 条访问历史（共 %d 条）", 
                result.getNumberOfElements(), result.getTotalElements()));
        return result;
    }
    
    /**
     * 获取访问统计信息
     */
    public AccessStatistics getAccessStatistics(Long userId, Long characterId) {
        logger.info(String.format("[AccessHistoryService] 获取访问统计 - userId: %d, characterId: %d", userId, characterId));
        
        AccessStatistics stats = new AccessStatistics();
        stats.setUserId(userId);
        stats.setCharacterId(characterId);
        
        // 访问次数
        long accessCount = accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId);
        stats.setAccessCount(accessCount);
        
        // 最后访问时间
        LocalDateTime lastAccessTime = accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId);
        stats.setLastAccessTime(lastAccessTime);
        
        // 总访问时长
        Long totalDuration = accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId);
        stats.setTotalDuration(totalDuration != null ? totalDuration.intValue() : 0);
        
        // 总对话轮数
        Long totalRounds = accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId);
        stats.setTotalConversationRounds(totalRounds != null ? totalRounds.intValue() : 0);
        
        logger.info(String.format("[AccessHistoryService] 统计结果 - 访问次数: %d, 总时长: %d秒, 总轮数: %d", 
                accessCount, stats.getTotalDuration(), stats.getTotalConversationRounds()));
        
        return stats;
    }
    
    /**
     * 获取用户最近访问的角色列表
     */
    public List<Long> getRecentCharacterIds(Long userId, Integer limit) {
        logger.info(String.format("[AccessHistoryService] 获取最近访问的角色 - userId: %d, limit: %d", userId, limit));
        
        List<AccessHistory> recentHistory = accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId);
        
        // 去重并限制数量
        List<Long> characterIds = recentHistory.stream()
                .map(AccessHistory::getCharacterId)
                .distinct()
                .limit(limit != null ? limit : 10)
                .collect(Collectors.toList());
        
        logger.info(String.format("[AccessHistoryService] 获取到 %d 个最近访问的角色", characterIds.size()));
        return characterIds;
    }
    
    /**
     * 访问统计信息
     */
    public static class AccessStatistics {
        private Long userId;
        private Long characterId;
        private Long accessCount;
        private LocalDateTime lastAccessTime;
        private Integer totalDuration;  // 总访问时长（秒）
        private Integer totalConversationRounds;  // 总对话轮数
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        
        public Long getCharacterId() {
            return characterId;
        }
        
        public void setCharacterId(Long characterId) {
            this.characterId = characterId;
        }
        
        public Long getAccessCount() {
            return accessCount;
        }
        
        public void setAccessCount(Long accessCount) {
            this.accessCount = accessCount;
        }
        
        public LocalDateTime getLastAccessTime() {
            return lastAccessTime;
        }
        
        public void setLastAccessTime(LocalDateTime lastAccessTime) {
            this.lastAccessTime = lastAccessTime;
        }
        
        public Integer getTotalDuration() {
            return totalDuration;
        }
        
        public void setTotalDuration(Integer totalDuration) {
            this.totalDuration = totalDuration;
        }
        
        public Integer getTotalConversationRounds() {
            return totalConversationRounds;
        }
        
        public void setTotalConversationRounds(Integer totalConversationRounds) {
            this.totalConversationRounds = totalConversationRounds;
        }
    }
}

