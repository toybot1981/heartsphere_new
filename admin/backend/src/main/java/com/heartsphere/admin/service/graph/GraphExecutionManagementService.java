package com.heartsphere.admin.service.graph;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.graph.*;
import com.heartsphere.admin.entity.graph.GraphExecution;
import com.heartsphere.admin.graph.core.GraphEngine;
import com.heartsphere.admin.graph.core.execution.ExecutionContext;
import com.heartsphere.admin.graph.core.execution.EnhancedGraphExecutor;
import com.heartsphere.admin.graph.core.node.NodeFactory;
import com.heartsphere.admin.graph.core.node.ConditionNode;
import com.heartsphere.admin.repository.graph.GraphExecutionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Graph执行管理服务
 * 提供执行暂停/恢复/取消等管理功能
 */
@Slf4j
@Service
public class GraphExecutionManagementService {
    
    @Autowired
    private GraphExecutionRepository executionRepository;
    
    @Autowired
    private GraphDefinitionService graphDefinitionService;
    
    @Autowired
    private NodeFactory nodeFactory;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 暂停执行
     */
    @Transactional
    public GraphExecutionDTO pauseExecution(Long graphId, String executionId, String reason, Long adminId) {
        log.info("暂停执行，Graph: {}, 执行ID: {}, 原因: {}", graphId, executionId, reason);
        
        // 1. 加载执行记录
        GraphExecution execution = executionRepository.findByExecutionId(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + executionId));
        
        if (!execution.getGraphId().equals(graphId)) {
            throw new RuntimeException("执行记录不属于指定的Graph: " + graphId);
        }
        
        if (!"RUNNING".equals(execution.getStatus()) && !"WAITING".equals(execution.getStatus())) {
            throw new RuntimeException("执行状态不是RUNNING或WAITING，无法暂停: " + execution.getStatus());
        }
        
        // 2. 恢复执行上下文
        ExecutionContext context = restoreExecutionContext(execution);
        
        // 3. 暂停执行（直接更新状态）
        EnhancedGraphExecutor executor = new EnhancedGraphExecutor(null);
        context = executor.pause(context, reason != null ? reason : "管理员暂停");
        
        // 4. 更新执行记录
        updateExecution(execution, context);
        
