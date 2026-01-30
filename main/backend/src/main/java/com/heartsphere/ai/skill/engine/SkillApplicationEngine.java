package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.ai.skill.enums.ExecutionStatus;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
import com.heartsphere.ai.skill.service.AsyncSkillRecordService;
import com.heartsphere.ai.skill.service.SkillRecordMonitor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 技能应用引擎
 * 核心组件，负责:
 * 1. 评估技能的适用性
 * 2. 决定是否应用技能
 * 3. 优化和执行技能
 * 4. 记录和分析执行过程
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SkillApplicationEngine {

    private final SkillScoringService scoringService;
    private final SkillExecutionRecordService recordService;
    
    @Autowired(required = false)
    private AsyncSkillRecordService asyncRecordService;
    
    @Autowired(required = false)
    private SkillRecordMonitor monitor;

    // 配置参数
    private static final int SCORE_THRESHOLD = 60;  // 评分阈值（0-100）
    private static final int TOP_N_SKILLS = 5;      // 最多同时应用的技能数

    /**
     * 主方法：评估并应用技能
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

        log.info("开始评估技能: conversationId={}, userMessage={}", 
            conversationId, context.getUserMessage().substring(0, Math.min(50, context.getUserMessage().length())));

        long evaluationStartTime = System.currentTimeMillis();

        // Step 1: 评估所有技能
        List<SkillScore> skillScores = evaluateSkills(context, availableSkills);
        
        long evaluationDuration = System.currentTimeMillis() - evaluationStartTime;
        if (monitor != null) {
            monitor.recordEvaluationTime(evaluationDuration);
        }
        log.info("技能评估完成: totalSkills={}, scoredSkills={}", 
            availableSkills.size(), skillScores.size());

        // Step 2: 过滤和排序
        List<SkillScore> appliedSkills = skillScores.stream()
            .filter(s -> s.getCompositeScore() >= SCORE_THRESHOLD)
            .sorted(Comparator.comparingInt(SkillScore::getCompositeScore).reversed())
            .limit(TOP_N_SKILLS)
            .collect(Collectors.toList());

        log.info("技能过滤完成: appliedSkills={}", appliedSkills.size());

        // Step 3: 记录决策
        List<Long> executionRecordIds = new ArrayList<>();
        SkillApplicationResult result = new SkillApplicationResult();

        for (SkillScore skillScore : appliedSkills) {
            try {
                // 使用异步服务创建记录（如果可用），否则使用同步服务
                Long recordId = createExecutionRecord(
                    skillScore,
                    userId,
                    conversationId,
                    context
                );
                executionRecordIds.add(recordId);
                result.addAppliedSkill(skillScore.getSkill().getId(), skillScore.getSkill().getName());
            } catch (Exception e) {
                log.error("创建执行记录失败: skillId={}", skillScore.getSkill().getId(), e);
                result.addError(skillScore.getSkill().getName(), e.getMessage());
            }
        }

        // Step 4: 记录被拒绝的技能
        skillScores.stream()
            .filter(s -> s.getCompositeScore() < SCORE_THRESHOLD)
            .forEach(s -> {
                result.addRejectedSkill(
                    s.getSkill().getId(),
                    s.getSkill().getName(),
                    s.getCompositeScore(),
                    "评分低于阈值 (" + SCORE_THRESHOLD + ")"
                );
            });

        result.setExecutionRecordIds(executionRecordIds);
        result.setTotalEvaluated(availableSkills.size());
        result.setTotalApplied(appliedSkills.size());
        result.setEvaluationTimestamp(LocalDateTime.now());

        log.info("技能应用完成: total={}, applied={}, rejected={}", 
            availableSkills.size(), appliedSkills.size(), 
            skillScores.size() - appliedSkills.size());

        return result;
    }

    /**
     * 评估所有技能
     */
    private List<SkillScore> evaluateSkills(
        SkillEvaluationContext context,
        List<SkillDefinition> availableSkills) {

        return availableSkills.stream()
            .map(skill -> {
                try {
                    return scoringService.scoreSkill(skill, context);
                } catch (Exception e) {
                    log.warn("技能评分失败: skillId={}", skill.getId(), e);
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    /**
     * 创建执行记录
     * 优先使用异步服务，如果不可用则使用同步服务
     */
    private Long createExecutionRecord(
        SkillScore skillScore,
        Long userId,
        Long conversationId,
        SkillEvaluationContext context) {

        SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
            .conversationId(conversationId)
            .skillId(skillScore.getSkill().getId())
            .userId(userId)
            .roleId(context.getRoleId())
            .semanticScore(skillScore.getSemanticScore())
            .contextScore(skillScore.getContextScore())
            .memoryScore(skillScore.getMemoryScore())
            .compositeScore(skillScore.getCompositeScore())
            .decision("APPLIED")
            .keywordMatches(skillScore.getMatchedKeywords())
            .relatedMemoryIds(context.getRelatedMemoryIds())
            .evaluationTimestamp(LocalDateTime.now())
            .build();

        // 如果异步服务可用且配置启用异步记录，使用异步服务
        if (asyncRecordService != null) {
            try {
                // 异步创建记录，不等待结果（避免阻塞）
                asyncRecordService.createRecordAsync(dto)
                    .thenAccept(recordId -> log.info("异步创建执行记录成功: recordId={}", recordId))
                    .exceptionally(e -> {
                        log.error("异步创建执行记录失败: skillId={}", dto.getSkillId(), e);
                        return null;
                    });
                // 返回临时ID（实际ID将在异步完成后生成）
                // 注意：这里返回 null 或临时ID，实际使用时需要处理
                return -1L; // 临时标记，表示异步处理中
            } catch (Exception e) {
                log.warn("异步创建记录失败，回退到同步: {}", e.getMessage());
            }
        }
        
        // 同步创建记录（回退方案）
        var record = recordService.createRecord(dto);
        return record.getId();
    }

    /**
     * 获取应用结果
     */
    public SkillApplicationResult getApplicationResult(Long conversationId) {
        // 这是一个占位符，实际实现会从缓存或数据库获取
        return new SkillApplicationResult();
    }

    /**
     * 调试方法：获取技能评分详情
     */
    public List<SkillScoreDebugInfo> debugSkillScores(
        SkillEvaluationContext context,
        List<SkillDefinition> availableSkills) {

        return evaluateSkills(context, availableSkills).stream()
            .map(this::toDebugInfo)
            .collect(Collectors.toList());
    }

    private SkillScoreDebugInfo toDebugInfo(SkillScore skillScore) {
        return SkillScoreDebugInfo.builder()
            .skillId(skillScore.getSkill().getId())
            .skillName(skillScore.getSkill().getName())
            .semanticScore(skillScore.getSemanticScore())
            .contextScore(skillScore.getContextScore())
            .memoryScore(skillScore.getMemoryScore())
            .compositeScore(skillScore.getCompositeScore())
            .matchedKeywords(skillScore.getMatchedKeywords())
            .appliedYesNo(skillScore.getCompositeScore() >= SCORE_THRESHOLD)
            .build();
    }

    // ==================== 内部数据类 ====================

    /**
     * 技能评分结果
     */
    public static class SkillScore {
        private final SkillDefinition skill;
        private final int semanticScore;
        private final int contextScore;
        private final int memoryScore;
        private final int compositeScore;
        private final List<String> matchedKeywords;

        public SkillScore(SkillDefinition skill, int semanticScore, int contextScore,
                         int memoryScore, List<String> matchedKeywords) {
            this.skill = skill;
            this.semanticScore = semanticScore;
            this.contextScore = contextScore;
            this.memoryScore = memoryScore;
            this.matchedKeywords = matchedKeywords;
            // 计算综合评分（可配置权重）
            this.compositeScore = (int) (
                semanticScore * 0.4 +
                contextScore * 0.35 +
                memoryScore * 0.25
            );
        }

        public SkillDefinition getSkill() { return skill; }
        public int getSemanticScore() { return semanticScore; }
        public int getContextScore() { return contextScore; }
        public int getMemoryScore() { return memoryScore; }
        public int getCompositeScore() { return compositeScore; }
        public List<String> getMatchedKeywords() { return matchedKeywords; }
    }
}
