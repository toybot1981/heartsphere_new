package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.entity.CapabilitySynergyLog;
import com.heartsphere.capability.repository.CapabilitySynergyLogRepository;
import com.heartsphere.capability.service.growth.CapabilityExperienceService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * 能力协同引擎
 * 实现能力之间的协同机制
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilitySynergyEngine {
    
    private final CapabilitySynergyLogRepository synergyLogRepository;
    private final CapabilityExperienceService experienceService;
    private final CharacterCompanionshipService companionshipService;
    
    /**
     * 处理技能-记忆协同
     * 技能执行时，更新相关记忆经验值
     * 
     * @param characterId 角色ID
     * @param skillId 技能ID
     * @param success 是否成功
     */
    @Transactional
    public void processSkillMemorySynergy(Long characterId, Long skillId, boolean success) {
        log.info("处理技能-记忆协同: characterId={}, skillId={}, success={}", 
            characterId, skillId, success);
        
        if (success) {
            // 技能执行成功 → 增加技能经验和记忆经验
            experienceService.addSkillExperience(characterId, 5);
            experienceService.addMemoryExperience(characterId, 3);
            
            // 记录协同效果
            recordSynergy(characterId, "SKILL_MEMORY", "SKILL", "MEMORY", 0.7);
        }
    }
    
    /**
     * 处理关系-技能协同
     * 根据关系阶段和模式，调整技能使用策略
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param skillId 技能ID
     * @param skillType 技能类型
     */
    @Transactional
    public void processRelationshipSkillSynergy(
            Long characterId, Long userId, Long skillId, String skillType) {
        log.info("处理关系-技能协同: characterId={}, userId={}, skillId={}, type={}", 
            characterId, userId, skillId, skillType);
        
        try {
            // 获取关系信息
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            String relationshipStage = (String) relationshipInfo.getOrDefault("currentStage", "STRANGER");
            
            // 根据关系阶段和技能类型调整经验值
            if ("MENTOR".equals(relationshipStage) && isGuidanceSkill(skillType)) {
                // 导师模式 + 指导技能 → 增加导师经验和关系经验
                experienceService.addMentorshipExperience(characterId, 10);
                experienceService.addRelationshipExperience(characterId, 5);
                recordSynergy(characterId, "RELATIONSHIP_SKILL", "RELATIONSHIP", "SKILL", 0.8);
            } else if ("CLOSE_FRIEND".equals(relationshipStage) && isEmotionalSkill(skillType)) {
                // 挚友模式 + 情感技能 → 增加挚友经验和关系经验
                experienceService.addCompanionshipExperience(characterId, 10);
                experienceService.addRelationshipExperience(characterId, 5);
                recordSynergy(characterId, "RELATIONSHIP_SKILL", "RELATIONSHIP", "SKILL", 0.8);
            }
        } catch (Exception e) {
            log.warn("处理关系-技能协同失败: characterId={}", characterId, e);
        }
    }
    
    /**
     * 处理关系-记忆协同
     * 关系记忆影响能力使用策略
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     */
    @Transactional
    public void processRelationshipMemorySynergy(Long characterId, Long userId) {
        log.info("处理关系-记忆协同: characterId={}, userId={}", characterId, userId);
        
        try {
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            String relationshipStage = (String) relationshipInfo.getOrDefault("currentStage", "STRANGER");
            
            // 关系阶段影响记忆经验值
            if ("CLOSE_FRIEND".equals(relationshipStage) || "MENTOR".equals(relationshipStage)) {
                // 深度关系 → 记忆经验值增加
                experienceService.addMemoryExperience(characterId, 2);
                experienceService.addRelationshipExperience(characterId, 2);
                recordSynergy(characterId, "RELATIONSHIP_MEMORY", "RELATIONSHIP", "MEMORY", 0.6);
            }
        } catch (Exception e) {
            log.warn("处理关系-记忆协同失败: characterId={}", characterId, e);
        }
    }
    
    /**
     * 处理关系-意识协同
     * 关系阶段影响意识状态
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     */
    @Transactional
    public void processRelationshipConsciousnessSynergy(Long characterId, Long userId) {
        log.info("处理关系-意识协同: characterId={}, userId={}", characterId, userId);
        
        try {
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            String relationshipStage = (String) relationshipInfo.getOrDefault("currentStage", "STRANGER");
            
            // 深度关系 → 意识经验值增加
            if ("CLOSE_FRIEND".equals(relationshipStage) || "MENTOR".equals(relationshipStage)) {
                experienceService.addConsciousnessExperience(characterId, 3);
                experienceService.addRelationshipExperience(characterId, 2);
                recordSynergy(characterId, "RELATIONSHIP_CONSCIOUSNESS", "RELATIONSHIP", "CONSCIOUSNESS", 0.7);
            }
        } catch (Exception e) {
            log.warn("处理关系-意识协同失败: characterId={}", characterId, e);
        }
    }
    
    /**
     * 记录协同效果
     */
    private void recordSynergy(
            Long characterId,
            String synergyType,
            String sourceDimension,
            String targetDimension,
            double synergyEffect) {
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("synergyType", synergyType);
        metadata.put("timestamp", System.currentTimeMillis());
        
        CapabilitySynergyLog log = CapabilitySynergyLog.builder()
            .characterId(characterId)
            .synergyType(synergyType)
            .sourceDimension(sourceDimension)
            .targetDimension(targetDimension)
            .synergyEffect(java.math.BigDecimal.valueOf(synergyEffect))
            .metadata(metadata)
            .build();
        
        synergyLogRepository.save(log);
    }
    
    /**
     * 判断是否为指导技能
     */
    private boolean isGuidanceSkill(String skillType) {
        if (skillType == null) {
            return false;
        }
        String lowerType = skillType.toLowerCase();
        return lowerType.contains("guidance") || 
               lowerType.contains("mentor") || 
               lowerType.contains("teach") ||
               lowerType.contains("educate");
    }
    
    /**
     * 判断是否为情感技能
     */
    private boolean isEmotionalSkill(String skillType) {
        if (skillType == null) {
            return false;
        }
        String lowerType = skillType.toLowerCase();
        return lowerType.contains("emotional") || 
               lowerType.contains("companion") || 
               lowerType.contains("support") ||
               lowerType.contains("care");
    }
}
