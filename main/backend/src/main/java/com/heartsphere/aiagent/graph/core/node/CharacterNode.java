package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * 角色节点（Character Node）
 * 
 * 用于在Graph中管理角色，支持：
 * - 创建/更新角色
 * - 修改角色属性（好感度、技能等）
 * - 触发角色相关事件
 * - 更新角色关系
 * 
 * 配置示例：
 * {
 *   "id": "character_node_1",
 *   "characterId": 456,
 *   "action": "UPDATE_ATTRIBUTES",  // SET_CURRENT, UPDATE_ATTRIBUTES, TRIGGER_EVENT, UPDATE_RELATION
 *   "favorabilityChange": {         // 可选，好感度变化
 *     "character_1": 10,
 *     "character_2": -5
 *   },
 *   "skillChange": {                // 可选，技能变化
 *     "combat": 5,
 *     "magic": 3
 *   },
 *   "attributeUpdates": {           // 可选，其他属性更新
 *     "mood": "happy",
 *     "health": 100
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
public class CharacterNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 角色ID（Character ID）
     */
    private Long characterId;
    
    /**
     * 角色名称（用于显示，可选）
     */
    private String characterName;
    
    /**
     * 操作类型
     */
    @Builder.Default
    private CharacterAction action = CharacterAction.SET_CURRENT;
    
    /**
     * 好感度变化（角色ID -> 变化值）
     */
    private Map<String, Integer> favorabilityChange;
    
    /**
     * 技能变化（技能ID -> 变化值）
     */
    private Map<String, Integer> skillChange;
    
    /**
     * 属性更新（属性名 -> 值）
     */
    private Map<String, Object> attributeUpdates;
    
    /**
     * 事件ID（当action为TRIGGER_EVENT时使用）
     */
    private String eventId;
    
    /**
     * 关系更新（目标角色ID -> 关系类型）
     */
    private Map<String, String> relationUpdates;
    
    /**
     * 角色操作类型枚举
     */
    public enum CharacterAction {
        SET_CURRENT,         // 设置当前角色
        UPDATE_ATTRIBUTES,   // 更新角色属性
        TRIGGER_EVENT,       // 触发角色事件
        UPDATE_RELATION      // 更新角色关系
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[CharacterNode] 执行角色节点: {}, 角色ID: {}, 操作: {}", id, characterId, action);
        
        switch (action) {
            case SET_CURRENT:
                // 设置当前角色
                state.setData("current_character_id", characterId);
                if (characterName != null) {
                    state.setData("current_character_name", characterName);
                }
                log.info("[CharacterNode] 设置当前角色: {}", characterId);
                break;
                
            case UPDATE_ATTRIBUTES:
                // 更新角色属性
                updateCharacterAttributes(state);
                break;
                
            case TRIGGER_EVENT:
                // 触发角色事件
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
                        log.info("[CharacterNode] 触发角色事件: {}", eventId);
                    }
                }
                break;
                
            case UPDATE_RELATION:
                // 更新角色关系
                if (relationUpdates != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> characterRelations = 
                        (Map<String, String>) state.getData("character_relations");
                    if (characterRelations == null) {
                        characterRelations = new java.util.HashMap<>();
                        state.setData("character_relations", characterRelations);
                    }
                    characterRelations.putAll(relationUpdates);
                    log.info("[CharacterNode] 更新角色关系: {}", relationUpdates);
                }
                break;
        }
        
        // 记录节点执行信息
        state.setData("last_character_node", id);
        state.setData("last_character_action", action.name());
        
        return state;
    }
    
    /**
     * 更新角色属性（好感度、技能等）
     */
    private void updateCharacterAttributes(GraphEngine.GraphState state) {
        // 更新好感度
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
                log.info("[CharacterNode] 角色 {} 好感度变化: {} -> {}", 
                    charId, current, finalFavorability.get(charId));
            });
        }
        
        // 更新技能
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
                log.info("[CharacterNode] 技能 {} 值变化: {} -> {}", 
                    skillId, current, finalSkills.get(skillId));
            });
        }
        
        // 更新其他属性
        if (attributeUpdates != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> characterAttributes = 
                (Map<String, Object>) state.getData("character_attributes");
            if (characterAttributes == null) {
                characterAttributes = new java.util.HashMap<>();
                state.setData("character_attributes", characterAttributes);
            }
            characterAttributes.putAll(attributeUpdates);
            log.info("[CharacterNode] 更新角色属性: {}", attributeUpdates);
        }
    }
}
