package com.heartsphere.mentis.executor;

/**
 * 错误恢复策略接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ErrorRecoveryStrategy {
    
    /**
     * 是否可以恢复
     * 
     * @param error 错误类型
     * @return 是否可以恢复
     */
    boolean canRecover(String error);
    
    /**
     * 执行恢复操作
     * 
     * @param context 恢复上下文
     * @return 恢复结果
     */
    RecoveryResult recover(RecoveryContext context);
    
    /**
     * 恢复上下文
     */
    class RecoveryContext {
        private String executionId;
        private String sessionId;
        private String errorType;
        private String errorMessage;
        private Object errorDetails;
        
        // Getters and Setters
        public String getExecutionId() { return executionId; }
        public void setExecutionId(String executionId) { this.executionId = executionId; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getErrorType() { return errorType; }
        public void setErrorType(String errorType) { this.errorType = errorType; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public Object getErrorDetails() { return errorDetails; }
        public void setErrorDetails(Object errorDetails) { this.errorDetails = errorDetails; }
    }
    
    /**
     * 恢复结果
     */
    class RecoveryResult {
        private boolean success;
        private String message;
        private Object recoveredState;
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Object getRecoveredState() { return recoveredState; }
        public void setRecoveredState(Object recoveredState) { this.recoveredState = recoveredState; }
    }
}
