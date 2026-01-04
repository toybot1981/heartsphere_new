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
 * 循环节点
 * 
 * 用于循环执行一段流程，支持条件循环和计数循环。
 * 可以设置循环条件（条件满足时继续循环）或最大循环次数。
 * 
 * 配置示例：
 * {
 *   "id": "loop_1",
 *   "loopType": "CONDITION",
 *   "condition": {
 *     "type": "VARIABLE",
 *     "target": "loop_count",
 *     "operator": "<",
 *     "value": 5
 *   },
 *   "loopBody": ["node_1", "node_2"],
 *   "exitNodeId": "exit_node"
 * }
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Data
@Builder
public class LoopNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 循环类型
     */
    @Builder.Default
    private LoopType loopType = LoopType.CONDITION;
    
    /**
     * 循环条件（条件循环时使用）
     * 条件满足时继续循环，不满足时退出循环
     */
    private LoopCondition condition;
    
    /**
     * 最大循环次数（计数循环时使用）
     * 超过此次数后强制退出循环
     */
    @Builder.Default
    private Integer maxIterations = 1000;
    
    /**
     * 循环体节点ID列表
     * 需要循环执行的节点序列
     */
    @Builder.Default
    private List<String> loopBody = new ArrayList<>();
    
    /**
     * 退出节点ID
     * 循环退出后跳转到此节点
     */
    private String exitNodeId;
    
    /**
     * 循环变量名（可选）
     * 用于在状态中记录当前循环次数
     */
    @Builder.Default
    private String loopVariableName = "loop_count";
    
    /**
     * 循环类型枚举
     */
    public enum LoopType {
        CONDITION,  // 条件循环（条件满足时继续）
        COUNT,      // 计数循环（达到最大次数后退出）
        FOREVER     // 无限循环（需要手动退出或达到最大次数）
    }
    
    /**
     * 循环条件
     */
    @Data
    @Builder
    public static class LoopCondition {
        /**
         * 条件类型
         */
        private ConditionType type;
        
        /**
         * 目标（变量名、技能ID等）
         */
        private String target;
        
        /**
         * 运算符 (>, <, >=, <=, ==, !=)
         */
        private String operator;
        
        /**
         * 比较值
         */
        private Object value;
        
        /**
         * 条件类型枚举
         */
        public enum ConditionType {
            VARIABLE,       // 变量
            SKILL,          // 技能值
            FAVORABILITY,   // 好感度
            EVENT,          // 事件
            ITEM            // 物品
        }
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[LoopNode] 执行循环节点: {}, 循环类型: {}", id, loopType);
        
        // 初始化循环计数（如果使用计数循环）
        if (loopType == LoopType.COUNT || loopType == LoopType.FOREVER) {
            Integer currentCount = (Integer) state.getData(loopVariableName);
            if (currentCount == null) {
                currentCount = 0;
            }
            state.setData(loopVariableName, currentCount);
        }
        
        // 标记需要循环执行
        // 实际的循环执行由执行器处理
        state.setData("loop_node_id", id);
        state.setData("loop_type", loopType.name());
        state.setData("loop_body", loopBody);
        state.setData("loop_exit_node_id", exitNodeId);
        state.setData("loop_variable_name", loopVariableName);
        state.setData("loop_max_iterations", maxIterations);
        state.setData("loop_executing", true);
        
        // 序列化条件（如果存在）
        if (condition != null) {
            Map<String, Object> conditionMap = new HashMap<>();
            conditionMap.put("type", condition.getType().name());
            conditionMap.put("target", condition.getTarget());
            conditionMap.put("operator", condition.getOperator());
            conditionMap.put("value", condition.getValue());
            state.setData("loop_condition", conditionMap);
        }
        
        log.debug("[LoopNode] 循环节点执行完成，等待执行器处理循环体");
        return state;
    }
    
    /**
     * 检查循环条件是否满足（是否应该继续循环）
     * 
     * @param state 当前状态
     * @param iterationCount 当前循环次数
     * @return true表示应该继续循环，false表示应该退出循环
     */
    public boolean shouldContinueLoop(GraphEngine.GraphState state, int iterationCount) {
        switch (loopType) {
            case FOREVER:
                // 无限循环，但检查最大次数限制
                return iterationCount < maxIterations;
                
            case COUNT:
                // 计数循环
                return iterationCount < maxIterations;
                
            case CONDITION:
            default:
                // 条件循环
                if (condition == null) {
                    // 没有条件，默认继续循环（但检查最大次数限制）
                    return iterationCount < maxIterations;
                }
                return checkCondition(condition, state);
        }
    }
    
    /**
     * 检查循环条件
     */
    private boolean checkCondition(LoopCondition condition, GraphEngine.GraphState state) {
        switch (condition.getType()) {
            case VARIABLE:
                return checkVariableCondition(condition, state);
            case SKILL:
                return checkSkillCondition(condition, state);
            case FAVORABILITY:
                return checkFavorabilityCondition(condition, state);
            case EVENT:
                return checkEventCondition(condition, state);
            case ITEM:
                return checkItemCondition(condition, state);
            default:
                log.warn("[LoopNode] 未知的条件类型: {}", condition.getType());
                return false;
        }
    }
    
    /**
     * 检查变量条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkVariableCondition(LoopCondition condition, GraphEngine.GraphState state) {
        Object value = state.getData(condition.getTarget());
        if (value == null) {
            return false;
        }
        return compareValue(value, condition.getOperator(), condition.getValue());
    }
    
    /**
     * 检查技能条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkSkillCondition(LoopCondition condition, GraphEngine.GraphState state) {
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        if (skills == null) {
            return false;
        }
        int currentValue = skills.getOrDefault(condition.getTarget(), 0);
        return compareValue(currentValue, condition.getOperator(), condition.getValue());
    }
    
    /**
     * 检查好感度条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkFavorabilityCondition(LoopCondition condition, GraphEngine.GraphState state) {
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        if (favorability == null) {
            return false;
        }
        int currentValue = favorability.getOrDefault(condition.getTarget(), 0);
        return compareValue(currentValue, condition.getOperator(), condition.getValue());
    }
    
    /**
     * 检查事件条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkEventCondition(LoopCondition condition, GraphEngine.GraphState state) {
        List<String> triggeredEvents = (List<String>) state.getData("triggered_events");
        boolean hasEvent = triggeredEvents != null && triggeredEvents.contains(condition.getTarget());
        return "has".equalsIgnoreCase(condition.getOperator()) ? hasEvent : !hasEvent;
    }
    
    /**
     * 检查物品条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkItemCondition(LoopCondition condition, GraphEngine.GraphState state) {
        List<String> collectedItems = (List<String>) state.getData("collected_items");
        boolean hasItem = collectedItems != null && collectedItems.contains(condition.getTarget());
        return "has".equalsIgnoreCase(condition.getOperator()) ? hasItem : !hasItem;
    }
    
    /**
     * 比较值
     */
    @SuppressWarnings("unchecked")
    private boolean compareValue(Object currentValue, String operator, Object targetValue) {
        if (currentValue instanceof Number && targetValue instanceof Number) {
            double current = ((Number) currentValue).doubleValue();
            double target = ((Number) targetValue).doubleValue();
            
            switch (operator) {
                case ">": return current > target;
                case "<": return current < target;
                case ">=": return current >= target;
                case "<=": return current <= target;
                case "==": return Math.abs(current - target) < 0.0001;
                case "!=": return Math.abs(current - target) >= 0.0001;
                default: return false;
            }
        } else if (currentValue instanceof String && targetValue instanceof String) {
            String current = (String) currentValue;
            String target = (String) targetValue;
            
            switch (operator) {
                case "==": return current.equals(target);
                case "!=": return !current.equals(target);
                default: return false;
            }
        }
        return false;
    }
}
