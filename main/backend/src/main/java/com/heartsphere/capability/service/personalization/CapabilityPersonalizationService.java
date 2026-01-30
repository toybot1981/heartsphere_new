package com.heartsphere.capability.service.personalization;

import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import com.heartsphere.capability.service.growth.CapabilityExperienceService;
import com.heartsphere.capability.service.growth.CapabilityLevelService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 能力个性化服务
 * 基于关系定位和用户交互实现能力个性化
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityPersonalizationService {
    
    private final RoleCapabilityProfileRepository profileRepository;
    private final CapabilityExperienceService experienceService;
    private final CapabilityLevelService levelService;
    private final CharacterCompanionshipService companionshipService;
    
    /**
     * 基于关系定位的能力个性化
     * 根据角色的关系阶段调整能力发展优先级
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 个性化配置
     */
    @Transactional
    public PersonalizationConfigDTO personalizeByRelationship(Long characterId, Long userId) {
        log.info("基于关系定位的能力个性化: characterId={}, userId={}", characterId, userId);
        
        try {
            // 获取关系信息
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            String relationshipStage = (String) relationshipInfo.getOrDefault("currentStage", "STRANGER");
            
            // 根据关系阶段确定能力发展优先级
            Map<String, Double> dimensionWeights = calculateDimensionWeights(relationshipStage);
            
            // 应用个性化配置
            applyPersonalization(characterId, dimensionWeights);
            
            return PersonalizationConfigDTO.builder()
                .characterId(characterId)
                .relationshipStage(relationshipStage)
                .dimensionWeights(dimensionWeights)
                .personalizationType("RELATIONSHIP_BASED")
                .build();
        } catch (Exception e) {
            log.error("能力个性化失败: characterId={}, userId={}", characterId, userId, e);
            throw new RuntimeException("能力个性化失败", e);
        }
    }
    
    /**
     * 根据关系阶段计算维度权重
     */
    private Map<String, Double> calculateDimensionWeights(String relationshipStage) {
        Map<String, Double> weights = new HashMap<>();
        
        switch (relationshipStage) {
            case "MENTOR":
                // 导师角色 → 优先发展指导、教育相关能力（技能维度+关系维度）
                weights.put("SKILL", 1.3);      // 技能维度权重提升30%
                weights.put("RELATIONSHIP", 1.4); // 关系维度权重提升40%
                weights.put("MEMORY", 1.1);     // 记忆维度权重提升10%
                weights.put("CONSCIOUSNESS", 1.0);
                weights.put("COLLABORATION", 1.0);
                break;
                
            case "CLOSE_FRIEND":
                // 挚友角色 → 优先发展情感、陪伴相关能力（意识维度+关系维度）
                weights.put("CONSCIOUSNESS", 1.3);  // 意识维度权重提升30%
                weights.put("RELATIONSHIP", 1.4);   // 关系维度权重提升40%
                weights.put("MEMORY", 1.1);        // 记忆维度权重提升10%
                weights.put("SKILL", 1.0);
                weights.put("COLLABORATION", 1.0);
                break;
                
            case "FRIEND":
                // 朋友阶段 → 平衡发展
                weights.put("SKILL", 1.1);
                weights.put("MEMORY", 1.1);
                weights.put("CONSCIOUSNESS", 1.1);
                weights.put("RELATIONSHIP", 1.2);
                weights.put("COLLABORATION", 1.0);
                break;
                
            default: // STRANGER
                // 陌生人阶段 → 默认权重
                weights.put("SKILL", 1.0);
                weights.put("MEMORY", 1.0);
                weights.put("CONSCIOUSNESS", 1.0);
                weights.put("RELATIONSHIP", 1.0);
                weights.put("COLLABORATION", 1.0);
        }
        
        return weights;
    }
    
    /**
     * 应用个性化配置
     * 调整能力经验值增长速率
     */
    private void applyPersonalization(Long characterId, Map<String, Double> dimensionWeights) {
        // 个性化配置可以存储在能力档案中
        // 这里简化处理，实际应该存储到数据库
        log.info("应用个性化配置: characterId={}, weights={}", characterId, dimensionWeights);
    }
    
    /**
     * 获取能力发展建议
     * 基于当前能力状态和关系阶段提供发展建议
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 发展建议列表
     */
    public List<DevelopmentSuggestion> getDevelopmentSuggestions(Long characterId, Long userId) {
        log.info("获取能力发展建议: characterId={}, userId={}", characterId, userId);
        
        List<DevelopmentSuggestion> suggestions = new ArrayList<>();
        
        try {
            // 获取关系阶段
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            String relationshipStage = (String) relationshipInfo.getOrDefault("currentStage", "STRANGER");
            
            // 获取能力等级
            int mentorshipLevel = levelService.calculateMentorshipLevel(characterId);
            int companionshipLevel = levelService.calculateCompanionshipLevel(characterId);
            int relationshipLevel = levelService.calculateRelationshipLevel(characterId);
            
            // 根据关系阶段和能力等级生成建议
            if ("MENTOR".equals(relationshipStage)) {
                if (mentorshipLevel < 5) {
                    suggestions.add(DevelopmentSuggestion.builder()
                        .dimension("RELATIONSHIP")
                        .subDimension("MENTORSHIP")
                        .priority("HIGH")
                        .title("提升导师能力等级")
                        .description("当前导师能力等级较低，建议增加知识资产和指导会话")
                        .suggestedActions(Arrays.asList(
                            "增加知识资产积累",
                            "提升指导会话质量",
                            "学习教育技巧"
                        ))
                        .build());
                }
            } else if ("CLOSE_FRIEND".equals(relationshipStage)) {
                if (companionshipLevel < 5) {
                    suggestions.add(DevelopmentSuggestion.builder()
                        .dimension("RELATIONSHIP")
                        .subDimension("COMPANIONSHIP")
                        .priority("HIGH")
                        .title("提升挚友能力等级")
                        .description("当前挚友能力等级较低，建议加强情感连接和陪伴支持")
                        .suggestedActions(Arrays.asList(
                            "增加情感共鸣时刻",
                            "提升陪伴支持能力",
                            "加强记忆共鸣"
                        ))
                        .build());
                }
            }
            
            // 如果关系等级较低，建议提升关系能力
            if (relationshipLevel < 3) {
                suggestions.add(DevelopmentSuggestion.builder()
                    .dimension("RELATIONSHIP")
                    .priority("MEDIUM")
                    .title("提升关系能力")
                    .description("当前关系能力等级较低，建议加强关系发展")
                    .suggestedActions(Arrays.asList(
                        "增加交互频率",
                        "提升情感连接",
                        "创造共同经历"
                    ))
                    .build());
            }
            
        } catch (Exception e) {
            log.error("获取能力发展建议失败: characterId={}, userId={}", characterId, userId, e);
        }
        
        return suggestions;
    }
    
    /**
     * 个性化配置DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class PersonalizationConfigDTO {
        private Long characterId;
        private String relationshipStage;
        private Map<String, Double> dimensionWeights;
        private String personalizationType;
    }
    
    /**
     * 发展建议DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class DevelopmentSuggestion {
        private String dimension;
        private String subDimension;
        private String priority; // HIGH, MEDIUM, LOW
        private String title;
        private String description;
        private List<String> suggestedActions;
    }
}
