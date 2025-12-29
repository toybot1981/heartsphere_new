package com.heartsphere.quickconnect.service;

import com.heartsphere.quickconnect.dto.QuickConnectCharacterDTO;
import com.heartsphere.quickconnect.repository.AccessHistoryRepository;
import com.heartsphere.quickconnect.repository.UserFavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 推荐算法服务
 * 基于用户行为计算E-SOUL的推荐分数
 * 优化：添加缓存和批量计算
 */
@Service
public class RecommendationService {
    
    private static final Logger logger = Logger.getLogger(RecommendationService.class.getName());
    
    @Autowired
    private AccessHistoryRepository accessHistoryRepository;
    
    @Autowired
    private UserFavoriteRepository userFavoriteRepository;
    
    // 内存缓存（用于批量计算时的临时缓存）
    private final Map<String, Double> scoreCache = new ConcurrentHashMap<>();
    
    // 推荐因素权重（可配置）
    private static final double WEIGHT_ACCESS_FREQUENCY = 0.30;  // 访问频率权重
    private static final double WEIGHT_RECENT_ACCESS = 0.25;      // 最近访问时间权重
    private static final double WEIGHT_FAVORITE = 0.20;          // 收藏状态权重
    private static final double WEIGHT_CONVERSATION_DURATION = 0.15;  // 对话时长权重
    private static final double WEIGHT_CONVERSATION_ROUNDS = 0.10;    // 对话轮数权重
    
    // 归一化参数（可配置）
    private static final double MAX_ACCESS_COUNT = 100.0;
    private static final double RECENT_ACCESS_DECAY_DAYS = 30.0;
    private static final double MAX_CONVERSATION_DURATION = 36000.0; // 10小时
    private static final double MAX_CONVERSATION_ROUNDS = 1000.0;
    
    /**
     * 计算推荐分数（带缓存）
     * 
     * @param userId 用户ID
     * @param characterId 角色ID
     * @return 推荐分数（0-1之间）
     */
    public double calculateRecommendationScore(Long userId, Long characterId) {
        String cacheKey = String.format("%d_%d", userId, characterId);
        
        // 检查缓存
        Double cachedScore = scoreCache.get(cacheKey);
        if (cachedScore != null) {
            return cachedScore;
        }
        
        double score = calculateRecommendationScoreInternal(userId, characterId);
        
        // 缓存结果
        scoreCache.put(cacheKey, score);
        
        return score;
    }
    
    /**
     * 内部计算推荐分数（不缓存）
     */
    private double calculateRecommendationScoreInternal(Long userId, Long characterId) {
        logger.fine(String.format("[RecommendationService] 计算推荐分数 - userId: %d, characterId: %d", userId, characterId));
        
        double score = 0.0;
        
        // 1. 访问频率分数（0-1）
        double accessFrequencyScore = calculateAccessFrequencyScore(userId, characterId);
        score += accessFrequencyScore * WEIGHT_ACCESS_FREQUENCY;
        
        // 2. 最近访问时间分数（0-1）
        double recentAccessScore = calculateRecentAccessScore(userId, characterId);
        score += recentAccessScore * WEIGHT_RECENT_ACCESS;
        
        // 3. 收藏状态分数（0或1）
        double favoriteScore = calculateFavoriteScore(userId, characterId);
        score += favoriteScore * WEIGHT_FAVORITE;
        
        // 4. 对话时长分数（0-1）
        double conversationDurationScore = calculateConversationDurationScore(userId, characterId);
        score += conversationDurationScore * WEIGHT_CONVERSATION_DURATION;
        
        // 5. 对话轮数分数（0-1）
        double conversationRoundsScore = calculateConversationRoundsScore(userId, characterId);
        score += conversationRoundsScore * WEIGHT_CONVERSATION_ROUNDS;
        
        // 确保分数在0-1之间
        score = Math.max(0.0, Math.min(1.0, score));
        
        logger.fine(String.format("[RecommendationService] 推荐分数: %.4f (访问频率: %.4f, 最近访问: %.4f, 收藏: %.4f, 时长: %.4f, 轮数: %.4f)", 
                score, accessFrequencyScore, recentAccessScore, favoriteScore, conversationDurationScore, conversationRoundsScore));
        
        return score;
    }
    
