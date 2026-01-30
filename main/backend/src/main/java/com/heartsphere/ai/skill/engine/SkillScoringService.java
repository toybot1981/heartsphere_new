package com.heartsphere.ai.skill.engine;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 技能评分服务
 * 负责计算技能的评分（多维度评分模型）
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillScoringService {

    private final ObjectMapper objectMapper;

    // 权重配置（可通过配置文件调整）
    private static final double SEMANTIC_WEIGHT = 0.4;
    private static final double CONTEXT_WEIGHT = 0.35;
    private static final double MEMORY_WEIGHT = 0.25;
    
    // 缓存用户偏好数据（简化实现，实际可以使用 Redis）
    private final Map<Long, Map<String, Object>> userPreferenceCache = new ConcurrentHashMap<>();
    
    // 缓存相似度计算结果（key: skillId_userMessage_hash, value: score）
    private final Map<String, Integer> similarityCache = new ConcurrentHashMap<>();
    private static final int MAX_CACHE_SIZE = 1000;

    /**
     * 评估单个技能
     */
    public SkillApplicationEngine.SkillScore scoreSkill(
        SkillDefinition skill,
        SkillEvaluationContext context) {

        try {
            // 计算各维度的评分
            int semanticScore = calculateSemanticScore(skill, context.getUserMessage());
            int contextScore = calculateContextScore(skill, context);
            int memoryScore = calculateMemoryScore(skill, context);

            // 获取匹配的关键词
            List<String> matchedKeywords = extractMatchedKeywords(skill, context.getUserMessage());

            log.info("技能评分完成: skillId={}, semantic={}, context={}, memory={}", 
                skill.getId(), semanticScore, contextScore, memoryScore);

            return new SkillApplicationEngine.SkillScore(
                skill,
                semanticScore,
                contextScore,
                memoryScore,
                matchedKeywords
            );
        } catch (Exception e) {
            log.error("技能评分失败: skillId={}", skill.getId(), e);
            throw new RuntimeException("评分失败", e);
        }
    }

    /**
     * 计算语义相似度得分
     * 基于：关键词匹配、内容相似性等
     * 使用缓存优化性能
     */
    private int calculateSemanticScore(SkillDefinition skill, String userMessage) {
        if (userMessage == null || userMessage.isEmpty()) {
            return 0;
        }
        
        // 生成缓存键
        String cacheKey = skill.getId() + "_" + userMessage.hashCode();
        if (similarityCache.containsKey(cacheKey)) {
            log.info("使用缓存结果: skillId={}, cacheKey={}", skill.getId(), cacheKey);
            return similarityCache.get(cacheKey);
        }

        String lowerMessage = userMessage.toLowerCase();
        String skillName = skill.getName().toLowerCase();
        String skillDescription = skill.getDescription() != null ? 
            skill.getDescription().toLowerCase() : "";

        int score = 0;

        // 技能名称完全匹配
        if (lowerMessage.contains(skillName)) {
            score += 40;
        }

        // 技能描述关键词匹配
        if (skillDescription.length() > 0 && 
            Arrays.stream(skillDescription.split("\\s")).anyMatch(lowerMessage::contains)) {
            score += 30;
        }

        // 触发关键词匹配
        if (skill.getAutoTriggerKeywords() != null && !skill.getAutoTriggerKeywords().isEmpty()) {
            try {
                List<String> keywords = objectMapper.readValue(
                    skill.getAutoTriggerKeywords(),
                    new TypeReference<List<String>>() {}
                );
                long matchedKeywords = keywords.stream()
                    .filter(kw -> lowerMessage.contains(kw.toLowerCase()))
                    .count();
                
                if (matchedKeywords > 0) {
                    score += Math.min(30, (int)(matchedKeywords * 10));
                }
            } catch (Exception e) {
                log.warn("解析自动触发关键词失败: skillId={}", skill.getSkillId(), e);
            }
        }

        return Math.min(100, score);
    }

    /**
     * 计算上下文匹配得分
     * 基于：对话历史、用户状态、主题匹配等
     */
    private int calculateContextScore(SkillDefinition skill, SkillEvaluationContext context) {
        int score = 0;

        // 对话历史匹配
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            long relevantTurns = context.getConversationHistory().stream()
                .filter(msg -> msg.toLowerCase().contains(skill.getName().toLowerCase()))
                .count();
            
            if (relevantTurns > 0) {
                score += Math.min(40, (int)(relevantTurns * 10));
            }
        }

        // 主题匹配
        if (context.getContextTopic() != null && 
            context.getContextTopic().toLowerCase()
                .contains(skill.getName().toLowerCase())) {
            score += 30;
        }

        // 用户状态匹配
        if (context.getUserState() != null && 
            skill.getCategory() != null &&
            context.getUserState().contains(skill.getCategory())) {
            score += 30;
        }

        return Math.min(100, score);
    }

    /**
     * 计算内存触发得分
     * 基于：相关内存、记忆关联等
     */
    private int calculateMemoryScore(SkillDefinition skill, SkillEvaluationContext context) {
        int score = 0;

        // 是否有相关内存
        if (context.getRelatedMemoryIds() != null && !context.getRelatedMemoryIds().isEmpty()) {
            score += Math.min(50, context.getRelatedMemoryIds().size() * 10);
        }

        // 技能是否与内存系统集成
        // （这里可以查询数据库中技能与内存的关联）
        // if (skillMemoryRelationExists(skill.getId())) {
        //     score += 50;
        // }

        return Math.min(100, score);
    }

    /**
     * 提取匹配的关键词
     */
    private List<String> extractMatchedKeywords(SkillDefinition skill, String userMessage) {
        if (skill.getAutoTriggerKeywords() == null || skill.getAutoTriggerKeywords().isEmpty() || userMessage == null) {
            return new ArrayList<>();
        }

        try {
            List<String> keywords = objectMapper.readValue(
                skill.getAutoTriggerKeywords(),
                new TypeReference<List<String>>() {}
            );
            String lowerMessage = userMessage.toLowerCase();
            return keywords.stream()
                .filter(kw -> lowerMessage.contains(kw.toLowerCase()))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("解析自动触发关键词失败: skillId={}", skill.getSkillId(), e);
            return new ArrayList<>();
        }
    }

    /**
     * 批量评分（性能优化版本）
     */
    public List<SkillApplicationEngine.SkillScore> scoreSkillsBatch(
        List<SkillDefinition> skills,
        SkillEvaluationContext context) {

        return skills.parallelStream()
            .map(skill -> {
                try {
                    return scoreSkill(skill, context);
                } catch (Exception e) {
                    log.warn("评分失败: skillId={}", skill.getId(), e);
                    return null;
                }
            })
            .filter(score -> score != null)
            .collect(Collectors.toList());
    }
}
