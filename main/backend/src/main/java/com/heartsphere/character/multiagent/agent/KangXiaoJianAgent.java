package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 康小健 Agent - 健康生活顾问
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class KangXiaoJianAgent extends LifeAssistantAgent {
    
    public KangXiaoJianAgent(SkillExecutor skillExecutor) {
        super(
            "kangxiaojian",
            "康小健",
            "健康生活顾问，提供健康管理和生活指导",
            2L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册8个健康管理技能
        registerSkill("health_data_tracking", "health_data_tracking");
        registerSkill("personalized_nutrition_advice", "personalized_nutrition_advice");
        registerSkill("exercise_plan_creation", "exercise_plan_creation");
        registerSkill("sleep_quality_improvement", "sleep_quality_improvement");
        registerSkill("stress_management", "stress_management");
        registerSkill("health_habit_formation", "health_habit_formation");
        registerSkill("health_risk_assessment", "health_risk_assessment");
        registerSkill("weight_management", "weight_management");
        
        // 添加能力描述
        addCapability("health");
        addCapability("nutrition");
        addCapability("exercise");
        addCapability("wellness");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("康小健处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("健康数据") || taskLower.contains("步数") || 
            taskLower.contains("心率") || taskLower.contains("睡眠") || taskLower.contains("体重")) {
            return executeSkill("health_data_tracking", parameters);
        } else if (taskLower.contains("饮食") || taskLower.contains("营养") || 
                   taskLower.contains("食谱")) {
            return executeSkill("personalized_nutrition_advice", parameters);
        } else if (taskLower.contains("运动") || taskLower.contains("健身") || 
                   taskLower.contains("锻炼")) {
            return executeSkill("exercise_plan_creation", parameters);
        } else if (taskLower.contains("睡眠") || taskLower.contains("失眠")) {
            return executeSkill("sleep_quality_improvement", parameters);
        } else if (taskLower.contains("压力") || taskLower.contains("减压") || 
                   taskLower.contains("放松")) {
            return executeSkill("stress_management", parameters);
        } else if (taskLower.contains("健康习惯")) {
            return executeSkill("health_habit_formation", parameters);
        } else if (taskLower.contains("健康风险") || taskLower.contains("健康评估")) {
            return executeSkill("health_risk_assessment", parameters);
        } else if (taskLower.contains("体重") || taskLower.contains("减重") || 
                   taskLower.contains("增重")) {
            return executeSkill("weight_management", parameters);
        } else {
            // 默认使用健康数据追踪
            return executeSkill("health_data_tracking", parameters);
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
