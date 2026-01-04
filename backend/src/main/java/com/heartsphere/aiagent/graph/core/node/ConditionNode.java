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
 * 条件判断节点
 * 
 * 用于在Graph中根据条件自动判断流程走向，连接两个后续节点（True/False分支）。
 * 支持：
 * - 多种条件类型（好感度、技能、事件、物品、变量）
 * - AND/OR逻辑组合
 * - 自动路由到True或False分支
 * 
 * 配置示例：
 * {
 *   "id": "condition_1",
 *   "logic": "AND",  // AND 或 OR
 *   "conditions": [
 *     {
 *       "type": "SKILL",
 *       "target": "strength",
 *       "operator": ">=",
 *       "value": 50
 *     }
 *   ],
 *   "trueNodeId": "node_success",
 *   "falseNodeId": "node_failure"
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
public class ConditionNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 逻辑运算符：AND 或 OR
     * 默认：AND
     */
    @Builder.Default
    private LogicType logic = LogicType.AND;
    
    /**
     * 条件列表
     */
    @Builder.Default
    private List<Condition> conditions = new ArrayList<>();
    
    /**
     * 条件为True时的下一个节点ID
     */
    private String trueNodeId;
    
    /**
     * 条件为False时的下一个节点ID
     */
    private String falseNodeId;
    
    /**
     * 逻辑类型
     */
    public enum LogicType {
        AND,  // 所有条件必须满足
        OR    // 至少一个条件满足
    }
    
    /**
     * 条件定义
     * 复用ChoiceNode中的条件结构
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Condition {
        /**
         * 条件类型
         */
        private ConditionType type;
        
        /**
         * 目标（角色ID、技能ID、事件ID等）
         */
        private String target;
        
        /**
         * 运算符
         * >=, <=, >, <, ==, !=, has, not_has
         */
        private String operator;
        
        /**
         * 比较值
         */
        private Object value;
        
        public enum ConditionType {
            FAVORABILITY,  // 好感度
            SKILL,         // 技能值
            EVENT,         // 事件
            ITEM,          // 物品
            VARIABLE       // 变量
        }
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[ConditionNode] 执行条件判断节点: {}, 条件数量: {}, 逻辑: {}", 
                id, conditions != null ? conditions.size() : 0, logic);
        
        // 评估条件
        boolean result = evaluateConditions(state);
        
        log.info("[ConditionNode] 条件判断结果: {}", result);
        
        // 根据结果设置下一个节点
        String nextNodeId = result ? trueNodeId : falseNodeId;
        
        // 检查nextNodeId是否为null
        if (nextNodeId == null || nextNodeId.isEmpty()) {
            String branchType = result ? "true" : "false";
            String missingNodeId = result ? "trueNodeId" : "falseNodeId";
            log.error("[ConditionNode] 节点 {} 的 {} 分支未设置，无法继续执行", id, branchType);
            throw new RuntimeException("ConditionNode " + id + " 的 " + missingNodeId + " 未设置，无法路由到下一个节点");
        }
        
        state.setData("condition_result", result);
        state.setData("condition_node_id", id);
        state.setData("next_node", nextNodeId);
        
        log.debug("[ConditionNode] 下一个节点: {}", nextNodeId);
        
        return state;
    }
    
    /**
     * 评估所有条件
     */
    private boolean evaluateConditions(GraphEngine.GraphState state) {
        if (conditions == null || conditions.isEmpty()) {
            log.warn("[ConditionNode] 节点 {} 没有条件，默认返回true", id);
            return true;
        }
        
        if (logic == null) {
            log.warn("[ConditionNode] 节点 {} 的逻辑类型为null，默认使用AND", id);
            logic = LogicType.AND;
        }
        
        if (logic == LogicType.AND) {
            // AND逻辑：所有条件必须满足
            for (Condition condition : conditions) {
                try {
                    if (!checkCondition(condition, state)) {
                        log.debug("[ConditionNode] 条件不满足: {}", condition);
                        return false;
                    }
                } catch (Exception e) {
                    log.error("[ConditionNode] 检查条件时出错: {}", condition, e);
                    return false;
                }
            }
            return true;
        } else {
            // OR逻辑：至少一个条件满足
            for (Condition condition : conditions) {
                try {
                    if (checkCondition(condition, state)) {
                        log.debug("[ConditionNode] 条件满足: {}", condition);
                        return true;
                    }
                } catch (Exception e) {
                    log.error("[ConditionNode] 检查条件时出错: {}", condition, e);
                    // OR逻辑中，单个条件出错不影响其他条件
                }
            }
            return false;
        }
    }
    
    /**
     * 检查单个条件
     */
    private boolean checkCondition(Condition condition, GraphEngine.GraphState state) {
        if (condition == null) {
            log.warn("[ConditionNode] 条件为null，返回true");
            return true;
        }
        
        if (condition.getType() == null) {
            log.error("[ConditionNode] 条件类型为null，无法检查条件");
            return false;
        }
        
        String operator = condition.getOperator();
        Object value = condition.getValue();
        
        try {
            switch (condition.getType()) {
                case FAVORABILITY:
                    return checkFavorabilityCondition(condition.getTarget(), operator, value, state);
                case SKILL:
                    return checkSkillCondition(condition.getTarget(), operator, value, state);
                case EVENT:
                    return checkEventCondition(condition.getTarget(), operator, state);
                case ITEM:
                    return checkItemCondition(condition.getTarget(), operator, state);
                case VARIABLE:
                    return checkVariableCondition(condition.getTarget(), operator, value, state);
                default:
                    log.warn("[ConditionNode] 未知的条件类型: {}", condition.getType());
                    return false;
            }
        } catch (Exception e) {
            log.error("[ConditionNode] 检查条件时发生异常，条件类型: {}, 目标: {}", 
                    condition.getType(), condition.getTarget(), e);
            return false;
        }
    }
    
    /**
     * 检查好感度条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkFavorabilityCondition(String characterId, String operator, Object value, GraphEngine.GraphState state) {
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        if (favorability == null) {
            favorability = new HashMap<>();
        }
        
        Integer currentValue = favorability.getOrDefault(characterId, 0);
        Integer targetValue = value instanceof Number ? ((Number) value).intValue() : 0;
        
        return compareValues(currentValue, operator, targetValue);
    }
    
    /**
     * 检查技能条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkSkillCondition(String skillId, String operator, Object value, GraphEngine.GraphState state) {
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        if (skills == null) {
            skills = new HashMap<>();
        }
        
        Integer currentValue = skills.getOrDefault(skillId, 0);
        Integer targetValue = value instanceof Number ? ((Number) value).intValue() : 0;
        
        return compareValues(currentValue, operator, targetValue);
    }
    
    /**
     * 检查事件条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkEventCondition(String eventId, String operator, GraphEngine.GraphState state) {
        List<String> triggeredEvents = (List<String>) state.getData("triggered_events");
        if (triggeredEvents == null) {
            triggeredEvents = new ArrayList<>();
        }
        
        boolean hasEvent = triggeredEvents.contains(eventId);
        
        if ("has".equalsIgnoreCase(operator) || "==".equals(operator)) {
            return hasEvent;
        } else if ("not_has".equalsIgnoreCase(operator) || "!=".equals(operator)) {
            return !hasEvent;
        } else {
            log.warn("[ConditionNode] 事件条件不支持的操作符: {}", operator);
            return false;
        }
    }
    
    /**
     * 检查物品条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkItemCondition(String itemId, String operator, GraphEngine.GraphState state) {
        List<String> collectedItems = (List<String>) state.getData("collected_items");
        if (collectedItems == null) {
            collectedItems = new ArrayList<>();
        }
        
        boolean hasItem = collectedItems.contains(itemId);
        
        if ("has".equalsIgnoreCase(operator) || "==".equals(operator)) {
            return hasItem;
        } else if ("not_has".equalsIgnoreCase(operator) || "!=".equals(operator)) {
            return !hasItem;
        } else {
            log.warn("[ConditionNode] 物品条件不支持的操作符: {}", operator);
            return false;
        }
    }
    
    /**
     * 检查变量条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkVariableCondition(String variableName, String operator, Object value, GraphEngine.GraphState state) {
        Map<String, Object> variables = (Map<String, Object>) state.getData("variables");
        if (variables == null) {
            variables = new HashMap<>();
        }
        
        Object currentValue = variables.get(variableName);
        
        // 如果变量不存在，根据操作符返回false或true
        if (currentValue == null) {
            if ("!=".equals(operator) || "not_has".equalsIgnoreCase(operator)) {
                return value != null; // 变量不存在，值存在，则 != 为true
            }
            return false; // 其他情况，变量不存在则条件不满足
        }
        
        // 数值比较
        if (currentValue instanceof Number && value instanceof Number) {
            Integer current = ((Number) currentValue).intValue();
            Integer target = ((Number) value).intValue();
            return compareValues(current, operator, target);
        }
        
        // 字符串比较
        if (currentValue instanceof String && value instanceof String) {
            String currentStr = (String) currentValue;
            String targetStr = (String) value;
            return compareStrings(currentStr, operator, targetStr);
        }
        
        // 布尔值比较
        if (currentValue instanceof Boolean && value instanceof Boolean) {
            Boolean currentBool = (Boolean) currentValue;
            Boolean targetBool = (Boolean) value;
            if ("==".equals(operator)) {
                return currentBool.equals(targetBool);
            } else if ("!=".equals(operator)) {
                return !currentBool.equals(targetBool);
            }
        }
        
        // 默认使用equals比较
        if ("==".equals(operator)) {
            return currentValue.equals(value);
        } else if ("!=".equals(operator)) {
            return !currentValue.equals(value);
        }
        
        log.warn("[ConditionNode] 变量条件不支持的操作符或类型: {} - {}", operator, currentValue.getClass());
        return false;
    }
    
    /**
     * 比较数值
     */
    private boolean compareValues(Integer currentValue, String operator, Integer targetValue) {
        switch (operator) {
            case ">": return currentValue > targetValue;
            case "<": return currentValue < targetValue;
            case ">=": return currentValue >= targetValue;
            case "<=": return currentValue <= targetValue;
            case "==": return currentValue.equals(targetValue);
            case "!=": return !currentValue.equals(targetValue);
            default:
                log.warn("[ConditionNode] 未知的数值比较操作符: {}", operator);
                return false;
        }
    }
    
    /**
     * 比较字符串
     */
    private boolean compareStrings(String currentValue, String operator, String targetValue) {
        switch (operator) {
            case "==": return currentValue.equals(targetValue);
            case "!=": return !currentValue.equals(targetValue);
            case "contains": return currentValue.contains(targetValue);
            case "startsWith": return currentValue.startsWith(targetValue);
            case "endsWith": return currentValue.endsWith(targetValue);
            default:
                log.warn("[ConditionNode] 未知的字符串比较操作符: {}", operator);
                return false;
        }
    }
}