    /**
     * 批量计算推荐分数（优化性能）
     * 
     * @param userId 用户ID
     * @param characterIds 角色ID列表
     * @return 角色ID到推荐分数的映射
     */
    public Map<Long, Double> batchCalculateRecommendationScores(Long userId, List<Long> characterIds) {
        logger.info(String.format("[RecommendationService] 批量计算推荐分数 - userId: %d, count: %d", userId, characterIds.size()));
        
        Map<Long, Double> scores = new HashMap<>();
        
        // 批量查询访问历史统计（减少数据库查询）
        Map<Long, Long> accessCounts = new HashMap<>();
        Map<Long, LocalDateTime> lastAccessTimes = new HashMap<>();
        Map<Long, Long> totalDurations = new HashMap<>();
        Map<Long, Long> totalRounds = new HashMap<>();
        
        for (Long characterId : characterIds) {
            accessCounts.put(characterId, accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId));
            lastAccessTimes.put(characterId, accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId));
            Long duration = accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId);
            totalDurations.put(characterId, duration != null ? duration : 0L);
            Long rounds = accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId);
            totalRounds.put(characterId, rounds != null ? rounds : 0L);
        }
        
        // 批量查询收藏状态
        List<Long> favoriteCharacterIds = userFavoriteRepository.findByUserIdAndCharacterIdIn(userId, characterIds)
                .stream()
                .map(uf -> uf.getCharacter().getId())
                .collect(Collectors.toList());
        
        // 批量计算分数
        for (Long characterId : characterIds) {
            double score = calculateScoreFromData(
                    accessCounts.getOrDefault(characterId, 0L),
                    lastAccessTimes.get(characterId),
                    favoriteCharacterIds.contains(characterId),
                    totalDurations.getOrDefault(characterId, 0L),
                    totalRounds.getOrDefault(characterId, 0L)
            );
            scores.put(characterId, score);
            
            // 缓存
            String cacheKey = String.format("%d_%d", userId, characterId);
            scoreCache.put(cacheKey, score);
        }
        
        logger.info(String.format("[RecommendationService] 批量计算完成 - 计算了 %d 个推荐分数", scores.size()));
        
        return scores;
    }
    
    /**
     * 从数据计算推荐分数（不查询数据库）
     */
    private double calculateScoreFromData(
            Long accessCount,
            LocalDateTime lastAccessTime,
            boolean isFavorite,
            Long totalDuration,
            Long totalRounds) {
        
        double score = 0.0;
        
        // 1. 访问频率分数
        double accessFrequencyScore = Math.log(1 + accessCount) / Math.log(1 + MAX_ACCESS_COUNT);
        score += Math.min(1.0, accessFrequencyScore) * WEIGHT_ACCESS_FREQUENCY;
        
        // 2. 最近访问时间分数
        double recentAccessScore = 0.0;
        if (lastAccessTime != null) {
            long daysSinceLastAccess = ChronoUnit.DAYS.between(lastAccessTime, LocalDateTime.now());
            recentAccessScore = Math.exp(-daysSinceLastAccess / RECENT_ACCESS_DECAY_DAYS);
        }
        score += Math.min(1.0, recentAccessScore) * WEIGHT_RECENT_ACCESS;
        
        // 3. 收藏状态分数
        double favoriteScore = isFavorite ? 1.0 : 0.0;
        score += favoriteScore * WEIGHT_FAVORITE;
        
        // 4. 对话时长分数
        double conversationDurationScore = 0.0;
        if (totalDuration > 0) {
            conversationDurationScore = Math.log(1 + totalDuration) / Math.log(1 + MAX_CONVERSATION_DURATION);
        }
        score += Math.min(1.0, conversationDurationScore) * WEIGHT_CONVERSATION_DURATION;
        
        // 5. 对话轮数分数
        double conversationRoundsScore = 0.0;
        if (totalRounds > 0) {
            conversationRoundsScore = Math.log(1 + totalRounds) / Math.log(1 + MAX_CONVERSATION_ROUNDS);
        }
        score += Math.min(1.0, conversationRoundsScore) * WEIGHT_CONVERSATION_ROUNDS;
        
        return Math.max(0.0, Math.min(1.0, score));
    }
    
    /**
     * 计算访问频率分数
     */
    private double calculateAccessFrequencyScore(Long userId, Long characterId) {
        long accessCount = accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId);
        double score = Math.log(1 + accessCount) / Math.log(1 + MAX_ACCESS_COUNT);
        return Math.min(1.0, score);
    }
    
    /**
     * 计算最近访问时间分数
     */
    private double calculateRecentAccessScore(Long userId, Long characterId) {
        LocalDateTime lastAccessTime = accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId);
        
        if (lastAccessTime == null) {
            return 0.0;
        }
        
        long daysSinceLastAccess = ChronoUnit.DAYS.between(lastAccessTime, LocalDateTime.now());
        double score = Math.exp(-daysSinceLastAccess / RECENT_ACCESS_DECAY_DAYS);
        
        return Math.min(1.0, score);
    }
    
    /**
     * 计算收藏状态分数
     */
    private double calculateFavoriteScore(Long userId, Long characterId) {
        boolean isFavorite = userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId);
        return isFavorite ? 1.0 : 0.0;
    }
    
    /**
     * 计算对话时长分数
     */
    private double calculateConversationDurationScore(Long userId, Long characterId) {
        Long totalDuration = accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId);
        
        if (totalDuration == null || totalDuration == 0) {
            return 0.0;
        }
        
        double score = Math.log(1 + totalDuration) / Math.log(1 + MAX_CONVERSATION_DURATION);
        return Math.min(1.0, score);
    }
    
    /**
     * 计算对话轮数分数
     */
    private double calculateConversationRoundsScore(Long userId, Long characterId) {
        Long totalRounds = accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId);
        
        if (totalRounds == null || totalRounds == 0) {
            return 0.0;
        }
        
        double score = Math.log(1 + totalRounds) / Math.log(1 + MAX_CONVERSATION_ROUNDS);
        return Math.min(1.0, score);
    }
    
    /**
     * 计算重要性评分
     */
    public double calculateImportance(Long userId, Long characterId) {
        return calculateRecommendationScore(userId, characterId);
    }
    
    /**
     * 为QuickConnectCharacterDTO填充推荐相关字段（批量优化版本）
     */
    public void fillRecommendationFields(List<QuickConnectCharacterDTO> dtos, Long userId) {
        if (dtos == null || dtos.isEmpty() || userId == null) {
            return;
        }
        
        // 提取所有角色ID
        List<Long> characterIds = dtos.stream()
                .map(QuickConnectCharacterDTO::getCharacterId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        
        if (characterIds.isEmpty()) {
            return;
        }
        
        // 批量计算推荐分数
        Map<Long, Double> scores = batchCalculateRecommendationScores(userId, characterIds);
        
        // 填充推荐字段
        for (QuickConnectCharacterDTO dto : dtos) {
            Long characterId = dto.getCharacterId();
            if (characterId != null) {
                Double score = scores.get(characterId);
                if (score != null) {
                    dto.setRecommendationScore(score);
                    dto.setImportance(score);
                }
            }
        }
    }
    
    /**
     * 为单个QuickConnectCharacterDTO填充推荐相关字段
     */
    public void fillRecommendationFields(QuickConnectCharacterDTO dto, Long userId) {
        if (dto == null || userId == null) {
            return;
        }
        
        Long characterId = dto.getCharacterId();
        if (characterId == null) {
            return;
        }
        
        double recommendationScore = calculateRecommendationScore(userId, characterId);
        dto.setRecommendationScore(recommendationScore);
        dto.setImportance(recommendationScore);
    }
    
    /**
     * 清除缓存
     */
    public void clearCache(Long userId, Long characterId) {
        if (characterId != null) {
            String cacheKey = String.format("%d_%d", userId, characterId);
            scoreCache.remove(cacheKey);
        } else {
            // 清除该用户的所有缓存
            scoreCache.entrySet().removeIf(entry -> entry.getKey().startsWith(userId + "_"));
        }
    }
}
