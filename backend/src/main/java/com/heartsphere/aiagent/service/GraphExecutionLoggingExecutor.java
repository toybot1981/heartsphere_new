package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import com.heartsphere.aiagent.graph.core.execution.ExecutionContext;
import com.heartsphere.aiagent.graph.core.execution.EnhancedGraphExecutor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.atomic.AtomicLong;

/**
 * 带日志记录的Graph执行器包装类
 * 在执行过程中自动记录日志
 */
@Slf4j
public class GraphExecutionLoggingExecutor {
    
    private final EnhancedGraphExecutor executor;
    private final ExecutionLogService logService;
    private final String executionId;
    private final Long graphId;
    private final AtomicLong nodeStartTime = new AtomicLong(0);
    
    public GraphExecutionLoggingExecutor(EnhancedGraphExecutor executor, ExecutionLogService logService,
                                        String executionId, Long graphId) {
        this.executor = executor;
        this.logService = logService;
        this.executionId = executionId;
        this.graphId = graphId;
    }
    
    /**
     * 开始执行（带日志记录）
     */
    public ExecutionContext start(GraphEngine.GraphState initialState) {
        ExecutionContext context = executor.start(initialState);
        
        // 记录开始日志
        logService.logExecutionControl(executionId, graphId, 
                com.heartsphere.aiagent.entity.ExecutionLog.LogType.NODE_START, 
                "Graph执行开始");
        
        return context;
    }
    
    /**
     * 继续执行（带日志记录）
     */
    public ExecutionContext continueExecution(ExecutionContext context) {
        ExecutionContext result = executor.continueExecution(context);
        
        // 记录继续执行日志
        logService.logExecutionControl(executionId, graphId,
                com.heartsphere.aiagent.entity.ExecutionLog.LogType.RESUME,
                "Graph执行继续");
        
        return result;
    }
    
    /**
     * 设置用户选择（带日志记录）
     */
    public ExecutionContext setUserChoice(ExecutionContext context, String optionId) {
        ExecutionContext result = executor.setUserChoice(context, optionId);
        
        // 记录用户操作日志
        logService.logUserAction(executionId, graphId, 
                context.getCurrentNodeId(), "choice",
                "用户选择", "选项ID: " + optionId, context.getStepCount());
        
        return result;
    }
    
    /**
     * 暂停执行（带日志记录）
     */
    public ExecutionContext pause(ExecutionContext context, String reason) {
        ExecutionContext result = executor.pause(context, reason);
        
        // 记录暂停日志
        logService.logExecutionControl(executionId, graphId,
                com.heartsphere.aiagent.entity.ExecutionLog.LogType.PAUSE,
                "Graph执行暂停: " + reason);
        
        return result;
    }
    
    /**
     * 恢复执行（带日志记录）
     */
    public ExecutionContext resume(ExecutionContext context) {
        ExecutionContext result = executor.resume(context);
        
        // 记录恢复日志
        logService.logExecutionControl(executionId, graphId,
                com.heartsphere.aiagent.entity.ExecutionLog.LogType.RESUME,
                "Graph执行恢复");
        
        return result;
    }
    
    /**
     * 取消执行（带日志记录）
     */
    public ExecutionContext cancel(ExecutionContext context) {
        ExecutionContext result = executor.cancel(context);
        
        // 记录取消日志
        logService.logExecutionControl(executionId, graphId,
                com.heartsphere.aiagent.entity.ExecutionLog.LogType.CANCEL,
                "Graph执行取消");
        
        return result;
    }
}
