package com.heartsphere.mentis.agent;

import java.util.Map;

/**
 * 意图识别器接口
 * 理解用户自然语言，识别任务意图
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface IntentRecognizer {
    
    /**
     * 识别用户意图
     * 
     * @param userMessage 用户消息
     * @param sessionId 会话ID
     * @return 识别结果
     */
    IntentRecognitionResult recognize(String userMessage, String sessionId);
    
    /**
     * 意图识别结果
     */
    class IntentRecognitionResult {
        private String taskType; // COMMAND, SCRIPT, COMPUTER_USE, CHAT
        private String intent; // 意图描述
        private Map<String, Object> parameters; // 提取的参数
        private double confidence; // 置信度
        
        // Getters and Setters
        public String getTaskType() { return taskType; }
        public void setTaskType(String taskType) { this.taskType = taskType; }
        public String getIntent() { return intent; }
        public void setIntent(String intent) { this.intent = intent; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
    }
}
