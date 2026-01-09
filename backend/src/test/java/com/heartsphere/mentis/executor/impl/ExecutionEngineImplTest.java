package com.heartsphere.mentis.executor.impl;

import com.heartsphere.mentis.executor.ComputerUseExecutor;
import com.heartsphere.mentis.executor.ExecutionEngine;
import com.heartsphere.mentis.executor.TaskPlanner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * ExecutionEngineImpl 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class ExecutionEngineImplTest {
    
    @Mock
    private TaskPlanner taskPlanner;
    
    @Mock
    private ComputerUseExecutor computerUseExecutor;
    
    @InjectMocks
    private ExecutionEngineImpl executionEngine;
    
    private String testSessionId;
    private TaskPlanner.TaskPlan testPlan;
    
    @BeforeEach
    void setUp() {
        testSessionId = "mentis_test_session_123";
        
        testPlan = new TaskPlanner.TaskPlan();
        testPlan.setPlanId("plan_test_123");
        testPlan.setOriginalRequest("测试任务计划");
        
        TaskPlanner.TaskStep step1 = new TaskPlanner.TaskStep();
        step1.setStepId("step1");
        step1.setTaskType("COMMAND");
        step1.setDescription("执行命令");
        step1.setCommand("ls -la");
        step1.setOrder(1);
        
        List<TaskPlanner.TaskStep> steps = new ArrayList<>();
        steps.add(step1);
        testPlan.setSteps(steps);
    }
    
    @Test
    void testExecuteCommandStep() {
        // Given
        ComputerUseExecutor.CommandResult cmdResult = new ComputerUseExecutor.CommandResult();
        cmdResult.setExitCode(0);
        cmdResult.setStdout("file1.txt\nfile2.txt");
        cmdResult.setStderr("");
        
        when(computerUseExecutor.executeCommand(eq(testSessionId), anyString()))
                .thenReturn(cmdResult);
        
        // When
        ExecutionEngine.ExecutionResult result = executionEngine.execute(testPlan, testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals("COMPLETED", result.getStatus());
        assertNotNull(result.getResult());
        assertTrue(result.getResult().contains("file1.txt"));
        verify(computerUseExecutor, times(1)).executeCommand(eq(testSessionId), anyString());
    }
    
    @Test
    void testExecuteScriptStep() {
        // Given
        TaskPlanner.TaskStep scriptStep = new TaskPlanner.TaskStep();
        scriptStep.setStepId("step2");
        scriptStep.setTaskType("SCRIPT");
        scriptStep.setDescription("执行Python脚本");
        scriptStep.setCommand("print('Hello')");
        scriptStep.setOrder(1);
        
        testPlan.setSteps(List.of(scriptStep));
        
        ComputerUseExecutor.ScriptResult scriptResult = new ComputerUseExecutor.ScriptResult();
        scriptResult.setSuccess(true);
        scriptResult.setOutput("Hello");
        scriptResult.setError("");
        
        when(computerUseExecutor.executeScript(eq(testSessionId), anyString(), anyString()))
                .thenReturn(scriptResult);
        
        // When
        ExecutionEngine.ExecutionResult result = executionEngine.execute(testPlan, testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals("COMPLETED", result.getStatus());
        verify(computerUseExecutor, times(1)).executeScript(eq(testSessionId), anyString(), anyString());
    }
    
    @Test
    void testExecuteFailedStep() {
        // Given
        ComputerUseExecutor.CommandResult cmdResult = new ComputerUseExecutor.CommandResult();
        cmdResult.setExitCode(1);
        cmdResult.setStdout("");
        cmdResult.setStderr("command not found");
        
        when(computerUseExecutor.executeCommand(eq(testSessionId), anyString()))
                .thenReturn(cmdResult);
        
        // When
        ExecutionEngine.ExecutionResult result = executionEngine.execute(testPlan, testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals("FAILED", result.getStatus());
        assertNotNull(result.getErrorMessage());
        verify(computerUseExecutor, times(1)).executeCommand(eq(testSessionId), anyString());
    }
    
    @Test
    void testExecuteWithException() {
        // Given
        when(computerUseExecutor.executeCommand(eq(testSessionId), anyString()))
                .thenThrow(new RuntimeException("执行失败"));
        
        // When
        ExecutionEngine.ExecutionResult result = executionEngine.execute(testPlan, testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals("FAILED", result.getStatus());
        assertNotNull(result.getErrorMessage());
    }
    
    @Test
    void testGetStatus() {
        // Given
        ComputerUseExecutor.CommandResult cmdResult = new ComputerUseExecutor.CommandResult();
        cmdResult.setExitCode(0);
        cmdResult.setStdout("success");
        
        when(computerUseExecutor.executeCommand(eq(testSessionId), anyString()))
                .thenReturn(cmdResult);
        
        ExecutionEngine.ExecutionResult execResult = executionEngine.execute(testPlan, testSessionId);
        
        // When
        ExecutionEngine.ExecutionStatus status = executionEngine.getStatus(execResult.getExecutionId());
        
        // Then
        assertNotNull(status);
        assertEquals(execResult.getExecutionId(), status.getExecutionId());
        assertEquals("COMPLETED", status.getStatus());
    }
}
