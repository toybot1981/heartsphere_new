package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 财务顾问 Agent - 财务规划和管理
 * 
 * 可以与学习智能体（学小知）协同，提供财务学习和规划建议
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class FinanceAdvisorAgent extends LifeAssistantAgent {
    
    public FinanceAdvisorAgent(SkillExecutor skillExecutor) {
        super(
            "financeadvisor",
            "财务顾问",
            "财务规划和管理顾问，提供理财建议、预算规划和财务教育",
            8L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册财务管理技能（使用占位符）
        registerSkill("budget_planning", "budget_planning");
        registerSkill("expense_tracking", "expense_tracking");
        registerSkill("investment_advice", "investment_advice");
        registerSkill("financial_education", "financial_education");
        registerSkill("debt_management", "debt_management");
        registerSkill("savings_planning", "savings_planning");
        registerSkill("retirement_planning", "retirement_planning");
        registerSkill("tax_planning", "tax_planning");
        
        // 添加能力描述
        addCapability("finance");
        addCapability("financial-planning");
        addCapability("budgeting");
        addCapability("investment");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("财务顾问处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("预算") || taskLower.contains("预算规划")) {
            return executeSkill("budget_planning", parameters);
        } else if (taskLower.contains("支出") || taskLower.contains("消费记录")) {
            return executeSkill("expense_tracking", parameters);
        } else if (taskLower.contains("投资") || taskLower.contains("理财")) {
            return executeSkill("investment_advice", parameters);
        } else if (taskLower.contains("财务学习") || taskLower.contains("财商教育")) {
            return executeSkill("financial_education", parameters);
        } else if (taskLower.contains("债务") || taskLower.contains("还债")) {
            return executeSkill("debt_management", parameters);
        } else if (taskLower.contains("储蓄") || taskLower.contains("存钱")) {
            return executeSkill("savings_planning", parameters);
        } else if (taskLower.contains("退休") || taskLower.contains("养老")) {
            return executeSkill("retirement_planning", parameters);
        } else if (taskLower.contains("税务") || taskLower.contains("税收")) {
            return executeSkill("tax_planning", parameters);
        } else {
            // 默认使用预算规划技能
            return executeSkill("budget_planning", parameters);
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
