package com.heartsphere.mentis.executor.computeruse;

/**
 * 命令执行器接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface CommandExecutor {
    
    /**
     * 执行命令
     * 
     * @param sessionId 会话ID
     * @param command 命令
     * @param timeout 超时时间（秒）
     * @return 命令执行结果
     */
    CommandResult execute(String sessionId, String command, int timeout);
    
    /**
     * 执行命令（使用默认超时）
     * 
     * @param sessionId 会话ID
     * @param command 命令
     * @return 命令执行结果
     */
    default CommandResult execute(String sessionId, String command) {
        return execute(sessionId, command, 60); // 默认60秒超时
    }
    
    /**
     * 验证命令是否安全
     * 
     * @param command 命令
     * @return 是否安全
     */
    boolean isCommandSafe(String command);
    
    /**
     * 命令执行结果
     */
    class CommandResult {
        private int exitCode;
        private String stdout;
        private String stderr;
        private long executionTime; // 执行时间（毫秒）
        private boolean timeout;
        
        // Getters and Setters
        public int getExitCode() { return exitCode; }
        public void setExitCode(int exitCode) { this.exitCode = exitCode; }
        public String getStdout() { return stdout; }
        public void setStdout(String stdout) { this.stdout = stdout; }
        public String getStderr() { return stderr; }
        public void setStderr(String stderr) { this.stderr = stderr; }
        public long getExecutionTime() { return executionTime; }
        public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }
        public boolean isTimeout() { return timeout; }
        public void setTimeout(boolean timeout) { this.timeout = timeout; }
        
        public boolean isSuccess() {
            return exitCode == 0 && !timeout;
        }
    }
}
