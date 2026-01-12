package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisTask;
import com.heartsphere.mentis.dto.TaskExecuteRequestDTO;

import java.util.List;

/**
 * Mentis 任务管理服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MentisTaskService {
    
    /**
     * 创建任务
     * 
     * @param sessionId 会话ID
     * @param request 任务创建请求
     * @return 创建的任务
     */
    MentisTask createTask(String sessionId, TaskExecuteRequestDTO request);
    
    /**
     * 执行任务
     * 
     * @param taskId 任务ID
     * @return 任务执行结果
     */
    TaskExecutionResult executeTask(String taskId);
    
    /**
     * 获取任务
     * 
     * @param taskId 任务ID
     * @return 任务
     */
    MentisTask getTask(String taskId);
    
    /**
     * 获取会话的所有任务
     * 
     * @param sessionId 会话ID
     * @return 任务列表
     */
    List<MentisTask> getSessionTasks(String sessionId);
    
    /**
     * 取消任务
     * 
     * @param taskId 任务ID
     */
    void cancelTask(String taskId);
    
    /**
     * 任务执行结果
     */
    class TaskExecutionResult {
        private String taskId;
        private String status;
        private String result;
        private String errorMessage;
        
        // Getters and Setters
        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
}
