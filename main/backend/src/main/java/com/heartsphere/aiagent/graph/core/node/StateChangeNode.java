package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 状态变更节点
 * 
 * 用于修改角色状态（技能值、好感度、变量等）。
 * 支持多种修改方式：增加、减少、设置为指定值。
 * 
 * 支持：
 * - 修改技能值
 * - 修改好感度
 * - 修改变量
 * - 触发事件
 * - 添加/移除物品
 * - 多种修改方式（增加、减少、设置）
 * 
 * 配置示例：
 * {
 *   "id": "state_change_1",
 *   "changes": [
 *     {
 *       "type": "SKILL",
 *       "target": "strength",
 *       "operation": "ADD",
 *       "value": 10
 *     },
 *     {
 *       "type": "FAVORABILITY",
 *       "target": "alice",
 *       "operation": "ADD",
 *       "value": 5
 *     }
 *   ]
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
public class StateChangeNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 状态变更列表
     */
    @Builder.Default
    private List<StateChange> changes = new ArrayList<>();
    
    /**
     * 状态变更定义
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StateChange {
        /**
         * 变更类型
         */
        private ChangeType type;
        
        /**
         * 目标（技能ID、角色ID、变量名、事件ID、物品ID等）
         */
        private String target;
        
        /**
         * 操作类型
         */
        private OperationType operation;
        
        /**
         * 值（用于ADD、SUBTRACT、SET操作）
         */
        private Object value;
        
        /**
         * 变更类型
         */
        public enum ChangeType {
            SKILL,          // 技能值
            FAVORABILITY,   // 好感度
            VARIABLE,       // 变量
            EVENT,          // 事件（触发或移除）
            ITEM            // 物品（添加或移除）
        }
        
        /**
         * 操作类型
         */
        public enum OperationType {
            ADD,        // 增加（仅用于数值类型）
            SUBTRACT,   // 减少（仅用于数值类型）
            SET,        // 设置为指定值
            TRIGGER,    // 触发（用于事件）
            REMOVE      // 移除（用于事件和物品）
        }
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[StateChangeNode] 执行状态变更节点: {}, 变更数量: {}", id, changes.size());
        
        // 应用所有状态变更
        for (StateChange change : changes) {
            applyChange(change, state);
        }
        
        log.info("[StateChangeNode] 状态变更节点执行完成");
        return state;
    }
    
    /**
     * 应用状态变更
     */
    private void applyChange(StateChange change, GraphEngine.GraphState state) {
        log.info("[StateChangeNode] 应用变更: type={}, target={}, operation={}, value={}", 
                change.getType(), change.getTarget(), change.getOperation(), change.getValue());
        
        switch (change.getType()) {
            case SKILL:
                applySkillChange(change, state);
                break;
            case FAVORABILITY:
                applyFavorabilityChange(change, state);
                break;
            case VARIABLE:
                applyVariableChange(change, state);
                break;
            case EVENT:
                applyEventChange(change, state);
                break;
            case ITEM:
                applyItemChange(change, state);
                break;
            default:
                log.warn("[StateChangeNode] 未知的变更类型: {}", change.getType());
        }
    }
    
    /**
     * 应用技能值变更
     */
    @SuppressWarnings("unchecked")
    private void applySkillChange(StateChange change, GraphEngine.GraphState state) {
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        if (skills == null) {
            skills = new HashMap<>();
            state.setData("character_skills", skills);
        }
        
        String skillId = change.getTarget();
        int currentValue = skills.getOrDefault(skillId, 0);
        int newValue = calculateNewValue(currentValue, change.getOperation(), change.getValue());
        
        // 限制在0-100范围内
        newValue = Math.max(0, Math.min(100, newValue));
        
        skills.put(skillId, newValue);
        log.info("[StateChangeNode] 技能 {} 变更: {} -> {}", skillId, currentValue, newValue);
    }
    
    /**
     * 应用好感度变更
     */
    @SuppressWarnings("unchecked")
    private void applyFavorabilityChange(StateChange change, GraphEngine.GraphState state) {
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        if (favorability == null) {
            favorability = new HashMap<>();
            state.setData("character_favorability", favorability);
        }
        
        String characterId = change.getTarget();
        int currentValue = favorability.getOrDefault(characterId, 0);
        int newValue = calculateNewValue(currentValue, change.getOperation(), change.getValue());
        
        // 限制在0-100范围内
        newValue = Math.max(0, Math.min(100, newValue));
        
        favorability.put(characterId, newValue);
        log.info("[StateChangeNode] 角色 {} 好感度变更: {} -> {}", characterId, currentValue, newValue);
    }
    
    /**
     * 应用变量变更
     */
    @SuppressWarnings("unchecked")
    private void applyVariableChange(StateChange change, GraphEngine.GraphState state) {
        Map<String, Object> variables = (Map<String, Object>) state.getData("variables");
        if (variables == null) {
            variables = new HashMap<>();
            state.setData("variables", variables);
        }
        
        String variableName = change.getTarget();
        
        if (change.getOperation() == StateChange.OperationType.SET) {
            // SET操作：直接设置值
            variables.put(variableName, change.getValue());
            log.info("[StateChangeNode] 变量 {} 设置为: {}", variableName, change.getValue());
        } else if (change.getOperation() == StateChange.OperationType.ADD || 
                   change.getOperation() == StateChange.OperationType.SUBTRACT) {
            // ADD/SUBTRACT操作：需要当前值是数值类型
            Object currentValue = variables.get(variableName);
            if (currentValue instanceof Number) {
                int current = ((Number) currentValue).intValue();
                int newValue = calculateNewValue(current, change.getOperation(), change.getValue());
                variables.put(variableName, newValue);
                log.info("[StateChangeNode] 变量 {} 变更: {} -> {}", variableName, current, newValue);
            } else {
                log.warn("[StateChangeNode] 变量 {} 不是数值类型，无法执行ADD/SUBTRACT操作", variableName);
            }
        } else {
            log.warn("[StateChangeNode] 变量变更不支持的操作类型: {}", change.getOperation());
        }
    }
    
    /**
     * 应用事件变更
     */
    @SuppressWarnings("unchecked")
    private void applyEventChange(StateChange change, GraphEngine.GraphState state) {
        List<String> triggeredEvents = (List<String>) state.getData("triggered_events");
        if (triggeredEvents == null) {
            triggeredEvents = new ArrayList<>();
            state.setData("triggered_events", triggeredEvents);
        }
        
        String eventId = change.getTarget();
        
        if (change.getOperation() == StateChange.OperationType.TRIGGER) {
            // TRIGGER操作：添加事件（如果不存在）
            if (!triggeredEvents.contains(eventId)) {
                triggeredEvents.add(eventId);
                log.info("[StateChangeNode] 触发事件: {}", eventId);
            }
        } else if (change.getOperation() == StateChange.OperationType.REMOVE) {
            // REMOVE操作：移除事件
            triggeredEvents.remove(eventId);
            log.info("[StateChangeNode] 移除事件: {}", eventId);
        } else {
            log.warn("[StateChangeNode] 事件变更不支持的操作类型: {}", change.getOperation());
        }
    }
    
    /**
     * 应用物品变更
     */
    @SuppressWarnings("unchecked")
    private void applyItemChange(StateChange change, GraphEngine.GraphState state) {
        List<String> collectedItems = (List<String>) state.getData("collected_items");
        if (collectedItems == null) {
            collectedItems = new ArrayList<>();
            state.setData("collected_items", collectedItems);
        }
        
        String itemId = change.getTarget();
        
        if (change.getOperation() == StateChange.OperationType.ADD || 
            change.getOperation() == StateChange.OperationType.TRIGGER) {
            // ADD/TRIGGER操作：添加物品（如果不存在）
            if (!collectedItems.contains(itemId)) {
                collectedItems.add(itemId);
                log.info("[StateChangeNode] 添加物品: {}", itemId);
            }
        } else if (change.getOperation() == StateChange.OperationType.REMOVE) {
            // REMOVE操作：移除物品
            collectedItems.remove(itemId);
            log.info("[StateChangeNode] 移除物品: {}", itemId);
        } else {
            log.warn("[StateChangeNode] 物品变更不支持的操作类型: {}", change.getOperation());
        }
    }
    
    /**
     * 计算新值
     */
    private int calculateNewValue(int currentValue, StateChange.OperationType operation, Object value) {
        int changeValue = value instanceof Number ? ((Number) value).intValue() : 0;
        
        switch (operation) {
            case ADD:
                return currentValue + changeValue;
            case SUBTRACT:
                return currentValue - changeValue;
            case SET:
                return changeValue;
            default:
                log.warn("[StateChangeNode] 未知的操作类型: {}", operation);
                return currentValue;
        }
    }
}
