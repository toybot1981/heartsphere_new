package com.heartsphere.aiagent.graph.research;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 自定义Graph引擎（备选方案）
 * 
 * 如果Spring AI Graph不可用，可以使用此自定义实现
 * 这是一个简化版的Graph执行引擎，实现基本的节点、边、状态管理功能
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class CustomGraphEngine {
    
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
            
            log.info("[CustomGraphEngine] 开始执行Graph，起始节点: {}", currentNodeId);
            
            while (currentNodeId != null && stepCount < maxSteps) {
                stepCount++;
                
                // 获取当前节点
                GraphNode currentNode = graph.getNode(currentNodeId);
                if (currentNode == null) {
                    log.error("[CustomGraphEngine] 节点不存在: {}", currentNodeId);
                    break;
                }
                
                // 执行节点
                log.debug("[CustomGraphEngine] 执行节点: {}", currentNodeId);
                currentState = currentNode.execute(currentState);
                
                // 查找下一个节点
                List<GraphEdge> edges = graph.getEdgesFrom(currentNodeId);
                if (edges.isEmpty()) {
                    // 没有后续节点，执行结束
                    log.info("[CustomGraphEngine] 节点 {} 没有后续节点，执行结束", currentNodeId);
                    break;
                }
                
                // 选择下一个节点
                GraphEdge nextEdge = selectNextEdge(edges, currentState);
                if (nextEdge == null) {
                    log.warn("[CustomGraphEngine] 无法选择下一个节点，执行结束");
                    break;
                }
                
                currentNodeId = nextEdge.getTargetNodeId();
                log.debug("[CustomGraphEngine] 选择下一个节点: {}", currentNodeId);
            }
            
            if (stepCount >= maxSteps) {
                log.warn("[CustomGraphEngine] 达到最大执行步骤数，执行终止");
            }
            
            log.info("[CustomGraphEngine] Graph执行完成，共执行 {} 步", stepCount);
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
     * 创建并测试一个简单的Graph
     */
    public String testSimpleGraph() {
        log.info("[CustomGraphEngine] 开始测试简单Graph...");
        
        // 创建Graph定义
        GraphDefinition graph = new GraphDefinition();
        
        // 创建节点1：开始节点
        GraphNode startNode = new GraphNode() {
            @Override
            public String getId() {
                return "start";
            }
            
            @Override
            public GraphState execute(GraphState state) {
                state.setData("message", "开始执行");
                log.info("[CustomGraphEngine] 执行开始节点");
                return state;
            }
        };
        
        // 创建节点2：处理节点
        GraphNode processNode = new GraphNode() {
            @Override
            public String getId() {
                return "process";
            }
            
            @Override
            public GraphState execute(GraphState state) {
                String message = (String) state.getData("message");
                state.setData("message", message + " -> 处理中");
                log.info("[CustomGraphEngine] 执行处理节点");
                return state;
            }
        };
        
        // 创建节点3：结束节点
        GraphNode endNode = new GraphNode() {
            @Override
            public String getId() {
                return "end";
            }
            
            @Override
            public GraphState execute(GraphState state) {
                String message = (String) state.getData("message");
                state.setData("message", message + " -> 完成");
                log.info("[CustomGraphEngine] 执行结束节点");
                return state;
            }
        };
        
        // 添加节点
        graph.addNode(startNode);
        graph.addNode(processNode);
        graph.addNode(endNode);
        
        // 添加边
        graph.addEdge(new GraphEdge("start", "process"));
        graph.addEdge(new GraphEdge("process", "end"));
        
        // 设置起始节点
        graph.setStartNodeId("start");
        
        // 执行Graph
        GraphState initialState = new SimpleGraphState();
        GraphExecutor executor = new GraphExecutor(graph);
        GraphState finalState = executor.execute(initialState);
        
        String result = (String) finalState.getData("message");
        log.info("[CustomGraphEngine] Graph执行结果: {}", result);
        
        return result;
    }
    
    /**
     * 测试带路由的Graph
     */
    public String testGraphWithRouter() {
        log.info("[CustomGraphEngine] 开始测试带路由的Graph...");
        
        GraphDefinition graph = new GraphDefinition();
        
        // 创建条件节点
        GraphNode conditionNode = new GraphNode() {
            @Override
            public String getId() {
                return "condition";
            }
            
            @Override
            public GraphState execute(GraphState state) {
                // 设置一个条件值
                state.setData("value", 75);
                log.info("[CustomGraphEngine] 执行条件节点，设置value=75");
                return state;
            }
        };
        
        // 创建成功节点
        GraphNode successNode = new GraphNode() {
            @Override
            public String getId() {
                return "success";
            }
            
            @Override
            public GraphState execute(GraphState state) {
                state.setData("result", "成功");
                log.info("[CustomGraphEngine] 执行成功节点");
                return state;
            }
        };
        
        // 创建失败节点
        GraphNode failureNode = new GraphNode() {
            @Override
            public String getId() {
                return "failure";
            }
            
            @Override
            public GraphState execute(GraphState state) {
                state.setData("result", "失败");
                log.info("[CustomGraphEngine] 执行失败节点");
                return state;
            }
        };
        
        graph.addNode(conditionNode);
        graph.addNode(successNode);
        graph.addNode(failureNode);
        
        // 添加带路由的边
        graph.addEdge(new GraphEdge("condition", "success", new GraphRouter() {
            @Override
            public String route(GraphState state) {
                Integer value = (Integer) state.getData("value");
                return value != null && value >= 50 ? "success" : null;
            }
        }));
        
        graph.addEdge(new GraphEdge("condition", "failure", new GraphRouter() {
            @Override
            public String route(GraphState state) {
                Integer value = (Integer) state.getData("value");
                return value != null && value < 50 ? "failure" : null;
            }
        }));
        
        graph.setStartNodeId("condition");
        
        GraphState initialState = new SimpleGraphState();
        GraphExecutor executor = new GraphExecutor(graph);
        GraphState finalState = executor.execute(initialState);
        
        String result = (String) finalState.getData("result");
        log.info("[CustomGraphEngine] 带路由的Graph执行结果: {}", result);
        
        return result;
    }
}
