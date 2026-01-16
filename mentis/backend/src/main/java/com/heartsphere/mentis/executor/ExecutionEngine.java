package com.heartsphere.mentis.executor;

/**
 * 执行引擎接口
 * 负责任务的实际执行
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ExecutionEngine {
    
    /**
     * 执行任务计划
     * 
     * @param plan 任务计划
     * @param sessionId 会话ID
     * @param messageId 关联的用户消息ID（用于任务与对话关联）
     * @return 执行结果
     */
    ExecutionResult execute(TaskPlanner.TaskPlan plan, String sessionId, String messageId);
    
    /**
     * 获取执行状态
     * 
     * @param executionId 执行ID
     * @return 执行状态
     */
    ExecutionStatus getStatus(String executionId);
    
    /**
     * 执行结果
     */
    class ExecutionResult {
        private String executionId;
        private String status; // RUNNING, COMPLETED, FAILED
        private String result;
        private String errorMessage;
        
        // Getters and Setters
        public String getExecutionId() { return executionId; }
        public void setExecutionId(String executionId) { this.executionId = executionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
    
    /**
     * 执行状态
     */
    class ExecutionStatus {
        private String executionId;
        private String status; // PENDING, RUNNING, COMPLETED, FAILED
        private int currentStep;
        private int totalSteps;
        private String currentStepDescription;
        private Long startTime; // 开始时间（毫秒时间戳）
        private Long currentStepStartTime; // 当前步骤开始时间
        private Long endTime; // 结束时间
        private String vmId; // 关联的虚拟机ID
        private String vmScreenshot; // 虚拟机屏幕截图（base64或URL）
        
        // Getters and Setters
        public String getExecutionId() { return executionId; }
        public void setExecutionId(String executionId) { this.executionId = executionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getCurrentStep() { return currentStep; }
        public void setCurrentStep(int currentStep) { this.currentStep = currentStep; }
        public int getTotalSteps() { return totalSteps; }
        public void setTotalSteps(int totalSteps) { this.totalSteps = totalSteps; }
        public String getCurrentStepDescription() { return currentStepDescription; }
        public void setCurrentStepDescription(String currentStepDescription) { this.currentStepDescription = currentStepDescription; }
        public Long getStartTime() { return startTime; }
        public void setStartTime(Long startTime) { this.startTime = startTime; }
        public Long getCurrentStepStartTime() { return currentStepStartTime; }
        public void setCurrentStepStartTime(Long currentStepStartTime) { this.currentStepStartTime = currentStepStartTime; }
        public Long getEndTime() { return endTime; }
        public void setEndTime(Long endTime) { this.endTime = endTime; }
        public String getVmId() { return vmId; }
        public void setVmId(String vmId) { this.vmId = vmId; }
        public String getVmScreenshot() { return vmScreenshot; }
        public void setVmScreenshot(String vmScreenshot) { this.vmScreenshot = vmScreenshot; }
    }
}
