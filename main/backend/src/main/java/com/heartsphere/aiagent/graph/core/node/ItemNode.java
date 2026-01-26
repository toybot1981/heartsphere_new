package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * 物品节点（Item Node）
 * 
 * 用于在Graph中管理物品，支持：
 * - 添加/移除物品
 * - 使用物品
 * - 检查物品拥有情况
 * - 应用物品效果
 * 
 * 配置示例：
 * {
 *   "id": "item_node_1",
 *   "itemId": "item_123",
 *   "action": "ADD",  // ADD, REMOVE, USE, CHECK
 *   "quantity": 1,    // 可选，数量
 *   "effect": {       // 可选，物品效果
 *     "favorabilityChange": {"character_1": 10},
 *     "skillChange": {"combat": 5}
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
public class ItemNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 物品ID（ScenarioItem ID或itemId）
     */
    private String itemId;
    
    /**
     * 物品名称（用于显示，可选）
     */
    private String itemName;
    
    /**
     * 操作类型
     */
    @Builder.Default
    private ItemAction action = ItemAction.ADD;
    
    /**
     * 数量（可选，默认为1）
     */
    @Builder.Default
    private Integer quantity = 1;
    
    /**
     * 物品效果（当action为USE时使用）
     */
    private Map<String, Object> effect;
    
    /**
     * 物品操作类型枚举
     */
    public enum ItemAction {
        ADD,      // 添加物品
        REMOVE,   // 移除物品
        USE,      // 使用物品
        CHECK     // 检查物品拥有情况
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[ItemNode] 执行物品节点: {}, 物品ID: {}, 操作: {}", id, itemId, action);
        
        @SuppressWarnings("unchecked")
        java.util.List<String> items = 
            (java.util.List<String>) state.getData("collected_items");
        if (items == null) {
            items = new java.util.ArrayList<>();
            state.setData("collected_items", items);
        }
        
        switch (action) {
            case ADD:
                // 添加物品
                for (int i = 0; i < quantity; i++) {
                    if (!items.contains(itemId)) {
                        items.add(itemId);
                    }
                }
                log.info("[ItemNode] 添加物品: {} x{}", itemId, quantity);
                break;
                
            case REMOVE:
                // 移除物品
                for (int i = 0; i < quantity; i++) {
                    items.remove(itemId);
                }
                log.info("[ItemNode] 移除物品: {} x{}", itemId, quantity);
                break;
                
            case USE:
                // 使用物品
                if (items.contains(itemId)) {
                    items.remove(itemId);
                    log.info("[ItemNode] 使用物品: {}", itemId);
                    
                    // 应用物品效果
                    if (effect != null) {
                        applyItemEffect(state, effect);
                    }
                } else {
                    log.warn("[ItemNode] 物品 {} 不存在，无法使用", itemId);
                }
                break;
                
            case CHECK:
                // 检查物品拥有情况
                boolean hasItem = items.contains(itemId);
                state.setData("has_item_" + itemId, hasItem);
                log.info("[ItemNode] 检查物品 {} 拥有情况: {}", itemId, hasItem);
                break;
        }
        
        // 记录节点执行信息
        state.setData("last_item_node", id);
        state.setData("last_item_id", itemId);
        
        return state;
    }
    
    /**
     * 应用物品效果
     */
    private void applyItemEffect(GraphEngine.GraphState state, Map<String, Object> effect) {
        // 好感度变化
        @SuppressWarnings("unchecked")
        Map<String, Integer> favorabilityChange = 
            (Map<String, Integer>) effect.get("favorabilityChange");
        if (favorabilityChange != null) {
            @SuppressWarnings("unchecked")
            Map<String, Integer> favorability = 
                (Map<String, Integer>) state.getData("character_favorability");
            final Map<String, Integer> finalFavorability;
            if (favorability == null) {
                finalFavorability = new java.util.HashMap<>();
                state.setData("character_favorability", finalFavorability);
            } else {
                finalFavorability = favorability;
            }
            favorabilityChange.forEach((charId, change) -> {
                int current = finalFavorability.getOrDefault(charId, 0);
                finalFavorability.put(charId, Math.max(0, Math.min(100, current + change)));
                log.info("[ItemNode] 物品效果：角色 {} 好感度变化: {} -> {}", 
                    charId, current, finalFavorability.get(charId));
            });
        }
        
        // 技能变化
        @SuppressWarnings("unchecked")
        Map<String, Integer> skillChange = 
            (Map<String, Integer>) effect.get("skillChange");
        if (skillChange != null) {
            @SuppressWarnings("unchecked")
            Map<String, Integer> skills = 
                (Map<String, Integer>) state.getData("character_skills");
            final Map<String, Integer> finalSkills;
            if (skills == null) {
                finalSkills = new java.util.HashMap<>();
                state.setData("character_skills", finalSkills);
            } else {
                finalSkills = skills;
            }
            skillChange.forEach((skillId, change) -> {
                int current = finalSkills.getOrDefault(skillId, 0);
                finalSkills.put(skillId, Math.max(0, Math.min(100, current + change)));
                log.info("[ItemNode] 物品效果：技能 {} 值变化: {} -> {}", 
                    skillId, current, finalSkills.get(skillId));
            });
        }
        
        // 其他效果
        effect.forEach((key, value) -> {
            if (!"favorabilityChange".equals(key) && !"skillChange".equals(key)) {
                state.setData("item_effect_" + key, value);
                log.info("[ItemNode] 物品效果：{} = {}", key, value);
            }
        });
    }
}
