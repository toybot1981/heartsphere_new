package com.heartsphere.quickconnect.service;

import com.heartsphere.quickconnect.repository.AccessHistoryRepository;
import com.heartsphere.quickconnect.repository.UserFavoriteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 推荐算法服务单元测试
 */
@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private AccessHistoryRepository accessHistoryRepository;

    @Mock
    private UserFavoriteRepository userFavoriteRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private Long userId;
    private Long characterId;

    @BeforeEach
    void setUp() {
        userId = 1L;
        characterId = 1L;
    }

    @Test
    void testCalculateRecommendationScore_WithAllFactors() {
        // Given - 模拟所有因素都有值
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId))
                .thenReturn(10L);
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId))
                .thenReturn(LocalDateTime.now().minusDays(1));
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(true);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId))
                .thenReturn(7200L); // 2小时
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(100L);

        // When
        double score = recommendationService.calculateRecommendationScore(userId, characterId);

        // Then
        assertTrue(score >= 0.0 && score <= 1.0);
        assertTrue(score > 0.5); // 因为有收藏和访问历史，分数应该较高
    }

    @Test
    void testCalculateRecommendationScore_NoHistory() {
        // Given - 没有访问历史
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId))
                .thenReturn(0L);
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(false);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);

        // When
        double score = recommendationService.calculateRecommendationScore(userId, characterId);

        // Then
        assertEquals(0.0, score, 0.001);
    }

    @Test
    void testCalculateRecommendationScore_FavoriteOnly() {
        // Given - 只有收藏，没有访问历史
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId))
                .thenReturn(0L);
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(true);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);

        // When
        double score = recommendationService.calculateRecommendationScore(userId, characterId);

        // Then
        assertTrue(score >= 0.0 && score <= 1.0);
        assertEquals(0.2, score, 0.001); // 只有收藏权重20%
    }

    @Test
    void testBatchCalculateRecommendationScores() {
        // Given
        List<Long> characterIds = Arrays.asList(1L, 2L, 3L);

        // Mock访问历史数据
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, 1L)).thenReturn(10L);
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, 2L)).thenReturn(5L);
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, 3L)).thenReturn(0L);

        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, 1L))
                .thenReturn(LocalDateTime.now().minusDays(1));
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, 2L))
                .thenReturn(LocalDateTime.now().minusDays(7));
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, 3L))
                .thenReturn(null);

        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, 1L)).thenReturn(true);
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, 2L)).thenReturn(false);
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, 3L)).thenReturn(false);

        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, 1L))
                .thenReturn(7200L);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, 2L))
                .thenReturn(3600L);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, 3L))
                .thenReturn(null);

        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, 1L))
                .thenReturn(100L);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, 2L))
                .thenReturn(50L);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, 3L))
                .thenReturn(null);

        // When
        Map<Long, Double> scores = recommendationService.batchCalculateRecommendationScores(userId, characterIds);

        // Then
        assertNotNull(scores);
        assertEquals(3, scores.size());
        assertTrue(scores.get(1L) > scores.get(2L)); // 角色1的分数应该高于角色2
        assertTrue(scores.get(2L) > scores.get(3L)); // 角色2的分数应该高于角色3
    }

    @Test
    void testCalculateImportance() {
        // Given
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId))
                .thenReturn(5L);
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId))
                .thenReturn(LocalDateTime.now().minusDays(2));
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(false);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId))
                .thenReturn(3600L);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(50L);

        // When
        double importance = recommendationService.calculateImportance(userId, characterId);
        double recommendationScore = recommendationService.calculateRecommendationScore(userId, characterId);

        // Then
        assertEquals(recommendationScore, importance, 0.001);
    }

    @Test
    void testClearCache() {
        // Given
        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId))
                .thenReturn(1L);
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId))
                .thenReturn(LocalDateTime.now());
        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(false);
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(null);

        // 先计算一次，填充缓存
        recommendationService.calculateRecommendationScore(userId, characterId);

        // When
        recommendationService.clearCache(userId, characterId);

        // Then - 清除后应该重新查询数据库
        recommendationService.calculateRecommendationScore(userId, characterId);
        verify(accessHistoryRepository, atLeast(2)).countByUserIdAndCharacterId(userId, characterId);
    }
}



