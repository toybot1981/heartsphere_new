package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * 场景节点（Era Node）
 * 
 * 用于在Graph中设置和管理游戏场景，支持：
 * - 设置当前场景
 * - 触发场景相关事件
 * - 更新场景状态
 * 
 * 配置示例：
 * {
 *   "id": "era_node_1",
 *   "eraId": 123,
 *   "action": "SET_CURRENT",  // SET_CURRENT, TRIGGER_EVENT, UPDATE_STATE
 *   "eventId": "event_1",   // 可选，当action为TRIGGER_EVENT时使用
 *   "stateUpdates": {      // 可选，当action为UPDATE_STATE时使用
 *     "weather": "rainy",
 *     "time": "night"
 *   }
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
public class EraNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 场景ID（Era ID）
     */
    private Long eraId;
    
    /**
     * 场景名称（用于显示，可选）
     */
    private String eraName;
    
    /**
     * 操作类型
     */
    @Builder.Default
    private EraAction action = EraAction.SET_CURRENT;
    
    /**
     * 事件ID（当action为TRIGGER_EVENT时使用）
     */
    private String eventId;
    
    /**
     * 状态更新（当action为UPDATE_STATE时使用）
     */
    private Map<String, Object> stateUpdates;
    
    /**
     * 场景操作类型枚举
     */
    public enum EraAction {
        SET_CURRENT,      // 设置当前场景
        TRIGGER_EVENT,    // 触发场景事件
        UPDATE_STATE      // 更新场景状态
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[EraNode] 执行场景节点: {}, 场景ID: {}, 操作: {}", id, eraId, action);
        
        switch (action) {
            case SET_CURRENT:
                // 设置当前场景
                state.setData("current_era_id", eraId);
                if (eraName != null) {
                    state.setData("current_era_name", eraName);
                }
                log.debug("[EraNode] 设置当前场景: {}", eraId);
                break;
                
            case TRIGGER_EVENT:
                // 触发场景事件
                if (eventId != null) {
                    @SuppressWarnings("unchecked")
                    java.util.List<String> triggeredEvents = 
                        (java.util.List<String>) state.getData("triggered_events");
                    if (triggeredEvents == null) {
                        triggeredEvents = new java.util.ArrayList<>();
                        state.setData("triggered_events", triggeredEvents);
                    }
                    if (!triggeredEvents.contains(eventId)) {
                        triggeredEvents.add(eventId);
                        log.debug("[EraNode] 触发场景事件: {}", eventId);
                    }
                }
                break;
                
            case UPDATE_STATE:
                // 更新场景状态
                if (stateUpdates != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> eraState = 
                        (Map<String, Object>) state.getData("era_state");
                    if (eraState == null) {
                        eraState = new java.util.HashMap<>();
                        state.setData("era_state", eraState);
                    }
                    eraState.putAll(stateUpdates);
                    log.debug("[EraNode] 更新场景状态: {}", stateUpdates);
                }
                break;
        }
        
        // 记录节点执行信息
        state.setData("last_era_node", id);
        state.setData("last_era_action", action.name());
        
        return state;
    }
}
