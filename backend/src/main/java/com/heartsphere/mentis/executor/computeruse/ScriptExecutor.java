package com.heartsphere.mentis.executor.computeruse;

import java.util.Map;

/**
 * 脚本执行器接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ScriptExecutor {
    
    /**
     * 执行脚本
     * 
     * @param sessionId 会话ID
     * @param script 脚本内容
     * @param language 脚本语言（python, javascript等）
     * @param parameters 脚本参数
     * @param timeout 超时时间（秒）
     * @return 脚本执行结果
     */
    ScriptResult execute(String sessionId, String script, String language, 
                        Map<String, Object> parameters, int timeout);
    
    /**
     * 执行脚本（使用默认超时）
     * 
     * @param sessionId 会话ID
     * @param script 脚本内容
     * @param language 脚本语言
     * @return 脚本执行结果
     */
    default ScriptResult execute(String sessionId, String script, String language) {
        return execute(sessionId, script, language, null, 60);
    }
    
    /**
     * 检查脚本语言是否支持
     * 
     * @param language 脚本语言
     * @return 是否支持
     */
    boolean isLanguageSupported(String language);
    
    /**
     * 脚本执行结果
     */
    class ScriptResult {
        private boolean success;
        private String output;
        private String error;
        private long executionTime; // 执行时间（毫秒）
        private boolean timeout;
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getOutput() { return output; }
        public void setOutput(String output) { this.output = output; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getExecutionTime() { return executionTime; }
        public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }
        public boolean isTimeout() { return timeout; }
        public void setTimeout(boolean timeout) { this.timeout = timeout; }
    }
}
