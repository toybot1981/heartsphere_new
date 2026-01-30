package com.heartsphere.capability.service.assessment;

import com.heartsphere.capability.entity.CapabilityAssessment;
import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.CapabilityAssessmentRepository;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 能力优化服务
 * 基于评估结果生成优化建议
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityOptimizationService {
    
    private final CapabilityAssessmentRepository assessmentRepository;
    private final RoleCapabilityProfileRepository profileRepository;
    
    /**
     * 生成能力优化建议
     * 
     * @param characterId 角色ID
     * @return 优化建议列表
     */
    public List<OptimizationSuggestion> generateOptimizationSuggestions(Long characterId) {
        log.info("生成能力优化建议: characterId={}", characterId);
        
        Optional<CapabilityAssessment> latestAssessmentOpt = 
            assessmentRepository.findFirstByCharacterIdOrderByCreatedAtDesc(characterId);
        
        if (latestAssessmentOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        CapabilityAssessment assessment = latestAssessmentOpt.get();
        List<OptimizationSuggestion> suggestions = new ArrayList<>();
        
        // 1. 识别能力瓶颈（得分低于平均值的维度）
        int overallScore = assessment.getOverallScore();
        identifyBottlenecks(assessment, overallScore, suggestions);
        
        // 2. 识别优势能力（得分高于平均值的维度）
        identifyStrengths(assessment, overallScore, suggestions);
        
        // 3. 关系维度优化建议
        generateRelationshipOptimizationSuggestions(assessment, suggestions);
        
        log.info("生成优化建议完成: characterId={}, suggestions={}", 
            characterId, suggestions.size());
        
        return suggestions;
    }
    
    /**
     * 识别能力瓶颈
     */
    private void identifyBottlenecks(
            CapabilityAssessment assessment,
            int overallScore,
            List<OptimizationSuggestion> suggestions) {
        
        if (assessment.getSkillScore() < overallScore - 10) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("SKILL")
                .type("BOTTLENECK")
                .priority("HIGH")
                .title("技能维度需要提升")
                .description("技能维度得分低于平均水平，建议增加技能使用频率和成功率")
                .suggestedActions(Arrays.asList(
                    "增加技能使用频率",
                    "提升技能执行成功率",
                    "学习新技能"
                ))
                .build());
        }
        
        if (assessment.getMemoryScore() < overallScore - 10) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("MEMORY")
                .type("BOTTLENECK")
                .priority("HIGH")
                .title("记忆维度需要提升")
                .description("记忆维度得分低于平均水平，建议提升记忆质量和检索精度")
                .suggestedActions(Arrays.asList(
                    "提升记忆质量",
                    "改善记忆检索精度",
                    "增强记忆关联度"
                ))
                .build());
        }
        
        if (assessment.getRelationshipScore() < overallScore - 10) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("RELATIONSHIP")
                .type("BOTTLENECK")
                .priority("HIGH")
                .title("关系维度需要提升")
                .description("关系维度得分低于平均水平，建议加强情感连接和关系发展")
                .suggestedActions(Arrays.asList(
                    "增加情感共鸣时刻",
                    "提升陪伴支持能力",
                    "发展导师或挚友能力"
                ))
                .build());
        }
    }
    
    /**
     * 识别优势能力
     */
    private void identifyStrengths(
            CapabilityAssessment assessment,
            int overallScore,
            List<OptimizationSuggestion> suggestions) {
        
        if (assessment.getSkillScore() > overallScore + 10) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("SKILL")
                .type("STRENGTH")
                .priority("LOW")
                .title("技能维度是优势")
                .description("技能维度得分高于平均水平，可以继续发挥优势")
                .suggestedActions(Arrays.asList(
                    "保持技能使用频率",
                    "探索新技能应用场景",
                    "将技能优势应用到其他维度"
                ))
                .build());
        }
        
        if (assessment.getRelationshipScore() > overallScore + 10) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("RELATIONSHIP")
                .type("STRENGTH")
                .priority("LOW")
                .title("关系维度是优势")
                .description("关系维度得分高于平均水平，可以继续深化关系")
                .suggestedActions(Arrays.asList(
                    "继续深化情感连接",
                    "提升导师或挚友能力",
                    "将关系优势应用到其他维度"
                ))
                .build());
        }
    }
    
    /**
     * 生成关系维度优化建议
     */
    private void generateRelationshipOptimizationSuggestions(
            CapabilityAssessment assessment,
            List<OptimizationSuggestion> suggestions) {
        
        int mentorshipScore = assessment.getMentorshipScore();
        int companionshipScore = assessment.getCompanionshipScore();
        
        // 导师能力优化建议
        if (mentorshipScore < 50) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("RELATIONSHIP")
                .subDimension("MENTORSHIP")
                .type("IMPROVEMENT")
                .priority("MEDIUM")
                .title("导师能力需要提升")
                .description("导师能力得分较低，建议增加知识资产和指导会话")
                .suggestedActions(Arrays.asList(
                    "增加知识资产积累",
                    "提升指导会话质量",
                    "学习教育技巧"
                ))
                .build());
        }
        
        // 挚友能力优化建议
        if (companionshipScore < 50) {
            suggestions.add(OptimizationSuggestion.builder()
                .dimension("RELATIONSHIP")
                .subDimension("COMPANIONSHIP")
                .type("IMPROVEMENT")
                .priority("MEDIUM")
                .title("挚友能力需要提升")
                .description("挚友能力得分较低，建议加强情感连接和陪伴支持")
                .suggestedActions(Arrays.asList(
                    "增加情感共鸣时刻",
                    "提升陪伴支持能力",
                    "加强记忆共鸣"
                ))
                .build());
        }
    }
    
    /**
     * 优化建议DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class OptimizationSuggestion {
        private String dimension;
        private String subDimension;
        private String type; // BOTTLENECK, STRENGTH, IMPROVEMENT
        private String priority; // HIGH, MEDIUM, LOW
        private String title;
        private String description;
        private List<String> suggestedActions;
    }
}
