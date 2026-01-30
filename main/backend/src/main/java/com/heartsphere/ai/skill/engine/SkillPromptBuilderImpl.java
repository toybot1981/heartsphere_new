package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 技能提示词构建器实现
 * 优先从提示词管理获取模板，取不到时使用代码内默认提示词。
 *
 * @author HeartSphere
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SkillPromptBuilderImpl implements SkillPromptBuilder {

    private final SkillSelectionConfig config;
    private final PromptTemplateIntegrationService templateService;

    // 默认值，如果配置未加载
    private static final int DEFAULT_LEVEL1_CANDIDATES = 10;

    @Override
    public String buildLevel1Prompt(List<SkillDefinition> skills, SkillEvaluationContext context) {
        String defaultPrompt = buildLevel1PromptDefault(skills, context);
        Map<String, Object> variables = new HashMap<>();
        variables.put("userMessage", context.getUserMessage());
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            variables.put("conversationHistory", String.join("\n", context.getConversationHistory().stream()
                    .map(msg -> "- " + msg).collect(Collectors.toList())));
        }
        StringBuilder skillsList = new StringBuilder();
        skills.forEach(skill -> skillsList.append(String.format(
                "- 技能ID: %s\n  技能名称: %s\n  技能描述: %s\n  技能分类: %s\n\n",
                skill.getSkillId(),
                skill.getName(),
                skill.getDescription() != null ? skill.getDescription() : "无描述",
                skill.getCategory() != null ? skill.getCategory() : "未分类"
        )));
        variables.put("skillsList", skillsList.toString());
        int maxCandidates = (config != null && config.getLlmDriven() != null)
                ? config.getLlmDriven().getLevel1Candidates()
                : DEFAULT_LEVEL1_CANDIDATES;
        variables.put("maxCandidates", maxCandidates);
        PromptRenderResponse response = templateService.getPrompts(
                "skill-selection-level1", variables, "", defaultPrompt);
        return response.getUserPrompt();
    }

    private String buildLevel1PromptDefault(List<SkillDefinition> skills, SkillEvaluationContext context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个技能选择助手。根据用户消息和对话上下文，从以下技能中选择最相关的技能。\n\n");
        prompt.append("[用户消息]\n");
        prompt.append(context.getUserMessage()).append("\n\n");
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            prompt.append("[对话上下文]\n");
            context.getConversationHistory().forEach(msg -> prompt.append("- ").append(msg).append("\n"));
            prompt.append("\n");
        }
        prompt.append("[可用技能列表]\n");
        skills.forEach(skill -> prompt.append(String.format(
                "- 技能ID: %s\n  技能名称: %s\n  技能描述: %s\n  技能分类: %s\n\n",
                skill.getSkillId(),
                skill.getName(),
                skill.getDescription() != null ? skill.getDescription() : "无描述",
                skill.getCategory() != null ? skill.getCategory() : "未分类"
        )));
        int maxCandidates = (config != null && config.getLlmDriven() != null)
                ? config.getLlmDriven().getLevel1Candidates()
                : DEFAULT_LEVEL1_CANDIDATES;
        prompt.append(String.format("请分析用户消息，选择最相关的技能（最多选择 %d 个），并给出选择理由。\n\n", maxCandidates));
        prompt.append("返回格式（JSON）：\n{\n  \"selectedSkills\": [\n    {\n      \"skillId\": \"skill_id\",\n      \"relevanceScore\": 0-100,\n      \"reason\": \"选择理由\"\n    }\n  ]\n}\n");
        return prompt.toString();
    }

    @Override
    public String buildLevel2Prompt(SkillDefinition skill, List<SkillInstruction> instructions, SkillEvaluationContext context) {
        String defaultPrompt = buildLevel2PromptDefault(skill, instructions, context);
        Map<String, Object> variables = new HashMap<>();
        variables.put("userMessage", context.getUserMessage());
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            variables.put("conversationHistory", String.join("\n", context.getConversationHistory().stream()
                    .map(msg -> "- " + msg).collect(Collectors.toList())));
        }
        StringBuilder skillDetail = new StringBuilder();
        skillDetail.append(String.format("技能ID: %s\n", skill.getSkillId()));
        skillDetail.append(String.format("技能名称: %s\n", skill.getName()));
        skillDetail.append(String.format("技能描述: %s\n", skill.getDescription() != null ? skill.getDescription() : "无描述"));
        skillDetail.append(String.format("技能分类: %s\n\n", skill.getCategory() != null ? skill.getCategory() : "未分类"));
        if (instructions != null && !instructions.isEmpty()) {
            skillDetail.append("[技能指令（Level 2）]\n");
            instructions.forEach(inst -> skillDetail.append(String.format("- Level %d: %s\n", inst.getInstructionLevel(), inst.getInstructionText())));
        }
        variables.put("skillDetail", skillDetail.toString());
        variables.put("skillId", skill.getSkillId());
        PromptRenderResponse response = templateService.getPrompts(
                "skill-selection-level2", variables, "", defaultPrompt);
        return response.getUserPrompt();
    }

    private String buildLevel2PromptDefault(SkillDefinition skill, List<SkillInstruction> instructions, SkillEvaluationContext context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("对以下候选技能进行深度评估，确定是否应该激活。\n\n");
        prompt.append("[用户消息]\n").append(context.getUserMessage()).append("\n\n");
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            prompt.append("[对话上下文]\n");
            context.getConversationHistory().forEach(msg -> prompt.append("- ").append(msg).append("\n"));
            prompt.append("\n");
        }
        prompt.append("[候选技能详情]\n");
        prompt.append(String.format("技能ID: %s\n技能名称: %s\n技能描述: %s\n技能分类: %s\n\n",
                skill.getSkillId(), skill.getName(),
                skill.getDescription() != null ? skill.getDescription() : "无描述",
                skill.getCategory() != null ? skill.getCategory() : "未分类"));
        prompt.append("[技能指令（Level 2）]\n");
        if (instructions != null && !instructions.isEmpty()) {
            instructions.forEach(inst -> prompt.append(String.format("- Level %d: %s\n", inst.getInstructionLevel(), inst.getInstructionText())));
        } else {
            prompt.append("无详细指令\n");
        }
        prompt.append("\n请评估这个技能：\n1. 是否与用户消息高度相关\n2. 是否适合当前对话上下文\n3. 激活后是否能提供价值\n\n");
        prompt.append("返回格式（JSON）：\n{\n  \"evaluatedSkills\": [\n    {\n      \"skillId\": \"").append(skill.getSkillId()).append("\",\n      \"shouldActivate\": true/false,\n      \"confidence\": 0-100,\n      \"reason\": \"评估理由\"\n    }\n  ]\n}\n");
        return prompt.toString();
    }

    @Override
    public String buildLevel3Prompt(SkillDefinition skill, List<SkillResource> resources, SkillEvaluationContext context) {
        String defaultPrompt = buildLevel3PromptDefault(skill, resources, context);
        Map<String, Object> variables = new HashMap<>();
        variables.put("userMessage", context.getUserMessage());
        StringBuilder skillDetail = new StringBuilder();
        skillDetail.append(String.format("技能ID: %s\n技能名称: %s\n技能描述: %s\n\n",
                skill.getSkillId(), skill.getName(),
                skill.getDescription() != null ? skill.getDescription() : "无描述"));
        variables.put("skillDetail", skillDetail.toString());
        StringBuilder resourcesList = new StringBuilder();
        if (resources != null && !resources.isEmpty()) {
            resources.forEach(r -> resourcesList.append(String.format("- %s (%s): %s\n",
                    r.getResourceName(), r.getResourceType(), r.getResourceContent() != null ? r.getResourceContent() : "无内容")));
        } else {
            resourcesList.append("无资源\n");
        }
        variables.put("resourcesList", resourcesList.toString());
        variables.put("skillId", skill.getSkillId());
        PromptRenderResponse response = templateService.getPrompts(
                "skill-selection-level3", variables, "", defaultPrompt);
        return response.getUserPrompt();
    }

    private String buildLevel3PromptDefault(SkillDefinition skill, List<SkillResource> resources, SkillEvaluationContext context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("对以下最终候选技能进行最终决策，确定激活优先级。\n\n");
        prompt.append("[用户消息]\n").append(context.getUserMessage()).append("\n\n");
        prompt.append("[候选技能完整信息]\n");
        prompt.append(String.format("技能ID: %s\n技能名称: %s\n技能描述: %s\n\n",
                skill.getSkillId(), skill.getName(),
                skill.getDescription() != null ? skill.getDescription() : "无描述"));
        prompt.append("[技能资源（Level 3）]\n");
        if (resources != null && !resources.isEmpty()) {
            resources.forEach(r -> prompt.append(String.format("- %s (%s): %s\n",
                    r.getResourceName(), r.getResourceType(),
                    r.getResourceContent() != null ? r.getResourceContent() : "无内容")));
        } else {
            prompt.append("无资源\n");
        }
        prompt.append("\n请进行最终决策：\n1. 确定激活优先级（1为最高）\n2. 评估技能组合的协同效果\n3. 考虑技能执行的顺序\n\n");
        prompt.append("返回格式（JSON）：\n{\n  \"finalSkills\": [\n    {\n      \"skillId\": \"").append(skill.getSkillId()).append("\",\n      \"priority\": 1-N,\n      \"activationOrder\": 1-N,\n      \"reason\": \"最终决策理由\"\n    }\n  ]\n}\n");
        return prompt.toString();
    }

    @Override
    public String buildLevel2BatchPrompt(List<SkillCandidate> candidates, SkillEvaluationContext context) {
        String defaultPrompt = buildLevel2BatchPromptDefault(candidates, context);
        Map<String, Object> variables = new HashMap<>();
        variables.put("userMessage", context.getUserMessage());
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            variables.put("conversationHistory", String.join("\n", context.getConversationHistory().stream()
                    .map(msg -> "- " + msg).collect(Collectors.toList())));
        }
        StringBuilder candidatesDetail = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            SkillCandidate c = candidates.get(i);
            SkillDefinition s = c.getSkill();
            candidatesDetail.append(String.format("\n技能 %d:\n技能ID: %s\n技能名称: %s\n技能描述: %s\n初步相关性得分: %d\n初步选择理由: %s\n",
                    i + 1, s.getSkillId(), s.getName(),
                    s.getDescription() != null ? s.getDescription() : "无描述",
                    c.getRelevanceScore(), c.getReason()));
        }
        variables.put("candidatesDetail", candidatesDetail.toString());
        PromptRenderResponse response = templateService.getPrompts(
                "skill-selection-level2-batch", variables, "", defaultPrompt);
        return response.getUserPrompt();
    }

    private String buildLevel2BatchPromptDefault(List<SkillCandidate> candidates, SkillEvaluationContext context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("对以下候选技能进行深度评估，确定是否应该激活。\n\n");
        prompt.append("[用户消息]\n").append(context.getUserMessage()).append("\n\n");
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            prompt.append("[对话上下文]\n");
            context.getConversationHistory().forEach(msg -> prompt.append("- ").append(msg).append("\n"));
            prompt.append("\n");
        }
        prompt.append("[候选技能详情]\n");
        for (int i = 0; i < candidates.size(); i++) {
            SkillCandidate c = candidates.get(i);
            SkillDefinition s = c.getSkill();
            prompt.append(String.format("\n技能 %d:\n技能ID: %s\n技能名称: %s\n技能描述: %s\n初步相关性得分: %d\n初步选择理由: %s\n",
                    i + 1, s.getSkillId(), s.getName(),
                    s.getDescription() != null ? s.getDescription() : "无描述",
                    c.getRelevanceScore(), c.getReason()));
        }
        prompt.append("\n请评估每个技能：\n1. 是否与用户消息高度相关\n2. 是否适合当前对话上下文\n3. 激活后是否能提供价值\n\n");
        prompt.append("返回格式（JSON）：\n{\n  \"evaluatedSkills\": [\n");
        for (int i = 0; i < candidates.size(); i++) {
            prompt.append("    {\n      \"skillId\": \"").append(candidates.get(i).getSkill().getSkillId()).append("\",\n      \"shouldActivate\": true/false,\n      \"confidence\": 0-100,\n      \"reason\": \"评估理由\"\n    }");
            if (i < candidates.size() - 1) prompt.append(",");
            prompt.append("\n");
        }
        prompt.append("  ]\n}\n");
        return prompt.toString();
    }

    @Override
    public String buildLevel3BatchPrompt(List<SkillCandidate> candidates, SkillEvaluationContext context) {
        String defaultPrompt = buildLevel3BatchPromptDefault(candidates, context);
        Map<String, Object> variables = new HashMap<>();
        variables.put("userMessage", context.getUserMessage());
        StringBuilder candidatesDetail = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            SkillCandidate c = candidates.get(i);
            SkillDefinition s = c.getSkill();
            candidatesDetail.append(String.format("\n技能 %d:\n技能ID: %s\n技能名称: %s\n技能描述: %s\n评估置信度: %d\n",
                    i + 1, s.getSkillId(), s.getName(),
                    s.getDescription() != null ? s.getDescription() : "无描述",
                    c.getConfidence()));
        }
        variables.put("candidatesDetail", candidatesDetail.toString());
        PromptRenderResponse response = templateService.getPrompts(
                "skill-selection-level3-batch", variables, "", defaultPrompt);
        return response.getUserPrompt();
    }

    private String buildLevel3BatchPromptDefault(List<SkillCandidate> candidates, SkillEvaluationContext context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("对以下最终候选技能进行最终决策，确定激活优先级。\n\n");
        prompt.append("[用户消息]\n").append(context.getUserMessage()).append("\n\n");
        prompt.append("[候选技能完整信息]\n");
        for (int i = 0; i < candidates.size(); i++) {
            SkillCandidate c = candidates.get(i);
            SkillDefinition s = c.getSkill();
            prompt.append(String.format("\n技能 %d:\n技能ID: %s\n技能名称: %s\n技能描述: %s\n评估置信度: %d\n",
                    i + 1, s.getSkillId(), s.getName(),
                    s.getDescription() != null ? s.getDescription() : "无描述",
                    c.getConfidence()));
        }
        prompt.append("\n请进行最终决策：\n1. 确定激活优先级（1为最高）\n2. 评估技能组合的协同效果\n3. 考虑技能执行的顺序\n\n");
        prompt.append("返回格式（JSON）：\n{\n  \"finalSkills\": [\n");
        for (int i = 0; i < candidates.size(); i++) {
            prompt.append("    {\n      \"skillId\": \"").append(candidates.get(i).getSkill().getSkillId()).append("\",\n      \"priority\": 1-N,\n      \"activationOrder\": 1-N,\n      \"reason\": \"最终决策理由\"\n    }");
            if (i < candidates.size() - 1) prompt.append(",");
            prompt.append("\n");
        }
        prompt.append("  ]\n}\n");
        return prompt.toString();
    }
}
