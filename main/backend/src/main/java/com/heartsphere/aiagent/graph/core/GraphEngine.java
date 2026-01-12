package com.heartsphere.aiagent.graph.core;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Graph引擎核心实现
 * 
 * 这是"高级角色和剧本设计器"的核心Graph执行引擎。
 * 基于技术预研结果，使用自定义实现（不使用Spring AI Graph）。
 * 
 * 核心概念：
 * - GraphState: 状态接口，用于节点间数据传递
 * - GraphNode: 节点接口，执行逻辑单元
 * - GraphRouter: 路由接口，条件分支选择
 * - GraphEdge: 边定义，连接节点
 * - GraphDefinition: Graph定义，包含节点和边
 * - GraphExecutor: 执行器，执行Graph
 * 
 * @author HeartSphere
 * @version 1.0
 * @see com.heartsphere.aiagent.graph.research.CustomGraphEngine (预研版本)
 */
@Slf4j
@Component
public class GraphEngine {
    
    /**
     * Graph状态接口
     * 用于在节点之间传递数据
     */
    public interface GraphState {
        Map<String, Object> getData();
        void setData(String key, Object value);
        Object getData(String key);
        GraphState clone();
    }
    
    /**
     * Graph节点接口
     * 表示Graph中的一个执行单元
     */
    public interface GraphNode {
        String getId();
        GraphState execute(GraphState state);
    }
    
    /**
     * Graph路由接口
     * 用于根据条件选择下一个节点
     */
    public interface GraphRouter {
        String route(GraphState state);
    }
    
    /**
     * Graph边
     * 表示节点之间的连接
     */
    public static class GraphEdge {
        private final String sourceNodeId;
        private final String targetNodeId;
        private final GraphRouter router; // 可选的路由器
        
        public GraphEdge(String sourceNodeId, String targetNodeId) {
            this(sourceNodeId, targetNodeId, null);
        }
        
        public GraphEdge(String sourceNodeId, String targetNodeId, GraphRouter router) {
            this.sourceNodeId = sourceNodeId;
            this.targetNodeId = targetNodeId;
            this.router = router;
        }
        
        public String getSourceNodeId() {
            return sourceNodeId;
        }
        
        public String getTargetNodeId() {
            return targetNodeId;
        }
        
        public GraphRouter getRouter() {
            return router;
        }
        
        public boolean hasRouter() {
            return router != null;
        }
    }
    
    /**
     * 简单的Graph状态实现
     */
    public static class SimpleGraphState implements GraphState {
        private final Map<String, Object> data = new HashMap<>();
        
        @Override
        public Map<String, Object> getData() {
            return new HashMap<>(data);
        }
        
        @Override
        public void setData(String key, Object value) {
            data.put(key, value);
        }
        
        @Override
        public Object getData(String key) {
            return data.get(key);
        }
        
        @Override
        public GraphState clone() {
            SimpleGraphState cloned = new SimpleGraphState();
            cloned.data.putAll(this.data);
            return cloned;
        }
    }
    
    /**
     * Graph定义
     * 包含节点、边和起始节点
     */
    public static class GraphDefinition {
        private final Map<String, GraphNode> nodes = new HashMap<>();
        private final List<GraphEdge> edges = new ArrayList<>();
        private String startNodeId;
        
        public void addNode(GraphNode node) {
            nodes.put(node.getId(), node);
        }
        
        public void addEdge(GraphEdge edge) {
            edges.add(edge);
        }
        
        public void setStartNodeId(String startNodeId) {
            this.startNodeId = startNodeId;
        }
        
        public GraphNode getNode(String nodeId) {
            return nodes.get(nodeId);
        }
        
        public List<GraphEdge> getEdgesFrom(String sourceNodeId) {
            return edges.stream()
                .filter(edge -> edge.getSourceNodeId().equals(sourceNodeId))
                .toList();
        }
        
        public String getStartNodeId() {
            return startNodeId;
        }
        
        public Map<String, GraphNode> getNodes() {
            return new HashMap<>(nodes);
        }
        
        public List<GraphEdge> getEdges() {
            return new ArrayList<>(edges);
        }
    }
    
