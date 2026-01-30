package com.heartsphere.multiagent.core;

import java.util.Map;
import java.util.Set;

/**
 * 智能体接口
 * 
 * 定义智能体的通用能力，所有智能体必须实现此接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface Agent {
    
    /**
     * 获取智能体唯一标识
     * 
     * @return 智能体 ID
     */
    String getId();
    
    /**
     * 获取智能体名称
     * 
     * @return 智能体名称
     */
    String getName();
    
    /**
     * 获取智能体描述
     * 
     * @return 智能体描述
     */
    String getDescription();
    
    /**
     * 获取智能体的能力描述
     * 
     * @return 能力集合，用于路由和匹配
     */
    Set<String> getCapabilities();
    
    /**
     * 执行任务
     * 
     * @param task 任务描述
     * @param context 执行上下文
     * @return 执行结果
     */
    AgentResult execute(String task, Map<String, Object> context);
    
    /**
     * 检查是否能够处理指定任务
     * 
     * @param task 任务描述
     * @return 是否能够处理
     */
    boolean canHandle(String task);
    
    /**
     * 获取智能体状态
     * 
     * @return 智能体状态
     */
    AgentStatus getStatus();
    
    /**
     * 智能体状态枚举
     */
    enum AgentStatus {
        IDLE,      // 空闲
        BUSY,      // 忙碌
        ERROR      // 错误
    }
    
    /**
     * 智能体执行结果
     */
    class AgentResult {
        private boolean success;
        private String result;
        private String errorMessage;
        private Map<String, Object> metadata;
        
        public AgentResult(boolean success, String result) {
            this.success = success;
            this.result = result;
        }
        
        public static AgentResult success(String result) {
            return new AgentResult(true, result);
        }
        
        public static AgentResult failure(String errorMessage) {
            AgentResult result = new AgentResult(false, null);
            result.errorMessage = errorMessage;
            return result;
        }
        
        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String getResult() {
            return result;
        }
        
        public void setResult(String result) {
            this.result = result;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
        
        public Map<String, Object> getMetadata() {
            return metadata;
        }
        
        public void setMetadata(Map<String, Object> metadata) {
            this.metadata = metadata;
        }
    }
}
