package com.heartsphere.mentis.service;

import com.heartsphere.mentis.dto.TaskExecuteRequestDTO;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.entity.MentisTask;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import com.heartsphere.mentis.repository.MentisTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * MentisTaskService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class MentisTaskServiceTest {
    
    @Mock
    private MentisTaskRepository taskRepository;
    
    @Mock
    private MentisSessionRepository sessionRepository;
    
    @InjectMocks
    private MentisTaskServiceImpl taskService;
    
    private String testSessionId;
    private MentisSession testSession;
    private MentisTask testTask;
    
    @BeforeEach
    void setUp() {
        testSessionId = "mentis_test_session_123";
        
        testSession = new MentisSession();
        testSession.setId(1L);
        testSession.setSessionId(testSessionId);
        testSession.setUserId(1L);
        
        testTask = new MentisTask();
        testTask.setId(1L);
        testTask.setTaskId("task_test_123");
        testTask.setSession(testSession);
        testTask.setTaskType("COMMAND");
        testTask.setStatus("PENDING");
        testTask.setDescription("测试任务");
        testTask.setCommand("ls -la");
        testTask.setCreatedAt(LocalDateTime.now());
        testTask.setUpdatedAt(LocalDateTime.now());
        
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.of(testSession));
    }
    
    @Test
    void testCreateTask() {
        // Given
        TaskExecuteRequestDTO request = new TaskExecuteRequestDTO();
        request.setTaskType("COMMAND");
        request.setDescription("执行命令");
        request.setCommand("ls -la");
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("timeout", 30);
        request.setParameters(parameters);
        
        when(taskRepository.save(any(MentisTask.class))).thenAnswer(invocation -> {
            MentisTask task = invocation.getArgument(0);
            task.setId(1L);
            return task;
        });
        
        // When
        MentisTask result = taskService.createTask(testSessionId, request);
        
        // Then
        assertNotNull(result);
        assertEquals("COMMAND", result.getTaskType());
        assertEquals("执行命令", result.getDescription());
        assertEquals("ls -la", result.getCommand());
        assertEquals("PENDING", result.getStatus());
        assertNotNull(result.getTaskId());
        verify(taskRepository, times(1)).save(any(MentisTask.class));
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    @Test
    void testGetTask() {
        // Given
        String taskId = "task_test_123";
        when(taskRepository.findByTaskId(taskId)).thenReturn(Optional.of(testTask));
        
        // When
        MentisTask result = taskService.getTask(taskId);
        
        // Then
        assertNotNull(result);
        assertEquals(taskId, result.getTaskId());
        verify(taskRepository, times(1)).findByTaskId(taskId);
    }
    
    @Test
    void testGetTaskNotFound() {
        // Given
        String taskId = "non_existent_task";
        when(taskRepository.findByTaskId(taskId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            taskService.getTask(taskId);
        });
        verify(taskRepository, times(1)).findByTaskId(taskId);
    }
    
    @Test
    void testExecuteTask() {
        // Given
        String taskId = "task_test_123";
        when(taskRepository.findByTaskId(taskId)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(MentisTask.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        MentisTaskService.TaskExecutionResult result = taskService.executeTask(taskId);
        
        // Then
        assertNotNull(result);
        assertEquals(taskId, result.getTaskId());
        assertEquals("COMPLETED", result.getStatus());
        verify(taskRepository, atLeast(2)).save(any(MentisTask.class)); // RUNNING and COMPLETED
    }
    
    @Test
    void testGetSessionTasks() {
        // Given
        MentisTask task1 = createTestTask("task1");
        MentisTask task2 = createTestTask("task2");
        List<MentisTask> tasks = Arrays.asList(task1, task2);
        
        when(taskRepository.findBySession_IdOrderByCreatedAtDesc(testSession.getId())).thenReturn(tasks);
        
        // When
        List<MentisTask> result = taskService.getSessionTasks(testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(taskRepository, times(1)).findBySession_IdOrderByCreatedAtDesc(testSession.getId());
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    @Test
    void testCancelTask() {
        // Given
        String taskId = "task_test_123";
        testTask.setStatus("RUNNING");
        when(taskRepository.findByTaskId(taskId)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(MentisTask.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        taskService.cancelTask(taskId);
        
        // Then
        assertEquals("CANCELLED", testTask.getStatus());
        verify(taskRepository, times(1)).save(testTask);
    }
    
    private MentisTask createTestTask(String taskId) {
        MentisTask task = new MentisTask();
        task.setTaskId(taskId);
        task.setSession(testSession);
        task.setTaskType("COMMAND");
        task.setStatus("PENDING");
        task.setDescription("测试任务");
        task.setCreatedAt(LocalDateTime.now());
        return task;
    }
}
