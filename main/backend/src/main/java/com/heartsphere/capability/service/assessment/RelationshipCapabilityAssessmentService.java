package com.heartsphere.capability.service.assessment;

import com.heartsphere.capability.entity.CapabilityAssessment;
import com.heartsphere.capability.repository.CapabilityAssessmentRepository;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import com.heartsphere.memory.service.CharacterMentorshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 关系能力评估服务
 * 整合导师和挚友能力评估到能力体系
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RelationshipCapabilityAssessmentService {
    
    private final CharacterMentorshipService mentorshipService;
    private final CharacterCompanionshipService companionshipService;
    private final CapabilityAssessmentRepository assessmentRepository;
    
    /**
     * 评估关系维度能力
     * 整合导师和挚友能力评估结果
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 关系能力评估结果
     */
    @Transactional
    public RelationshipCapabilityAssessmentDTO assessRelationshipCapability(Long characterId, Long userId) {
        log.info("评估关系维度能力: characterId={}, userId={}", characterId, userId);
        
        // 1. 获取导师能力评估结果
        Map<String, Object> mentorshipAssessment = mentorshipService.evaluateMentorshipCapabilities(characterId);
        int mentorshipScore = extractScore(mentorshipAssessment, "totalScore");
        
        // 2. 获取挚友能力评估结果
        Map<String, Object> companionshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
        int companionshipScore = extractCompanionshipScore(companionshipInfo);
        
        // 3. 计算关系维度总得分
        int relationshipScore = (mentorshipScore + companionshipScore) / 2;
        
        // 4. 保存评估记录
        CapabilityAssessment assessment = saveAssessment(
            characterId, mentorshipScore, companionshipScore, relationshipScore,
            mentorshipAssessment, companionshipInfo);
        
        return RelationshipCapabilityAssessmentDTO.builder()
            .characterId(characterId)
            .mentorshipScore(mentorshipScore)
            .companionshipScore(companionshipScore)
            .relationshipScore(relationshipScore)
            .mentorshipDetails(mentorshipAssessment)
            .companionshipDetails(companionshipInfo)
            .assessmentId(assessment.getId())
            .build();
    }
    
    /**
     * 保存评估记录
     */
    private CapabilityAssessment saveAssessment(
            Long characterId,
            int mentorshipScore,
            int companionshipScore,
            int relationshipScore,
            Map<String, Object> mentorshipDetails,
            Map<String, Object> companionshipDetails) {
        
        Map<String, Object> assessmentResult = new HashMap<>();
        assessmentResult.put("mentorship", mentorshipDetails);
        assessmentResult.put("companionship", companionshipDetails);
        assessmentResult.put("relationshipScore", relationshipScore);
        
        CapabilityAssessment assessment = CapabilityAssessment.builder()
            .characterId(characterId)
            .assessmentType("RELATIONSHIP")
            .relationshipScore(relationshipScore)
            .mentorshipScore(mentorshipScore)
            .companionshipScore(companionshipScore)
            .overallScore(relationshipScore) // 关系维度评估的综合得分就是关系得分
            .assessmentResult(assessmentResult)
            .build();
        
        return assessmentRepository.save(assessment);
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
     * 获取最新的关系能力评估记录
     */
    public Optional<CapabilityAssessment> getLatestAssessment(Long characterId) {
        return assessmentRepository.findFirstByCharacterIdOrderByCreatedAtDesc(characterId);
    }
    
    /**
     * 关系能力评估DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class RelationshipCapabilityAssessmentDTO {
        private Long characterId;
        private Integer mentorshipScore;
        private Integer companionshipScore;
        private Integer relationshipScore;
        private Map<String, Object> mentorshipDetails;
        private Map<String, Object> companionshipDetails;
        private Long assessmentId;
    }
}
