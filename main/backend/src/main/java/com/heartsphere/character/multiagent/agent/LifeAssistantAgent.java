package com.heartsphere.character.multiagent.agent;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.BaseAgent;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

/**
 * 生活助手 Agent 基类
 * 
 * 提供生活助手 Agent 的通用功能
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public abstract class LifeAssistantAgent extends BaseAgent {
    
    protected final SkillExecutor skillExecutor;
    protected final Long characterId;
    
    // 技能映射：技能名称 -> 技能ID
    protected final Map<String, String> skillMapping = new HashMap<>();
    
    public LifeAssistantAgent(String id, String name, String description, 
                             Long characterId, SkillExecutor skillExecutor) {
        super(id, name, description);
        this.characterId = characterId;
        this.skillExecutor = skillExecutor;
        
        // 添加通用能力
        addCapability("life-assistant");
    }
    
    /**
     * 注册技能
     * 
     * @param skillName 技能名称（如：time_audit）
     * @param skillId 技能ID
     */
    protected void registerSkill(String skillName, String skillId) {
        skillMapping.put(skillName, skillId);
        addCapability(skillName);
    }
    
    /**
     * 执行技能
     * 
     * @param skillName 技能名称
     * @param parameters 技能参数
     * @return 执行结果
     */
    protected AgentResult executeSkill(String skillName, Map<String, Object> parameters) {
        String skillId = skillMapping.get(skillName);
        if (skillId == null) {
            return AgentResult.failure("技能不存在: " + skillName);
        }
        
        try {
            Long userId = extractUserId(parameters);
            if (userId == null) {
                userId = getUserIdFromContext();
            }
            
            SkillExecutor.SkillExecutionContext context = 
                SkillExecutor.SkillExecutionContext.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .build();
            
            SkillExecutor.SkillExecutionResult result = skillExecutor.execute(
                skillId, 
                parameters != null ? parameters : new HashMap<>(), 
                context
            );
            
            if (result.isSuccess()) {
                return AgentResult.success(result.getResult().toString());
            } else {
                return AgentResult.failure(result.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("执行技能失败: skillName={}, error={}", skillName, e.getMessage(), e);
            return AgentResult.failure("执行技能失败: " + e.getMessage());
        }
    }
    
    /**
     * 从上下文获取用户ID（子类可以覆盖）
     */
    protected Long getUserIdFromContext() {
        // 默认返回null，子类可以覆盖以提供用户ID
        // 如果context中包含userId，可以从context中获取
        return null;
    }
    
    /**
     * 从上下文Map中提取用户ID
     */
    protected Long extractUserId(Map<String, Object> context) {
        if (context == null) {
            return null;
        }
        Object userId = context.get("userId");
        if (userId instanceof Long) {
            return (Long) userId;
        } else if (userId instanceof Number) {
            return ((Number) userId).longValue();
        } else if (userId instanceof String) {
            try {
                return Long.parseLong((String) userId);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    @Override
    public boolean canHandle(String task) {
        // 检查任务是否包含技能关键词
        String taskLower = task.toLowerCase();
        for (String skillName : skillMapping.keySet()) {
            if (taskLower.contains(skillName.replace("_", " "))) {
                return true;
            }
        }
        return super.canHandle(task);
    }
}
