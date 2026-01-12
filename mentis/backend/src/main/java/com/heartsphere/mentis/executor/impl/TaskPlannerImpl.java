package com.heartsphere.mentis.executor.impl;

import com.heartsphere.mentis.executor.TaskDecomposer;
import com.heartsphere.mentis.executor.TaskPlanner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 任务规划器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskPlannerImpl implements TaskPlanner {
    
    private final TaskDecomposer taskDecomposer;
    
    @Override
    public TaskPlan planTask(String userRequest, String sessionId) {
        log.info("规划任务: sessionId={}, request={}", sessionId, userRequest);
        
        try {
            // 1. 分解任务为步骤
            List<TaskDecomposer.TaskStep> decomposedSteps = taskDecomposer.decompose(userRequest, sessionId);
            
            // 2. 转换为 TaskPlan 的 TaskStep
            List<TaskStep> steps = convertSteps(decomposedSteps);
            
            // 3. 分析依赖关系
            analyzeDependencies(steps);
            
            // 4. 编排执行顺序
            List<TaskStep> orderedSteps = orderSteps(steps);
            
            // 5. 创建任务计划
            TaskPlan plan = new TaskPlan();
            plan.setPlanId("plan_" + System.currentTimeMillis());
            plan.setOriginalRequest(userRequest);
            plan.setSteps(orderedSteps);
            plan.setStatus("PLANNED");
            
            // 6. 验证任务
            if (validateTask(plan)) {
                plan.setStatus("VALIDATED");
            } else {
                plan.setStatus("INVALID");
            }
            
            return plan;
            
        } catch (Exception e) {
            log.error("任务规划失败: sessionId={}", sessionId, e);
            throw new RuntimeException("任务规划失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean validateTask(TaskPlan plan) {
        log.debug("验证任务计划: planId={}", plan.getPlanId());
        
        if (plan == null || plan.getSteps() == null || plan.getSteps().isEmpty()) {
            return false;
        }
        
        // 验证每个步骤
        for (TaskStep step : plan.getSteps()) {
            if (step.getTaskType() == null || step.getDescription() == null) {
                return false;
            }
            
            // 验证依赖关系
            if (step.getDependencies() != null) {
                Set<String> stepIds = new HashSet<>();
                for (TaskStep s : plan.getSteps()) {
                    stepIds.add(s.getStepId());
                }
                
                for (String depId : step.getDependencies()) {
                    if (!stepIds.contains(depId)) {
                        log.warn("任务步骤依赖不存在: stepId={}, depId={}", step.getStepId(), depId);
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * 转换步骤类型
     */
    private List<TaskStep> convertSteps(List<TaskDecomposer.TaskStep> decomposedSteps) {
        List<TaskStep> steps = new ArrayList<>();
        
        for (TaskDecomposer.TaskStep decomposed : decomposedSteps) {
            TaskStep step = new TaskStep();
            step.setStepId(decomposed.getStepId());
            step.setTaskType(decomposed.getTaskType());
            step.setDescription(decomposed.getDescription());
            step.setCommand(decomposed.getCommand());
            step.setOrder(decomposed.getOrder());
            step.setDependencies(decomposed.getDependencies() != null ? 
                    new ArrayList<>(decomposed.getDependencies()) : new ArrayList<>());
            steps.add(step);
        }
        
        return steps;
    }
    
    /**
     * 分析依赖关系
     */
    private void analyzeDependencies(List<TaskStep> steps) {
        // 创建步骤映射
        Map<String, TaskStep> stepMap = new HashMap<>();
        for (TaskStep step : steps) {
            stepMap.put(step.getStepId(), step);
        }
        
        // 分析依赖关系，确保依赖的步骤在前面
        for (TaskStep step : steps) {
            if (step.getDependencies() != null && !step.getDependencies().isEmpty()) {
                // 计算最小顺序号
                int minOrder = 0;
                for (String depId : step.getDependencies()) {
                    TaskStep depStep = stepMap.get(depId);
                    if (depStep != null && depStep.getOrder() > minOrder) {
                        minOrder = depStep.getOrder();
                    }
                }
                
                // 确保当前步骤的顺序大于所有依赖
                if (step.getOrder() <= minOrder) {
                    step.setOrder(minOrder + 1);
                }
            }
        }
    }
    
    /**
     * 编排执行顺序
     */
    private List<TaskStep> orderSteps(List<TaskStep> steps) {
        // 按照 order 排序
        steps.sort(Comparator.comparingInt(TaskStep::getOrder));
        
        // 如果有依赖关系，需要进一步调整
        List<TaskStep> ordered = new ArrayList<>();
        Set<String> completed = new HashSet<>();
        
        while (ordered.size() < steps.size()) {
            boolean progress = false;
            
            for (TaskStep step : steps) {
                if (ordered.contains(step)) {
                    continue;
                }
                
                // 检查依赖是否都已完成
                if (step.getDependencies() == null || step.getDependencies().isEmpty() ||
                    completed.containsAll(step.getDependencies())) {
                    ordered.add(step);
                    completed.add(step.getStepId());
                    progress = true;
                }
            }
            
            // 如果无法继续，说明有循环依赖
            if (!progress) {
                log.warn("检测到循环依赖，按原始顺序执行");
                for (TaskStep step : steps) {
                    if (!ordered.contains(step)) {
                        ordered.add(step);
                    }
                }
                break;
            }
        }
        
        return ordered;
    }
}
