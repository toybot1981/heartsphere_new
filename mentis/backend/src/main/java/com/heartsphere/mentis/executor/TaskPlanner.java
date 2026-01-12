package com.heartsphere.mentis.executor;

import java.util.List;

/**
 * 任务规划器接口
 * 负责将用户需求分解为可执行的任务步骤
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface TaskPlanner {
    
    /**
     * 规划任务
     * 
     * @param userRequest 用户请求
     * @param sessionId 会话ID
     * @return 任务计划
     */
    TaskPlan planTask(String userRequest, String sessionId);
    
    /**
     * 验证任务可执行性
     * 
     * @param plan 任务计划
     * @return 是否可执行
     */
    boolean validateTask(TaskPlan plan);
    
    /**
     * 任务计划
     */
    class TaskPlan {
        private String planId;
        private String originalRequest;
        private List<TaskStep> steps;
        private String status; // PLANNED, VALIDATED, INVALID
        
        // Getters and Setters
        public String getPlanId() { return planId; }
        public void setPlanId(String planId) { this.planId = planId; }
        public String getOriginalRequest() { return originalRequest; }
        public void setOriginalRequest(String originalRequest) { this.originalRequest = originalRequest; }
        public List<TaskStep> getSteps() { return steps; }
        public void setSteps(List<TaskStep> steps) { this.steps = steps; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    /**
     * 任务步骤
     */
    class TaskStep {
        private String stepId;
        private String taskType; // COMMAND, SCRIPT, COMPUTER_USE
        private String description;
        private String command;
        private int order;
        private List<String> dependencies;
        
        // Getters and Setters
        public String getStepId() { return stepId; }
        public void setStepId(String stepId) { this.stepId = stepId; }
        public String getTaskType() { return taskType; }
        public void setTaskType(String taskType) { this.taskType = taskType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        public int getOrder() { return order; }
        public void setOrder(int order) { this.order = order; }
        public List<String> getDependencies() { return dependencies; }
        public void setDependencies(List<String> dependencies) { this.dependencies = dependencies; }
    }
}
