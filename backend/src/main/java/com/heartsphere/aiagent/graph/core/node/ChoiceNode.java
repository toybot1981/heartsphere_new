package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 选择节点
 * 
 * 用于在Graph中提供多个选项供用户选择，每个选项连接一个后续节点。
 * 支持：
 * - 多个选项
 * - 选项显示条件
 * - 选项选择效果（状态变更）
 * 
 * 配置示例：
 * {
 *   "id": "choice_1",
 *   "options": [
 *     {
 *       "id": "opt_1",
 *       "text": "选项1",
 *       "nextNodeId": "node_1",
 *       "conditions": [...],
 *       "effects": {...}
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
public class ChoiceNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 选择提示文本（可选）
     */
    private String prompt;
    
    /**
     * 选项列表
     */
    @Builder.Default
    private List<ChoiceOption> options = new ArrayList<>();
    
    /**
     * 选择选项
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoiceOption {
        /**
         * 选项ID
         */
        private String id;
        
        /**
         * 选项文本
         */
        private String text;
        
        /**
         * 下一个节点ID
         */
        private String nextNodeId;
        
        /**
         * 显示条件（可选）
         * 如果条件不满足，选项不显示
         */
        private List<ChoiceCondition> conditions;
        
        /**
         * 选择效果（可选）
         * 选择此选项时的状态影响
         */
        private ChoiceEffect effect;
        
        /**
         * 是否隐藏（即使条件满足也不显示）
         */
        @Builder.Default
        private Boolean hidden = false;
    }
    
    /**
     * 选择条件
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoiceCondition {
        /**
         * 条件类型
         * favorability - 好感度
         * skill - 技能值
         * event - 事件
         * item - 物品
         * variable - 变量
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
    
    /**
     * 选择效果
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoiceEffect {
        /**
         * 好感度变化
         * Map<角色ID, 变化值>
         */
        private Map<String, Integer> favorabilityChange;
        
        /**
         * 技能值变化
         * Map<技能ID, 变化值>
         */
        private Map<String, Integer> skillChange;
        
        /**
         * 触发事件
         * 事件ID列表
         */
        private List<String> triggerEvents;
        
        /**
         * 添加物品
         * 物品ID列表
         */
        private List<String> addItems;
        
        /**
         * 设置变量
         * Map<变量名, 变量值>
         */
        private Map<String, Object> setVariables;
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[ChoiceNode] 执行选择节点: {}, 选项数量: {}", id, options.size());
        
        // 将选择节点信息存储到状态中
        state.setData("current_choice", this);
        state.setData("choice_prompt", prompt);
        state.setData("choice_options", getAvailableOptions(state));
        
        // 标记当前需要用户选择
        state.setData("waiting_for_choice", true);
        state.setData("choice_node_id", id);
        
        log.debug("[ChoiceNode] 选择节点执行完成，等待用户选择");
        
        return state;
    }
    
    /**
     * 获取可用的选项（根据条件过滤）
     */
    public List<ChoiceOption> getAvailableOptions(GraphEngine.GraphState state) {
        List<ChoiceOption> availableOptions = new ArrayList<>();
        
        for (ChoiceOption option : options) {
            // 如果选项被标记为隐藏，跳过
            if (Boolean.TRUE.equals(option.getHidden())) {
                continue;
            }
            
            // 检查条件
            if (option.getConditions() != null && !option.getConditions().isEmpty()) {
                boolean allConditionsMet = checkAllConditions(option.getConditions(), state);
                if (!allConditionsMet) {
                    // 条件不满足，跳过此选项
                    continue;
                }
            }
            
            availableOptions.add(option);
        }
        
        log.debug("[ChoiceNode] 可用选项数量: {}/{}", availableOptions.size(), options.size());
        return availableOptions;
    }
    
    /**
     * 检查所有条件是否满足（AND逻辑）
     */
    private boolean checkAllConditions(List<ChoiceCondition> conditions, GraphEngine.GraphState state) {
        for (ChoiceCondition condition : conditions) {
            if (!checkCondition(condition, state)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 检查单个条件
     */
    private boolean checkCondition(ChoiceCondition condition, GraphEngine.GraphState state) {
        if (condition == null) {
            return true;
        }
        
        String operator = condition.getOperator();
        Object value = condition.getValue();
        
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
                log.warn("[ChoiceNode] 未知的条件类型: {}", condition.getType());
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
            favorability = new java.util.HashMap<>();
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
            skills = new java.util.HashMap<>();
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
        
        if ("has".equals(operator)) {
            return hasEvent;
        } else if ("not_has".equals(operator)) {
            return !hasEvent;
        }
        
        return false;
    }
    
    /**
     * 检查物品条件
     */
    @SuppressWarnings("unchecked")
    private boolean checkItemCondition(String itemId, String operator, GraphEngine.GraphState state) {
        List<String> items = (List<String>) state.getData("items");
        if (items == null) {
            items = new ArrayList<>();
        }
        
        boolean hasItem = items.contains(itemId);
        
        if ("has".equals(operator)) {
            return hasItem;
        } else if ("not_has".equals(operator)) {
            return !hasItem;
        }
        
        return false;
    }
    
    /**
     * 检查变量条件
     */
    private boolean checkVariableCondition(String variableName, String operator, Object value, GraphEngine.GraphState state) {
        Object currentValue = state.getData("variable_" + variableName);
        if (currentValue == null) {
            currentValue = state.getData(variableName);
        }
        
        if (currentValue == null) {
            return false;
        }
        
        if (currentValue instanceof Number && value instanceof Number) {
            return compareValues(((Number) currentValue).intValue(), operator, ((Number) value).intValue());
        } else {
            // 字符串比较
            if ("==".equals(operator) || "equals".equals(operator)) {
                return String.valueOf(currentValue).equals(String.valueOf(value));
            } else if ("!=".equals(operator) || "not_equals".equals(operator)) {
                return !String.valueOf(currentValue).equals(String.valueOf(value));
            }
        }
        
        return false;
    }
    
    /**
     * 比较数值
     */
    private boolean compareValues(int currentValue, String operator, int targetValue) {
        return switch (operator) {
            case ">=" -> currentValue >= targetValue;
            case "<=" -> currentValue <= targetValue;
            case ">" -> currentValue > targetValue;
            case "<" -> currentValue < targetValue;
            case "==", "=" -> currentValue == targetValue;
            case "!=" -> currentValue != targetValue;
            default -> false;
        };
    }
    
    /**
     * 应用选择效果
     */
    @SuppressWarnings("unchecked")
    public void applyEffect(ChoiceOption option, GraphEngine.GraphState state) {
        if (option.getEffect() == null) {
            return;
        }
        
        ChoiceEffect effect = option.getEffect();
        
        // 应用好感度变化
        if (effect.getFavorabilityChange() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Integer> favorabilityMap = (Map<String, Integer>) state.getData("character_favorability");
            Map<String, Integer> favorability = favorabilityMap;
            if (favorability == null) {
                favorability = new java.util.HashMap<>();
                state.setData("character_favorability", favorability);
            }
            final Map<String, Integer> finalFavorability = favorability;
            
            effect.getFavorabilityChange().forEach((characterId, change) -> {
                int current = finalFavorability.getOrDefault(characterId, 0);
                finalFavorability.put(characterId, Math.max(0, Math.min(100, current + change)));
                log.debug("[ChoiceNode] 角色 {} 好感度变化: {} -> {}", characterId, current, finalFavorability.get(characterId));
            });
        }
        
        // 应用技能值变化
        if (effect.getSkillChange() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Integer> skillsMap = (Map<String, Integer>) state.getData("character_skills");
            Map<String, Integer> skills = skillsMap;
            if (skills == null) {
                skills = new java.util.HashMap<>();
                state.setData("character_skills", skills);
            }
            final Map<String, Integer> finalSkills = skills;
            
            effect.getSkillChange().forEach((skillId, change) -> {
                int current = finalSkills.getOrDefault(skillId, 0);
                finalSkills.put(skillId, Math.max(0, Math.min(100, current + change)));
                log.debug("[ChoiceNode] 技能 {} 值变化: {} -> {}", skillId, current, finalSkills.get(skillId));
            });
        }
        
        // 触发事件
        if (effect.getTriggerEvents() != null) {
            List<String> triggeredEvents = (List<String>) state.getData("triggered_events");
            if (triggeredEvents == null) {
                triggeredEvents = new ArrayList<>();
                state.setData("triggered_events", triggeredEvents);
            }
            
            for (String eventId : effect.getTriggerEvents()) {
                if (!triggeredEvents.contains(eventId)) {
                    triggeredEvents.add(eventId);
                    log.debug("[ChoiceNode] 触发事件: {}", eventId);
                }
            }
        }
        
        // 添加物品
        if (effect.getAddItems() != null) {
            List<String> items = (List<String>) state.getData("items");
            if (items == null) {
                items = new ArrayList<>();
                state.setData("items", items);
            }
            
            for (String itemId : effect.getAddItems()) {
                if (!items.contains(itemId)) {
                    items.add(itemId);
                    log.debug("[ChoiceNode] 添加物品: {}", itemId);
                }
            }
        }
        
        // 设置变量
        if (effect.getSetVariables() != null) {
            effect.getSetVariables().forEach((varName, varValue) -> {
                state.setData("variable_" + varName, varValue);
                log.debug("[ChoiceNode] 设置变量: {} = {}", varName, varValue);
            });
        }
    }
    
    /**
     * 处理用户选择
     * 
     * @param optionId 用户选择的选项ID
     * @param state 当前状态
     * @return 下一个节点ID
     */
    public String handleChoice(String optionId, GraphEngine.GraphState state) {
        log.info("[ChoiceNode] 处理用户选择: {}", optionId);
        
        // 查找选项
        ChoiceOption selectedOption = null;
        for (ChoiceOption option : options) {
            if (option.getId().equals(optionId)) {
                selectedOption = option;
                break;
            }
        }
        
        if (selectedOption == null) {
            log.error("[ChoiceNode] 未找到选项: {}", optionId);
            throw new IllegalArgumentException("未找到选项: " + optionId);
        }
        
        // 应用选择效果
        applyEffect(selectedOption, state);
        
        // 清除等待选择标记
        state.setData("waiting_for_choice", false);
        state.setData("selected_option_id", optionId);
        state.setData("selected_option", selectedOption);
        
        // 返回下一个节点ID
        String nextNodeId = selectedOption.getNextNodeId();
        log.info("[ChoiceNode] 用户选择: {}, 下一个节点: {}", optionId, nextNodeId);
        
        return nextNodeId;
    }
    
    /**
     * 创建简单的选择节点
     */
    public static ChoiceNode create(String id, String prompt, List<ChoiceOption> options) {
        return ChoiceNode.builder()
            .id(id)
            .prompt(prompt)
            .options(options)
            .build();
    }
}
