package com.heartsphere.ai.skill.util;

import com.heartsphere.aiagent.dto.response.TextGenerationResponse;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mock LLM 响应构建器
 * 用于构建测试中的 LLM 响应
 */
public class MockLLMResponseBuilder {
    
    /**
     * 构建 Level 1 响应
     */
    public static TextGenerationResponse buildLevel1Response(List<SelectedSkill> skills) {
        String json = buildLevel1Json(skills);
        TextGenerationResponse response = new TextGenerationResponse();
        response.setContent(json);
        response.setProvider("test");
        response.setModel("test-model");
        return response;
    }
    
    /**
     * 构建 Level 2 响应
     */
    public static TextGenerationResponse buildLevel2Response(List<EvaluatedSkill> skills) {
        String json = buildLevel2Json(skills);
        TextGenerationResponse response = new TextGenerationResponse();
        response.setContent(json);
        response.setProvider("test");
        response.setModel("test-model");
        return response;
    }
    
    /**
     * 构建 Level 3 响应
     */
    public static TextGenerationResponse buildLevel3Response(List<FinalSkill> skills) {
        String json = buildLevel3Json(skills);
        TextGenerationResponse response = new TextGenerationResponse();
        response.setContent(json);
        response.setProvider("test");
        response.setModel("test-model");
        return response;
    }
    
    private static String buildLevel1Json(List<SelectedSkill> skills) {
        String skillsJson = skills.stream()
            .map(s -> String.format(
                "{\"skillId\":\"%s\",\"relevanceScore\":%d,\"reason\":\"%s\"}",
                s.skillId, s.relevanceScore, s.reason
            ))
            .collect(Collectors.joining(","));
        return String.format("{\"selectedSkills\":[%s]}", skillsJson);
    }
    
    private static String buildLevel2Json(List<EvaluatedSkill> skills) {
        String skillsJson = skills.stream()
            .map(s -> String.format(
                "{\"skillId\":\"%s\",\"shouldActivate\":%s,\"confidence\":%d,\"reason\":\"%s\"}",
                s.skillId, s.shouldActivate, s.confidence, s.reason
            ))
            .collect(Collectors.joining(","));
        return String.format("{\"evaluatedSkills\":[%s]}", skillsJson);
    }
    
    private static String buildLevel3Json(List<FinalSkill> skills) {
        String skillsJson = skills.stream()
            .map(s -> String.format(
                "{\"skillId\":\"%s\",\"priority\":%d,\"activationOrder\":%d,\"reason\":\"%s\"}",
                s.skillId, s.priority, s.activationOrder, s.reason
            ))
            .collect(Collectors.joining(","));
        return String.format("{\"finalSkills\":[%s]}", skillsJson);
    }
    
    /**
     * Level 1 选中的技能
     */
    public static class SelectedSkill {
        public String skillId;
        public int relevanceScore;
        public String reason;
        
        public SelectedSkill(String skillId, int relevanceScore, String reason) {
            this.skillId = skillId;
            this.relevanceScore = relevanceScore;
            this.reason = reason;
        }
    }
    
    /**
     * Level 2 评估后的技能
     */
    public static class EvaluatedSkill {
        public String skillId;
        public boolean shouldActivate;
        public int confidence;
        public String reason;
        
        public EvaluatedSkill(String skillId, boolean shouldActivate, int confidence, String reason) {
            this.skillId = skillId;
            this.shouldActivate = shouldActivate;
            this.confidence = confidence;
            this.reason = reason;
        }
    }
    
    /**
     * Level 3 最终决策的技能
     */
    public static class FinalSkill {
        public String skillId;
        public int priority;
        public int activationOrder;
        public String reason;
        
        public FinalSkill(String skillId, int priority, int activationOrder, String reason) {
            this.skillId = skillId;
            this.priority = priority;
            this.activationOrder = activationOrder;
            this.reason = reason;
        }
    }
}
