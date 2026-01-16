package com.heartsphere.mentis.executor.impl;

import com.heartsphere.mentis.entity.MentisTask;
import com.heartsphere.mentis.executor.ComputerUseExecutor;
import com.heartsphere.mentis.executor.ExecutionEngine;
import com.heartsphere.mentis.executor.TaskPlanner;
import com.heartsphere.mentis.repository.MentisTaskRepository;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import com.heartsphere.mentis.service.SessionRealtimeService;
import com.heartsphere.mentis.tool.Tool;
import com.heartsphere.mentis.tool.executor.ToolExecutor;
import com.heartsphere.mentis.tool.registry.ToolRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 执行引擎实现
 * 集成虚拟机执行能力
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
    private final VmCommandExecutor vmCommandExecutor;
    private final VmScriptExecutor vmScriptExecutor;
    private final VmGuiExecutor vmGuiExecutor;
    private final MentisTaskRepository taskRepository;
    private final MentisSessionRepository sessionRepository;
    private final SessionRealtimeService sessionRealtimeService;
    private final ToolExecutor toolExecutor;
    private final ToolRegistry toolRegistry;
    // 移除 ExecutionProgressService 依赖，避免循环依赖
    // 进度推送由 ExecutionProgressService 通过轮询 ExecutionEngine.getStatus() 实现
    
    private final Map<String, ExecutionStatus> executionStatusMap = new ConcurrentHashMap<>();
    
    @Override
    public ExecutionResult execute(TaskPlanner.TaskPlan plan, String sessionId, String messageId) {
        log.info("执行任务计划: planId={}, sessionId={}, messageId={}", plan.getPlanId(), sessionId, messageId);
        
        String executionId = "exec_" + System.currentTimeMillis();
        
        try {
            // 创建执行状态
            ExecutionStatus status = new ExecutionStatus();
            status.setExecutionId(executionId);
            status.setStatus("RUNNING");
            status.setTotalSteps(plan.getSteps().size());
            status.setCurrentStep(0);
            status.setStartTime(System.currentTimeMillis());
            executionStatusMap.put(executionId, status);
            
            // 1. 在开始执行前，先创建所有任务（PENDING状态），并通过SSE通知前端
            List<MentisTask> tasks = new ArrayList<>();
            for (TaskPlanner.TaskStep step : plan.getSteps()) {
                MentisTask task = createTaskFromStep(step, sessionId, executionId, messageId);
                task.setStatus("PENDING");
                task = taskRepository.save(task);
                tasks.add(task);
                log.info("创建任务实体（PENDING）: taskId={}, stepId={}, description={}", 
                        task.getTaskId(), step.getStepId(), step.getDescription());
                
                // 通过SSE发送任务创建事件
                Map<String, Object> taskCreatedData = new HashMap<>();
                taskCreatedData.put("taskId", task.getTaskId());
                taskCreatedData.put("description", task.getDescription());
                taskCreatedData.put("command", task.getCommand());
                taskCreatedData.put("taskType", task.getTaskType());
                taskCreatedData.put("status", task.getStatus());
                taskCreatedData.put("createdAt", task.getCreatedAt());
                sessionRealtimeService.sendEvent(sessionId, "task_created", taskCreatedData);
            }
            
            // 2. 执行每个步骤
            List<String> results = new ArrayList<>();
            
            for (int i = 0; i < plan.getSteps().size(); i++) {
                TaskPlanner.TaskStep step = plan.getSteps().get(i);
                MentisTask task = tasks.get(i);
                
                status.setCurrentStep(status.getCurrentStep() + 1);
                status.setCurrentStepDescription(step.getDescription());
                status.setCurrentStepStartTime(System.currentTimeMillis());
                executionStatusMap.put(executionId, status); // 更新状态
                
                log.info("执行任务步骤: stepId={}, taskType={}, description={}", 
                        step.getStepId(), step.getTaskType(), step.getDescription());
                
                // 更新任务状态为 RUNNING，并通过SSE通知前端
                task.setStatus("RUNNING");
                task.setStartedAt(LocalDateTime.now());
                task = taskRepository.save(task);
                log.info("任务开始执行: taskId={}, status=RUNNING", task.getTaskId());
                
                // 通过SSE发送任务状态变化事件（RUNNING）
                Map<String, Object> runningStatusData = new HashMap<>();
                runningStatusData.put("taskId", task.getTaskId());
                runningStatusData.put("status", task.getStatus());
                runningStatusData.put("startedAt", task.getStartedAt());
                sessionRealtimeService.sendEvent(sessionId, "task_status_changed", runningStatusData);
                
                String stepResult;
                try {
                    // 根据任务类型调用不同的执行器（已集成虚拟机执行）
                    stepResult = executeStep(step, sessionId);
                    results.add(stepResult);
                    
                    // 更新任务状态为完成，并通过SSE通知前端
                    task.setStatus("COMPLETED");
                    task.setCompletedAt(LocalDateTime.now());
                    task.setResult(stepResult);
                    task = taskRepository.save(task);
                    log.info("任务执行完成: taskId={}, status=COMPLETED", task.getTaskId());
                    
                    // 通过SSE发送任务状态变化事件（COMPLETED）
                    Map<String, Object> completedStatusData = new HashMap<>();
                    completedStatusData.put("taskId", task.getTaskId());
                    completedStatusData.put("status", task.getStatus());
                    completedStatusData.put("completedAt", task.getCompletedAt());
                    completedStatusData.put("result", task.getResult());
                    sessionRealtimeService.sendEvent(sessionId, "task_status_changed", completedStatusData);
                    
                    // 单独发送执行结果事件，确保前端能够接收到虚拟机执行结果
                    Map<String, Object> resultData = new HashMap<>();
                    resultData.put("taskId", task.getTaskId());
                    resultData.put("executionId", executionId);
                    resultData.put("result", stepResult);
                    resultData.put("completedAt", task.getCompletedAt());
                    resultData.put("duration", task.getDuration());
                    sessionRealtimeService.sendEvent(sessionId, "task_result", resultData);
                } catch (Exception e) {
                    // 更新任务状态为失败，并通过SSE通知前端
                    task.setStatus("FAILED");
                    task.setCompletedAt(LocalDateTime.now());
                    task.setErrorMessage(e.getMessage());
                    task = taskRepository.save(task);
                    log.error("任务执行失败: taskId={}, error={}", task.getTaskId(), e.getMessage());
                    
                    // 通过SSE发送任务状态变化事件（FAILED）
                    Map<String, Object> failedStatusData = new HashMap<>();
                    failedStatusData.put("taskId", task.getTaskId());
                    failedStatusData.put("status", task.getStatus());
                    failedStatusData.put("completedAt", task.getCompletedAt());
                    failedStatusData.put("errorMessage", task.getErrorMessage());
                    sessionRealtimeService.sendEvent(sessionId, "task_status_changed", failedStatusData);
                    
                    stepResult = "ERROR: " + e.getMessage();
                    results.add(stepResult);
                    
                    // 发送失败结果事件
                    Map<String, Object> errorResultData = new HashMap<>();
                    errorResultData.put("taskId", task.getTaskId());
                    errorResultData.put("executionId", executionId);
                    errorResultData.put("result", stepResult);
                    errorResultData.put("error", e.getMessage());
                    errorResultData.put("completedAt", task.getCompletedAt());
                    sessionRealtimeService.sendEvent(sessionId, "task_result", errorResultData);
                }
                
                // 更新步骤执行时间
                long stepDuration = System.currentTimeMillis() - status.getCurrentStepStartTime();
                log.debug("步骤执行完成: stepId={}, duration={}ms", step.getStepId(), stepDuration);
                
                // 检查是否需要停止
                if (stepResult.contains("ERROR")) {
                    status.setStatus("FAILED");
                    executionStatusMap.put(executionId, status);
                    
                    // 提取实际的错误信息（移除 "ERROR: " 前缀）
                    String errorMessage = stepResult;
                    if (stepResult.startsWith("ERROR: ")) {
                        errorMessage = stepResult.substring(7); // 移除 "ERROR: " 前缀
                    }
                    
                    ExecutionResult result = new ExecutionResult();
                    result.setExecutionId(executionId);
                    result.setStatus("FAILED");
                    result.setErrorMessage("步骤执行失败: " + step.getStepId() + " - " + errorMessage);
                    result.setResult(String.join("\n", results)); // 包含已执行步骤的结果
                    
                    log.error("步骤执行失败: stepId={}, error={}", step.getStepId(), errorMessage);
                    return result;
                }
            }
            
            // 执行完成
            status.setStatus("COMPLETED");
            status.setEndTime(System.currentTimeMillis());
            long totalDuration = status.getEndTime() - status.getStartTime();
            log.info("任务执行完成: executionId={}, totalDuration={}ms", executionId, totalDuration);
            executionStatusMap.put(executionId, status);
            
            ExecutionResult result = new ExecutionResult();
            result.setExecutionId(executionId);
            result.setStatus("COMPLETED");
            result.setResult(String.join("\n", results));
            
            // 发送整个执行完成的最终结果事件
            Map<String, Object> finalResultData = new HashMap<>();
            finalResultData.put("executionId", executionId);
            finalResultData.put("status", "COMPLETED");
            finalResultData.put("result", result.getResult());
            finalResultData.put("totalSteps", plan.getSteps().size());
            finalResultData.put("completedSteps", results.size());
            finalResultData.put("duration", totalDuration);
            finalResultData.put("completedAt", System.currentTimeMillis());
            sessionRealtimeService.sendEvent(sessionId, "execution_complete", finalResultData);
            
            return result;
            
        } catch (Exception e) {
            log.error("执行任务计划失败: planId={}", plan.getPlanId(), e);
            
            ExecutionStatus status = executionStatusMap.get(executionId);
            if (status != null) {
                status.setStatus("FAILED");
                status.setEndTime(System.currentTimeMillis());
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
     * 优先使用工具系统，如果失败则回退到虚拟机执行器或原有执行器
     */
    private String executeStep(TaskPlanner.TaskStep step, String sessionId) {
        try {
            // 尝试使用工具系统执行（如果命令匹配工具模式）
            String toolResult = tryExecuteWithTool(step, sessionId);
            if (toolResult != null) {
                return toolResult;
            }
            
            // 根据任务类型调用不同的执行器（优先使用虚拟机执行器）
            switch (step.getTaskType()) {
                case "COMMAND":
                    // 优先使用虚拟机命令执行器
                    try {
                        ComputerUseExecutor.CommandResult cmdResult = 
                            vmCommandExecutor.executeCommand(sessionId, step.getCommand());
                        if (cmdResult.getExitCode() == 0) {
                            return cmdResult.getStdout();
                        } else {
                            return "ERROR: " + cmdResult.getStderr();
                        }
                    } catch (Exception e) {
                        log.warn("虚拟机命令执行失败，回退到原有执行器: {}", e.getMessage());
                        // 回退到原有执行器
                        ComputerUseExecutor.CommandResult cmdResult = 
                            computerUseExecutor.executeCommand(sessionId, step.getCommand());
                        if (cmdResult.getExitCode() == 0) {
                            return cmdResult.getStdout();
                        } else {
                            return "ERROR: " + cmdResult.getStderr();
                        }
                    }
                    
                case "SCRIPT":
                    // 从描述中识别脚本语言，或默认使用 Python
                    String language = extractLanguage(step.getDescription());
                    // 优先使用虚拟机脚本执行器
                    try {
                        ComputerUseExecutor.ScriptResult scriptResult = 
                            vmScriptExecutor.executeScript(sessionId, step.getCommand(), language);
                        if (scriptResult.isSuccess()) {
                            return scriptResult.getOutput();
                        } else {
                            return "ERROR: " + scriptResult.getError();
                        }
                    } catch (Exception e) {
                        log.warn("虚拟机脚本执行失败，回退到原有执行器: {}", e.getMessage());
                        // 回退到原有执行器
                        ComputerUseExecutor.ScriptResult scriptResult = 
                            computerUseExecutor.executeScript(sessionId, step.getCommand(), language);
                        if (scriptResult.isSuccess()) {
                            return scriptResult.getOutput();
                        } else {
                            return "ERROR: " + scriptResult.getError();
                        }
                    }
                    
                case "COMPUTER_USE":
                    // 解析 GUI 操作
                    ComputerUseExecutor.GuiAction action = parseGuiAction(step);
                    // 优先使用虚拟机 GUI 执行器
                    try {
                        ComputerUseExecutor.GuiActionResult guiResult = 
                            vmGuiExecutor.performGuiAction(sessionId, action);
                        if (guiResult.isSuccess()) {
                            String result = guiResult.getMessage();
                            // 截图处理已注释
                            // if (guiResult.getScreenshot() != null) {
                            //     result += "\n[截图已捕获]";
                            // }
                            return result;
                        } else {
                            return "ERROR: " + guiResult.getMessage();
                        }
                    } catch (Exception e) {
                        log.warn("虚拟机 GUI 操作失败，回退到原有执行器: {}", e.getMessage());
                        // 回退到原有执行器
                        ComputerUseExecutor.GuiActionResult guiResult = 
                            computerUseExecutor.performGuiAction(sessionId, action);
                        if (guiResult.isSuccess()) {
                            return guiResult.getMessage();
                        } else {
                            return "ERROR: " + guiResult.getMessage();
                        }
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
     * 尝试使用工具系统执行步骤
     * 如果命令匹配某个工具的模式，使用工具系统执行
     * 
     * @return 执行结果，如果不匹配任何工具则返回 null
     */
    private String tryExecuteWithTool(TaskPlanner.TaskStep step, String sessionId) {
        try {
            // 根据任务类型和命令内容推断应该使用的工具
            String toolName = inferToolName(step);
            if (toolName == null || !toolRegistry.hasTool(toolName)) {
                return null; // 没有匹配的工具，返回 null 使用原有执行器
            }
            
            log.info("使用工具执行步骤: toolName={}, stepId={}", toolName, step.getStepId());
            
            // 构建工具参数
            Map<String, Object> parameters = buildToolParameters(step, toolName);
            
            // 执行工具（支持重试机制）
            Tool.ToolResult result = executeToolWithRetry(toolName, sessionId, parameters, step);
            
            if (result.isSuccess()) {
                // 将结果转换为字符串
                if (result.getResult() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> resultMap = (Map<String, Object>) result.getResult();
                    
                    // 如果是股票数据，格式化输出
                    if (resultMap.containsKey("hasStockData") && Boolean.TRUE.equals(resultMap.get("hasStockData"))) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> stockData = (Map<String, Object>) resultMap.get("stockData");
                        if (stockData != null) {
                            return formatStockDataResult(stockData, resultMap);
                        }
                    }
                    
                    // 优先返回提取的页面内容（浏览器工具提取的文本）
                    // 格式化输出，包含URL和标题信息，方便AI理解上下文
                    StringBuilder formattedResult = new StringBuilder();
                    
                    if (resultMap.containsKey("pageTitle")) {
                        String pageTitle = (String) resultMap.get("pageTitle");
                        if (pageTitle != null && !pageTitle.trim().isEmpty()) {
                            formattedResult.append("页面标题: ").append(pageTitle).append("\n\n");
                        }
                    }
                    
                    if (resultMap.containsKey("url")) {
                        String pageUrl = (String) resultMap.get("url");
                        if (pageUrl != null && !pageUrl.trim().isEmpty()) {
                            formattedResult.append("页面URL: ").append(pageUrl).append("\n\n");
                        }
                    }
                    
                    // 优先使用提取的内容
                    String content = null;
                    if (resultMap.containsKey("extractedContent")) {
                        content = (String) resultMap.get("extractedContent");
                    } else if (resultMap.containsKey("mainContent")) {
                        content = (String) resultMap.get("mainContent");
                    } else if (resultMap.containsKey("pageText")) {
                        content = (String) resultMap.get("pageText");
                    }
                    
                    if (content != null && !content.trim().isEmpty()) {
                        formattedResult.append("页面内容:\n").append(content);
                        log.info("返回提取的页面内容: 长度={}字符, url={}", content.length(), resultMap.get("url"));
                        return formattedResult.toString();
                    }
                    
                    // 如果没有提取的内容，返回 stdout 或 output
                    if (resultMap.containsKey("stdout")) {
                        return (String) resultMap.get("stdout");
                    } else if (resultMap.containsKey("output")) {
                        return (String) resultMap.get("output");
                    } else {
                        return resultMap.toString();
                    }
                } else if (result.getResult() instanceof String) {
                    return (String) result.getResult();
                } else {
                    return result.getResult().toString();
                }
            } else {
                return "ERROR: " + result.getErrorMessage();
            }
        } catch (Exception e) {
            log.warn("工具执行失败，回退到原有执行器: {}", e.getMessage());
            return null; // 返回 null，使用原有执行器
        }
    }
    
    /**
     * 根据任务步骤推断应该使用的工具名称
     */
    private String inferToolName(TaskPlanner.TaskStep step) {
        String taskType = step.getTaskType();
        String command = step.getCommand();
        String description = step.getDescription();
        
        if (command == null) {
            command = "";
        }
        if (description == null) {
            description = "";
        }
        
        String lowerCommand = command.toLowerCase();
        String lowerDescription = description.toLowerCase();
        
        // 根据任务类型和命令内容推断工具
        switch (taskType) {
            case "COMMAND":
                // 终端命令工具
                return "terminal_exec";
                
            case "SCRIPT":
                // 根据脚本语言推断工具
                if (lowerDescription.contains("python") || lowerCommand.contains("python")) {
                    return "python_run";
                } else if (lowerDescription.contains("node") || lowerDescription.contains("javascript") || 
                          lowerCommand.contains("node") || lowerCommand.contains("javascript")) {
                    return "node_run";
                } else if (lowerDescription.contains("bash") || lowerCommand.startsWith("#!/bin/bash")) {
                    return "bash_run";
                }
                // 默认使用 Python
                return "python_run";
                
            case "COMPUTER_USE":
                // 根据描述推断浏览器工具
                if (lowerDescription.contains("访问") || lowerDescription.contains("打开") || 
                    lowerDescription.contains("goto") || lowerDescription.contains("url")) {
                    return "browser_goto";
                } else if (lowerDescription.contains("点击") || lowerDescription.contains("click")) {
                    return "browser_click";
                } else if (lowerDescription.contains("输入") || lowerDescription.contains("type")) {
                    return "browser_type";
                } else if (lowerDescription.contains("滚动") || lowerDescription.contains("scroll")) {
                    return "browser_scroll";
                } 
                // 截图功能已禁用
                // else if (lowerDescription.contains("截图") || lowerDescription.contains("screenshot")) {
                //     return "browser_screenshot";
                // }
                // 默认使用 browser_goto
                return "browser_goto";
                
            default:
                return null;
        }
    }
    
    /**
     * 构建工具参数
     */
    private Map<String, Object> buildToolParameters(TaskPlanner.TaskStep step, String toolName) {
        Map<String, Object> parameters = new HashMap<>();
        
        // 根据工具名称构建参数
        if (toolName.startsWith("terminal_")) {
            parameters.put("command", step.getCommand());
        } else if (toolName.startsWith("python_") || toolName.startsWith("node_") || toolName.startsWith("bash_")) {
            parameters.put("code", step.getCommand());
        } else if (toolName.startsWith("browser_")) {
            // 从命令或描述中提取URL
            String url = extractUrl(step.getCommand(), step.getDescription());
            if (url != null && !url.trim().isEmpty()) {
                parameters.put("url", url);
            } else {
                // 如果无法提取URL，对于 browser_goto，尝试从描述中推断
                if ("browser_goto".equals(toolName)) {
                    String inferredUrl = inferUrlFromDescription(step.getDescription());
                    if (inferredUrl != null && !inferredUrl.trim().isEmpty()) {
                        parameters.put("url", inferredUrl);
                        log.info("从描述推断URL: description={}, url={}", step.getDescription(), inferredUrl);
                    } else {
                        // 如果仍然无法推断URL，记录警告日志
                        log.warn("无法从任务步骤中提取或推断URL: command={}, description={}, toolName={}", 
                                step.getCommand(), step.getDescription(), toolName);
                    }
                } else {
                    // 其他浏览器工具也需要URL但没有找到
                    log.warn("无法从任务步骤中提取URL: command={}, description={}, toolName={}", 
                            step.getCommand(), step.getDescription(), toolName);
                }
            }
            // 其他浏览器工具参数可以根据需要添加
        } else if (toolName.startsWith("system_")) {
            // 系统工具通常不需要参数，或从命令中提取
            if (step.getCommand() != null && !step.getCommand().trim().isEmpty()) {
                parameters.put("command", step.getCommand());
            }
        }
        
        return parameters;
    }
    
    /**
     * 从命令或描述中提取URL
     * 如果无法提取，根据描述内容生成合理的默认URL
     */
    private String extractUrl(String command, String description) {
        if (command != null) {
            // 尝试从命令中提取URL（简单模式匹配）
            String[] parts = command.split("\\s+");
            for (String part : parts) {
                if (part.startsWith("http://") || part.startsWith("https://")) {
                    return part;
                }
            }
            
            // 尝试从命令中提取网站名称并生成URL
            String inferredUrl = inferUrlFromCommand(command);
            if (inferredUrl != null) {
                return inferredUrl;
            }
        }
        
        if (description != null) {
            // 尝试从描述中提取URL
            String[] parts = description.split("\\s+");
            for (String part : parts) {
                if (part.startsWith("http://") || part.startsWith("https://")) {
                    return part;
                }
            }
            
            // 尝试从描述中推断URL
            String inferredUrl = inferUrlFromDescription(description);
            if (inferredUrl != null) {
                return inferredUrl;
            }
        }
        
        return null;
    }
    
    /**
     * 从命令中推断URL
     */
    private String inferUrlFromCommand(String command) {
        if (command == null || command.trim().isEmpty()) {
            return null;
        }
        
        String lowerCommand = command.toLowerCase();
        
        // 检查是否包含网站名称
        if (lowerCommand.contains("weather.com")) {
            return "https://www.weather.com";
        } else if (lowerCommand.contains("weather.com.cn") || lowerCommand.contains("中国天气网")) {
            return "https://www.weather.com.cn";
        } else if (lowerCommand.contains("baidu.com") || lowerCommand.contains("百度")) {
            return "https://www.baidu.com";
        } else if (lowerCommand.contains("google.com") || lowerCommand.contains("谷歌")) {
            return "https://www.google.com";
        } else if (lowerCommand.contains("yahoo.com")) {
            return "https://www.yahoo.com";
        } else if (lowerCommand.contains("finance.yahoo.com") || lowerCommand.contains("yahoo finance")) {
            return "https://finance.yahoo.com";
        }
        
        return null;
    }
    
    /**
     * 执行工具（支持重试机制）
     * 如果页面不存在，尝试其他备选URL
     */
    private Tool.ToolResult executeToolWithRetry(String toolName, String sessionId, 
                                                 Map<String, Object> parameters, TaskPlanner.TaskStep step) {
        // 首次执行
        Tool.ToolResult result = toolExecutor.execute(toolName, sessionId, parameters);
        
        // 如果是 browser_goto 工具，且页面无效，尝试其他URL
        if ("browser_goto".equals(toolName) && result.isSuccess()) {
            if (result.getResult() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resultMap = (Map<String, Object>) result.getResult();
                Boolean needsRetry = (Boolean) resultMap.get("needsRetry");
                Boolean pageValid = (Boolean) resultMap.get("pageValid");
                
                if (Boolean.TRUE.equals(needsRetry) || Boolean.FALSE.equals(pageValid)) {
                    log.info("页面无效，尝试其他备选URL: toolName={}, sessionId={}", toolName, sessionId);
                    
                    // 获取备选URL列表
                    List<String> alternativeUrls = inferAlternativeUrlsFromDescription(step.getDescription());
                    if (alternativeUrls.isEmpty()) {
                        // 如果没有备选URL，尝试从URL推断
                        String currentUrl = (String) parameters.get("url");
                        if (currentUrl != null) {
                            alternativeUrls = inferAlternativeUrlsFromUrl(currentUrl);
                        }
                    }
                    
                    // 尝试每个备选URL
                    for (String altUrl : alternativeUrls) {
                        // 跳过已经尝试过的URL
                        String currentUrl = (String) parameters.get("url");
                        if (altUrl.equals(currentUrl)) {
                            continue;
                        }
                        
                        log.info("尝试备选URL: {}", altUrl);
                        
                        // 创建新的参数
                        Map<String, Object> newParameters = new HashMap<>(parameters);
                        newParameters.put("url", altUrl);
                        
                        // 执行工具
                        Tool.ToolResult retryResult = toolExecutor.execute(toolName, sessionId, newParameters);
                        
                        if (retryResult.isSuccess()) {
                            if (retryResult.getResult() instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> retryResultMap = (Map<String, Object>) retryResult.getResult();
                                Boolean retryPageValid = (Boolean) retryResultMap.get("pageValid");
                                
                                // 如果页面有效，返回成功结果
                                if (Boolean.TRUE.equals(retryPageValid)) {
                                    log.info("备选URL访问成功: {}", altUrl);
                                    return retryResult;
                                }
                            } else {
                                // 如果没有 pageValid 字段，假设成功
                                log.info("备选URL访问成功（无法验证页面有效性）: {}", altUrl);
                                return retryResult;
                            }
                        }
                    }
                    
                    log.warn("所有备选URL都失败，返回原始结果");
                }
            }
        }
        
        return result;
    }
    
    /**
     * 从URL推断备选URL列表
     */
    private List<String> inferAlternativeUrlsFromUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        String lowerUrl = url.toLowerCase();
        List<String> urls = new ArrayList<>();
        
        // 东方财富相关
        if (lowerUrl.contains("eastmoney") || lowerUrl.contains("东方财富")) {
            urls.add("https://quote.eastmoney.com/center/gridlist.html#hs_a_board");
            urls.add("https://q.10jqka.com.cn/"); // 同花顺
            urls.add("https://finance.sina.com.cn/realstock/company/sh000001/nc.shtml"); // 新浪财经
        }
        // 同花顺相关
        else if (lowerUrl.contains("10jqka") || lowerUrl.contains("同花顺")) {
            urls.add("https://q.10jqka.com.cn/");
            urls.add("https://quote.eastmoney.com/center/gridlist.html#hs_a_board"); // 东方财富
            urls.add("https://finance.sina.com.cn/realstock/company/sh000001/nc.shtml"); // 新浪财经
        }
        // 新浪财经相关
        else if (lowerUrl.contains("sina") || lowerUrl.contains("新浪")) {
            urls.add("https://finance.sina.com.cn/realstock/company/sh000001/nc.shtml");
            urls.add("https://quote.eastmoney.com/center/gridlist.html#hs_a_board"); // 东方财富
            urls.add("https://q.10jqka.com.cn/"); // 同花顺
        }
        
        return urls;
    }
    
    /**
     * 从描述中推断备选URL列表（用于重试）
     */
    private List<String> inferAlternativeUrlsFromDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        String lowerDesc = description.toLowerCase();
        
        // A股实时行情相关，提供多个备选URL
        if (lowerDesc.contains("a股") || lowerDesc.contains("a-share") || 
            lowerDesc.contains("实时股价") || lowerDesc.contains("实时行情") ||
            lowerDesc.contains("东方财富") || lowerDesc.contains("eastmoney") ||
            lowerDesc.contains("同花顺") || lowerDesc.contains("10jqka") ||
            lowerDesc.contains("新浪财经") || lowerDesc.contains("sina")) {
            List<String> urls = new ArrayList<>();
            urls.add("https://quote.eastmoney.com/center/gridlist.html#hs_a_board"); // 东方财富A股行情
            urls.add("https://q.10jqka.com.cn/"); // 同花顺行情中心
            urls.add("https://finance.sina.com.cn/realstock/company/sh000001/nc.shtml"); // 新浪财经A股
            urls.add("https://finance.yahoo.com/quote/000001.SS"); // Yahoo Finance 上证指数
            return urls;
        }
        
        // 其他情况返回空列表
        return Collections.emptyList();
    }
    
    /**
     * 从描述中推断URL
     */
    private String inferUrlFromDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return null;
        }
        
        String lowerDesc = description.toLowerCase();
        
        // 根据任务内容推断URL
        // 天气相关
        if (lowerDesc.contains("天气") || lowerDesc.contains("weather")) {
            // 优先使用国际天气网站
            if (lowerDesc.contains("北京") || lowerDesc.contains("beijing")) {
                return "https://www.weather.com/weather/today/l/Beijing+China";
            } else if (lowerDesc.contains("上海") || lowerDesc.contains("shanghai")) {
                return "https://www.weather.com/weather/today/l/Shanghai+China";
            } else {
                return "https://www.weather.com";
            }
        }
        
        // 股票/金融相关（扩展关键词匹配）
        if (lowerDesc.contains("股票") || lowerDesc.contains("股市") || lowerDesc.contains("stock") || 
            lowerDesc.contains("finance") || lowerDesc.contains("金融") ||
            lowerDesc.contains("股指") || lowerDesc.contains("指数") || lowerDesc.contains("index") ||
            lowerDesc.contains("行情") || lowerDesc.contains("行情数据") || lowerDesc.contains("market") ||
            lowerDesc.contains("上证") || lowerDesc.contains("深证") || lowerDesc.contains("纳斯达克") ||
            lowerDesc.contains("道琼斯") || lowerDesc.contains("nasdaq") || lowerDesc.contains("dow") ||
            lowerDesc.contains("开盘价") || lowerDesc.contains("收盘价") || lowerDesc.contains("涨跌幅") ||
            lowerDesc.contains("成交量") || lowerDesc.contains("财经") || lowerDesc.contains("财经网站")) {
            // A股相关，优先使用国内网站
            if (lowerDesc.contains("a股") || lowerDesc.contains("a-share") || 
                lowerDesc.contains("实时股价") || lowerDesc.contains("实时行情") ||
                lowerDesc.contains("东方财富") || lowerDesc.contains("eastmoney") ||
                lowerDesc.contains("同花顺") || lowerDesc.contains("10jqka") ||
                lowerDesc.contains("新浪财经") || lowerDesc.contains("sina")) {
                // 返回第一个备选URL（其他备选URL会在重试时使用）
                return "https://quote.eastmoney.com/center/gridlist.html#hs_a_board";
            }
            // 其他股票/金融相关，使用 Yahoo Finance
            return "https://finance.yahoo.com";
        }
        
        // 搜索相关
        if (lowerDesc.contains("搜索") || lowerDesc.contains("search") || lowerDesc.contains("查询") || 
            lowerDesc.contains("lookup")) {
            return "https://www.google.com";
        }
        
        // 如果描述中包含"访问"、"打开"、"goto"等关键词，但没有URL，返回null
        // 调用方应该从上下文或之前的步骤中获取URL
        return null;
    }
    
    /**
     * 解析 GUI 操作
     */
    private ComputerUseExecutor.GuiAction parseGuiAction(TaskPlanner.TaskStep step) {
        ComputerUseExecutor.GuiAction action = new ComputerUseExecutor.GuiAction();
        // TODO: 从步骤描述或命令中解析 GUI 操作
        // 截图功能已禁用，默认使用 NAVIGATE 而不是 SCREENSHOT
        action.setActionType("NAVIGATE"); // 默认改为导航操作
        action.setTarget(step.getDescription());
        return action;
    }
    
    /**
     * 从任务步骤创建 MentisTask 实体
     */
    @Transactional
    private MentisTask createTaskFromStep(TaskPlanner.TaskStep step, String sessionId, String executionId, String messageId) {
        var session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        MentisTask task = new MentisTask();
        task.setTaskId("task_" + System.currentTimeMillis() + "_" + step.getStepId());
        task.setSession(session);
        task.setTaskType(step.getTaskType());
        task.setDescription(step.getDescription());
        task.setCommand(step.getCommand());
        task.setStatus("PENDING");
        task.setExecutionId(executionId);
        task.setMessageId(messageId); // 关联用户消息ID
        
        return task;
    }
    
    /**
     * 格式化股票数据结果
     * 将提取的股票数据格式化为易读的文本格式
     */
    private String formatStockDataResult(Map<String, Object> stockData, Map<String, Object> fullResult) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("✅ 成功访问股票行情页面\n\n");
        
        // 添加URL信息
        if (fullResult.containsKey("url")) {
            sb.append("📊 数据来源: ").append(fullResult.get("url")).append("\n\n");
        }
        
        // 添加指数数据
        if (stockData.containsKey("indices")) {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, String>> indices = (java.util.List<Map<String, String>>) stockData.get("indices");
            if (indices != null && !indices.isEmpty()) {
                sb.append("📈 主要指数行情:\n");
                for (Map<String, String> index : indices) {
                    String name = index.get("name");
                    String value = index.get("value");
                    sb.append("  • ").append(name).append(": ").append(value).append("\n");
                }
                sb.append("\n");
            }
        }
        
        // 添加摘要信息
        if (stockData.containsKey("summary")) {
            String summary = (String) stockData.get("summary");
            if (summary != null && !summary.trim().isEmpty()) {
                sb.append("📝 行情摘要: ").append(summary).append("\n\n");
            }
        }
        
        // 如果有原始JSON数据，也包含在内（用于调试）
        if (stockData.containsKey("rawJson")) {
            String rawJson = (String) stockData.get("rawJson");
            if (rawJson != null && rawJson.length() < 500) {  // 只显示较短的JSON
                sb.append("📄 详细数据: ").append(rawJson).append("\n");
            }
        }
        
        // 如果还有其他输出信息，也添加
        if (fullResult.containsKey("output")) {
            String output = (String) fullResult.get("output");
            if (output != null && output.length() > 0) {
                // 只显示输出的前500个字符，避免过长
                String shortOutput = output.length() > 500 ? output.substring(0, 500) + "..." : output;
                sb.append("\n📋 页面信息: ").append(shortOutput);
            }
        }
        
        return sb.toString();
    }
}
