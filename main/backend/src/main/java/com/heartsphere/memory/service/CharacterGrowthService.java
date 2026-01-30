package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import com.heartsphere.memory.repository.jpa.CharacterGrowthEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 角色成长服务
 * 管理角色的自我成长，包括主动学习、自我反思、能力提升等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterGrowthService {
    
    private final CharacterGrowthEventRepository growthEventRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 记录成长事件
     */
    @Transactional
    public CharacterGrowthEventEntity recordGrowthEvent(
            Long characterId,
            Long userId,
            String eventType,
            String eventCategory,
            String title,
            String description,
            Map<String, Object> metadata) {
        
        try {
            String metadataJson = metadata != null ? objectMapper.writeValueAsString(metadata) : null;
            
            CharacterGrowthEventEntity event = CharacterGrowthEventEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .eventType(eventType)
                    .eventCategory(eventCategory)
                    .title(title)
                    .description(description)
                    .metadata(metadataJson)
                    .build();
            
            CharacterGrowthEventEntity saved = growthEventRepository.save(event);
            log.info("✅ 成长事件已记录: characterId={}, userId={}, eventType={}, title={}",
                    characterId, userId, eventType, title);
            
            return saved;
        } catch (Exception e) {
            log.error("❌ 记录成长事件失败: characterId={}, userId={}, eventType={}",
                    characterId, userId, eventType, e);
            throw new RuntimeException("记录成长事件失败", e);
        }
    }
    
    /**
     * 检测学习机会（轻量级实现）
     * 在实际应用中，这里可以集成AI分析对话内容
     */
    public void detectLearningOpportunity(Long characterId, Long userId, String conversationContent) {
        // TODO: 集成AI分析对话内容，识别学习机会
        // 当前实现：简单记录学习事件
        if (conversationContent != null && conversationContent.length() > 50) {
            recordGrowthEvent(
                    characterId,
                    userId,
                    "LEARNING",
                    "SELF_GROWTH",
                    "检测到学习机会",
                    "从对话中识别到潜在的学习机会",
                    Map.of("contentLength", conversationContent.length())
            );
        }
    }
    
    /**
     * 触发自我反思
     */
    @Transactional
    public void triggerSelfReflection(Long characterId, Long userId, String reflectionType) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("reflectionType", reflectionType);
            metadata.put("timestamp", LocalDateTime.now().toString());
            
            recordGrowthEvent(
                    characterId,
                    userId,
                    "REFLECTION",
                    "SELF_GROWTH",
                    "自我反思",
                    "角色进行自我反思，分析表现和改进机会",
                    metadata
            );
            
            log.info("✅ 自我反思已触发: characterId={}, userId={}, reflectionType={}",
                    characterId, userId, reflectionType);
        } catch (Exception e) {
            log.error("❌ 触发自我反思失败: characterId={}, userId={}",
                    characterId, userId, e);
        }
    }
    
    /**
     * 记录能力提升
     */
    @Transactional
    public void recordAbilityUpgrade(Long characterId, Long userId, String abilityType, String description) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("abilityType", abilityType);
            metadata.put("timestamp", LocalDateTime.now().toString());
            
            recordGrowthEvent(
                    characterId,
                    userId,
                    "ABILITY_UPGRADE",
                    "SELF_GROWTH",
                    "能力提升: " + abilityType,
                    description,
                    metadata
            );
            
            log.info("✅ 能力提升已记录: characterId={}, userId={}, abilityType={}",
                    characterId, userId, abilityType);
        } catch (Exception e) {
            log.error("❌ 记录能力提升失败: characterId={}, userId={}",
                    characterId, userId, e);
        }
    }
    
    /**
     * 获取角色的成长事件列表
     */
    public List<CharacterGrowthEventEntity> getGrowthEvents(Long characterId, Long userId) {
        return growthEventRepository.findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId);
    }
    
    /**
     * 获取成长轨迹（简化版）
     */
    public Map<String, Object> getGrowthTrajectory(Long characterId, Long userId) {
        List<CharacterGrowthEventEntity> events = getGrowthEvents(characterId, userId);
        
        Map<String, Object> trajectory = new LinkedHashMap<>();
        trajectory.put("characterId", characterId);
        trajectory.put("userId", userId);
        trajectory.put("totalEvents", events.size());
        trajectory.put("events", events);
        
        // 按类型统计
        Map<String, Long> eventTypeStats = new HashMap<>();
        for (CharacterGrowthEventEntity event : events) {
            eventTypeStats.merge(event.getEventType(), 1L, Long::sum);
        }
        trajectory.put("eventTypeStats", eventTypeStats);
        
        return trajectory;
    }
}
