package com.heartsphere.mentis.agent;

import com.heartsphere.mentis.ai.util.StreamResponseHandler;
import com.heartsphere.mentis.dto.ChatResponseDTO;

import java.util.List;

/**
 * 响应生成器接口
 * 生成自然语言响应返回给用户
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ResponseGenerator {
    
    /**
     * 生成响应
     * 
     * @param executionResult 执行结果
     * @param sessionId 会话ID
     * @return 生成的响应文本
     */
    String generate(ExecutionResult executionResult, String sessionId);
    
    /**
     * 流式生成响应
     * 
     * @param executionResult 执行结果
     * @param sessionId 会话ID
     * @param messageId 消息ID
     * @param handler 流式响应处理器
     */
    void generateStream(ExecutionResult executionResult, String sessionId, String messageId,
                       StreamResponseHandler<ChatResponseDTO> handler);
    
    /**
     * 执行结果
     */
    class ExecutionResult {
        private String status;
        private List<TaskResult> taskResults;
        private String errorMessage;
        
        // Getters and Setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<TaskResult> getTaskResults() { return taskResults; }
        public void setTaskResults(List<TaskResult> taskResults) { this.taskResults = taskResults; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
    
    /**
     * 任务结果
     */
    class TaskResult {
        private String taskId;
        private String description;
        private String status;
        private String result;
        
        // Getters and Setters
        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
    }
}
