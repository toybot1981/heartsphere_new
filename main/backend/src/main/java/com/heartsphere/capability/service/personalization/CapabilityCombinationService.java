package com.heartsphere.capability.service.personalization;

import com.heartsphere.capability.service.growth.CapabilityLevelService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 能力组合服务
 * 为不同场景和任务推荐最优能力组合
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityCombinationService {
    
    private final CapabilityLevelService levelService;
    private final CharacterCompanionshipService companionshipService;
    
    /**
     * 推荐能力组合
     * 基于关系阶段和场景推荐最优能力组合
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param scenario 场景类型: GUIDANCE/EMOTIONAL_SUPPORT/GENERAL
     * @return 推荐的能力组合
     */
    public CapabilityCombinationDTO recommendCombination(
            Long characterId, Long userId, String scenario) {
        log.info("推荐能力组合: characterId={}, userId={}, scenario={}", 
            characterId, userId, scenario);
        
        try {
            // 获取关系阶段
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            String relationshipStage = (String) relationshipInfo.getOrDefault("currentStage", "STRANGER");
            
            // 获取能力等级
            int skillLevel = levelService.calculateSkillLevel(characterId);
            int memoryLevel = levelService.calculateMemoryLevel(characterId);
            int consciousnessLevel = levelService.calculateConsciousnessLevel(characterId);
            int relationshipLevel = levelService.calculateRelationshipLevel(characterId);
            int mentorshipLevel = levelService.calculateMentorshipLevel(characterId);
            int companionshipLevel = levelService.calculateCompanionshipLevel(characterId);
            
            // 根据场景和关系阶段推荐组合
            CapabilityCombinationDTO combination = buildCombination(
                scenario, relationshipStage,
                skillLevel, memoryLevel, consciousnessLevel, relationshipLevel,
                mentorshipLevel, companionshipLevel);
            
            return combination;
        } catch (Exception e) {
            log.error("推荐能力组合失败: characterId={}, userId={}", characterId, userId, e);
            // 返回默认组合
            return buildDefaultCombination(scenario);
        }
    }
    
    /**
     * 构建能力组合
     */
    private CapabilityCombinationDTO buildCombination(
            String scenario,
            String relationshipStage,
            int skillLevel,
            int memoryLevel,
            int consciousnessLevel,
            int relationshipLevel,
            int mentorshipLevel,
            int companionshipLevel) {
        
        List<String> recommendedDimensions = new ArrayList<>();
        List<String> recommendedSkills = new ArrayList<>();
        String mode = "NEUTRAL";
        String description = "";
        
        if ("MENTOR".equals(relationshipStage) && ("GUIDANCE".equals(scenario) || scenario == null)) {
            // 导师模式推荐：指导技能 + 导师能力 + 记忆管理
            mode = "MENTOR";
            recommendedDimensions.add("SKILL");
            recommendedDimensions.add("RELATIONSHIP");
            recommendedDimensions.add("MEMORY");
            recommendedSkills.add("指导技能");
            recommendedSkills.add("教育技能");
            recommendedSkills.add("知识管理");
            description = "导师模式：优先使用指导和教育相关能力，结合记忆管理提供个性化指导";
            
        } else if ("CLOSE_FRIEND".equals(relationshipStage) && ("EMOTIONAL_SUPPORT".equals(scenario) || scenario == null)) {
            // 挚友模式推荐：情感技能 + 挚友能力 + 意识理解
            mode = "COMPANION";
            recommendedDimensions.add("CONSCIOUSNESS");
            recommendedDimensions.add("RELATIONSHIP");
            recommendedDimensions.add("MEMORY");
            recommendedSkills.add("情感支持技能");
            recommendedSkills.add("陪伴技能");
            recommendedSkills.add("情感理解");
            description = "挚友模式：优先使用情感和陪伴相关能力，结合意识理解提供情感支持";
            
        } else {
            // 默认组合：平衡发展
            mode = "NEUTRAL";
            recommendedDimensions.add("SKILL");
            recommendedDimensions.add("MEMORY");
            recommendedDimensions.add("CONSCIOUSNESS");
            recommendedSkills.add("通用技能");
            description = "平衡模式：均衡使用各维度能力";
        }
        
        // 计算组合效果评分
        double combinationScore = calculateCombinationScore(
            recommendedDimensions, skillLevel, memoryLevel, consciousnessLevel,
            relationshipLevel, mentorshipLevel, companionshipLevel);
        
        return CapabilityCombinationDTO.builder()
            .mode(mode)
            .scenario(scenario != null ? scenario : "GENERAL")
            .relationshipStage(relationshipStage)
            .recommendedDimensions(recommendedDimensions)
            .recommendedSkills(recommendedSkills)
            .combinationScore(combinationScore)
            .description(description)
            .build();
    }
    
    /**
     * 计算组合效果评分
     */
    private double calculateCombinationScore(
            List<String> dimensions,
            int skillLevel,
            int memoryLevel,
            int consciousnessLevel,
            int relationshipLevel,
            int mentorshipLevel,
            int companionshipLevel) {
        
        double totalScore = 0.0;
        int count = 0;
        
        for (String dimension : dimensions) {
            switch (dimension) {
                case "SKILL":
                    totalScore += skillLevel;
                    count++;
                    break;
                case "MEMORY":
                    totalScore += memoryLevel;
                    count++;
                    break;
                case "CONSCIOUSNESS":
                    totalScore += consciousnessLevel;
                    count++;
                    break;
                case "RELATIONSHIP":
                    totalScore += relationshipLevel;
                    if (mentorshipLevel > 0) totalScore += mentorshipLevel * 0.5;
                    if (companionshipLevel > 0) totalScore += companionshipLevel * 0.5;
                    count++;
                    break;
            }
        }
        
        return count > 0 ? totalScore / count : 0.0;
    }
    
    /**
     * 构建默认组合
     */
    private CapabilityCombinationDTO buildDefaultCombination(String scenario) {
        return CapabilityCombinationDTO.builder()
            .mode("NEUTRAL")
            .scenario(scenario != null ? scenario : "GENERAL")
            .relationshipStage("STRANGER")
            .recommendedDimensions(Arrays.asList("SKILL", "MEMORY"))
            .recommendedSkills(Arrays.asList("通用技能"))
            .combinationScore(0.0)
            .description("默认组合：均衡使用各维度能力")
            .build();
    }
    
    /**
     * 评估能力组合效果
     * 
     * @param characterId 角色ID
     * @param combination 能力组合
     * @return 组合效果评估
     */
    public CombinationEffectDTO evaluateCombinationEffect(
            Long characterId, CapabilityCombinationDTO combination) {
        log.info("评估能力组合效果: characterId={}, mode={}", 
            characterId, combination.getMode());
        
        // 基于组合评分和维度匹配度评估效果
        double effectiveness = combination.getCombinationScore() / 10.0; // 归一化到0-1
        if (effectiveness > 1.0) effectiveness = 1.0;
        
        String effectivenessLevel = effectiveness >= 0.8 ? "HIGH" :
                                   effectiveness >= 0.6 ? "MEDIUM" : "LOW";
        
        return CombinationEffectDTO.builder()
            .characterId(characterId)
            .combination(combination)
            .effectiveness(effectiveness)
            .effectivenessLevel(effectivenessLevel)
            .recommendation(effectiveness >= 0.7 ? "推荐使用" : "建议优化")
            .build();
    }
    
    /**
     * 能力组合DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class CapabilityCombinationDTO {
        private String mode; // MENTOR, COMPANION, NEUTRAL
        private String scenario;
        private String relationshipStage;
        private List<String> recommendedDimensions;
        private List<String> recommendedSkills;
        private Double combinationScore;
        private String description;
    }
    
    /**
     * 组合效果评估DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class CombinationEffectDTO {
        private Long characterId;
        private CapabilityCombinationDTO combination;
        private Double effectiveness; // 0-1
        private String effectivenessLevel; // HIGH, MEDIUM, LOW
        private String recommendation;
    }
}
