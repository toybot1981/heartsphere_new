package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
import com.heartsphere.skill.entity.SkillDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * LLM 驱动的技能应用引擎
 * 使用三层渐进式 LLM 判断机制进行技能选择
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LLMSkillApplicationEngine {
    
    private final LLMSkillSelector llmSkillSelector;
    private final ProgressiveSkillLoader skillLoader;
    private final SkillExecutionRecordService recordService;
    private final SkillSelectionConfig config;
    
    /**
     * 主方法：评估并应用技能（纯 LLM 驱动）
     * 
     * @param context 对话上下文
     * @param availableSkills 可用的技能列表
     * @param userId 用户ID
     * @param conversationId 对话ID
     * @return 被应用的技能列表及其执行记录
     */
    public SkillApplicationResult evaluateAndApplySkills(
        SkillEvaluationContext context,
        List<SkillDefinition> availableSkills,
        Long userId,
        Long conversationId) {
        
        // 检查是否启用 LLM 驱动
        if (!config.getLlmDriven().isEnabled()) {
            log.warn("LLM 驱动未启用，返回空结果。请确保 skill.selection.llm-driven.enabled=true");
            return createEmptyResult(availableSkills.size());
        }
        
        try {
            return evaluateWithLLM(context, availableSkills, userId, conversationId);
        } catch (Exception e) {
            log.error("LLM 驱动失败: {}", e.getMessage(), e);
            // 不再降级到规则驱动，返回空结果
            return createEmptyResult(availableSkills.size());
        }
    }
    
    /**
     * 使用 LLM 进行技能评估
     */
    private SkillApplicationResult evaluateWithLLM(
        SkillEvaluationContext context,
        List<SkillDefinition> availableSkills,
        Long userId,
        Long conversationId) {
        
        log.info("🚀 开始 LLM 驱动的技能评估: conversationId={}, skills={}, userMessage={}", 
            conversationId, availableSkills.size(), context.getMessageSummary());
        
        long startTime = System.currentTimeMillis();
        
        // 阶段 1：Level 1 初步筛选
        List<SkillCandidate> level1Candidates = llmSkillSelector.selectCandidatesLevel1(
            availableSkills, 
            context
        );
        
        if (level1Candidates.isEmpty()) {
            log.info("Level 1 未筛选出候选技能");
            return createEmptyResult(availableSkills.size());
        }
        
        // 限制候选数量
        int maxLevel1 = config.getLlmDriven().getLevel1Candidates();
        level1Candidates = level1Candidates.stream()
            .sorted(Comparator.comparing(SkillCandidate::getRelevanceScore).reversed())
            .limit(maxLevel1)
            .collect(Collectors.toList());
        
        log.info("Level 1 筛选完成: candidates={}", level1Candidates.size());
        
        // 阶段 2：Level 2 深度评估
        List<SkillCandidate> level2Candidates = llmSkillSelector.evaluateCandidatesLevel2(
            level1Candidates,
            context
        );
        
        if (level2Candidates.isEmpty()) {
            log.info("Level 2 评估后无技能需要激活");
            return createEmptyResult(availableSkills.size());
        }
        
        // 限制候选数量
        int maxLevel2 = config.getLlmDriven().getLevel2Candidates();
        level2Candidates = level2Candidates.stream()
            .sorted(Comparator.comparing(SkillCandidate::getConfidence, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(maxLevel2)
            .collect(Collectors.toList());
        
        log.info("Level 2 评估完成: candidates={}", level2Candidates.size());
        
        // 阶段 3：Level 3 最终决策（可选）
        List<SkillCandidate> finalCandidates = level2Candidates;
        if (config.getLlmDriven().isEnableLevel3()) {
            finalCandidates = llmSkillSelector.finalizeCandidatesLevel3(
                level2Candidates,
                context
            );
            log.info("Level 3 决策完成: candidates={}", finalCandidates.size());
        }
        
        // 转换为应用结果
        SkillApplicationResult result = convertToApplicationResult(
            finalCandidates,
            availableSkills.size(),
            userId,
            conversationId,
            context
        );
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ LLM 驱动的技能评估完成: duration={}ms, applied={}, total={}, level1={}, level2={}, level3={}", 
            duration, result.getTotalApplied(), availableSkills.size(),
            level1Candidates.size(), level2Candidates.size(), 
            config.getLlmDriven().isEnableLevel3() ? finalCandidates.size() : 0);
        
        return result;
    }
    
    /**
     * 转换为应用结果
     */
    private SkillApplicationResult convertToApplicationResult(
        List<SkillCandidate> candidates,
        int totalEvaluated,
        Long userId,
        Long conversationId,
        SkillEvaluationContext context) {
        
        SkillApplicationResult result = new SkillApplicationResult();
        List<Long> executionRecordIds = new ArrayList<>();
        
        for (SkillCandidate candidate : candidates) {
            try {
                // 创建执行记录
                SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
                    .conversationId(conversationId)
                    .skillId(candidate.getSkill().getId())  // 使用 Long 类型的 id，而不是 String 类型的 skillId
                    .userId(userId)
                    .roleId(context.getRoleId())
                    .semanticScore(candidate.getRelevanceScore())
                    .contextScore(candidate.getConfidence())
                    .memoryScore(0)  // LLM 驱动不单独计算内存得分
                    .compositeScore(calculateCompositeScore(candidate))
                    .decision("APPLIED")
                    .keywordMatches(new ArrayList<>())  // LLM 驱动不使用关键词匹配
                    .relatedMemoryIds(context.getRelatedMemoryIds())
                    .evaluationTimestamp(LocalDateTime.now())
                    .build();
                
                var record = recordService.createRecord(dto);
                executionRecordIds.add(record.getId());
                result.addAppliedSkill(candidate.getSkill().getId(), candidate.getSkill().getName());
                
            } catch (Exception e) {
                log.error("创建执行记录失败: skillId={}", candidate.getSkill().getSkillId(), e);
                result.addError(candidate.getSkill().getName(), e.getMessage());
            }
        }
        
        result.setExecutionRecordIds(executionRecordIds);
        result.setTotalEvaluated(totalEvaluated);
        result.setTotalApplied(candidates.size());
        result.setEvaluationTimestamp(LocalDateTime.now());
        
        return result;
    }
    
    /**
     * 计算综合得分
     */
    private int calculateCompositeScore(SkillCandidate candidate) {
        int relevanceScore = candidate.getRelevanceScore() != null ? candidate.getRelevanceScore() : 0;
        int confidence = candidate.getConfidence() != null ? candidate.getConfidence() : 0;
        
        // 综合得分 = 相关性得分 * 0.6 + 置信度 * 0.4
        return (int) (relevanceScore * 0.6 + confidence * 0.4);
    }
    
    /**
     * 创建空结果
     */
    private SkillApplicationResult createEmptyResult(int totalEvaluated) {
        SkillApplicationResult result = new SkillApplicationResult();
        result.setTotalEvaluated(totalEvaluated);
        result.setTotalApplied(0);
        result.setEvaluationTimestamp(LocalDateTime.now());
        return result;
    }
    
}
