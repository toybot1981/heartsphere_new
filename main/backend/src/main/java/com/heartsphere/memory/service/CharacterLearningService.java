package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterLearningHistoryEntity;
import com.heartsphere.memory.repository.jpa.CharacterKnowledgeAssetRepository;
import com.heartsphere.memory.repository.jpa.CharacterLearningHistoryRepository;
import com.heartsphere.memory.util.ExperienceLevelCalculator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 角色学习服务
 * 管理角色的学习过程、等级晋升、统计数据等
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterLearningService {
    
    private final CharacterKnowledgeAssetRepository assetRepository;
    private final CharacterLearningHistoryRepository historyRepository;
    private final ExperienceLevelCalculator experienceLevelCalculator;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取角色的经验等级
     */
    public ExperienceLevelCalculator.ExperienceLevel getCharacterExperienceLevel(Long characterId) {
        long assetCount = assetRepository.countByCharacterIdAndIsApprovedTrue(characterId);
        Double avgTrustScore = assetRepository.getAverageTrustScore(characterId);
        
        if (avgTrustScore == null) {
            avgTrustScore = 0.0;
        }
        
        return experienceLevelCalculator.calculateLevel(assetCount, avgTrustScore);
    }
    
    /**
     * 获取角色的学习统计数据
     */
    public Map<String, Object> getCharacterLearningStats(Long characterId) {
        long totalAssets = assetRepository.countByCharacterId(characterId);
        long approvedAssets = assetRepository.countByCharacterIdAndIsApprovedTrue(characterId);
        Double avgTrustScore = assetRepository.getAverageTrustScore(characterId);
        
        if (avgTrustScore == null) {
            avgTrustScore = 0.0;
        }
        
        ExperienceLevelCalculator.ExperienceLevel level = getCharacterExperienceLevel(characterId);
        
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("characterId", characterId);
        stats.put("experienceLevel", level.level);
        stats.put("experienceLevelName", level.name);
        stats.put("totalAssets", totalAssets);
        stats.put("approvedAssets", approvedAssets);
        stats.put("pendingAssets", totalAssets - approvedAssets);
        stats.put("averageTrustScore", Math.round(avgTrustScore * 100.0) / 100.0);
        stats.put("levelDescription", experienceLevelCalculator.getLevelDescription(level));
        stats.put("nextLevelAssetRequirement", experienceLevelCalculator.getNextLevelAssetRequirement(level));
        stats.put("nextLevelTrustRequirement", experienceLevelCalculator.getNextLevelTrustRequirement(level));
        stats.put("progressPercentage", experienceLevelCalculator.getProgressPercentage(approvedAssets, level));
        
        return stats;
    }
    
    /**
     * 获取角色的学习历史
     */
    public List<Map<String, Object>> getLearningHistory(Long characterId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<CharacterLearningHistoryEntity> histories = 
            historyRepository.findByCharacterIdOrderByCreatedAtDesc(characterId, pageable);
        
        return histories.stream()
            .map(this::convertToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取特定类型的学习历史
     */
    public List<Map<String, Object>> getLearningHistoryByType(Long characterId, String eventType, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<CharacterLearningHistoryEntity> histories = 
            historyRepository.findByCharacterIdAndEventTypeOrderByCreatedAtDesc(characterId, eventType, pageable);
        
        return histories.stream()
            .map(this::convertToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * 将历史实体转换为 Map
     */
    private Map<String, Object> convertToMap(CharacterLearningHistoryEntity history) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", history.getId());
        map.put("characterId", history.getCharacterId());
        map.put("eventType", history.getEventType());
        map.put("assetId", history.getAssetId());
        map.put("description", history.getDescription());
        
        // 解析 metadata JSON
        if (history.getMetadata() != null) {
            try {
                map.put("metadata", objectMapper.readValue(history.getMetadata(), Map.class));
            } catch (Exception e) {
                log.error("解析元数据失败", e);
                map.put("metadata", Collections.emptyMap());
            }
        }
        
        map.put("createdAt", history.getCreatedAt().toString());
        
        return map;
    }
    
    /**
     * 获取角色的主要里程碑
     */
    public List<Map<String, Object>> getCharacterMilestones(Long characterId) {
        // 获取所有 LEVEL_UP 事件
        Pageable pageable = PageRequest.of(0, 10);
        List<CharacterLearningHistoryEntity> levelUps = 
            historyRepository.findByCharacterIdAndEventTypeOrderByCreatedAtDesc(characterId, "LEVEL_UP", pageable);
        
        return levelUps.stream()
            .map(this::convertToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * 计算角色的学习速度（每天升级的资产数）
     */
    public double calculateLearningVelocity(Long characterId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        long totalAssets = assetRepository.countByCharacterId(characterId);
        
        if (totalAssets == 0) {
            return 0;
        }
        
        return (double) totalAssets / days;
    }
    
    /**
     * 记录学习事件
     */
    @Transactional
    public void recordLearningEvent(Long characterId, String eventType, Long assetId,
                                    String description, Map<String, Object> metadata) {
        try {
            CharacterLearningHistoryEntity history = CharacterLearningHistoryEntity.builder()
                .characterId(characterId)
                .eventType(eventType)
                .assetId(assetId)
                .description(description)
                .metadata(objectMapper.writeValueAsString(metadata))
                .createdAt(LocalDateTime.now())
                .build();
            
            historyRepository.save(history);
        } catch (Exception e) {
            log.error("记录学习事件失败", e);
        }
    }
}
