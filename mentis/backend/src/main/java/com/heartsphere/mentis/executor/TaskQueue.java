package com.heartsphere.mentis.executor;

import java.util.List;
import java.util.Optional;

/**
 * 任务队列接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface TaskQueue {
    
    /**
     * 添加任务到队列
     * 
     * @param task 任务
     */
    void enqueue(TaskItem task);
    
    /**
     * 从队列取出任务
     * 
     * @return 任务项
     */
    Optional<TaskItem> dequeue();
    
    /**
     * 获取队列大小
     * 
     * @return 队列大小
     */
    int size();
    
    /**
     * 是否为空
     * 
     * @return 是否为空
     */
    boolean isEmpty();
    
    /**
     * 获取所有任务
     * 
     * @return 任务列表
     */
    List<TaskItem> getAllTasks();
    
    /**
     * 根据ID获取任务
     * 
     * @param taskId 任务ID
     * @return 任务项
     */
    Optional<TaskItem> getTask(String taskId);
    
    /**
     * 移除任务
     * 
     * @param taskId 任务ID
     */
    void removeTask(String taskId);
    
    /**
     * 任务项
     */
    class TaskItem {
        private String taskId;
        private TaskPlanner.TaskPlan plan;
        private String sessionId;
        private int priority; // 优先级，数字越大优先级越高
        private long createTime;
        
        // Getters and Setters
        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public TaskPlanner.TaskPlan getPlan() { return plan; }
        public void setPlan(TaskPlanner.TaskPlan plan) { this.plan = plan; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public int getPriority() { return priority; }
        public void setPriority(int priority) { this.priority = priority; }
        public long getCreateTime() { return createTime; }
        public void setCreateTime(long createTime) { this.createTime = createTime; }
    }
}
