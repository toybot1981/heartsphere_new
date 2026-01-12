package com.heartsphere.mentis.agentscope.multiagent;

import java.util.List;
import java.util.Map;

/**
 * 多智能体协作服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MultiAgentCollaborationService {
    
    /**
     * 创建协作任务
     * 
     * @param taskDescription 任务描述
     * @param agentIds 参与的智能体 ID 列表
     * @return 协作任务 ID
     */
    String createCollaboration(String taskDescription, List<String> agentIds);
    
    /**
     * 执行协作任务
     * 
     * @param collaborationId 协作任务 ID
     * @return 执行结果
     */
    CollaborationResult executeCollaboration(String collaborationId);
    
    /**
     * 获取协作任务状态
     * 
     * @param collaborationId 协作任务 ID
     * @return 任务状态
     */
    CollaborationStatus getCollaborationStatus(String collaborationId);
    
    /**
     * 协作结果
     */
    class CollaborationResult {
        private String collaborationId;
        private boolean success;
        private String result;
        private Map<String, Object> agentResults;
        private List<String> errors;
        
        // Getters and Setters
        public String getCollaborationId() {
            return collaborationId;
        }
        
        public void setCollaborationId(String collaborationId) {
            this.collaborationId = collaborationId;
        }
        
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
        
        public Map<String, Object> getAgentResults() {
            return agentResults;
        }
        
        public void setAgentResults(Map<String, Object> agentResults) {
            this.agentResults = agentResults;
        }
        
        public List<String> getErrors() {
            return errors;
        }
        
        public void setErrors(List<String> errors) {
            this.errors = errors;
        }
    }
    
    /**
     * 协作状态
     */
    enum CollaborationStatus {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
