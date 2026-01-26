package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 开始节点
 * 
 * 流程的起点节点，只能有一个。用于标记流程的开始位置。
 * 执行时不做任何操作，只是标记流程已开始。
 * 
 * 配置示例：
 * {
 *   "id": "start"
 * }
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     * 通常使用 "start" 作为ID
     */
    private String id;
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[StartNode] 执行开始节点: {}", id);
        
        // 标记流程已开始
        state.setData("graph_started", true);
        state.setData("start_node_id", id);
        
        log.info("[StartNode] 流程开始");
        return state;
    }
}
