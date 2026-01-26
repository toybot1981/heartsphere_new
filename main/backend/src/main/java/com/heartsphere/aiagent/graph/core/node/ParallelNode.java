package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 并行节点
 * 
 * 用于并行执行多个分支，等待所有分支完成后继续执行。
 * 每个分支是一个节点ID列表，表示该分支的执行路径。
 * 
 * 配置示例：
 * {
 *   "id": "parallel_1",
 *   "branches": [
 *     ["node_a1", "node_a2"],
 *     ["node_b1", "node_b2"]
 *   ],
 *   "mergeNodeId": "merge_node"
 * }
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Data
@Builder
public class ParallelNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 并行分支列表
     * 每个分支是一个节点ID列表，表示该分支的执行路径
     */
    @Builder.Default
    private List<List<String>> branches = new ArrayList<>();
    
    /**
     * 合并节点ID
     * 所有分支执行完成后，跳转到此节点继续执行
     */
    private String mergeNodeId;
    
    /**
     * 状态合并策略
     * ALL - 合并所有分支的状态（默认）
     * FIRST - 使用第一个分支的状态
     * LAST - 使用最后一个分支的状态
     */
    @Builder.Default
    private MergeStrategy mergeStrategy = MergeStrategy.ALL;
    
    /**
     * 状态合并策略枚举
     */
    public enum MergeStrategy {
        ALL,    // 合并所有分支的状态
        FIRST,  // 使用第一个分支的状态
        LAST    // 使用最后一个分支的状态
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[ParallelNode] 执行并行节点: {}, 分支数: {}", id, branches.size());
        
        // 标记需要并行执行
        // 实际的并行执行由执行器处理
        state.setData("parallel_node_id", id);
        state.setData("parallel_branches", branches);
        state.setData("parallel_merge_node_id", mergeNodeId);
        state.setData("parallel_merge_strategy", mergeStrategy.name());
        state.setData("parallel_executing", true);
        
        log.info("[ParallelNode] 并行节点执行完成，等待执行器处理并行分支");
        return state;
    }
    
    /**
     * 合并多个分支的状态
     * 
     * @param branchStates 各分支的状态列表
     * @return 合并后的状态
     */
    public static GraphEngine.GraphState mergeStates(List<GraphEngine.GraphState> branchStates, MergeStrategy strategy) {
        if (branchStates == null || branchStates.isEmpty()) {
            throw new IllegalArgumentException("分支状态列表不能为空");
        }
        
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphState mergedState = engine.createState();
        
        switch (strategy) {
            case FIRST:
                // 使用第一个分支的状态
                return branchStates.get(0).clone();
                
            case LAST:
                // 使用最后一个分支的状态
                return branchStates.get(branchStates.size() - 1).clone();
                
            case ALL:
            default:
                // 合并所有分支的状态
                // 对于Map类型的数据，合并所有键值对（后面的覆盖前面的）
                // 对于List类型的数据，合并所有元素
                Map<String, Object> allData = new HashMap<>();
                
                for (GraphEngine.GraphState branchState : branchStates) {
                    Map<String, Object> branchData = branchState.getData();
                    for (Map.Entry<String, Object> entry : branchData.entrySet()) {
                        String key = entry.getKey();
                        Object value = entry.getValue();
                        
                        // 特殊处理一些状态数据
                        if (key.startsWith("parallel_")) {
                            // 跳过并行节点的内部状态
                            continue;
                        }
                        
                        if (value instanceof Map) {
                            // Map类型：合并
                            @SuppressWarnings("unchecked")
                            Map<String, Object> existingMap = (Map<String, Object>) allData.get(key);
                            if (existingMap == null) {
                                existingMap = new HashMap<>();
                                allData.put(key, existingMap);
                            }
                            @SuppressWarnings("unchecked")
                            Map<String, Object> newMap = (Map<String, Object>) value;
                            existingMap.putAll(newMap);
                        } else if (value instanceof List) {
                            // List类型：合并（去重）
                            @SuppressWarnings("unchecked")
                            List<Object> existingList = (List<Object>) allData.get(key);
                            if (existingList == null) {
                                existingList = new ArrayList<>();
                                allData.put(key, existingList);
                            }
                            @SuppressWarnings("unchecked")
                            List<Object> newList = (List<Object>) value;
                            for (Object item : newList) {
                                if (!existingList.contains(item)) {
                                    existingList.add(item);
                                }
                            }
                        } else {
                            // 其他类型：后面的覆盖前面的
                            allData.put(key, value);
                        }
                    }
                }
                
                // 将合并后的数据设置到新状态中
                for (Map.Entry<String, Object> entry : allData.entrySet()) {
                    mergedState.setData(entry.getKey(), entry.getValue());
                }
                
                return mergedState;
        }
    }
}
