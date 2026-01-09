package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisTask;
import com.heartsphere.mentis.dto.TaskExecuteRequestDTO;
import com.heartsphere.mentis.repository.MentisTaskRepository;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Mentis 任务管理服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MentisTaskServiceImpl implements MentisTaskService {
    
    private final MentisTaskRepository taskRepository;
    private final MentisSessionRepository sessionRepository;
    // TODO: 注入执行引擎
    // private final ExecutionEngine executionEngine;
    
    @Override
    @Transactional
    public MentisTask createTask(String sessionId, TaskExecuteRequestDTO request) {
        log.info("创建任务: sessionId={}, taskType={}", sessionId, request.getTaskType());
        
        var session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        MentisTask task = new MentisTask();
        task.setTaskId("task_" + UUID.randomUUID().toString().replace("-", ""));
        task.setSession(session);
        task.setTaskType(request.getTaskType());
        task.setDescription(request.getDescription());
        task.setCommand(request.getCommand());
        task.setStatus("PENDING");
        
        return taskRepository.save(task);
    }
    
    @Override
    @Transactional
    public TaskExecutionResult executeTask(String taskId) {
        log.info("执行任务: taskId={}", taskId);
        
        MentisTask task = getTask(taskId);
        
        try {
            task.setStatus("RUNNING");
            task.setStartedAt(LocalDateTime.now());
            taskRepository.save(task);
            
            // TODO: 调用执行引擎执行任务
            // TaskExecutionResult result = executionEngine.execute(task);
            
            task.setStatus("COMPLETED");
            task.setCompletedAt(LocalDateTime.now());
            taskRepository.save(task);
            
            TaskExecutionResult result = new TaskExecutionResult();
            result.setTaskId(taskId);
            result.setStatus("COMPLETED");
            result.setResult("功能开发中...");
            
            return result;
            
        } catch (Exception e) {
            log.error("执行任务失败: taskId={}", taskId, e);
            task.setStatus("FAILED");
            task.setErrorMessage(e.getMessage());
            task.setCompletedAt(LocalDateTime.now());
            taskRepository.save(task);
            
            TaskExecutionResult result = new TaskExecutionResult();
            result.setTaskId(taskId);
            result.setStatus("FAILED");
            result.setErrorMessage(e.getMessage());
            
            return result;
        }
    }
    
    @Override
    public MentisTask getTask(String taskId) {
        log.debug("获取任务: taskId={}", taskId);
        
        return taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("任务不存在: " + taskId));
    }
    
    @Override
    public List<MentisTask> getSessionTasks(String sessionId) {
        log.debug("获取会话任务列表: sessionId={}", sessionId);
        
        var session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        return taskRepository.findBySession_IdOrderByCreatedAtDesc(session.getId());
    }
    
    @Override
    @Transactional
    public void cancelTask(String taskId) {
        log.info("取消任务: taskId={}", taskId);
        
        MentisTask task = getTask(taskId);
        task.setStatus("CANCELLED");
        taskRepository.save(task);
    }
}
