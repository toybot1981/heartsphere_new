package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import com.heartsphere.memory.entity.CharacterRelationshipMilestoneEntity;
import com.heartsphere.memory.repository.jpa.CharacterGrowthEventRepository;
import com.heartsphere.memory.repository.jpa.CharacterRelationshipMilestoneRepository;
import com.heartsphere.memory.util.CompanionshipMemoryBuilder;
import com.heartsphere.memory.util.EmotionalConnectionAnalyzer;
import com.heartsphere.memory.util.RelationshipDepthCalculator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 角色陪伴服务
 * 管理角色的挚友能力，包括情感连接、陪伴机制、关系阶段等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterCompanionshipService {
    
    private final CharacterGrowthEventRepository growthEventRepository;
    private final CharacterRelationshipMilestoneRepository milestoneRepository;
    private final EmotionalConnectionAnalyzer emotionalConnectionAnalyzer;
    private final RelationshipDepthCalculator relationshipDepthCalculator;
    private final CompanionshipMemoryBuilder companionshipMemoryBuilder;
    private final ObjectMapper objectMapper;
    
    /**
     * 分析情感连接
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param emotionalResonanceCount 情感共鸣次数
     * @param emotionalMemoryCount 情感记忆数量
     * @param positiveEmotionRatio 正面情绪比例
     * @param deepConversationCount 深度对话次数
     * @return 情感连接分数 (0-100)
     */
    public int analyzeEmotionalConnection(
            Long characterId,
            Long userId,
            int emotionalResonanceCount,
            int emotionalMemoryCount,
            double positiveEmotionRatio,
            int deepConversationCount) {
        
        int score = emotionalConnectionAnalyzer.calculateEmotionalConnectionScore(
                emotionalResonanceCount,
                emotionalMemoryCount,
                positiveEmotionRatio,
                deepConversationCount);
        
        log.info("情感连接分析完成: characterId={}, userId={}, score={}",
                characterId, userId, score);
        
        return score;
    }
    
    /**
     * 检测情感共鸣
     */
    @Transactional
    public boolean detectAndRecordEmotionalResonance(
            Long characterId,
            Long userId,
            String userMessage,
            String characterResponse) {
        
        boolean hasResonance = emotionalConnectionAnalyzer.detectEmotionalResonance(
                userMessage, characterResponse);
        
        if (hasResonance) {
            // 记录情感共鸣事件
            Map<String, Object> memory = companionshipMemoryBuilder.buildEmotionalResonanceMemory(
                    "AUTO_DETECTED",
                    userMessage,
                    characterResponse,
                    70); // 默认强度
            
            try {
                String metadataJson = objectMapper.writeValueAsString(memory);
                
                CharacterGrowthEventEntity event = CharacterGrowthEventEntity.builder()
                        .characterId(characterId)
                        .userId(userId)
                        .eventType("RELATIONSHIP_PROGRESS")
                        .eventCategory("COMPANIONSHIP")
                        .title("情感共鸣")
                        .description("检测到情感共鸣时刻")
                        .metadata(metadataJson)
                        .build();
                
                growthEventRepository.save(event);
                
                log.info("✅ 情感共鸣已记录: characterId={}, userId={}",
                        characterId, userId);
            } catch (Exception e) {
                log.error("❌ 记录情感共鸣失败: characterId={}, userId={}",
                        characterId, userId, e);
            }
        }
        
        return hasResonance;
    }
    
    /**
     * 计算并更新关系阶段
     */
    @Transactional
    public RelationshipDepthCalculator.RelationshipStage calculateAndUpdateRelationshipStage(
            Long characterId,
            Long userId,
            int interactionCount,
            int emotionalConnectionScore,
            int sharedExperienceCount,
            double positiveFeedbackRatio,
            long daysSinceFirstInteraction) {
        
        // 计算关系深度分数
        int relationshipDepthScore = relationshipDepthCalculator.calculateRelationshipDepth(
                interactionCount,
                emotionalConnectionScore,
                sharedExperienceCount,
                positiveFeedbackRatio,
                daysSinceFirstInteraction);
        
        // 确定关系阶段
        RelationshipDepthCalculator.RelationshipStage newStage = 
                relationshipDepthCalculator.determineRelationshipStage(relationshipDepthScore);
        
        // TODO: 从数据库获取当前阶段，检查是否需要转换
        // 这里简化处理，直接记录里程碑
        
        // 记录关系里程碑（如果是阶段转换）
        recordRelationshipMilestone(
                characterId,
                userId,
                "STAGE_TRANSITION",
                null, // fromStage - 需要从数据库获取
                newStage.name(),
                "关系阶段: " + newStage.getName(),
                "关系深度分数: " + relationshipDepthScore);
        
        log.info("✅ 关系阶段已计算: characterId={}, userId={}, stage={}, score={}",
                characterId, userId, newStage.getName(), relationshipDepthScore);
        
        return newStage;
    }
    
    /**
     * 记录关系里程碑
     */
    @Transactional
    public CharacterRelationshipMilestoneEntity recordRelationshipMilestone(
            Long characterId,
            Long userId,
            String milestoneType,
            String fromStage,
            String toStage,
            String title,
            String description) {
        
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("milestoneType", milestoneType);
            metadata.put("timestamp", LocalDateTime.now().toString());
            
            String metadataJson = objectMapper.writeValueAsString(metadata);
            
            CharacterRelationshipMilestoneEntity milestone = CharacterRelationshipMilestoneEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .milestoneType(milestoneType)
                    .fromStage(fromStage)
                    .toStage(toStage)
                    .title(title)
                    .description(description)
                    .metadata(metadataJson)
                    .build();
            
            CharacterRelationshipMilestoneEntity saved = milestoneRepository.save(milestone);
            
            log.info("✅ 关系里程碑已记录: characterId={}, userId={}, milestoneType={}, title={}",
                    characterId, userId, milestoneType, title);
            
            return saved;
        } catch (Exception e) {
            log.error("❌ 记录关系里程碑失败: characterId={}, userId={}",
                    characterId, userId, e);
            throw new RuntimeException("记录关系里程碑失败", e);
        }
    }
    
    /**
     * 触发主动关怀
     */
    @Transactional
    public void triggerActiveCare(Long characterId, Long userId, String userEmotionState, String careMessage) {
        try {
            Map<String, Object> memory = companionshipMemoryBuilder.buildCompanionshipCareMemory(
                    "ACTIVE_CARE",
                    careMessage,
                    userEmotionState);
            
            String metadataJson = objectMapper.writeValueAsString(memory);
            
            CharacterGrowthEventEntity event = CharacterGrowthEventEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .eventType("RELATIONSHIP_PROGRESS")
                    .eventCategory("COMPANIONSHIP")
                    .title("主动关怀")
                    .description(careMessage)
                    .metadata(metadataJson)
                    .build();
            
            growthEventRepository.save(event);
            
            log.info("✅ 主动关怀已触发: characterId={}, userId={}, emotionState={}",
                    characterId, userId, userEmotionState);
        } catch (Exception e) {
            log.error("❌ 触发主动关怀失败: characterId={}, userId={}",
                    characterId, userId, e);
        }
    }
    
    /**
     * 记录定期问候
     */
    @Transactional
    public void recordScheduledGreeting(Long characterId, Long userId, String greetingMessage) {
        try {
            Map<String, Object> memory = companionshipMemoryBuilder.buildCompanionshipCareMemory(
                    "SCHEDULED_GREETING",
                    greetingMessage,
                    null);
            
            String metadataJson = objectMapper.writeValueAsString(memory);
            
            CharacterGrowthEventEntity event = CharacterGrowthEventEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .eventType("RELATIONSHIP_PROGRESS")
                    .eventCategory("COMPANIONSHIP")
                    .title("定期问候")
                    .description(greetingMessage)
                    .metadata(metadataJson)
                    .build();
            
            growthEventRepository.save(event);
            
            log.info("✅ 定期问候已记录: characterId={}, userId={}",
                    characterId, userId);
        } catch (Exception e) {
            log.error("❌ 记录定期问候失败: characterId={}, userId={}",
                    characterId, userId, e);
        }
    }
    
    /**
     * 获取关系信息
     */
    public Map<String, Object> getRelationshipInfo(Long characterId, Long userId) {
        List<CharacterRelationshipMilestoneEntity> milestones = 
                milestoneRepository.findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId);
        
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("characterId", characterId);
        info.put("userId", userId);
        info.put("milestones", milestones);
        info.put("milestoneCount", milestones.size());
        
        // 获取最新的阶段转换
        Optional<CharacterRelationshipMilestoneEntity> latestTransition = 
                milestoneRepository.findLatestStageTransition(characterId, userId);
        
        if (latestTransition.isPresent()) {
            info.put("currentStage", latestTransition.get().getToStage());
            info.put("lastTransitionAt", latestTransition.get().getCreatedAt());
        } else {
            info.put("currentStage", "STRANGER");
        }
        
        return info;
    }
}
