package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 结束节点
 * 
 * 流程的终点节点，可以有多个（不同结局）。
 * 用于标记流程的结束，可以配置结局类型和描述。
 * 
 * 配置示例：
 * {
 *   "id": "end_1",
 *   "endingType": "GOOD",
 *   "endingDescription": "完美结局"
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
public class EndNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 结局类型（可选）
     * GOOD, BAD, NORMAL 等
     */
    private String endingType;
    
    /**
     * 结局描述（可选）
     */
    private String endingDescription;
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[EndNode] 执行结束节点: {}, 结局类型: {}", id, endingType);
        
        // 标记流程已结束
        state.setData("graph_ended", true);
        state.setData("end_node_id", id);
        state.setData("ending_type", endingType);
        state.setData("ending_description", endingDescription);
        state.setData("next_node", null); // 结束节点没有下一个节点
        
        log.info("[EndNode] 流程结束，结局: {}", endingDescription != null ? endingDescription : endingType);
        return state;
    }
}
