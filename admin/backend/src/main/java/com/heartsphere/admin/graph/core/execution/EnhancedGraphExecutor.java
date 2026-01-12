package com.heartsphere.admin.graph.core.execution;

import com.heartsphere.admin.graph.core.GraphEngine;
import com.heartsphere.admin.graph.core.node.ChoiceNode;
import com.heartsphere.admin.graph.core.node.WaitNode;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

/**
 * 增强的Graph执行器
 * 支持暂停/恢复、用户选择处理、等待逻辑等高级功能
 *
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class EnhancedGraphExecutor {
    
    private final GraphEngine.GraphDefinition graph;
    private final int maxSteps;
    private ExecutionContext context;
    
    public EnhancedGraphExecutor(GraphEngine.GraphDefinition graph) {
        this(graph, 1000);
    }
    
    public EnhancedGraphExecutor(GraphEngine.GraphDefinition graph, int maxSteps) {
        this.graph = graph;
        this.maxSteps = maxSteps;
    }
    
    /**
     * 开始执行Graph
     * @param initialState 初始状态
     * @return 执行上下文
     */
    public ExecutionContext start(GraphEngine.GraphState initialState) {
        String executionId = UUID.randomUUID().toString();
        this.context = ExecutionContext.builder()
                .executionId(executionId)
                .graphId(null) // 如果Graph有ID，可以设置
                .status(ExecutionContext.ExecutionStatus.RUNNING)
                .currentNodeId(graph.getStartNodeId())
                .state(initialState)
                .stepCount(0)
                .build();
        
        log.info("[EnhancedGraphExecutor] 开始执行Graph，执行ID: {}, 起始节点: {}", executionId, graph.getStartNodeId());
        return executeInternal();
    }
    
    /**
     * 继续执行（用于从暂停或等待状态恢复）
     * @param context 执行上下文
     * @return 更新后的执行上下文
     */
    public ExecutionContext continueExecution(ExecutionContext context) {
        this.context = context;
        
        if (context.getStatus() == ExecutionContext.ExecutionStatus.PAUSED) {
            context.resume();
        } else if (context.getStatus() == ExecutionContext.ExecutionStatus.WAITING) {
            context.clearWaiting();
        }
        
        log.info("[EnhancedGraphExecutor] 继续执行，执行ID: {}, 当前节点: {}", 
                context.getExecutionId(), context.getCurrentNodeId());
        return executeInternal();
    }
    
    /**
     * 设置用户选择（用于ChoiceNode）
     * @param context 执行上下文
     * @param optionId 选项ID
     * @return 更新后的执行上下文
     */
    public ExecutionContext setUserChoice(ExecutionContext context, String optionId) {
        this.context = context;
        context.setUserChoice(optionId);
        
        // 清除等待状态，恢复为运行状态
        context.clearWaiting();
        context.setStatus(ExecutionContext.ExecutionStatus.RUNNING);
        
        log.info("[EnhancedGraphExecutor] 用户选择选项: {}, 继续执行", optionId);
        return executeInternal();
    }
    
    /**
     * 内部执行逻辑
     */
    private ExecutionContext executeInternal() {
        GraphEngine.GraphState currentState = context.getState();
        String currentNodeId = context.getCurrentNodeId();
        
        while (currentNodeId != null && 
               context.getStepCount() < maxSteps && 
               !context.isPaused() &&
               context.getStatus() == ExecutionContext.ExecutionStatus.RUNNING) {
            
            context.incrementStepCount();
            context.setCurrentNodeId(currentNodeId);
            
            // 获取当前节点
            GraphEngine.GraphNode currentNode = graph.getNode(currentNodeId);
            if (currentNode == null) {
                log.error("[EnhancedGraphExecutor] 节点不存在: {}", currentNodeId);
                context.setStatus(ExecutionContext.ExecutionStatus.FAILED);
                break;
            }
            
            // 如果是ChoiceNode且有用户选择，跳过execute，直接处理选择
            boolean skipExecute = false;
            if (currentNode instanceof ChoiceNode && context.getUserChoiceOptionId() != null) {
                skipExecute = true;
                log.debug("[EnhancedGraphExecutor] 跳过ChoiceNode执行，直接处理用户选择");
            }
            
            // 执行节点（如果不需要跳过）
            if (!skipExecute) {
                log.debug("[EnhancedGraphExecutor] 执行节点: {} (步骤: {})", currentNodeId, context.getStepCount());
                try {
                    currentState = currentNode.execute(currentState);
                    context.setState(currentState);
                } catch (Exception e) {
                    log.error("[EnhancedGraphExecutor] 节点执行失败: {}", currentNodeId, e);
                    context.setStatus(ExecutionContext.ExecutionStatus.FAILED);
                    throw new GraphEngine.GraphExecutionException("节点执行失败: " + currentNodeId, e);
                }
            }
            
            // 检查是否为等待节点
            if (currentNode instanceof WaitNode) {
                WaitNode waitNode = (WaitNode) currentNode;
                if (!waitNode.checkWaitCondition(currentState)) {
                    // 需要等待，暂停执行
                    context.setWaiting(currentNodeId, ExecutionContext.WaitType.WAIT);
                    log.info("[EnhancedGraphExecutor] 执行暂停，等待条件满足，节点: {}", currentNodeId);
                    return context;
                }
            }
            
            // 检查是否为选择节点
            if (currentNode instanceof ChoiceNode) {
                ChoiceNode choiceNode = (ChoiceNode) currentNode;
                
                // 检查是否有用户选择
                if (context.getUserChoiceOptionId() == null) {
                    // 没有用户选择，需要等待用户选择
                    context.setWaiting(currentNodeId, ExecutionContext.WaitType.CHOICE);
                    log.info("[EnhancedGraphExecutor] 执行暂停，等待用户选择，节点: {}", currentNodeId);
                    return context;
                }
                
                // 有用户选择，处理选择逻辑
                String selectedOptionId = context.getUserChoiceOptionId();
                log.info("[EnhancedGraphExecutor] 处理用户选择: {}, 当前节点: {}", selectedOptionId, currentNodeId);
                
                // 使用 ChoiceNode 的 handleChoice 方法处理选择
                // 这会应用选择的效果并返回下一个节点ID
                try {
                    String nextNodeId = choiceNode.handleChoice(selectedOptionId, currentState);
                    if (nextNodeId != null && !nextNodeId.isEmpty()) {
                        log.info("[EnhancedGraphExecutor] 选择处理成功，下一个节点: {}", nextNodeId);
                        currentNodeId = nextNodeId;
                        context.setUserChoice(null); // 清除选择
                        context.setCurrentNodeId(currentNodeId);
                        // 继续执行下一个节点，不执行当前节点的execute方法
                        continue;
                    } else {
                        log.warn("[EnhancedGraphExecutor] 选择处理失败，未返回下一个节点，选项ID: {}", selectedOptionId);
                        // 如果没有返回下一个节点，尝试通过边查找下一个节点
                        List<GraphEngine.GraphEdge> edges = graph.getEdgesFrom(currentNodeId);
                        if (!edges.isEmpty()) {
                            GraphEngine.GraphEdge nextEdge = selectNextEdge(edges, currentState);
                            if (nextEdge != null) {
                                currentNodeId = nextEdge.getTargetNodeId();
                                context.setCurrentNodeId(currentNodeId);
                                context.setUserChoice(null);
                                continue;
                            }
                        }
                        context.setStatus(ExecutionContext.ExecutionStatus.FAILED);
                        break;
                    }
                } catch (Exception e) {
                    log.error("[EnhancedGraphExecutor] 处理用户选择时出错: {}", selectedOptionId, e);
                    context.setStatus(ExecutionContext.ExecutionStatus.FAILED);
                    throw new GraphEngine.GraphExecutionException("处理用户选择失败: " + selectedOptionId, e);
                }
            }
            
            // 查找下一个节点
            List<GraphEngine.GraphEdge> edges = graph.getEdgesFrom(currentNodeId);
            if (edges.isEmpty()) {
                // 没有后续节点，执行结束
                log.info("[EnhancedGraphExecutor] 节点 {} 没有后续节点，执行结束", currentNodeId);
                context.setStatus(ExecutionContext.ExecutionStatus.COMPLETED);
                break;
            }
            
            // 选择下一个节点
            GraphEngine.GraphEdge nextEdge = selectNextEdge(edges, currentState);
            if (nextEdge == null) {
                log.warn("[EnhancedGraphExecutor] 无法选择下一个节点，执行结束");
                context.setStatus(ExecutionContext.ExecutionStatus.COMPLETED);
                break;
            }
            
            currentNodeId = nextEdge.getTargetNodeId();
            context.setCurrentNodeId(currentNodeId);
            log.debug("[EnhancedGraphExecutor] 选择下一个节点: {}", currentNodeId);
        }
        
        // 检查是否达到最大步骤数
        if (context.getStepCount() >= maxSteps) {
            log.warn("[EnhancedGraphExecutor] 达到最大执行步骤数，执行终止");
            context.setStatus(ExecutionContext.ExecutionStatus.FAILED);
            throw new GraphEngine.GraphExecutionException("达到最大执行步骤数: " + maxSteps);
        }
        
        // 如果执行完成，设置状态
        if (context.getStatus() == ExecutionContext.ExecutionStatus.RUNNING) {
            context.setStatus(ExecutionContext.ExecutionStatus.COMPLETED);
        }
        
        log.info("[EnhancedGraphExecutor] Graph执行完成，执行ID: {}, 共执行 {} 步，状态: {}", 
                context.getExecutionId(), context.getStepCount(), context.getStatus());
        return context;
    }
    
    
    /**
     * 选择下一个边（节点）
     * 优化后的路由选择逻辑，支持更复杂的条件判断
     */
    private GraphEngine.GraphEdge selectNextEdge(List<GraphEngine.GraphEdge> edges, GraphEngine.GraphState state) {
        if (edges.isEmpty()) {
            return null;
        }
        
        // 1. 优先使用带路由器的边
        List<GraphEngine.GraphEdge> routedEdges = edges.stream()
                .filter(GraphEngine.GraphEdge::hasRouter)
                .toList();
        
        if (!routedEdges.isEmpty()) {
            // 遍历所有带路由的边，找到第一个路由条件满足的
            for (GraphEngine.GraphEdge edge : routedEdges) {
                String targetNodeId = edge.getRouter().route(state);
                if (targetNodeId != null && targetNodeId.equals(edge.getTargetNodeId())) {
                    log.debug("[EnhancedGraphExecutor] 路由选择边: {} -> {}", edge.getSourceNodeId(), edge.getTargetNodeId());
                    return edge;
                }
            }
            // 如果所有路由条件都不满足，返回null
            log.debug("[EnhancedGraphExecutor] 所有路由条件都不满足");
            return null;
        }
        
        // 2. 如果没有路由器，使用state中的next_node（由节点执行时设置）
        String nextNodeId = (String) state.getData("next_node");
        if (nextNodeId != null) {
            for (GraphEngine.GraphEdge edge : edges) {
                if (nextNodeId.equals(edge.getTargetNodeId())) {
                    log.debug("[EnhancedGraphExecutor] 使用状态中的next_node选择边: {} -> {}", 
                            edge.getSourceNodeId(), edge.getTargetNodeId());
                    return edge;
                }
            }
        }
        
        // 3. 默认选择第一条边
        log.debug("[EnhancedGraphExecutor] 默认选择第一条边: {} -> {}", 
                edges.get(0).getSourceNodeId(), edges.get(0).getTargetNodeId());
        return edges.get(0);
    }
    
    /**
     * 暂停执行
     */
    public ExecutionContext pause(ExecutionContext context, String reason) {
        this.context = context;
        context.pause(reason);
        log.info("[EnhancedGraphExecutor] 执行已暂停，原因: {}", reason);
        return context;
    }
    
    /**
     * 恢复执行
     */
    public ExecutionContext resume(ExecutionContext context) {
        this.context = context;
        context.resume();
        log.info("[EnhancedGraphExecutor] 执行已恢复");
        return continueExecution(context);
    }
    
    /**
     * 取消执行
     */
    public ExecutionContext cancel(ExecutionContext context) {
        this.context = context;
        context.setStatus(ExecutionContext.ExecutionStatus.CANCELLED);
        log.info("[EnhancedGraphExecutor] 执行已取消");
        return context;
    }
    
    /**
     * 获取当前执行上下文
     */
    public ExecutionContext getContext() {
        return context;
    }
}
