package com.heartsphere.mentis.executor;

/**
 * Computer-Use 执行器接口
 * 在虚拟机中执行 Computer-Use 操作
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ComputerUseExecutor {
    
    /**
     * 执行命令
     * 
     * @param sessionId 会话ID
     * @param command 命令
     * @return 命令执行结果
     */
    CommandResult executeCommand(String sessionId, String command);
    
    /**
     * 执行脚本
     * 
     * @param sessionId 会话ID
     * @param script 脚本内容
     * @param language 脚本语言（python, javascript等）
     * @return 脚本执行结果
     */
    ScriptResult executeScript(String sessionId, String script, String language);
    
    /**
     * GUI 自动化操作
     * 
     * @param sessionId 会话ID
     * @param action GUI操作
     * @return GUI操作结果
     */
    GuiActionResult performGuiAction(String sessionId, GuiAction action);
    
    /**
     * 命令执行结果
     */
    class CommandResult {
        private int exitCode;
        private String stdout;
        private String stderr;
        
        // Getters and Setters
        public int getExitCode() { return exitCode; }
        public void setExitCode(int exitCode) { this.exitCode = exitCode; }
        public String getStdout() { return stdout; }
        public void setStdout(String stdout) { this.stdout = stdout; }
        public String getStderr() { return stderr; }
        public void setStderr(String stderr) { this.stderr = stderr; }
    }
    
    /**
     * 脚本执行结果
     */
    class ScriptResult {
        private boolean success;
        private String output;
        private String error;
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getOutput() { return output; }
        public void setOutput(String output) { this.output = output; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
    
    /**
     * GUI 操作
     */
    class GuiAction {
        private String actionType; // CLICK, TYPE, SCROLL, SCREENSHOT
        private String target; // 目标元素或坐标
        private String value; // 操作的值（如输入文本）
        
        // Getters and Setters
        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
    
    /**
     * GUI 操作结果
     */
    class GuiActionResult {
        private boolean success;
        private String screenshot; // 截图URL或base64
        private String message;
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getScreenshot() { return screenshot; }
        public void setScreenshot(String screenshot) { this.screenshot = screenshot; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
