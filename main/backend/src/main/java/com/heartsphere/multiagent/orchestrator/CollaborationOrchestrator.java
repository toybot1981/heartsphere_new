package com.heartsphere.multiagent.orchestrator;

import com.heartsphere.multiagent.core.Agent;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 协作编排引擎接口
 * 
 * 管理多智能体协作流程
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface CollaborationOrchestrator {
    
    /**
     * 创建协作任务
     * 
     * @param taskDescription 任务描述
     * @param agents 参与的智能体列表
     * @param context 协作上下文
     * @return 协作任务 ID
     */
    String createCollaboration(String taskDescription, List<Agent> agents, 
                              CollaborationContext context);
    
    /**
     * 执行协作任务
     * 
     * @param collaborationId 协作任务 ID
     * @return 执行结果的 Future
     */
    CompletableFuture<CollaborationResult> execute(String collaborationId);
    
    /**
     * 获取协作任务状态
     * 
     * @param collaborationId 协作任务 ID
     * @return 任务状态
     */
    CollaborationStatus getStatus(String collaborationId);
    
    /**
     * 取消协作任务
     * 
     * @param collaborationId 协作任务 ID
     */
    void cancel(String collaborationId);
    
    /**
     * 协作上下文
     */
    class CollaborationContext {
        private String userId;
        private String sessionId;
        private WorkflowMode mode;
        private Map<String, Object> parameters;
        
        public CollaborationContext(String userId, String sessionId) {
            this.userId = userId;
            this.sessionId = sessionId;
            this.mode = WorkflowMode.SEQUENTIAL;
        }
        
        // Getters and Setters
        public String getUserId() {
            return userId;
        }
        
        public void setUserId(String userId) {
            this.userId = userId;
        }
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
        
        public WorkflowMode getMode() {
            return mode;
        }
        
        public void setMode(WorkflowMode mode) {
            this.mode = mode;
        }
        
        public Map<String, Object> getParameters() {
            return parameters;
        }
        
        public void setParameters(Map<String, Object> parameters) {
            this.parameters = parameters;
        }
    }
    
    /**
     * 工作流模式
     */
    enum WorkflowMode {
        SEQUENTIAL,  // 顺序执行
        PARALLEL,   // 并行执行
        CONDITIONAL  // 条件分支
    }
    
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
