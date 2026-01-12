package com.heartsphere.admin.graph.core.node;

import com.heartsphere.admin.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 等待节点
 * 
 * 暂停流程，等待用户输入或其他条件满足后再继续。
 * 用于需要用户交互的场景，比如等待用户点击、输入文本等。
 * 
 * 配置示例：
 * {
 *   "id": "wait_1",
 *   "waitType": "USER_INPUT",
 *   "waitCondition": "user_clicked",
 *   "nextNodeId": "node_after_wait"
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
public class WaitNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 等待类型
     */
    private WaitType waitType;
    
    /**
     * 等待条件（可选）
     * 用于标识等待的具体条件，如事件ID、用户操作类型等
     */
    private String waitCondition;
    
    /**
     * 等待完成后的下一个节点ID
     */
    private String nextNodeId;
    
    /**
     * 等待超时时间（毫秒，可选）
     * 如果设置了超时时间，超过该时间后可以继续执行（需要执行器支持）
     */
    private Long timeout;
    
    /**
     * 等待类型
     */
    public enum WaitType {
        USER_INPUT,     // 等待用户输入
        USER_CLICK,     // 等待用户点击
        USER_CHOICE,    // 等待用户选择（通常与ChoiceNode配合使用）
        EVENT,          // 等待事件触发
        TIMER,          // 等待指定时间
        CONDITION       // 等待条件满足
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[WaitNode] 执行等待节点: {}, 等待类型: {}", id, waitType);
        
        // 标记需要等待
        state.setData("waiting", true);
        state.setData("wait_node_id", id);
        state.setData("wait_type", waitType != null ? waitType.name() : null);
        state.setData("wait_condition", waitCondition);
        state.setData("wait_timeout", timeout);
        state.setData("next_node", nextNodeId);
        
        log.debug("[WaitNode] 流程暂停，等待条件: {}", waitCondition);
        return state;
    }
    
    /**
     * 检查等待条件是否满足
     * 由外部系统调用，用于检查是否可以继续执行
     * 
     * @param state 当前状态
     * @return 是否满足等待条件
     */
    public boolean checkWaitCondition(GraphEngine.GraphState state) {
        if (waitType == null) {
            return true; // 没有指定等待类型，默认满足
        }
        
        switch (waitType) {
            case EVENT:
                // 检查事件是否已触发
                if (waitCondition != null) {
                    @SuppressWarnings("unchecked")
                    java.util.List<String> triggeredEvents = 
                        (java.util.List<String>) state.getData("triggered_events");
                    if (triggeredEvents != null) {
                        return triggeredEvents.contains(waitCondition);
                    }
                }
                return false;
            case CONDITION:
                // 检查变量或状态条件（简化实现，实际可能需要更复杂的条件检查）
                if (waitCondition != null) {
                    Object conditionResult = state.getData("wait_condition_result");
                    return Boolean.TRUE.equals(conditionResult);
                }
                return false;
            case TIMER:
                // 定时器等待，需要执行器支持（这里只标记，实际由执行器处理）
                return false; // 定时器等待需要执行器控制
            case USER_INPUT:
            case USER_CLICK:
            case USER_CHOICE:
                // 用户交互等待，需要外部系统标记（通过设置wait_completed标记）
                Object waitCompleted = state.getData("wait_completed");
                return Boolean.TRUE.equals(waitCompleted);
            default:
                return false;
        }
    }
}
