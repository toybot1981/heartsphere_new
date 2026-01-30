package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 心小暖 Agent - 情绪陪伴师
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class XinXiaoNuanAgent extends LifeAssistantAgent {
    
    public XinXiaoNuanAgent(SkillExecutor skillExecutor) {
        super(
            "xinxiaonuan",
            "心小暖",
            "情绪陪伴师，提供情绪支持和陪伴",
            4L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册8个情绪陪伴技能
        registerSkill("emotion_support", "emotion_support");
        registerSkill("emotion_recognition", "emotion_recognition");
        registerSkill("emotion_regulation", "emotion_regulation");
        registerSkill("comforting_conversation", "comforting_conversation");
        registerSkill("positive_thinking_guidance", "positive_thinking_guidance");
        registerSkill("empathy_expression", "empathy_expression");
        registerSkill("emotional_accompaniment", "emotional_accompaniment");
        registerSkill("mood_tracking", "mood_tracking");
        
        // 添加能力描述
        addCapability("emotion");
        addCapability("emotional-support");
        addCapability("companionship");
        addCapability("empathy");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("心小暖处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("情绪支持") || taskLower.contains("情感支持")) {
            return executeSkill("emotion_support", parameters);
        } else if (taskLower.contains("情绪识别") || taskLower.contains("情感识别")) {
            return executeSkill("emotion_recognition", parameters);
        } else if (taskLower.contains("情绪调节") || taskLower.contains("情绪管理")) {
            return executeSkill("emotion_regulation", parameters);
        } else if (taskLower.contains("安慰") || taskLower.contains("陪伴")) {
            return executeSkill("comforting_conversation", parameters);
        } else if (taskLower.contains("积极思维") || taskLower.contains("正面思考")) {
            return executeSkill("positive_thinking_guidance", parameters);
        } else if (taskLower.contains("共情") || taskLower.contains("理解")) {
            return executeSkill("empathy_expression", parameters);
        } else if (taskLower.contains("情感陪伴")) {
            return executeSkill("emotional_accompaniment", parameters);
        } else if (taskLower.contains("情绪追踪") || taskLower.contains("心情记录")) {
            return executeSkill("mood_tracking", parameters);
        } else {
            // 默认使用情绪支持
            return executeSkill("emotion_support", parameters);
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
