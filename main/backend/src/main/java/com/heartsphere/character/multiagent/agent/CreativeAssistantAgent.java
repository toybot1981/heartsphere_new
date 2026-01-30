package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 创意助手 Agent - 创意工作和灵感激发
 * 
 * 可以与情绪智能体（心小暖）协同，提供创意工作和情绪支持
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class CreativeAssistantAgent extends LifeAssistantAgent {
    
    public CreativeAssistantAgent(SkillExecutor skillExecutor) {
        super(
            "creativeassistant",
            "创意助手",
            "创意工作和灵感激发助手，提供创意建议、灵感激发和创作支持",
            10L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册创意工作技能（使用占位符）
        registerSkill("idea_generation", "idea_generation");
        registerSkill("creative_writing", "creative_writing");
        registerSkill("brainstorming", "brainstorming");
        registerSkill("design_suggestions", "design_suggestions");
        registerSkill("inspiration_curation", "inspiration_curation");
        registerSkill("creative_block_help", "creative_block_help");
        registerSkill("artistic_guidance", "artistic_guidance");
        registerSkill("portfolio_review", "portfolio_review");
        
        // 添加能力描述
        addCapability("creative");
        addCapability("creativity");
        addCapability("idea-generation");
        addCapability("artistic");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("创意助手处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("创意") || taskLower.contains("想法") || taskLower.contains("灵感")) {
            return executeSkill("idea_generation", parameters);
        } else if (taskLower.contains("写作") || taskLower.contains("文案")) {
            return executeSkill("creative_writing", parameters);
        } else if (taskLower.contains("头脑风暴") || taskLower.contains("brainstorming")) {
            return executeSkill("brainstorming", parameters);
        } else if (taskLower.contains("设计") || taskLower.contains("设计方案")) {
            return executeSkill("design_suggestions", parameters);
        } else if (taskLower.contains("灵感收集") || taskLower.contains("参考")) {
            return executeSkill("inspiration_curation", parameters);
        } else if (taskLower.contains("创意瓶颈") || taskLower.contains("卡住")) {
            return executeSkill("creative_block_help", parameters);
        } else if (taskLower.contains("艺术") || taskLower.contains("创作指导")) {
            return executeSkill("artistic_guidance", parameters);
        } else if (taskLower.contains("作品集") || taskLower.contains("portfolio")) {
            return executeSkill("portfolio_review", parameters);
        } else {
            // 默认使用创意生成技能
            return executeSkill("idea_generation", parameters);
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
