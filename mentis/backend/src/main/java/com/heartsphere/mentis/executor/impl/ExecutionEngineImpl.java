package com.heartsphere.mentis.executor.impl;

import com.heartsphere.mentis.executor.ComputerUseExecutor;
import com.heartsphere.mentis.executor.ExecutionEngine;
import com.heartsphere.mentis.executor.TaskPlanner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 执行引擎实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Lazy
@Component
@RequiredArgsConstructor
public class ExecutionEngineImpl implements ExecutionEngine {
    
    private final TaskPlanner taskPlanner;
    private final ComputerUseExecutor computerUseExecutor;
    
    private final Map<String, ExecutionStatus> executionStatusMap = new ConcurrentHashMap<>();
    
    @Override
    public ExecutionResult execute(TaskPlanner.TaskPlan plan, String sessionId) {
        log.info("执行任务计划: planId={}, sessionId={}", plan.getPlanId(), sessionId);
        
        String executionId = "exec_" + System.currentTimeMillis();
        
        try {
            // 创建执行状态
            ExecutionStatus status = new ExecutionStatus();
            status.setExecutionId(executionId);
            status.setStatus("RUNNING");
            status.setTotalSteps(plan.getSteps().size());
            status.setCurrentStep(0);
            executionStatusMap.put(executionId, status);
            
            // 执行每个步骤
            List<String> results = new ArrayList<>();
            
            for (TaskPlanner.TaskStep step : plan.getSteps()) {
                status.setCurrentStep(status.getCurrentStep() + 1);
                status.setCurrentStepDescription(step.getDescription());
                
                log.info("执行任务步骤: stepId={}, taskType={}", step.getStepId(), step.getTaskType());
                
                // TODO: 根据任务类型调用不同的执行器
                String stepResult = executeStep(step, sessionId);
                results.add(stepResult);
                
                // 检查是否需要停止
                if (stepResult.contains("ERROR")) {
                    status.setStatus("FAILED");
                    executionStatusMap.put(executionId, status);
                    
                    ExecutionResult result = new ExecutionResult();
                    result.setExecutionId(executionId);
                    result.setStatus("FAILED");
                    result.setErrorMessage("步骤执行失败: " + step.getStepId());
                    return result;
                }
            }
            
            // 执行完成
            status.setStatus("COMPLETED");
            executionStatusMap.put(executionId, status);
            
            ExecutionResult result = new ExecutionResult();
            result.setExecutionId(executionId);
            result.setStatus("COMPLETED");
            result.setResult(String.join("\n", results));
            
            return result;
            
        } catch (Exception e) {
            log.error("执行任务计划失败: planId={}", plan.getPlanId(), e);
            
            ExecutionStatus status = executionStatusMap.get(executionId);
            if (status != null) {
                status.setStatus("FAILED");
            }
            
            ExecutionResult result = new ExecutionResult();
            result.setExecutionId(executionId);
            result.setStatus("FAILED");
            result.setErrorMessage(e.getMessage());
            
            return result;
        }
    }
    
    @Override
    public ExecutionStatus getStatus(String executionId) {
        return executionStatusMap.get(executionId);
    }
    
    /**
     * 执行单个步骤
     */
    private String executeStep(TaskPlanner.TaskStep step, String sessionId) {
        try {
            // 根据任务类型调用不同的执行器
            switch (step.getTaskType()) {
                case "COMMAND":
                    ComputerUseExecutor.CommandResult cmdResult = 
                        computerUseExecutor.executeCommand(sessionId, step.getCommand());
                    if (cmdResult.getExitCode() == 0) {
                        return cmdResult.getStdout();
                    } else {
                        return "ERROR: " + cmdResult.getStderr();
                    }
                    
                case "SCRIPT":
                    // 从描述中识别脚本语言，或默认使用 Python
                    String language = extractLanguage(step.getDescription());
                    ComputerUseExecutor.ScriptResult scriptResult = 
                        computerUseExecutor.executeScript(sessionId, step.getCommand(), language);
                    if (scriptResult.isSuccess()) {
                        return scriptResult.getOutput();
                    } else {
                        return "ERROR: " + scriptResult.getError();
                    }
                    
                case "COMPUTER_USE":
                    // TODO: 解析 GUI 操作
                    ComputerUseExecutor.GuiAction action = parseGuiAction(step);
                    ComputerUseExecutor.GuiActionResult guiResult = 
                        computerUseExecutor.performGuiAction(sessionId, action);
                    if (guiResult.isSuccess()) {
                        return guiResult.getMessage();
                    } else {
                        return "ERROR: " + guiResult.getMessage();
                    }
                    
                default:
                    log.warn("未知任务类型: {}", step.getTaskType());
                    return "ERROR: 未知任务类型: " + step.getTaskType();
            }
        } catch (Exception e) {
            log.error("执行步骤失败: stepId={}", step.getStepId(), e);
            return "ERROR: " + e.getMessage();
        }
    }
    
    /**
     * 从描述中提取脚本语言
     */
    private String extractLanguage(String description) {
        if (description == null) {
            return "python";
        }
        String descLower = description.toLowerCase();
        if (descLower.contains("javascript") || descLower.contains("js") || descLower.contains("node")) {
            return "javascript";
        }
        return "python"; // 默认
    }
    
    /**
     * 解析 GUI 操作
     */
    private ComputerUseExecutor.GuiAction parseGuiAction(TaskPlanner.TaskStep step) {
        ComputerUseExecutor.GuiAction action = new ComputerUseExecutor.GuiAction();
        // TODO: 从步骤描述或命令中解析 GUI 操作
        action.setActionType("SCREENSHOT"); // 默认
        action.setTarget(step.getDescription());
        return action;
    }
}
