package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 学小知 Agent - 学习成长导师
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class XueXiaoZhiAgent extends LifeAssistantAgent {
    
    public XueXiaoZhiAgent(SkillExecutor skillExecutor) {
        super(
            "xuexiaozhi",
            "学小知",
            "学习成长导师，提供学习方法和成长指导",
            3L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册8个学习成长技能
        registerSkill("study_plan_creation", "study_plan_creation");
        registerSkill("knowledge_system_building", "knowledge_system_building");
        registerSkill("memory_technique_training", "memory_technique_training");
        registerSkill("note_taking_method_guidance", "note_taking_method_guidance");
        registerSkill("learning_method_optimization", "learning_method_optimization");
        registerSkill("learning_motivation_enhancement", "learning_motivation_enhancement");
        registerSkill("exam_preparation_guidance", "exam_preparation_guidance");
        registerSkill("learning_progress_tracking", "learning_progress_tracking");
        
        // 添加能力描述
        addCapability("learning");
        addCapability("education");
        addCapability("study-skills");
        addCapability("growth");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("学小知处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("学习计划") || taskLower.contains("学习目标")) {
            return executeSkill("study_plan_creation", parameters);
        } else if (taskLower.contains("知识体系") || taskLower.contains("知识结构") || 
                   taskLower.contains("思维导图")) {
            return executeSkill("knowledge_system_building", parameters);
        } else if (taskLower.contains("记忆") || taskLower.contains("记忆技巧")) {
            return executeSkill("memory_technique_training", parameters);
        } else if (taskLower.contains("笔记") || taskLower.contains("康奈尔")) {
            return executeSkill("note_taking_method_guidance", parameters);
        } else if (taskLower.contains("学习方法") || taskLower.contains("学习效率")) {
            return executeSkill("learning_method_optimization", parameters);
        } else if (taskLower.contains("学习动力") || taskLower.contains("学习动机")) {
            return executeSkill("learning_motivation_enhancement", parameters);
        } else if (taskLower.contains("考试") || taskLower.contains("备考")) {
            return executeSkill("exam_preparation_guidance", parameters);
        } else if (taskLower.contains("学习进度") || taskLower.contains("学习追踪")) {
            return executeSkill("learning_progress_tracking", parameters);
        } else {
            // 默认使用学习计划制定
            return executeSkill("study_plan_creation", parameters);
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
