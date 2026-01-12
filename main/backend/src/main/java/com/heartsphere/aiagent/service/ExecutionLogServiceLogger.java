package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import com.heartsphere.aiagent.graph.core.execution.ExecutionLogger;
import lombok.RequiredArgsConstructor;

/**
 * ExecutionLogger接口的实现，使用ExecutionLogService记录日志
 */
@RequiredArgsConstructor
public class ExecutionLogServiceLogger implements ExecutionLogger {
    
    private final ExecutionLogService logService;
    private final String executionId;
    private final Long graphId;
    
    @Override
    public void logNodeStart(String executionId, Long graphId, String nodeId, String nodeType,
                            GraphEngine.GraphState state, Integer stepNumber) {
        logService.logNodeStart(executionId, graphId, nodeId, nodeType, state, stepNumber);
    }
    
    @Override
    public void logNodeEnd(String executionId, Long graphId, String nodeId, String nodeType,
                          GraphEngine.GraphState state, Integer stepNumber, Long executionTimeMs) {
        logService.logNodeEnd(executionId, graphId, nodeId, nodeType, state, stepNumber, executionTimeMs);
    }
    
    @Override
    public void logNodeError(String executionId, Long graphId, String nodeId, String nodeType,
                            String errorMessage, GraphEngine.GraphState state, Integer stepNumber) {
        logService.logNodeError(executionId, graphId, nodeId, nodeType, errorMessage, state, stepNumber);
    }
    
    @Override
    public void logStateChange(String executionId, Long graphId, String nodeId, String nodeType,
                              String message, GraphEngine.GraphState state, Integer stepNumber) {
        logService.logStateChange(executionId, graphId, nodeId, nodeType, message, state, stepNumber);
    }
}
