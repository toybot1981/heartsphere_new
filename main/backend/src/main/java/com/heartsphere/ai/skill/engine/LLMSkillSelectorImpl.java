package com.heartsphere.ai.skill.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.skill.entity.SkillDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * LLM 技能选择器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LLMSkillSelectorImpl implements LLMSkillSelector {
    
    private final AIService aiService;
    private final SkillPromptBuilder promptBuilder;
    private final ProgressiveSkillLoader skillLoader;
    private final ObjectMapper objectMapper;
    private final SkillSelectionConfig config;
    private final SkillSelectionCacheService cacheService;
    private final CacheManager cacheManager;
    
    @Override
    public List<SkillCandidate> selectCandidatesLevel1(
        List<SkillDefinition> skills,
        SkillEvaluationContext context
    ) {
        try {
            log.info("Level 1 初步筛选: skills={}, userMessage={}", 
                skills.size(), context.getMessageSummary());
            
            // 构建 Level 1 提示词
            String prompt = promptBuilder.buildLevel1Prompt(skills, context);
            
            // 调用 LLM（带缓存）
            String llmResponse = callLLMWithCache(prompt, context, "level1", skills);
            
            // 解析响应
            SkillSelectionResponse response = parseResponse(llmResponse);
            
            // 转换为候选列表
            if (response.getSelectedSkills() == null || response.getSelectedSkills().isEmpty()) {
                log.warn("LLM 未返回任何候选技能");
                return new ArrayList<>();
            }
            
            List<SkillCandidate> candidates = new ArrayList<>();
            Map<String, SkillDefinition> skillMap = skills.stream()
                .collect(Collectors.toMap(SkillDefinition::getSkillId, s -> s));
            
            for (SkillSelectionResponse.SelectedSkill selected : response.getSelectedSkills()) {
                SkillDefinition skill = skillMap.get(selected.getSkillId());
                if (skill != null) {
                    candidates.add(SkillCandidate.builder()
                        .skill(skill)
                        .relevanceScore(selected.getRelevanceScore())
                        .reason(selected.getReason())
                        .level(1)
                        .build());
                } else {
                    log.warn("LLM 返回的技能ID不存在: {}", selected.getSkillId());
                }
            }
            
            log.info("Level 1 筛选完成: candidates={}", candidates.size());
            return candidates;
            
        } catch (Exception e) {
            log.error("Level 1 筛选失败", e);
            throw new RuntimeException("Level 1 筛选失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<SkillCandidate> evaluateCandidatesLevel2(
        List<SkillCandidate> candidates,
        SkillEvaluationContext context
    ) {
        try {
            log.info("Level 2 深度评估: candidates={}", candidates.size());
            
            // 批量加载 Level 2 指令
            List<String> skillIds = candidates.stream()
                .map(c -> c.getSkill().getSkillId())
                .collect(Collectors.toList());
            Map<String, List<com.heartsphere.skill.entity.SkillInstruction>> instructionsMap = 
                skillLoader.loadLevel2Batch(skillIds);
            
            // 为每个候选技能加载指令
            List<SkillCandidate> enrichedCandidates = new ArrayList<>();
            for (SkillCandidate candidate : candidates) {
                String skillId = candidate.getSkill().getSkillId();
                List<com.heartsphere.skill.entity.SkillInstruction> instructions = 
                    instructionsMap.getOrDefault(skillId, new ArrayList<>());
                
                // 构建 Level 2 提示词（单个技能）
                String prompt = promptBuilder.buildLevel2Prompt(
                    candidate.getSkill(), 
                    instructions, 
                    context
                );
                
                // 调用 LLM（带缓存）
                String llmResponse = callLLMWithCache(prompt, context, "level2", List.of(candidate.getSkill()));
                
                // 解析响应
                SkillSelectionResponse response = parseResponse(llmResponse);
                
                // 更新候选信息
                if (response.getEvaluatedSkills() != null && !response.getEvaluatedSkills().isEmpty()) {
                    SkillSelectionResponse.EvaluatedSkill evaluated = response.getEvaluatedSkills().get(0);
                    if (evaluated.getSkillId().equals(skillId)) {
                        candidate.setShouldActivate(evaluated.getShouldActivate());
                        candidate.setConfidence(evaluated.getConfidence());
                        candidate.setReason(evaluated.getReason());
                        candidate.setLevel(2);
                        
                        if (Boolean.TRUE.equals(evaluated.getShouldActivate())) {
                            enrichedCandidates.add(candidate);
                        }
                    }
                }
            }
            
            log.info("Level 2 评估完成: evaluated={}, activated={}", 
                candidates.size(), enrichedCandidates.size());
            return enrichedCandidates;
            
        } catch (Exception e) {
            log.error("Level 2 评估失败", e);
            throw new RuntimeException("Level 2 评估失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<SkillCandidate> finalizeCandidatesLevel3(
        List<SkillCandidate> candidates,
        SkillEvaluationContext context
    ) {
        if (!config.getLlmDriven().isEnableLevel3()) {
            log.info("Level 3 未启用，跳过最终决策");
            return candidates;
        }
        
        try {
            log.info("Level 3 最终决策: candidates={}", candidates.size());
            
            // 批量加载 Level 3 资源
            List<String> skillIds = candidates.stream()
                .map(c -> c.getSkill().getSkillId())
                .collect(Collectors.toList());
            Map<String, List<com.heartsphere.skill.entity.SkillResource>> resourcesMap = 
                skillLoader.loadLevel3Batch(skillIds);
            
            // 为每个候选技能加载资源
            List<SkillCandidate> enrichedCandidates = new ArrayList<>();
            for (SkillCandidate candidate : candidates) {
                String skillId = candidate.getSkill().getSkillId();
                List<com.heartsphere.skill.entity.SkillResource> resources = 
                    resourcesMap.getOrDefault(skillId, new ArrayList<>());
                
                // 构建 Level 3 提示词（单个技能）
                String prompt = promptBuilder.buildLevel3Prompt(
                    candidate.getSkill(), 
                    resources, 
                    context
                );
                
                // 调用 LLM（带缓存）
                String llmResponse = callLLMWithCache(prompt, context, "level3", List.of(candidate.getSkill()));
                
                // 解析响应
                SkillSelectionResponse response = parseResponse(llmResponse);
                
                // 更新候选信息
                if (response.getFinalSkills() != null && !response.getFinalSkills().isEmpty()) {
                    SkillSelectionResponse.FinalSkill finalSkill = response.getFinalSkills().get(0);
                    if (finalSkill.getSkillId().equals(skillId)) {
                        candidate.setPriority(finalSkill.getPriority());
                        candidate.setReason(finalSkill.getReason());
                        candidate.setLevel(3);
                        enrichedCandidates.add(candidate);
                    }
                }
            }
            
            // 按优先级排序
            enrichedCandidates.sort((a, b) -> {
                int priorityA = a.getPriority() != null ? a.getPriority() : Integer.MAX_VALUE;
                int priorityB = b.getPriority() != null ? b.getPriority() : Integer.MAX_VALUE;
                return Integer.compare(priorityA, priorityB);
            });
            
            log.info("Level 3 决策完成: finalized={}", enrichedCandidates.size());
            return enrichedCandidates;
            
        } catch (Exception e) {
            log.error("Level 3 决策失败", e);
            // Level 3 失败不影响整体流程，返回 Level 2 的结果
            return candidates;
        }
    }
    
    /**
     * 调用 LLM 生成文本（带缓存）
     */
    private String callLLMWithCache(
        String prompt, 
        SkillEvaluationContext context, 
        String level,
        List<SkillDefinition> skills) {
        
        // 生成缓存键
        String cacheKey = cacheService.generateCacheKey(prompt, context, level, skills);
        
        // 尝试从缓存获取
        if (cacheManager != null) {
            Cache cache = cacheManager.getCache("llmSkillSelection");
            if (cache != null) {
                Cache.ValueWrapper wrapper = cache.get(cacheKey);
                if (wrapper != null && wrapper.get() != null) {
                    String cachedResult = (String) wrapper.get();
                    log.info("✅ 使用缓存的 LLM 结果: level={}, cacheKey={}", level, cacheKey);
                    return cachedResult;
                }
            }
        }
        
        // 缓存未命中，调用 LLM
        log.debug("缓存未命中，调用 LLM: level={}, cacheKey={}", level, cacheKey);
        String result = callLLM(prompt, context.getRoleId());
        
        // 保存到缓存
        cacheService.cacheResult(cacheKey, result);
        
        return result;
    }
    
    /**
     * 调用 LLM 生成文本
     */
    private String callLLM(String prompt, Long roleId) {
        try {
            long startTime = System.currentTimeMillis();
            
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的技能选择助手，请严格按照JSON格式返回结果。");
            request.setTemperature(config.getLlmDriven().getTemperature());
            request.setMaxTokens(config.getLlmDriven().getMaxTokens());
            
            // 使用角色ID作为用户ID（如果没有用户ID）
            Long userId = roleId != null ? roleId : 1L;
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            long duration = System.currentTimeMillis() - startTime;
            
            if (response == null || response.getContent() == null) {
                throw new RuntimeException("LLM 返回空响应");
            }
            
            log.info("LLM 调用完成: duration={}ms, responseLength={}", 
                duration, response.getContent().length());
            
            return response.getContent();
            
        } catch (Exception e) {
            log.error("调用 LLM 失败: roleId={}", roleId, e);
            throw new RuntimeException("调用 LLM 失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解析 LLM 响应
     */
    private SkillSelectionResponse parseResponse(String llmResponse) {
        try {
            // 尝试提取 JSON（可能包含 markdown 代码块）
            String jsonText = llmResponse.trim();
            if (jsonText.startsWith("```json")) {
                jsonText = jsonText.substring(7);
            }
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();
            
            SkillSelectionResponse response = objectMapper.readValue(jsonText, SkillSelectionResponse.class);
            
            log.debug("解析 LLM 响应成功: response={}", response);
            return response;
            
        } catch (JsonProcessingException e) {
            log.error("解析 LLM 响应失败: response={}", llmResponse, e);
            throw new RuntimeException("解析 LLM 响应失败: " + e.getMessage(), e);
        }
    }
}
