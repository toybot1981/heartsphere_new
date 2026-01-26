package com.heartsphere.aiagent.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.*;
import com.heartsphere.aiagent.entity.GraphExecution;
import com.heartsphere.aiagent.graph.core.GraphEngine;
import com.heartsphere.aiagent.graph.core.execution.ExecutionContext;
import com.heartsphere.aiagent.graph.core.execution.EnhancedGraphExecutor;
import com.heartsphere.aiagent.graph.core.node.ConditionNode;
import com.heartsphere.aiagent.graph.core.node.NodeFactory;
import com.heartsphere.aiagent.repository.GraphExecutionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Graph执行服务
 * 提供Graph执行的业务逻辑
 */
@Slf4j
@Service
public class GraphExecutionService {
    
    @Autowired
    private GraphExecutionRepository executionRepository;
    
    @Autowired
    private GraphDefinitionService graphDefinitionService;
    
    @Autowired
    private NodeFactory nodeFactory;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 执行Graph
     */
    @Transactional
    public GraphExecutionDTO executeGraph(Long graphId, GraphExecutionRequest request, Long adminId) {
        log.info("开始执行Graph: {}", graphId);
        
        // 1. 加载Graph定义
        GraphDefinitionDTO graphDTO = graphDefinitionService.getGraphById(graphId);
        if (graphDTO == null) {
            throw new RuntimeException("Graph定义不存在: " + graphId);
        }
        
        // 2. 转换为GraphEngine.GraphDefinition
        GraphEngine.GraphDefinition graphDefinition = buildGraphDefinition(graphDTO);
        
        // 3. 创建初始状态
        GraphEngine.GraphState initialState = createInitialState(request);
        
        // 4. 创建执行器并开始执行
        EnhancedGraphExecutor executor = new EnhancedGraphExecutor(graphDefinition);
        ExecutionContext context = executor.start(initialState);
        
        // 5. 保存执行记录
        GraphExecution execution = saveExecution(graphId, context, adminId);
        
        log.info("Graph执行开始，执行ID: {}", execution.getExecutionId());
        
        return toDTO(execution);
    }
    
    /**
     * 获取执行状态
     */
    public GraphExecutionDTO getExecutionStatus(Long graphId, String executionId) {
        GraphExecution execution = executionRepository.findByExecutionId(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + executionId));
        
        if (!execution.getGraphId().equals(graphId)) {
            throw new RuntimeException("执行记录不属于指定的Graph: " + graphId);
        }
        
