package com.heartsphere.character.multiagent.agent;

import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 旅行规划师 Agent - 旅行规划和管理
 * 
 * 可以与健康智能体（康小健）协同，提供旅行规划和健康建议
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class TravelPlannerAgent extends LifeAssistantAgent {
    
    public TravelPlannerAgent(SkillExecutor skillExecutor) {
        super(
            "travelplanner",
            "旅行规划师",
            "旅行规划和管理助手，提供行程规划、目的地推荐和旅行健康建议",
            9L, // TODO: 从数据库获取实际的角色ID
            skillExecutor
        );
        
        // 注册旅行规划技能（使用占位符）
        registerSkill("itinerary_planning", "itinerary_planning");
        registerSkill("destination_recommendation", "destination_recommendation");
        registerSkill("budget_estimation", "budget_estimation");
        registerSkill("accommodation_booking", "accommodation_booking");
        registerSkill("travel_health_tips", "travel_health_tips");
        registerSkill("safety_guidance", "safety_guidance");
        registerSkill("local_culture_guide", "local_culture_guide");
        registerSkill("travel_packing_list", "travel_packing_list");
        
        // 添加能力描述
        addCapability("travel");
        addCapability("travel-planning");
        addCapability("itinerary");
        addCapability("tourism");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        log.info("旅行规划师处理任务: {}", task);
        
        String taskLower = task.toLowerCase();
        Map<String, Object> parameters = extractParameters(task, context);
        
        // 根据任务内容选择技能
        if (taskLower.contains("行程") || taskLower.contains("路线")) {
            return executeSkill("itinerary_planning", parameters);
        } else if (taskLower.contains("目的地") || taskLower.contains("推荐")) {
            return executeSkill("destination_recommendation", parameters);
        } else if (taskLower.contains("预算") || taskLower.contains("费用")) {
            return executeSkill("budget_estimation", parameters);
        } else if (taskLower.contains("住宿") || taskLower.contains("酒店")) {
            return executeSkill("accommodation_booking", parameters);
        } else if (taskLower.contains("健康") || taskLower.contains("旅行健康")) {
            return executeSkill("travel_health_tips", parameters);
        } else if (taskLower.contains("安全") || taskLower.contains("注意事项")) {
            return executeSkill("safety_guidance", parameters);
        } else if (taskLower.contains("文化") || taskLower.contains("当地")) {
            return executeSkill("local_culture_guide", parameters);
        } else if (taskLower.contains("打包") || taskLower.contains("行李")) {
            return executeSkill("travel_packing_list", parameters);
        } else {
            // 默认使用行程规划技能
            return executeSkill("itinerary_planning", parameters);
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
