package com.heartsphere.mentis.executor;

import java.util.List;

/**
 * 任务分解器接口
 * 负责将用户需求分解为可执行的任务步骤
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface TaskDecomposer {
    
    /**
     * 分解任务
     * 
     * @param userRequest 用户请求
     * @param sessionId 会话ID
     * @return 任务步骤列表
     */
    List<TaskStep> decompose(String userRequest, String sessionId);
    
    /**
     * 识别任务类型
     * 
     * @param userRequest 用户请求
     * @return 任务类型（COMMAND, SCRIPT, COMPUTER_USE等）
     */
    String identifyTaskType(String userRequest);
    
    /**
     * 任务步骤
     */
    class TaskStep {
        private String stepId;
        private String taskType;
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
