package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import com.heartsphere.memory.service.CharacterMentorshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * 关系能力整合服务
 * 整合现有的导师能力和挚友能力到能力体系的关系维度
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RelationshipCapabilityIntegrationService {
    
    private final CharacterMentorshipService mentorshipService;
    private final CharacterCompanionshipService companionshipService;
    private final RoleCapabilityProfileRepository profileRepository;
    
    /**
     * 整合关系维度能力
     * 从现有的导师和挚友服务获取评估结果，整合到能力体系
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 关系维度能力得分
     */
    @Transactional
    public RelationshipCapabilityDTO integrateRelationshipCapability(Long characterId, Long userId) {
        log.info("整合关系维度能力: characterId={}, userId={}", characterId, userId);
        
        // 1. 获取导师能力评估结果
        Map<String, Object> mentorshipAssessment = mentorshipService.evaluateMentorshipCapabilities(characterId);
        int mentorshipScore = extractScore(mentorshipAssessment, "totalScore");
        
        // 2. 获取挚友能力评估结果
        Map<String, Object> companionshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
        int companionshipScore = extractCompanionshipScore(companionshipInfo);
        
        // 3. 计算关系维度总得分
        int relationshipScore = (mentorshipScore + companionshipScore) / 2;
        
        // 4. 更新或创建能力档案
        updateCapabilityProfile(characterId, mentorshipScore, companionshipScore, relationshipScore);
        
        return RelationshipCapabilityDTO.builder()
            .characterId(characterId)
            .mentorshipScore(mentorshipScore)
            .companionshipScore(companionshipScore)
            .relationshipScore(relationshipScore)
            .mentorshipDetails(mentorshipAssessment)
            .companionshipDetails(companionshipInfo)
            .build();
    }
    
    /**
     * 更新能力档案中的关系维度得分
     */
    private void updateCapabilityProfile(Long characterId, int mentorshipScore, 
                                       int companionshipScore, int relationshipScore) {
        Optional<RoleCapabilityProfile> profileOpt = profileRepository.findByCharacterId(characterId);
        
        RoleCapabilityProfile profile = profileOpt.orElseGet(() -> {
            RoleCapabilityProfile newProfile = RoleCapabilityProfile.builder()
                .characterId(characterId)
                .build();
            return profileRepository.save(newProfile);
        });
        
        profile.setMentorshipCapabilityScore(mentorshipScore);
        profile.setCompanionshipCapabilityScore(companionshipScore);
        profile.setRelationshipDimensionScore(relationshipScore);
        
        // 重新计算综合得分
        recalculateOverallScore(profile);
        
        profileRepository.save(profile);
        log.info("更新能力档案: characterId={}, relationshipScore={}", characterId, relationshipScore);
    }
    
    /**
     * 重新计算综合得分
     */
    private void recalculateOverallScore(RoleCapabilityProfile profile) {
        int overallScore = (profile.getSkillDimensionScore() 
                + profile.getMemoryDimensionScore()
                + profile.getConsciousnessDimensionScore()
                + profile.getCollaborationDimensionScore()
                + profile.getRelationshipDimensionScore()) / 5;
        profile.setOverallScore(overallScore);
    }
    
    /**
     * 从评估结果中提取得分
     */
    private int extractScore(Map<String, Object> assessment, String key) {
        if (assessment == null || !assessment.containsKey(key)) {
            return 0;
        }
        Object score = assessment.get(key);
        if (score instanceof Number) {
            return ((Number) score).intValue();
        }
        return 0;
    }
    
    /**
     * 从关系信息中提取挚友能力得分
     */
    private int extractCompanionshipScore(Map<String, Object> companionshipInfo) {
        if (companionshipInfo == null) {
            return 0;
        }
        
        // 尝试从不同字段提取得分
        if (companionshipInfo.containsKey("emotionalConnectionScore")) {
            return extractScore(companionshipInfo, "emotionalConnectionScore");
        }
        if (companionshipInfo.containsKey("relationshipDepth")) {
            Object depth = companionshipInfo.get("relationshipDepth");
            if (depth instanceof Number) {
                // 将关系深度（0-1）转换为得分（0-100）
                return (int) (((Number) depth).doubleValue() * 100);
            }
        }
        
        // 默认基于关系阶段计算得分
        String stage = (String) companionshipInfo.getOrDefault("relationshipStage", "STRANGER");
        return calculateScoreByStage(stage);
    }
    
    /**
     * 根据关系阶段计算得分
     */
    private int calculateScoreByStage(String stage) {
        return switch (stage) {
            case "STRANGER" -> 20;
            case "FRIEND" -> 50;
            case "CLOSE_FRIEND" -> 75;
            case "MENTOR" -> 90;
            default -> 0;
        };
    }
    
    /**
     * 关系能力DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class RelationshipCapabilityDTO {
        private Long characterId;
        private Integer mentorshipScore;
        private Integer companionshipScore;
        private Integer relationshipScore;
        private Map<String, Object> mentorshipDetails;
        private Map<String, Object> companionshipDetails;
    }
}
