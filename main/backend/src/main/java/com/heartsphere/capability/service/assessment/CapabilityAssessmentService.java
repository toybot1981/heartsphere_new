package com.heartsphere.capability.service.assessment;

import com.heartsphere.capability.entity.CapabilityAssessment;
import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.CapabilityAssessmentRepository;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import com.heartsphere.capability.service.integration.RoleCapabilityModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 能力评估服务
 * 提供多维度能力评估功能
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityAssessmentService {
    
    private final CapabilityAssessmentRepository assessmentRepository;
    private final RoleCapabilityProfileRepository profileRepository;
    private final RoleCapabilityModelService capabilityModelService;
    private final RelationshipCapabilityAssessmentService relationshipAssessmentService;
    
    /**
     * 全面能力评估
     * 评估所有维度的能力
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 能力评估结果
     */
    @Transactional
    public FullCapabilityAssessmentDTO assessAllCapabilities(Long characterId, Long userId) {
        log.info("开始全面能力评估: characterId={}, userId={}", characterId, userId);
        
        // 1. 获取能力档案（如果不存在则创建）
        RoleCapabilityProfile profile = capabilityModelService.getOrCreateProfile(characterId);
        
        // 2. 评估关系维度能力（整合导师和挚友能力）
        RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO relationshipAssessment =
            relationshipAssessmentService.assessRelationshipCapability(characterId, userId);
        
        // 3. 构建全面评估结果
        // 注意：技能、记忆、意识、协作维度需要从其他系统获取，这里先使用档案中的值
        FullCapabilityAssessmentDTO assessment = FullCapabilityAssessmentDTO.builder()
            .characterId(characterId)
            .skillScore(profile.getSkillDimensionScore())
            .memoryScore(profile.getMemoryDimensionScore())
            .consciousnessScore(profile.getConsciousnessDimensionScore())
            .collaborationScore(profile.getCollaborationDimensionScore())
            .relationshipScore(relationshipAssessment.getRelationshipScore())
            .mentorshipScore(relationshipAssessment.getMentorshipScore())
            .companionshipScore(relationshipAssessment.getCompanionshipScore())
            .overallScore(calculateOverallScore(profile, relationshipAssessment))
            .relationshipDetails(relationshipAssessment)
            .build();
        
        // 4. 保存评估记录
        saveFullAssessment(characterId, assessment);
        
        // 5. 更新能力档案
        updateProfileFromAssessment(profile, assessment);
        
        log.info("全面能力评估完成: characterId={}, overallScore={}", 
            characterId, assessment.getOverallScore());
        
        return assessment;
    }
    
    /**
     * 计算综合得分
     */
    private int calculateOverallScore(
            RoleCapabilityProfile profile,
            RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO relationshipAssessment) {
        // 5个维度平均分
        int skillScore = profile.getSkillDimensionScore();
        int memoryScore = profile.getMemoryDimensionScore();
        int consciousnessScore = profile.getConsciousnessDimensionScore();
        int collaborationScore = profile.getCollaborationDimensionScore();
        int relationshipScore = relationshipAssessment.getRelationshipScore();
        
        return (skillScore + memoryScore + consciousnessScore + collaborationScore + relationshipScore) / 5;
    }
    
    /**
     * 保存全面评估记录
     */
    private CapabilityAssessment saveFullAssessment(Long characterId, FullCapabilityAssessmentDTO assessment) {
        Map<String, Object> assessmentResult = new HashMap<>();
        assessmentResult.put("skill", assessment.getSkillScore());
        assessmentResult.put("memory", assessment.getMemoryScore());
        assessmentResult.put("consciousness", assessment.getConsciousnessScore());
        assessmentResult.put("collaboration", assessment.getCollaborationScore());
        assessmentResult.put("relationship", assessment.getRelationshipScore());
        assessmentResult.put("mentorship", assessment.getMentorshipScore());
        assessmentResult.put("companionship", assessment.getCompanionshipScore());
        assessmentResult.put("overall", assessment.getOverallScore());
        
        CapabilityAssessment record = CapabilityAssessment.builder()
            .characterId(characterId)
            .assessmentType("FULL")
            .skillScore(assessment.getSkillScore())
            .memoryScore(assessment.getMemoryScore())
            .consciousnessScore(assessment.getConsciousnessScore())
            .collaborationScore(assessment.getCollaborationScore())
            .relationshipScore(assessment.getRelationshipScore())
            .mentorshipScore(assessment.getMentorshipScore())
            .companionshipScore(assessment.getCompanionshipScore())
            .overallScore(assessment.getOverallScore())
            .assessmentResult(assessmentResult)
            .build();
        
        return assessmentRepository.save(record);
    }
    
    /**
     * 从评估结果更新能力档案
     */
    private void updateProfileFromAssessment(
            RoleCapabilityProfile profile,
            FullCapabilityAssessmentDTO assessment) {
        profile.setSkillDimensionScore(assessment.getSkillScore());
        profile.setMemoryDimensionScore(assessment.getMemoryScore());
        profile.setConsciousnessDimensionScore(assessment.getConsciousnessScore());
        profile.setCollaborationDimensionScore(assessment.getCollaborationScore());
        profile.setRelationshipDimensionScore(assessment.getRelationshipScore());
        profile.setMentorshipCapabilityScore(assessment.getMentorshipScore());
        profile.setCompanionshipCapabilityScore(assessment.getCompanionshipScore());
        profile.setOverallScore(assessment.getOverallScore());
        
        profileRepository.save(profile);
    }
    
    /**
     * 获取最新的全面评估记录
     */
    public Optional<CapabilityAssessment> getLatestFullAssessment(Long characterId) {
        return assessmentRepository.findFirstByCharacterIdOrderByCreatedAtDesc(characterId)
            .filter(a -> "FULL".equals(a.getAssessmentType()));
    }
    
    /**
     * 全面能力评估DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class FullCapabilityAssessmentDTO {
        private Long characterId;
        private Integer skillScore;
        private Integer memoryScore;
        private Integer consciousnessScore;
        private Integer collaborationScore;
        private Integer relationshipScore;
        private Integer mentorshipScore;
        private Integer companionshipScore;
        private Integer overallScore;
        private RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO relationshipDetails;
    }
}
