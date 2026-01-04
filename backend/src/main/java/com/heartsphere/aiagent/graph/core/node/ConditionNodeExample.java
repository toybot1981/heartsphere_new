package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ConditionNode使用示例
 * 
 * 演示如何使用ConditionNode进行条件判断和流程分支
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class ConditionNodeExample {
    
    public static void main(String[] args) {
        // 创建示例状态
        GraphEngine.SimpleGraphState state = new GraphEngine.SimpleGraphState();
        
        // 设置角色技能
        Map<String, Integer> skills = new HashMap<>();
        skills.put("strength", 60);
        skills.put("intelligence", 40);
        state.setData("character_skills", skills);
        
        // 设置角色好感度
        Map<String, Integer> favorability = new HashMap<>();
        favorability.put("alice", 70);
        favorability.put("bob", 50);
        state.setData("character_favorability", favorability);
        
        // 设置触发的事件
        List<String> events = new ArrayList<>();
        events.add("met_alice");
        state.setData("triggered_events", events);
        
        // 设置收集的物品
        List<String> items = new ArrayList<>();
        items.add("sword");
        state.setData("collected_items", items);
        
        // 设置变量
        Map<String, Object> variables = new HashMap<>();
        variables.put("quest_progress", 3);
        variables.put("player_name", "Hero");
        state.setData("variables", variables);
        
        // 示例1: 技能检查（AND逻辑）
        log.info("=== 示例1: 技能检查（AND逻辑） ===");
        ConditionNode skillCheckNode = ConditionNode.builder()
                .id("skill_check_1")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.SKILL)
                                .target("strength")
                                .operator(">=")
                                .value(50)
                                .build(),
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.SKILL)
                                .target("intelligence")
                                .operator(">=")
                                .value(30)
                                .build()
                ))
                .trueNodeId("node_success")
                .falseNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result1 = skillCheckNode.execute(state.clone());
        log.info("条件结果: {}", result1.getData("condition_result"));
        log.info("下一个节点: {}", result1.getData("next_node"));
        
        // 示例2: 好感度检查（OR逻辑）
        log.info("\n=== 示例2: 好感度检查（OR逻辑） ===");
        ConditionNode favorabilityCheckNode = ConditionNode.builder()
                .id("favorability_check_1")
                .logic(ConditionNode.LogicType.OR)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.FAVORABILITY)
                                .target("alice")
                                .operator(">=")
                                .value(80)
                                .build(),
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.FAVORABILITY)
                                .target("bob")
                                .operator(">=")
                                .value(60)
                                .build()
                ))
                .trueNodeId("node_high_favorability")
                .falseNodeId("node_low_favorability")
                .build();
        
        GraphEngine.GraphState result2 = favorabilityCheckNode.execute(state.clone());
        log.info("条件结果: {}", result2.getData("condition_result"));
        log.info("下一个节点: {}", result2.getData("next_node"));
        
        // 示例3: 事件和物品检查
        log.info("\n=== 示例3: 事件和物品检查 ===");
        ConditionNode eventItemCheckNode = ConditionNode.builder()
                .id("event_item_check_1")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.EVENT)
                                .target("met_alice")
                                .operator("has")
                                .build(),
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.ITEM)
                                .target("sword")
                                .operator("has")
                                .build()
                ))
                .trueNodeId("node_ready")
                .falseNodeId("node_not_ready")
                .build();
        
        GraphEngine.GraphState result3 = eventItemCheckNode.execute(state.clone());
        log.info("条件结果: {}", result3.getData("condition_result"));
        log.info("下一个节点: {}", result3.getData("next_node"));
        
        // 示例4: 变量检查
        log.info("\n=== 示例4: 变量检查 ===");
        ConditionNode variableCheckNode = ConditionNode.builder()
                .id("variable_check_1")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.VARIABLE)
                                .target("quest_progress")
                                .operator(">=")
                                .value(2)
                                .build(),
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.VARIABLE)
                                .target("player_name")
                                .operator("==")
                                .value("Hero")
                                .build()
                ))
                .trueNodeId("node_quest_advanced")
                .falseNodeId("node_quest_early")
                .build();
        
        GraphEngine.GraphState result4 = variableCheckNode.execute(state.clone());
        log.info("条件结果: {}", result4.getData("condition_result"));
        log.info("下一个节点: {}", result4.getData("next_node"));
    }
}
