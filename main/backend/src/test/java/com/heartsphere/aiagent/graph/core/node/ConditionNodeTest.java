package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ConditionNode单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class ConditionNodeTest {
    
    private GraphEngine.SimpleGraphState state;
    
    @BeforeEach
    void setUp() {
        state = new GraphEngine.SimpleGraphState();
        
        // 初始化技能
        Map<String, Integer> skills = new HashMap<>();
        skills.put("strength", 60);
        skills.put("intelligence", 40);
        state.setData("character_skills", skills);
        
        // 初始化好感度
        Map<String, Integer> favorability = new HashMap<>();
        favorability.put("alice", 70);
        favorability.put("bob", 50);
        state.setData("character_favorability", favorability);
        
        // 初始化事件
        List<String> events = new ArrayList<>();
        events.add("met_alice");
        state.setData("triggered_events", events);
        
        // 初始化物品
        List<String> items = new ArrayList<>();
        items.add("sword");
        state.setData("collected_items", items);
        
        // 初始化变量
        Map<String, Object> variables = new HashMap<>();
        variables.put("quest_progress", 3);
        variables.put("player_name", "Hero");
        state.setData("variables", variables);
    }
    
    @Test
    void testSkillCondition_AND_AllTrue() {
        // 所有条件都满足
        ConditionNode node = ConditionNode.builder()
                .id("test_1")
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
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
    
    @Test
    void testSkillCondition_AND_OneFalse() {
        // 一个条件不满足
        ConditionNode node = ConditionNode.builder()
                .id("test_2")
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
                                .value(50) // 不满足（实际是40）
                                .build()
                ))
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertFalse((Boolean) result.getData("condition_result"));
        assertEquals("node_false", result.getData("next_node"));
    }
    
    @Test
    void testFavorabilityCondition_OR_OneTrue() {
        // OR逻辑，至少一个满足
        ConditionNode node = ConditionNode.builder()
                .id("test_3")
                .logic(ConditionNode.LogicType.OR)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.FAVORABILITY)
                                .target("alice")
                                .operator(">=")
                                .value(80) // 不满足（实际是70）
                                .build(),
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.FAVORABILITY)
                                .target("bob")
                                .operator(">=")
                                .value(40) // 满足（实际是50）
                                .build()
                ))
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
    
    @Test
    void testEventCondition_Has() {
        // 检查事件是否存在
        ConditionNode node = ConditionNode.builder()
                .id("test_4")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.EVENT)
                                .target("met_alice")
                                .operator("has")
                                .build()
                ))
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
    
    @Test
    void testItemCondition_NotHas() {
        // 检查物品是否不存在
        ConditionNode node = ConditionNode.builder()
                .id("test_5")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.ITEM)
                                .target("shield") // 不存在
                                .operator("not_has")
                                .build()
                ))
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
    
    @Test
    void testVariableCondition_Numeric() {
        // 数值变量比较
        ConditionNode node = ConditionNode.builder()
                .id("test_6")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.VARIABLE)
                                .target("quest_progress")
                                .operator(">=")
                                .value(2)
                                .build()
                ))
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
    
    @Test
    void testVariableCondition_String() {
        // 字符串变量比较
        ConditionNode node = ConditionNode.builder()
                .id("test_7")
                .logic(ConditionNode.LogicType.AND)
                .conditions(List.of(
                        ConditionNode.Condition.builder()
                                .type(ConditionNode.Condition.ConditionType.VARIABLE)
                                .target("player_name")
                                .operator("==")
                                .value("Hero")
                                .build()
                ))
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
    
    @Test
    void testEmptyConditions() {
        // 没有条件，默认返回true
        ConditionNode node = ConditionNode.builder()
                .id("test_8")
                .logic(ConditionNode.LogicType.AND)
                .conditions(new ArrayList<>())
                .trueNodeId("node_true")
                .falseNodeId("node_false")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("condition_result"));
        assertEquals("node_true", result.getData("next_node"));
    }
}