        return toDTO(execution);
    }
    
    /**
     * 继续执行（用于WaitNode）
     */
    @Transactional
    public GraphExecutionDTO continueExecution(Long graphId, String executionId, Long adminId) {
        log.info("继续执行Graph: {}, 执行ID: {}", graphId, executionId);
        
        // 1. 加载执行记录
        GraphExecution execution = executionRepository.findByExecutionId(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + executionId));
        
        if (!execution.getGraphId().equals(graphId)) {
            throw new RuntimeException("执行记录不属于指定的Graph: " + graphId);
        }
        
        if (!"WAITING".equals(execution.getStatus()) && !"PAUSED".equals(execution.getStatus())) {
            throw new RuntimeException("执行状态不是WAITING或PAUSED，无法继续: " + execution.getStatus());
        }
        
        // 2. 恢复执行上下文
        ExecutionContext context = restoreExecutionContext(execution);
        
        // 3. 加载Graph定义
        GraphDefinitionDTO graphDTO = graphDefinitionService.getGraphById(graphId);
        GraphEngine.GraphDefinition graphDefinition = buildGraphDefinition(graphDTO);
        
        // 4. 继续执行
        EnhancedGraphExecutor executor = new EnhancedGraphExecutor(graphDefinition);
        context = executor.continueExecution(context);
        
        // 5. 更新执行记录
        updateExecution(execution, context);
        
        log.info("Graph执行继续，执行ID: {}, 新状态: {}", executionId, context.getStatus());
        
        return toDTO(execution);
    }
    
    /**
     * 用户选择（用于ChoiceNode）
     */
    @Transactional
    public GraphExecutionDTO makeChoice(Long graphId, String executionId, GraphExecutionChoiceRequest choiceRequest, Long adminId) {
        log.info("处理用户选择，Graph: {}, 执行ID: {}, 选项: {}", graphId, executionId, choiceRequest.getOptionId());
        
        // 1. 加载执行记录
        GraphExecution execution = executionRepository.findByExecutionId(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + executionId));
        
        if (!execution.getGraphId().equals(graphId)) {
            throw new RuntimeException("执行记录不属于指定的Graph: " + graphId);
        }
        
        if (!"WAITING".equals(execution.getStatus()) || !"CHOICE".equals(execution.getWaitType())) {
            throw new RuntimeException("执行状态不是WAITING/CHOICE，无法处理选择: " + execution.getStatus() + "/" + execution.getWaitType());
        }
        
        // 2. 恢复执行上下文
        ExecutionContext context = restoreExecutionContext(execution);
        
        // 3. 加载Graph定义
        GraphDefinitionDTO graphDTO = graphDefinitionService.getGraphById(graphId);
        GraphEngine.GraphDefinition graphDefinition = buildGraphDefinition(graphDTO);
        
        // 4. 设置用户选择并继续执行
        EnhancedGraphExecutor executor = new EnhancedGraphExecutor(graphDefinition);
        context = executor.setUserChoice(context, choiceRequest.getOptionId());
        
        // 5. 更新执行记录
        updateExecution(execution, context);
        
        log.info("用户选择已处理，执行ID: {}, 新状态: {}", executionId, context.getStatus());
        
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
        
        // 创建边（简单的边，不使用路由器）
        if (graphDTO.getEdges() != null) {
            for (GraphEdgeDTO edgeDTO : graphDTO.getEdges()) {
                GraphEngine.GraphEdge edge = new GraphEngine.GraphEdge(
                        edgeDTO.getSourceNodeId(),
                        edgeDTO.getTargetNodeId(),
                        null // 路由器暂时为null，后续可以扩展
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
     * 创建初始状态
     */
    private GraphEngine.GraphState createInitialState(GraphExecutionRequest request) {
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphState state = engine.createState();
        
        // 如果请求中有初始状态数据，设置到state中
        if (request != null && request.getInitialState() != null) {
            for (Map.Entry<String, Object> entry : request.getInitialState().entrySet()) {
                state.setData(entry.getKey(), entry.getValue());
            }
        }
        
        // 初始化默认数据
        state.setData("character_favorability", new HashMap<String, Integer>());
        state.setData("character_skills", new HashMap<String, Integer>());
        state.setData("triggered_events", new java.util.ArrayList<String>());
        state.setData("collected_items", new java.util.ArrayList<String>());
        state.setData("dialogue_history", new java.util.ArrayList<Map<String, Object>>());
        
        return state;
    }
    
    /**
     * 保存执行记录
     */
    private GraphExecution saveExecution(Long graphId, ExecutionContext context, Long adminId) {
        GraphExecution execution = new GraphExecution();
        execution.setExecutionId(context.getExecutionId());
        execution.setGraphId(graphId);
        execution.setStatus(context.getStatus().name());
        execution.setCurrentNodeId(context.getCurrentNodeId());
        execution.setWaitType(context.getWaitType() != null ? context.getWaitType().name() : null);
        execution.setWaitingNodeId(context.getWaitingNodeId());
        execution.setStepCount(context.getStepCount());
        execution.setCreatedBy(adminId);
        
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
        
        return executionRepository.save(execution);
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
     * 更新执行记录
     */
    private void updateExecution(GraphExecution execution, ExecutionContext context) {
        execution.setStatus(context.getStatus().name());
        execution.setCurrentNodeId(context.getCurrentNodeId());
        execution.setWaitType(context.getWaitType() != null ? context.getWaitType().name() : null);
        execution.setWaitingNodeId(context.getWaitingNodeId());
        execution.setStepCount(context.getStepCount());
        
        // 如果执行完成或失败，设置完成时间
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
    
    /**
     * 查询执行历史
     */
    public GraphExecutionListResponse queryExecutions(GraphExecutionQueryRequest request) {
        log.info("查询执行历史: {}", request);
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(request.getPage(), request.getSize());
        
        // 使用复杂查询方法
        org.springframework.data.domain.Page<GraphExecution> page = executionRepository.findByConditions(
                request.getGraphId(),
                request.getStatus(),
                request.getCreatedBy(),
                request.getStartTime(),
                request.getEndTime(),
                pageable
        );
        
        java.util.List<GraphExecutionDTO> executionDTOs = page.getContent().stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
        
        return GraphExecutionListResponse.builder()
                .executions(executionDTOs)
                .total(page.getTotalElements())
                .page(request.getPage())
                .size(request.getSize())
                .totalPages(page.getTotalPages())
                .build();
    }
    
    /**
     * 根据Graph ID查询执行历史
     */
    public GraphExecutionListResponse getExecutionsByGraphId(Long graphId, Integer page, Integer size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page != null ? page : 0, size != null ? size : 20);
        org.springframework.data.domain.Page<GraphExecution> executionPage = executionRepository.findByGraphId(graphId, pageable);
        
        java.util.List<GraphExecutionDTO> executionDTOs = executionPage.getContent().stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
        
        return GraphExecutionListResponse.builder()
                .executions(executionDTOs)
                .total(executionPage.getTotalElements())
                .page(page != null ? page : 0)
                .size(size != null ? size : 20)
                .totalPages(executionPage.getTotalPages())
                .build();
    }
    
    /**
     * 清理旧的执行记录
     */
    @Transactional
    public int cleanupOldExecutions(int daysBefore) {
        log.info("开始清理{}天前的执行记录", daysBefore);
        
        LocalDateTime beforeTime = LocalDateTime.now().minusDays(daysBefore);
        java.util.List<String> completedStatuses = java.util.Arrays.asList(
                ExecutionContext.ExecutionStatus.COMPLETED.name(),
                ExecutionContext.ExecutionStatus.FAILED.name(),
                ExecutionContext.ExecutionStatus.CANCELLED.name()
        );
        
        // 查询需要删除的记录数（用于日志）
        long countBefore = executionRepository.count();
        
        // 删除旧记录
        executionRepository.deleteByStatusInAndCompletedAtBefore(completedStatuses, beforeTime);
        
        long countAfter = executionRepository.count();
        int deletedCount = (int) (countBefore - countAfter);
        
        log.info("清理完成，删除了{}条执行记录", deletedCount);
        return deletedCount;
    }
    
    /**
     * 获取执行统计信息
     */
    public Map<String, Object> getExecutionStatistics(Long graphId) {
        Map<String, Object> stats = new HashMap<>();
        
        if (graphId != null) {
            // 指定Graph的统计
            stats.put("total", executionRepository.countByGraphId(graphId));
            stats.put("completed", executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.COMPLETED.name()).size());
            stats.put("failed", executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.FAILED.name()).size());
            stats.put("running", executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.RUNNING.name()).size());
            stats.put("waiting", executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.WAITING.name()).size());
        } else {
            // 全局统计
            stats.put("total", executionRepository.count());
            stats.put("completed", executionRepository.countByStatus(ExecutionContext.ExecutionStatus.COMPLETED.name()));
            stats.put("failed", executionRepository.countByStatus(ExecutionContext.ExecutionStatus.FAILED.name()));
            stats.put("running", executionRepository.countByStatus(ExecutionContext.ExecutionStatus.RUNNING.name()));
            stats.put("waiting", executionRepository.countByStatus(ExecutionContext.ExecutionStatus.WAITING.name()));
        }
        
        return stats;
    }
    
    /**
     * 获取执行分析数据
     */
    public com.heartsphere.aiagent.dto.GraphExecutionAnalyticsDTO getExecutionAnalytics(Long graphId) {
        com.heartsphere.aiagent.dto.GraphExecutionAnalyticsDTO.GraphExecutionAnalyticsDTOBuilder builder = 
                com.heartsphere.aiagent.dto.GraphExecutionAnalyticsDTO.builder();
        
        long total = graphId != null ? executionRepository.countByGraphId(graphId) : executionRepository.count();
        long completed = graphId != null ? 
                executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.COMPLETED.name()).size() :
                executionRepository.countByStatus(ExecutionContext.ExecutionStatus.COMPLETED.name());
        long failed = graphId != null ?
                executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.FAILED.name()).size() :
                executionRepository.countByStatus(ExecutionContext.ExecutionStatus.FAILED.name());
        long cancelled = graphId != null ?
                executionRepository.findByGraphIdAndStatus(graphId, ExecutionContext.ExecutionStatus.CANCELLED.name()).size() :
                executionRepository.countByStatus(ExecutionContext.ExecutionStatus.CANCELLED.name());
        
        builder.totalExecutions(total)
                .completedExecutions(completed)
                .failedExecutions(failed)
                .cancelledExecutions(cancelled);
        
        // 计算成功率
        if (total > 0) {
            double successRate = (double) completed / total * 100;
            builder.successRate(successRate);
        } else {
            builder.successRate(0.0);
        }
        
        // 统计信息
        Map<String, Object> stats = getExecutionStatistics(graphId);
        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("RUNNING", ((Number) stats.get("running")).longValue());
        statusCounts.put("WAITING", ((Number) stats.get("waiting")).longValue());
        statusCounts.put("COMPLETED", completed);
        statusCounts.put("FAILED", failed);
        statusCounts.put("CANCELLED", cancelled);
        builder.statusCounts(statusCounts);
        
        // TODO: 平均执行步骤数和平均执行时间需要从执行记录中计算
        // 当前GraphExecution实体中没有存储执行时间，可以后续添加
        builder.averageStepCount(0.0);
        builder.averageExecutionTime(0.0);
        
        return builder.build();
    }
}
