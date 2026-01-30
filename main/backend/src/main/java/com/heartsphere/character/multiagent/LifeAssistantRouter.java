package com.heartsphere.character.multiagent;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.router.AgentRouter;
import com.heartsphere.multiagent.router.AgentRouter.SubTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 生活助手路由策略
 * 
 * 实现生活助手特定的路由逻辑
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LifeAssistantRouter implements AgentRouter {
    
    private final AgentRegistry agentRegistry;
    
    // 生活助手角色映射
    private static final Map<String, String> CHARACTER_MAPPING = Map.of(
        "时小光", "time-management",
        "康小健", "health",
        "学小知", "learning",
        "心小暖", "emotion",
        "心小安", "mental-health",
        "暖小阳", "companionship"
    );
    
    // 关键词到能力的映射
    private static final Map<String, Set<String>> KEYWORD_TO_CAPABILITIES = Map.ofEntries(
        Map.entry("时间", Set.of("time-management")),
        Map.entry("效率", Set.of("time-management")),
        Map.entry("拖延", Set.of("time-management")),
        Map.entry("健康", Set.of("health")),
        Map.entry("运动", Set.of("health")),
        Map.entry("饮食", Set.of("health")),
        Map.entry("学习", Set.of("learning")),
        Map.entry("成长", Set.of("learning")),
        Map.entry("情绪", Set.of("emotion", "mental-health")),
        Map.entry("心理", Set.of("mental-health")),
        Map.entry("陪伴", Set.of("companionship", "emotion")),
        // 新增智能体的关键词映射
        Map.entry("工作", Set.of("work-management", "productivity")),
        Map.entry("任务", Set.of("work-management", "task-planning")),
        Map.entry("项目", Set.of("work-management", "project-management")),
        Map.entry("财务", Set.of("finance", "financial-planning")),
        Map.entry("理财", Set.of("finance", "investment")),
        Map.entry("预算", Set.of("finance", "budgeting")),
        Map.entry("旅行", Set.of("travel", "travel-planning")),
        Map.entry("行程", Set.of("travel", "itinerary")),
        Map.entry("创意", Set.of("creative", "creativity")),
        Map.entry("灵感", Set.of("creative", "inspiration")),
        Map.entry("创作", Set.of("creative", "idea-generation"))
    );
    
    @Override
    public List<Agent> route(String task, RoutingContext context) {
        log.info("Routing task: {}", task);
        
        // 分析任务，提取所需能力
        Set<String> requiredCapabilities = extractCapabilities(task);
        
        if (requiredCapabilities.isEmpty()) {
            log.warn("No capabilities found for task: {}", task);
            return Collections.emptyList();
        }
        
        // 查找具备这些能力的智能体
        List<Agent> agents = agentRegistry.findAgentsByCapabilities(requiredCapabilities);
        
        if (agents.isEmpty()) {
            // 尝试按单个能力查找
            List<Agent> allFoundAgents = new ArrayList<>();
            for (String capability : requiredCapabilities) {
                List<Agent> found = agentRegistry.findAgentsByCapability(capability);
                allFoundAgents.addAll(found);
            }
            // 去重
            agents = allFoundAgents.stream()
                .distinct()
                .collect(Collectors.toList());
        }
        
        log.info("Routed to {} agents: {}", agents.size(), 
            agents.stream().map(Agent::getName).collect(Collectors.toList()));
        
        return agents;
    }
    
    @Override
    public List<SubTask> decompose(String task) {
        log.info("Decomposing task: {}", task);
        
        // 提取所需能力
        Set<String> requiredCapabilities = extractCapabilities(task);
        
        // 为每个能力创建一个子任务
        List<SubTask> subTasks = new ArrayList<>();
        int taskIndex = 1;
        
        for (String capability : requiredCapabilities) {
            // 查找具备该能力的智能体
            List<Agent> agents = agentRegistry.findAgentsByCapability(capability);
            if (!agents.isEmpty()) {
                SubTask subTask = new SubTask(
                    "subtask-" + taskIndex++,
                    "处理" + capability + "相关任务: " + task
                );
                // 选择第一个可用的智能体
                subTask.setAssignedAgentId(agents.get(0).getId());
                subTasks.add(subTask);
            }
        }
        
        log.info("Decomposed into {} subtasks", subTasks.size());
        return subTasks;
    }
    
    /**
     * 从任务描述中提取所需能力
     */
    private Set<String> extractCapabilities(String task) {
        Set<String> capabilities = new HashSet<>();
        String taskLower = task.toLowerCase();
        
        // 检查关键词
        for (Map.Entry<String, Set<String>> entry : KEYWORD_TO_CAPABILITIES.entrySet()) {
            if (taskLower.contains(entry.getKey())) {
                capabilities.addAll(entry.getValue());
            }
        }
        
        // 检查角色名称
        for (Map.Entry<String, String> entry : CHARACTER_MAPPING.entrySet()) {
            if (task.contains(entry.getKey())) {
                capabilities.add(entry.getValue());
            }
        }
        
        return capabilities;
    }
}
