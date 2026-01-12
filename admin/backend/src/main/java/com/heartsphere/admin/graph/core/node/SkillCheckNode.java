package com.heartsphere.admin.graph.core.node;

import com.heartsphere.admin.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * 技能检查节点
 * 
 * 专门用于检查角色技能值的简化节点，根据检查结果自动路由到成功或失败分支。
 * 这是 ConditionNode 的一个特化版本，专门用于技能检查场景。
 * 
 * 支持：
 * - 检查指定角色的指定技能值
 * - 支持多种运算符（>=, <=, >, <, ==, !=）
 * - 自动路由到成功或失败分支
 * 
 * 配置示例：
 * {
 *   "id": "skill_check_1",
 *   "characterId": "char_1",
 *   "skillId": "strength",
 *   "operator": ">=",
 *   "requiredValue": 50,
 *   "successNodeId": "node_success",
 *   "failureNodeId": "node_failure"
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
public class SkillCheckNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 角色ID（可选，如果为空则检查玩家角色）
     */
    private String characterId;
    
    /**
     * 技能ID
     */
    private String skillId;
    
    /**
     * 运算符
     * >=, <=, >, <, ==, !=
     */
    private String operator;
    
    /**
     * 需要的技能值
     */
    private Integer requiredValue;
    
    /**
     * 检查成功时的下一个节点ID
     */
    private String successNodeId;
    
    /**
     * 检查失败时的下一个节点ID
     */
    private String failureNodeId;
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[SkillCheckNode] 执行技能检查节点: {}, 角色: {}, 技能: {}", 
                id, characterId, skillId);
        
        // 获取当前技能值
        int currentSkillValue = getSkillValue(state);
        log.debug("[SkillCheckNode] 当前技能值: {}, 需要值: {}, 运算符: {}", 
                currentSkillValue, requiredValue, operator);
        
        // 执行检查
        boolean checkResult = checkSkillValue(currentSkillValue, requiredValue, operator);
        
        log.info("[SkillCheckNode] 技能检查结果: {}", checkResult);
        
        // 根据结果设置下一个节点
        String nextNodeId = checkResult ? successNodeId : failureNodeId;
        state.setData("skill_check_result", checkResult);
        state.setData("skill_check_node_id", id);
        state.setData("skill_check_skill_id", skillId);
        state.setData("skill_check_character_id", characterId);
        state.setData("skill_check_current_value", currentSkillValue);
        state.setData("skill_check_required_value", requiredValue);
        state.setData("next_node", nextNodeId);
        
        log.debug("[SkillCheckNode] 下一个节点: {}", nextNodeId);
        
        return state;
    }
    
    /**
     * 获取技能值
     */
    @SuppressWarnings("unchecked")
    private int getSkillValue(GraphEngine.GraphState state) {
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        if (skills == null) {
            skills = new HashMap<>();
            state.setData("character_skills", skills);
        }
        
        // 如果有指定角色ID，则从该角色的技能中获取
        // 否则从玩家角色的技能中获取
        String targetSkillKey = skillId;
        if (characterId != null && !characterId.isEmpty()) {
            // 如果支持多角色，可以使用 "characterId:skillId" 作为key
            // 这里简化处理，假设所有角色的技能都在同一个Map中，使用skillId作为key
            targetSkillKey = skillId;
        }
        
        return skills.getOrDefault(targetSkillKey, 0);
    }
    
    /**
     * 检查技能值是否满足条件
     */
    private boolean checkSkillValue(int currentValue, int requiredValue, String operator) {
        switch (operator) {
            case ">": return currentValue > requiredValue;
            case "<": return currentValue < requiredValue;
            case ">=": return currentValue >= requiredValue;
            case "<=": return currentValue <= requiredValue;
            case "==": return currentValue == requiredValue;
            case "!=": return currentValue != requiredValue;
            default:
                log.warn("[SkillCheckNode] 未知的运算符: {}，默认使用 >=", operator);
                return currentValue >= requiredValue;
        }
    }
}
