package com.heartsphere.mentis.exception;

/**
 * 任务不存在异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class TaskNotFoundException extends MentisException {
    
    public TaskNotFoundException(String taskId) {
        super("TASK_NOT_FOUND", "任务不存在: " + taskId);
    }
}
