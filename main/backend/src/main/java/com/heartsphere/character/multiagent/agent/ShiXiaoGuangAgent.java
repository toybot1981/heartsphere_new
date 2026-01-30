package com.heartsphere.character.multiagent.agent;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 时小光 Agent - 时间管理导师
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class ShiXiaoGuangAgent extends LifeAssistantAgent {
    
    public ShiXiaoGuangAgent(SkillExecutor skillExecutor) {
        super(
            "shixiaoguang",
            "时小光",
            "时间管理导师，帮助提高效率，克服拖延症",
            1L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册8个时间管理技能
        registerSkill("time_audit", "time_audit");
        registerSkill("task_breakdown", "task_breakdown");
        registerSkill("pomodoro_assistant", "pomodoro_assistant");
        registerSkill("priority_matrix", "priority_matrix");
        registerSkill("habit_tracker", "habit_tracker");
        registerSkill("goal_setting_tracking", "goal_setting_tracking");
        registerSkill("procrastination_diagnosis", "procrastination_diagnosis");
        registerSkill("time_blocking", "time_blocking");
        
        // 添加能力描述
        addCapability("time-management");
        addCapability("efficiency");
        addCapability("procrastination-help");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("时小光处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("时间审计") || taskLower.contains("时间去哪了") || 
            taskLower.contains("时间使用")) {
            return executeSkill("time_audit", parameters);
        } else if (taskLower.contains("任务分解") || taskLower.contains("wbs") || 
                   taskLower.contains("项目规划")) {
            return executeSkill("task_breakdown", parameters);
        } else if (taskLower.contains("番茄") || taskLower.contains("专注")) {
            return executeSkill("pomodoro_assistant", parameters);
        } else if (taskLower.contains("优先级") || taskLower.contains("紧急重要")) {
            return executeSkill("priority_matrix", parameters);
        } else if (taskLower.contains("习惯") || taskLower.contains("打卡")) {
            return executeSkill("habit_tracker", parameters);
        } else if (taskLower.contains("目标") || taskLower.contains("smart")) {
            return executeSkill("goal_setting_tracking", parameters);
        } else if (taskLower.contains("拖延") || taskLower.contains("效率问题")) {
            return executeSkill("procrastination_diagnosis", parameters);
        } else if (taskLower.contains("时间块") || taskLower.contains("日程规划")) {
            return executeSkill("time_blocking", parameters);
        } else {
            // 默认使用任务分解技能
            return executeSkill("task_breakdown", parameters);
        }
    }
    
    /**
     * 从任务和上下文中提取参数
     */
    private Map<String, Object> extractParameters(String task, Map<String, Object> context) {
        Map<String, Object> parameters = new HashMap<>();
        if (context != null) {
            parameters.putAll(context);
        }
        parameters.put("task", task);
        return parameters;
    }
}
