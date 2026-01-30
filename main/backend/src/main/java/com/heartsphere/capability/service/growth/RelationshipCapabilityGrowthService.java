package com.heartsphere.capability.service.growth;

import com.heartsphere.capability.service.growth.CapabilityExperienceService;
import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 关系能力成长服务
 * 处理关系相关的能力成长逻辑
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RelationshipCapabilityGrowthService {
    
    private final CapabilityExperienceService experienceService;
    
    /**
     * 处理成长事件，转换为能力经验值
     * 
     * @param event 成长事件
     */
    @Transactional
    public void processGrowthEvent(CharacterGrowthEventEntity event) {
        Long characterId = event.getCharacterId();
        String eventType = event.getEventType();
        String eventCategory = event.getEventCategory();
        
        log.info("处理成长事件: characterId={}, eventType={}, category={}", 
            characterId, eventType, eventCategory);
        
        switch (eventType) {
            case "LEARNING":
                // 学习事件 → 技能经验 + 记忆经验
                experienceService.addSkillExperience(characterId, 10);
                experienceService.addMemoryExperience(characterId, 10);
                break;
                
            case "REFLECTION":
                // 反思事件 → 意识经验
                experienceService.addConsciousnessExperience(characterId, 15);
                break;
                
            case "ABILITY_UPGRADE":
                // 能力提升 → 根据分类决定经验类型
                processAbilityUpgrade(characterId, eventCategory);
                break;
                
            case "RELATIONSHIP_PROGRESS":
                // 关系进展 → 关系经验
                processRelationshipProgress(characterId, eventCategory);
                break;
                
            default:
                log.warn("未知的成长事件类型: {}", eventType);
        }
    }
    
    /**
     * 处理能力提升事件
     */
    private void processAbilityUpgrade(Long characterId, String category) {
        if (category == null) {
            // 默认增加技能经验
            experienceService.addSkillExperience(characterId, 5);
            return;
        }
        
        switch (category) {
            case "SELF_GROWTH":
                // 自我成长 → 技能经验
                experienceService.addSkillExperience(characterId, 10);
                break;
            case "COMPANIONSHIP":
                // 挚友能力 → 挚友经验
                experienceService.addCompanionshipExperience(characterId, 15);
                experienceService.addRelationshipExperience(characterId, 10);
                break;
            case "MENTORSHIP":
                // 导师能力 → 导师经验
                experienceService.addMentorshipExperience(characterId, 15);
                experienceService.addRelationshipExperience(characterId, 10);
                break;
            default:
                experienceService.addSkillExperience(characterId, 5);
        }
    }
    
    /**
     * 处理关系进展事件
     */
    private void processRelationshipProgress(Long characterId, String category) {
        if (category == null) {
            // 默认增加关系经验
            experienceService.addRelationshipExperience(characterId, 20);
            return;
        }
        
        switch (category) {
            case "COMPANIONSHIP":
                // 挚友关系进展 → 挚友经验 + 关系经验
                experienceService.addCompanionshipExperience(characterId, 20);
                experienceService.addRelationshipExperience(characterId, 15);
                break;
            case "MENTORSHIP":
                // 导师关系进展 → 导师经验 + 关系经验
                experienceService.addMentorshipExperience(characterId, 20);
                experienceService.addRelationshipExperience(characterId, 15);
                break;
            default:
                // 通用关系进展
                experienceService.addRelationshipExperience(characterId, 20);
        }
    }
    
    /**
     * 根据关系阶段调整能力成长速度
     * 
     * @param characterId 角色ID
     * @param relationshipStage 关系阶段
     * @param baseExperience 基础经验值
     * @return 调整后的经验值
     */
    public long adjustExperienceByRelationshipStage(Long characterId, String relationshipStage, long baseExperience) {
        double multiplier = getRelationshipStageMultiplier(relationshipStage);
        long adjustedExperience = (long) (baseExperience * multiplier);
        
        log.info("根据关系阶段调整经验: characterId={}, stage={}, base={}, adjusted={}", 
            characterId, relationshipStage, baseExperience, adjustedExperience);
        
        return adjustedExperience;
    }
    
    /**
     * 获取关系阶段的经验值倍数
     */
    private double getRelationshipStageMultiplier(String stage) {
        if (stage == null) {
            return 1.0;
        }
        
        return switch (stage) {
            case "STRANGER" -> 1.0;
            case "FRIEND" -> 1.1;
            case "CLOSE_FRIEND" -> 1.2;  // 情感能力成长速度 +20%
            case "MENTOR" -> 1.2;        // 指导能力成长速度 +20%
            default -> 1.0;
        };
    }
}