        log.info("执行已暂停，执行ID: {}", executionId);
        return toDTO(execution);
    }
    
    /**
     * 恢复执行
     */
    @Transactional
    public GraphExecutionDTO resumeExecution(Long graphId, String executionId, Long adminId) {
        log.info("恢复执行，Graph: {}, 执行ID: {}", graphId, executionId);
        
        // 1. 加载执行记录
        GraphExecution execution = executionRepository.findByExecutionId(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + executionId));
        
        if (!execution.getGraphId().equals(graphId)) {
            throw new RuntimeException("执行记录不属于指定的Graph: " + graphId);
        }
        
        if (!"PAUSED".equals(execution.getStatus())) {
            throw new RuntimeException("执行状态不是PAUSED，无法恢复: " + execution.getStatus());
        }
        
        // 2. 恢复执行上下文
        ExecutionContext context = restoreExecutionContext(execution);
        
        // 3. 恢复执行（需要重新构建Graph以继续执行）
        GraphDefinitionDTO graphDTO = graphDefinitionService.getGraphById(graphId);
        GraphEngine.GraphDefinition graphDefinition = buildGraphDefinition(graphDTO);
        EnhancedGraphExecutor executor = new EnhancedGraphExecutor(graphDefinition);
        context = executor.resume(context);
        
        // 4. 更新执行记录
        updateExecution(execution, context);
        
        log.info("执行已恢复，执行ID: {}, 新状态: {}", executionId, context.getStatus());
        return toDTO(execution);
    }
    
    /**
     * 取消执行
     */
    @Transactional
    public GraphExecutionDTO cancelExecution(Long graphId, String executionId, Long adminId) {
        log.info("取消执行，Graph: {}, 执行ID: {}", graphId, executionId);
        
        // 1. 加载执行记录
        GraphExecution execution = executionRepository.findByExecutionId(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + executionId));
        
        if (!execution.getGraphId().equals(graphId)) {
            throw new RuntimeException("执行记录不属于指定的Graph: " + graphId);
        }
        
        if ("COMPLETED".equals(execution.getStatus()) || 
            "CANCELLED".equals(execution.getStatus()) || 
            "FAILED".equals(execution.getStatus())) {
            throw new RuntimeException("执行状态是" + execution.getStatus() + "，无法取消");
        }
        
        // 2. 恢复执行上下文
        ExecutionContext context = restoreExecutionContext(execution);
        
        // 3. 取消执行（直接更新状态）
        EnhancedGraphExecutor executor = new EnhancedGraphExecutor(null);
        context = executor.cancel(context);
        
        // 4. 更新执行记录
        updateExecution(execution, context);
        
        log.info("执行已取消，执行ID: {}", executionId);
        return toDTO(execution);
    }
    
    /**
     * 将GraphDefinitionDTO转换为GraphEngine.GraphDefinition
     */
    private GraphEngine.GraphDefinition buildGraphDefinition(GraphDefinitionDTO graphDTO) {
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphDefinition graphDefinition = engine.createGraphDefinition();
        graphDefinition.setStartNodeId(graphDTO.getStartNodeId());
        
        // 创建节点
        if (graphDTO.getNodes() != null) {
            for (GraphNodeDTO nodeDTO : graphDTO.getNodes()) {
                try {
                    // 确保nodeConfig包含nodeId（某些节点类型需要id字段）
                    Map<String, Object> nodeConfig = nodeDTO.getNodeConfig();
                    if (nodeConfig == null) {
                        nodeConfig = new java.util.HashMap<>();
                    }
                    // 如果config中没有id，使用nodeId
                    if (!nodeConfig.containsKey("id") && nodeDTO.getNodeId() != null) {
                        nodeConfig.put("id", nodeDTO.getNodeId());
                    }
                    
                    GraphEngine.GraphNode node = nodeFactory.createNode(nodeDTO.getNodeType(), nodeConfig);
                    graphDefinition.addNode(node);
                } catch (Exception e) {
                    log.error("创建节点失败: {}, 类型: {}, 配置: {}", 
                            nodeDTO.getNodeId(), nodeDTO.getNodeType(), nodeDTO.getNodeConfig(), e);
                    throw new RuntimeException("创建节点失败: " + nodeDTO.getNodeId() + ", 错误: " + e.getMessage(), e);
                }
            }
        }
        
        // 创建边
        if (graphDTO.getEdges() != null) {
            for (GraphEdgeDTO edgeDTO : graphDTO.getEdges()) {
                GraphEngine.GraphEdge edge = new GraphEngine.GraphEdge(
                        edgeDTO.getSourceNodeId(),
                        edgeDTO.getTargetNodeId(),
                        null
                );
                graphDefinition.addEdge(edge);
            }
        }
        
        // 对于ConditionNode，如果trueNodeId或falseNodeId未设置，从边的信息中推断
        if (graphDTO.getEdges() != null) {
            for (GraphNodeDTO nodeDTO : graphDTO.getNodes()) {
                if ("condition".equals(nodeDTO.getNodeType())) {
                    GraphEngine.GraphNode node = graphDefinition.getNode(nodeDTO.getNodeId());
                    if (node instanceof ConditionNode) {
                        ConditionNode conditionNode = (ConditionNode) node;
                        // 如果trueNodeId或falseNodeId未设置，从边中查找
                        if (conditionNode.getTrueNodeId() == null || conditionNode.getFalseNodeId() == null) {
                            for (GraphEdgeDTO edgeDTO : graphDTO.getEdges()) {
                                if (edgeDTO.getSourceNodeId().equals(nodeDTO.getNodeId())) {
                                    if ("true".equals(edgeDTO.getEdgeType()) && conditionNode.getTrueNodeId() == null) {
                                        conditionNode.setTrueNodeId(edgeDTO.getTargetNodeId());
                                        log.info("从边推断ConditionNode {} 的trueNodeId: {}", nodeDTO.getNodeId(), edgeDTO.getTargetNodeId());
                                    } else if ("false".equals(edgeDTO.getEdgeType()) && conditionNode.getFalseNodeId() == null) {
                                        conditionNode.setFalseNodeId(edgeDTO.getTargetNodeId());
                                        log.info("从边推断ConditionNode {} 的falseNodeId: {}", nodeDTO.getNodeId(), edgeDTO.getTargetNodeId());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return graphDefinition;
    }
    
    /**
     * 恢复执行上下文
     */
    private ExecutionContext restoreExecutionContext(GraphExecution execution) {
        try {
            // 反序列化状态
            Map<String, Object> stateData = objectMapper.readValue(
                    execution.getStateJson(), 
                    new TypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> contextData = execution.getContextDataJson() != null ?
                    objectMapper.readValue(
                            execution.getContextDataJson(),
                            new TypeReference<Map<String, Object>>() {}
                    ) : new HashMap<>();
            
            // 创建GraphState
            GraphEngine engine = new GraphEngine();
            GraphEngine.GraphState state = engine.createState();
            for (Map.Entry<String, Object> entry : stateData.entrySet()) {
                state.setData(entry.getKey(), entry.getValue());
            }
            
            // 创建ExecutionContext
            ExecutionContext.ExecutionStatus status = ExecutionContext.ExecutionStatus.valueOf(execution.getStatus());
            ExecutionContext.WaitType waitType = execution.getWaitType() != null ?
                    ExecutionContext.WaitType.valueOf(execution.getWaitType()) : null;
            
            ExecutionContext context = ExecutionContext.builder()
                    .executionId(execution.getExecutionId())
                    .graphId(execution.getGraphId())
                    .status(status)
                    .currentNodeId(execution.getCurrentNodeId())
                    .state(state)
                    .stepCount(execution.getStepCount())
                    .waitType(waitType)
                    .waitingNodeId(execution.getWaitingNodeId())
                    .contextData(contextData)
                    .build();
            
            // 恢复暂停状态
            if (status == ExecutionContext.ExecutionStatus.PAUSED) {
                context.pause("从数据库恢复");
            }
            
            return context;
        } catch (Exception e) {
            log.error("恢复执行上下文失败", e);
            throw new RuntimeException("恢复执行上下文失败", e);
        }
    }
    
    /**
     * 更新执行记录
     */
    private void updateExecution(GraphExecution execution, ExecutionContext context) {
        execution.setStatus(context.getStatus().name());
        execution.setCurrentNodeId(context.getCurrentNodeId());
        execution.setWaitType(context.getWaitType() != null ? context.getWaitType().name() : null);
        execution.setWaitingNodeId(context.getWaitingNodeId());
        execution.setStepCount(context.getStepCount());
        
        // 如果执行完成或失败或取消，设置完成时间
        if (context.getStatus() == ExecutionContext.ExecutionStatus.COMPLETED ||
            context.getStatus() == ExecutionContext.ExecutionStatus.FAILED ||
            context.getStatus() == ExecutionContext.ExecutionStatus.CANCELLED) {
            execution.setCompletedAt(LocalDateTime.now());
        }
        
        try {
            // 清理状态数据中的 null key，避免序列化错误
            Map<String, Object> stateData = cleanNullKeys(context.getState().getData());
            Map<String, Object> contextData = cleanNullKeys(context.getContextData());
            
            // 序列化状态
            execution.setStateJson(objectMapper.writeValueAsString(stateData));
            execution.setContextDataJson(objectMapper.writeValueAsString(contextData));
        } catch (Exception e) {
            log.error("序列化执行状态失败", e);
            throw new RuntimeException("序列化执行状态失败", e);
        }
        
        executionRepository.save(execution);
    }
    
    /**
     * 清理 Map 中的 null key，递归处理嵌套的 Map
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> cleanNullKeys(Map<String, Object> data) {
        if (data == null) {
            return new HashMap<>();
        }
        
        Map<String, Object> cleaned = new HashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            // 跳过 null key
            if (key == null) {
                log.warn("发现 null key，跳过: value = {}", value);
                continue;
            }
            
            // 如果值是 Map，递归清理
            if (value instanceof Map) {
                try {
                    Map<String, Object> nestedMap = (Map<String, Object>) value;
                    cleaned.put(key, cleanNullKeys(nestedMap));
                } catch (ClassCastException e) {
                    // 如果不是 Map<String, Object>，直接使用原值
                    cleaned.put(key, value);
                }
            } else {
                cleaned.put(key, value);
            }
        }
        return cleaned;
    }
    
    /**
     * 转换为DTO
     */
    private GraphExecutionDTO toDTO(GraphExecution execution) {
        try {
            Map<String, Object> state = execution.getStateJson() != null ?
                    objectMapper.readValue(execution.getStateJson(), new TypeReference<Map<String, Object>>() {}) :
                    new HashMap<>();
            
            Map<String, Object> contextData = execution.getContextDataJson() != null ?
                    objectMapper.readValue(execution.getContextDataJson(), new TypeReference<Map<String, Object>>() {}) :
                    new HashMap<>();
            
            return GraphExecutionDTO.builder()
                    .id(execution.getId())
                    .executionId(execution.getExecutionId())
                    .graphId(execution.getGraphId())
                    .status(execution.getStatus())
                    .currentNodeId(execution.getCurrentNodeId())
                    .waitType(execution.getWaitType())
                    .waitingNodeId(execution.getWaitingNodeId())
                    .stepCount(execution.getStepCount())
                    .state(state)
                    .contextData(contextData)
                    .errorMessage(execution.getErrorMessage())
                    .createdBy(execution.getCreatedBy())
                    .createdAt(execution.getCreatedAt())
                    .updatedAt(execution.getUpdatedAt())
                    .completedAt(execution.getCompletedAt())
                    .build();
        } catch (Exception e) {
            log.error("转换为DTO失败", e);
            throw new RuntimeException("转换为DTO失败", e);
        }
    }
}
