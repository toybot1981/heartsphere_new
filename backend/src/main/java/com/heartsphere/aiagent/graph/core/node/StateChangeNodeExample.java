package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * StateChangeNode使用示例
 * 
 * 演示如何使用StateChangeNode修改角色状态
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class StateChangeNodeExample {
    
    public static void main(String[] args) {
        // 创建示例状态
        GraphEngine.SimpleGraphState state = new GraphEngine.SimpleGraphState();
        
        // 初始化技能
        Map<String, Integer> skills = new HashMap<>();
        skills.put("strength", 50);
        skills.put("intelligence", 40);
        state.setData("character_skills", skills);
        
        // 初始化好感度
        Map<String, Integer> favorability = new HashMap<>();
        favorability.put("alice", 60);
        favorability.put("bob", 50);
        state.setData("character_favorability", favorability);
        
        // 初始化变量
        Map<String, Object> variables = new HashMap<>();
        variables.put("quest_progress", 2);
        state.setData("variables", variables);
        
        // 初始化事件和物品列表
        List<String> events = new ArrayList<>();
        state.setData("triggered_events", events);
        List<String> items = new ArrayList<>();
        state.setData("collected_items", items);
        
        // 示例1: 增加技能值
        log.info("=== 示例1: 增加技能值 ===");
        StateChangeNode addSkillNode = StateChangeNode.builder()
                .id("add_skill_1")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(10)
                                .build()
                ))
                .build();
        
        GraphEngine.GraphState result1 = addSkillNode.execute(state.clone());
        Map<String, Integer> skillsAfter1 = (Map<String, Integer>) result1.getData("character_skills");
        log.info("力量技能值: {} -> {}", skills.get("strength"), skillsAfter1.get("strength"));
        
        // 示例2: 设置好感度
        log.info("\n=== 示例2: 设置好感度 ===");
        StateChangeNode setFavorabilityNode = StateChangeNode.builder()
                .id("set_favorability_1")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.FAVORABILITY)
                                .target("alice")
                                .operation(StateChangeNode.StateChange.OperationType.SET)
                                .value(80)
                                .build()
                ))
                .build();
        
        GraphEngine.GraphState result2 = setFavorabilityNode.execute(state.clone());
        Map<String, Integer> favorabilityAfter2 = (Map<String, Integer>) result2.getData("character_favorability");
        log.info("Alice好感度: {} -> {}", favorability.get("alice"), favorabilityAfter2.get("alice"));
        
        // 示例3: 触发事件和添加物品
        log.info("\n=== 示例3: 触发事件和添加物品 ===");
        StateChangeNode eventItemNode = StateChangeNode.builder()
                .id("event_item_1")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.EVENT)
                                .target("met_alice")
                                .operation(StateChangeNode.StateChange.OperationType.TRIGGER)
                                .build(),
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.ITEM)
                                .target("sword")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .build()
                ))
                .build();
        
        GraphEngine.GraphState result3 = eventItemNode.execute(state.clone());
        List<String> eventsAfter3 = (List<String>) result3.getData("triggered_events");
        List<String> itemsAfter3 = (List<String>) result3.getData("collected_items");
        log.info("触发事件: {}", eventsAfter3);
        log.info("收集物品: {}", itemsAfter3);
        
        // 示例4: 修改变量
        log.info("\n=== 示例4: 修改变量 ===");
        StateChangeNode variableNode = StateChangeNode.builder()
                .id("variable_1")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.VARIABLE)
                                .target("quest_progress")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(1)
                                .build()
                ))
                .build();
        
        GraphEngine.GraphState result4 = variableNode.execute(state.clone());
        Map<String, Object> variablesAfter4 = (Map<String, Object>) result4.getData("variables");
        log.info("任务进度: {} -> {}", variables.get("quest_progress"), variablesAfter4.get("quest_progress"));
        
        // 示例5: 复合变更（多个状态同时变更）
        log.info("\n=== 示例5: 复合变更（多个状态同时变更） ===");
        StateChangeNode complexNode = StateChangeNode.builder()
                .id("complex_1")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("intelligence")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(5)
                                .build(),
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.FAVORABILITY)
                                .target("bob")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(10)
                                .build(),
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.EVENT)
                                .target("completed_quest")
                                .operation(StateChangeNode.StateChange.OperationType.TRIGGER)
                                .build()
                ))
                .build();
        
        GraphEngine.GraphState result5 = complexNode.execute(state.clone());
        Map<String, Integer> skillsAfter5 = (Map<String, Integer>) result5.getData("character_skills");
        Map<String, Integer> favorabilityAfter5 = (Map<String, Integer>) result5.getData("character_favorability");
        List<String> eventsAfter5 = (List<String>) result5.getData("triggered_events");
        log.info("智力技能值: {} -> {}", skills.get("intelligence"), skillsAfter5.get("intelligence"));
        log.info("Bob好感度: {} -> {}", favorability.get("bob"), favorabilityAfter5.get("bob"));
        log.info("触发事件: {}", eventsAfter5);
    }
}
