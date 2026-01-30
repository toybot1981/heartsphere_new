package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 工作助手 Agent - 工作管理和效率提升
 * 
 * 可以与时间管理智能体（时小光）协同，提供工作规划和时间管理建议
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class WorkAssistantAgent extends LifeAssistantAgent {
    
    public WorkAssistantAgent(SkillExecutor skillExecutor) {
        super(
            "workassistant",
            "工作助手",
            "工作管理和效率提升助手，提供工作规划、任务管理和效率优化建议",
            7L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册工作管理技能（使用占位符）
        registerSkill("work_planning", "work_planning");
        registerSkill("task_management", "task_management");
        registerSkill("project_coordination", "project_coordination");
        registerSkill("meeting_optimization", "meeting_optimization");
        registerSkill("workflow_optimization", "workflow_optimization");
        registerSkill("deadline_management", "deadline_management");
        registerSkill("team_collaboration", "team_collaboration");
        registerSkill("work_life_balance", "work_life_balance");
        
        // 添加能力描述
        addCapability("work-management");
        addCapability("productivity");
        addCapability("task-planning");
        addCapability("project-management");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("工作助手处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("工作规划") || taskLower.contains("工作计划")) {
            return executeSkill("work_planning", parameters);
        } else if (taskLower.contains("任务管理") || taskLower.contains("待办")) {
            return executeSkill("task_management", parameters);
        } else if (taskLower.contains("项目协调") || taskLower.contains("项目管理")) {
            return executeSkill("project_coordination", parameters);
        } else if (taskLower.contains("会议") || taskLower.contains("会议优化")) {
            return executeSkill("meeting_optimization", parameters);
        } else if (taskLower.contains("工作流") || taskLower.contains("流程优化")) {
            return executeSkill("workflow_optimization", parameters);
        } else if (taskLower.contains("截止日期") || taskLower.contains("deadline")) {
            return executeSkill("deadline_management", parameters);
        } else if (taskLower.contains("团队协作") || taskLower.contains("协作")) {
            return executeSkill("team_collaboration", parameters);
        } else if (taskLower.contains("工作生活平衡") || taskLower.contains("平衡")) {
            return executeSkill("work_life_balance", parameters);
        } else {
            // 默认使用工作规划技能
            return executeSkill("work_planning", parameters);
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
