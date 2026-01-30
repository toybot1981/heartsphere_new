package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 心小安 Agent - 心理健康守护者
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class XinXiaoAnAgent extends LifeAssistantAgent {
    
    public XinXiaoAnAgent(SkillExecutor skillExecutor) {
        super(
            "xinxiaoan",
            "心小安",
            "心理健康守护者，提供心理健康指导和守护",
            5L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册8个心理健康技能
        registerSkill("mental_health_assessment", "mental_health_assessment");
        registerSkill("anxiety_management", "anxiety_management");
        registerSkill("depression_support", "depression_support");
        registerSkill("stress_coping", "stress_coping");
        registerSkill("self_care_guidance", "self_care_guidance");
        registerSkill("mindfulness_practice", "mindfulness_practice");
        registerSkill("psychological_resilience", "psychological_resilience");
        registerSkill("mental_health_education", "mental_health_education");
        
        // 添加能力描述
        addCapability("mental-health");
        addCapability("psychological-support");
        addCapability("wellness");
        addCapability("therapy");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("心小安处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("心理健康评估") || taskLower.contains("心理评估")) {
            return executeSkill("mental_health_assessment", parameters);
        } else if (taskLower.contains("焦虑") || taskLower.contains("焦虑管理")) {
            return executeSkill("anxiety_management", parameters);
        } else if (taskLower.contains("抑郁") || taskLower.contains("抑郁支持")) {
            return executeSkill("depression_support", parameters);
        } else if (taskLower.contains("压力应对") || taskLower.contains("压力处理")) {
            return executeSkill("stress_coping", parameters);
        } else if (taskLower.contains("自我关怀") || taskLower.contains("自我照顾")) {
            return executeSkill("self_care_guidance", parameters);
        } else if (taskLower.contains("正念") || taskLower.contains("冥想")) {
            return executeSkill("mindfulness_practice", parameters);
        } else if (taskLower.contains("心理韧性") || taskLower.contains("抗压能力")) {
            return executeSkill("psychological_resilience", parameters);
        } else if (taskLower.contains("心理健康教育")) {
            return executeSkill("mental_health_education", parameters);
        } else {
            // 默认使用心理健康评估
            return executeSkill("mental_health_assessment", parameters);
        }
    }
    
    private Map<String, Object> extractParameters(String task, Map<String, Object> context) {
        Map<String, Object> parameters = new HashMap<>();
        if (context != null) {
            parameters.putAll(context);
        }
        parameters.put("task", task);
        return parameters;
    }
}
