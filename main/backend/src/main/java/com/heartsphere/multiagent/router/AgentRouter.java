package com.heartsphere.multiagent.router;

import com.heartsphere.multiagent.core.Agent;

import java.util.List;

/**
 * 智能体路由接口
 * 
 * 定义智能体路由的通用能力
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AgentRouter {
    
    /**
     * 路由任务到合适的智能体
     * 
     * @param task 任务描述
     * @param context 路由上下文
     * @return 选中的智能体列表
     */
    List<Agent> route(String task, RoutingContext context);
    
    /**
     * 分解任务为子任务
     * 
     * @param task 复杂任务描述
     * @return 子任务列表
     */
    List<SubTask> decompose(String task);
    
    /**
     * 路由上下文
     */
    class RoutingContext {
        private String userId;
        private String sessionId;
        private Object additionalContext;
        
        public RoutingContext(String userId, String sessionId) {
            this.userId = userId;
            this.sessionId = sessionId;
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
        
        public Object getAdditionalContext() {
            return additionalContext;
        }
        
        public void setAdditionalContext(Object additionalContext) {
            this.additionalContext = additionalContext;
        }
    }
    
    /**
     * 子任务
     */
    class SubTask {
        private String taskId;
        private String description;
        private String assignedAgentId;
        
        public SubTask(String taskId, String description) {
            this.taskId = taskId;
            this.description = description;
        }
        
        // Getters and Setters
        public String getTaskId() {
            return taskId;
        }
        
        public void setTaskId(String taskId) {
            this.taskId = taskId;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getAssignedAgentId() {
            return assignedAgentId;
        }
        
        public void setAssignedAgentId(String assignedAgentId) {
            this.assignedAgentId = assignedAgentId;
        }
    }
}
