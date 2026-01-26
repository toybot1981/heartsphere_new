package com.heartsphere.admin.graph.core.node;

import com.heartsphere.admin.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * 事件节点（Event Node）
 * 
 * 用于在Graph中触发和管理游戏事件，支持：
 * - 触发事件
 * - 检查事件触发条件
 * - 执行事件逻辑
 * - 更新相关实体状态
 * 
 * 配置示例：
 * {
 *   "id": "event_node_1",
 *   "eventId": "event_123",
 *   "action": "TRIGGER",  // TRIGGER, CHECK_CONDITION, EXECUTE
 *   "condition": {        // 可选，触发条件
 *     "type": "favorability",
 *     "target": "character_1",
 *     "operator": ">=",
 *     "value": 50
 *   },
 *   "stateUpdates": {     // 可选，事件执行后的状态更新
 *     "triggered_events": ["event_123"],
 *     "character_favorability": {"character_1": 10}
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
public class EventNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 事件ID（ScenarioEvent ID或eventId）
     */
    private String eventId;
    
    /**
     * 事件名称（用于显示，可选）
     */
    private String eventName;
    
    /**
     * 操作类型
     */
    @Builder.Default
    private EventAction action = EventAction.TRIGGER;
    
    /**
     * 触发条件（可选）
     */
    private Map<String, Object> condition;
    
    /**
     * 状态更新（事件执行后的状态变化）
     */
    private Map<String, Object> stateUpdates;
    
    /**
     * 事件操作类型枚举
     */
    public enum EventAction {
        TRIGGER,           // 触发事件
        CHECK_CONDITION,   // 检查触发条件
        EXECUTE            // 执行事件逻辑
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[EventNode] 执行事件节点: {}, 事件ID: {}, 操作: {}", id, eventId, action);
        
        switch (action) {
            case TRIGGER:
                // 触发事件
                triggerEvent(state);
                break;
                
            case CHECK_CONDITION:
                // 检查触发条件
                boolean canTrigger = checkCondition(state);
                state.setData("event_can_trigger_" + eventId, canTrigger);
                log.info("[EventNode] 事件 {} 触发条件检查: {}", eventId, canTrigger);
                if (!canTrigger) {
                    log.info("[EventNode] 事件 {} 触发条件不满足，跳过执行", eventId);
                    return state;
                }
                // 条件满足，继续触发事件
                triggerEvent(state);
                break;
                
            case EXECUTE:
                // 执行事件逻辑
                triggerEvent(state);
                if (stateUpdates != null) {
                    applyStateUpdates(state, stateUpdates);
                }
                break;
        }
        
        // 记录节点执行信息
        state.setData("last_event_node", id);
        state.setData("last_event_id", eventId);
        
        return state;
    }
    
    /**
     * 触发事件
     */
    private void triggerEvent(GraphEngine.GraphState state) {
        @SuppressWarnings("unchecked")
        java.util.List<String> triggeredEvents = 
            (java.util.List<String>) state.getData("triggered_events");
        if (triggeredEvents == null) {
            triggeredEvents = new java.util.ArrayList<>();
            state.setData("triggered_events", triggeredEvents);
        }
        if (!triggeredEvents.contains(eventId)) {
            triggeredEvents.add(eventId);
            log.info("[EventNode] 触发事件: {}", eventId);
        }
    }
    
    /**
     * 检查触发条件
     */
    private boolean checkCondition(GraphEngine.GraphState state) {
        if (condition == null || condition.isEmpty()) {
            return true; // 无条件，默认可以触发
        }
        
        String type = (String) condition.get("type");
        String target = (String) condition.get("target");
        String operator = (String) condition.get("operator");
        Object value = condition.get("value");
        
        if (type == null || target == null || operator == null || value == null) {
            log.warn("[EventNode] 条件配置不完整，默认允许触发");
            return true;
        }
        
        // 根据条件类型检查
        switch (type.toLowerCase()) {
            case "favorability":
                return checkFavorabilityCondition(state, target, operator, value);
            case "skill":
                return checkSkillCondition(state, target, operator, value);
            case "event":
                return checkEventCondition(state, target, operator, value);
            case "item":
                return checkItemCondition(state, target, operator, value);
            default:
                log.warn("[EventNode] 未知的条件类型: {}", type);
                return true;
        }
    }
    
    private boolean checkFavorabilityCondition(GraphEngine.GraphState state, String target, String operator, Object value) {
        @SuppressWarnings("unchecked")
        Map<String, Integer> favorability = 
            (Map<String, Integer>) state.getData("character_favorability");
        if (favorability == null) {
            return false;
        }
        int current = favorability.getOrDefault(target, 0);
        int targetValue = ((Number) value).intValue();
        return compareValues(current, operator, targetValue);
    }
    
    private boolean checkSkillCondition(GraphEngine.GraphState state, String target, String operator, Object value) {
        @SuppressWarnings("unchecked")
        Map<String, Integer> skills = 
            (Map<String, Integer>) state.getData("character_skills");
        if (skills == null) {
            return false;
        }
        int current = skills.getOrDefault(target, 0);
        int targetValue = ((Number) value).intValue();
        return compareValues(current, operator, targetValue);
    }
    
    private boolean checkEventCondition(GraphEngine.GraphState state, String target, String operator, Object value) {
        @SuppressWarnings("unchecked")
        java.util.List<String> triggeredEvents = 
            (java.util.List<String>) state.getData("triggered_events");
        if (triggeredEvents == null) {
            return false;
        }
        boolean hasEvent = triggeredEvents.contains(target);
        if ("has".equals(operator)) {
            return hasEvent;
        } else if ("not_has".equals(operator)) {
            return !hasEvent;
        }
        return false;
    }
    
    private boolean checkItemCondition(GraphEngine.GraphState state, String target, String operator, Object value) {
        @SuppressWarnings("unchecked")
        java.util.List<String> items = 
            (java.util.List<String>) state.getData("collected_items");
        if (items == null) {
            return false;
        }
        boolean hasItem = items.contains(target);
        if ("has".equals(operator)) {
            return hasItem;
        } else if ("not_has".equals(operator)) {
            return !hasItem;
        }
        return false;
    }
    
    private boolean compareValues(int current, String operator, int target) {
        switch (operator) {
            case ">=": return current >= target;
            case "<=": return current <= target;
            case ">": return current > target;
            case "<": return current < target;
            case "==": return current == target;
            case "!=": return current != target;
            default: return false;
        }
    }
    
    /**
     * 应用状态更新
     */
    private void applyStateUpdates(GraphEngine.GraphState state, Map<String, Object> updates) {
        updates.forEach((key, value) -> {
            state.setData(key, value);
            log.info("[EventNode] 更新状态: {} = {}", key, value);
        });
    }
}
