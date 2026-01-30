package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 暖小阳 Agent - 情感陪伴伙伴
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class NuanXiaoYangAgent extends LifeAssistantAgent {
    
    public NuanXiaoYangAgent(SkillExecutor skillExecutor) {
        super(
            "nuanxiaoyang",
            "暖小阳",
            "情感陪伴伙伴，提供温暖的情感陪伴和支持",
            6L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册8个情感陪伴技能
        registerSkill("warm_companionship", "warm_companionship");
        registerSkill("listening_support", "listening_support");
        registerSkill("encouragement", "encouragement");
        registerSkill("emotional_validation", "emotional_validation");
        registerSkill("daily_care", "daily_care");
        registerSkill("celebration_sharing", "celebration_sharing");
        registerSkill("difficulty_accompaniment", "difficulty_accompaniment");
        registerSkill("life_guidance", "life_guidance");
        
        // 添加能力描述
        addCapability("companionship");
        addCapability("emotional-support");
        addCapability("warmth");
        addCapability("care");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("暖小阳处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("陪伴") || taskLower.contains("温暖")) {
            return executeSkill("warm_companionship", parameters);
        } else if (taskLower.contains("倾听") || taskLower.contains("聆听")) {
            return executeSkill("listening_support", parameters);
        } else if (taskLower.contains("鼓励") || taskLower.contains("激励")) {
            return executeSkill("encouragement", parameters);
        } else if (taskLower.contains("情感确认") || taskLower.contains("理解感受")) {
            return executeSkill("emotional_validation", parameters);
        } else if (taskLower.contains("日常关怀") || taskLower.contains("生活关怀")) {
            return executeSkill("daily_care", parameters);
        } else if (taskLower.contains("庆祝") || taskLower.contains("分享喜悦")) {
            return executeSkill("celebration_sharing", parameters);
        } else if (taskLower.contains("困难陪伴") || taskLower.contains("困境支持")) {
            return executeSkill("difficulty_accompaniment", parameters);
        } else if (taskLower.contains("生活指导") || taskLower.contains("人生指导")) {
            return executeSkill("life_guidance", parameters);
        } else {
            // 默认使用温暖陪伴
            return executeSkill("warm_companionship", parameters);
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