    /**
     * Graph执行器
     * 负责执行Graph定义
     */
    public static class GraphExecutor {
        private final GraphDefinition graph;
        private final int maxSteps; // 最大执行步骤数（防止无限循环）
        
        public GraphExecutor(GraphDefinition graph) {
            this(graph, 1000);
        }
        
        public GraphExecutor(GraphDefinition graph, int maxSteps) {
            this.graph = graph;
            this.maxSteps = maxSteps;
        }
        
        /**
         * 执行Graph
         * @param initialState 初始状态
         * @return 最终状态
         */
        public GraphState execute(GraphState initialState) {
            GraphState currentState = initialState;
            String currentNodeId = graph.getStartNodeId();
            int stepCount = 0;
            
            log.info("[GraphEngine] 开始执行Graph，起始节点: {}", currentNodeId);
            
            while (currentNodeId != null && stepCount < maxSteps) {
                stepCount++;
                
                // 获取当前节点
                GraphNode currentNode = graph.getNode(currentNodeId);
                if (currentNode == null) {
                    log.error("[GraphEngine] 节点不存在: {}", currentNodeId);
                    break;
                }
                
                // 执行节点
                log.debug("[GraphEngine] 执行节点: {}", currentNodeId);
                try {
                    currentState = currentNode.execute(currentState);
                } catch (Exception e) {
                    log.error("[GraphEngine] 节点执行失败: {}", currentNodeId, e);
                    throw new GraphExecutionException("节点执行失败: " + currentNodeId, e);
                }
                
                // 查找下一个节点
                List<GraphEdge> edges = graph.getEdgesFrom(currentNodeId);
                if (edges.isEmpty()) {
                    // 没有后续节点，执行结束
                    log.info("[GraphEngine] 节点 {} 没有后续节点，执行结束", currentNodeId);
                    break;
                }
                
                // 选择下一个节点
                GraphEdge nextEdge = selectNextEdge(edges, currentState);
                if (nextEdge == null) {
                    log.warn("[GraphEngine] 无法选择下一个节点，执行结束");
                    break;
                }
                
                currentNodeId = nextEdge.getTargetNodeId();
                log.debug("[GraphEngine] 选择下一个节点: {}", currentNodeId);
            }
            
            if (stepCount >= maxSteps) {
                log.warn("[GraphEngine] 达到最大执行步骤数，执行终止");
                throw new GraphExecutionException("达到最大执行步骤数: " + maxSteps);
            }
            
            log.info("[GraphEngine] Graph执行完成，共执行 {} 步", stepCount);
            return currentState;
        }
        
        /**
         * 选择下一个边（节点）
         */
        private GraphEdge selectNextEdge(List<GraphEdge> edges, GraphState state) {
            // 如果有带路由器的边，使用路由器选择
            List<GraphEdge> routedEdges = edges.stream()
                .filter(GraphEdge::hasRouter)
                .toList();
            
            if (!routedEdges.isEmpty()) {
                // 遍历所有带路由的边，找到第一个路由条件满足的
                for (GraphEdge edge : routedEdges) {
                    String targetNodeId = edge.getRouter().route(state);
                    if (targetNodeId != null && targetNodeId.equals(edge.getTargetNodeId())) {
                        return edge;
                    }
                }
                // 如果所有路由条件都不满足，返回null
                return null;
            }
            
            // 如果没有路由器，选择第一条边
            return edges.isEmpty() ? null : edges.get(0);
        }
    }
    
    /**
     * Graph执行异常
     */
    public static class GraphExecutionException extends RuntimeException {
        public GraphExecutionException(String message) {
            super(message);
        }
        
        public GraphExecutionException(String message, Throwable cause) {
            super(message, cause);
        }
    }
    
    /**
     * 创建Graph定义
     */
    public GraphDefinition createGraphDefinition() {
        return new GraphDefinition();
    }
    
    /**
     * 创建Graph执行器
     */
    public GraphExecutor createExecutor(GraphDefinition graph) {
        return new GraphExecutor(graph);
    }
    
    /**
     * 创建简单状态
     */
    public GraphState createState() {
        return new SimpleGraphState();
    }
}
