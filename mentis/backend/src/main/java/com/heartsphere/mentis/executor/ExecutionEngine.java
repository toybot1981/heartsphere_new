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
     * @return 执行结果
     */
    ExecutionResult execute(TaskPlanner.TaskPlan plan, String sessionId);
    
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
        private String status;
        private int currentStep;
        private int totalSteps;
        private String currentStepDescription;
        
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
    }
}
