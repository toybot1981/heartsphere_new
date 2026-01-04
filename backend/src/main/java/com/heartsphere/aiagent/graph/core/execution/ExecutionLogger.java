package com.heartsphere.aiagent.graph.core.execution;

import com.heartsphere.aiagent.graph.core.GraphEngine;

/**
 * Graph执行日志记录器接口
 * 用于在执行过程中记录日志
 */
public interface ExecutionLogger {
    
    /**
     * 记录节点开始执行
     */
    void logNodeStart(String executionId, Long graphId, String nodeId, String nodeType,
                     GraphEngine.GraphState state, Integer stepNumber);
    
    /**
     * 记录节点执行结束
     */
    void logNodeEnd(String executionId, Long graphId, String nodeId, String nodeType,
                   GraphEngine.GraphState state, Integer stepNumber, Long executionTimeMs);
    
    /**
     * 记录节点执行错误
     */
    void logNodeError(String executionId, Long graphId, String nodeId, String nodeType,
                     String errorMessage, GraphEngine.GraphState state, Integer stepNumber);
    
    /**
     * 记录状态变更
     */
    void logStateChange(String executionId, Long graphId, String nodeId, String nodeType,
                       String message, GraphEngine.GraphState state, Integer stepNumber);
    
    /**
     * 空实现（不记录日志）
     */
    ExecutionLogger NO_OP = new ExecutionLogger() {
        @Override
        public void logNodeStart(String executionId, Long graphId, String nodeId, String nodeType,
                                GraphEngine.GraphState state, Integer stepNumber) {
            // 不记录
        }
        
        @Override
        public void logNodeEnd(String executionId, Long graphId, String nodeId, String nodeType,
                              GraphEngine.GraphState state, Integer stepNumber, Long executionTimeMs) {
            // 不记录
        }
        
        @Override
        public void logNodeError(String executionId, Long graphId, String nodeId, String nodeType,
                                String errorMessage, GraphEngine.GraphState state, Integer stepNumber) {
            // 不记录
        }
        
        @Override
        public void logStateChange(String executionId, Long graphId, String nodeId, String nodeType,
                                  String message, GraphEngine.GraphState state, Integer stepNumber) {
            // 不记录
        }
    };
}
