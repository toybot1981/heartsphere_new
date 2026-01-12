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
 * StateChangeNode单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class StateChangeNodeTest {
    
    private GraphEngine.SimpleGraphState state;
    
    @BeforeEach
    void setUp() {
        state = new GraphEngine.SimpleGraphState();
        
        // 初始化技能
        Map<String, Integer> skills = new HashMap<>();
        skills.put("strength", 50);
        skills.put("intelligence", 40);
        state.setData("character_skills", skills);
        
        // 初始化好感度
        Map<String, Integer> favorability = new HashMap<>();
        favorability.put("alice", 60);
        state.setData("character_favorability", favorability);
        
        // 初始化变量
        Map<String, Object> variables = new HashMap<>();
        variables.put("counter", 10);
        state.setData("variables", variables);
        
        // 初始化事件和物品
        state.setData("triggered_events", new ArrayList<>());
        state.setData("collected_items", new ArrayList<>());
    }
    
    @Test
    void testSkillChange_Add() {
        // 增加技能值
        StateChangeNode node = StateChangeNode.builder()
                .id("test_1")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(10)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        assertEquals(60, skills.get("strength"));
    }
    
    @Test
    void testSkillChange_Subtract() {
        // 减少技能值
        StateChangeNode node = StateChangeNode.builder()
                .id("test_2")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.SUBTRACT)
                                .value(20)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        assertEquals(30, skills.get("strength"));
    }
    
    @Test
    void testSkillChange_Set() {
        // 设置技能值
        StateChangeNode node = StateChangeNode.builder()
                .id("test_3")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.SET)
                                .value(80)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        assertEquals(80, skills.get("strength"));
    }
    
    @Test
    void testSkillChange_ClampTo100() {
        // 技能值应该限制在100以内
        StateChangeNode node = StateChangeNode.builder()
                .id("test_4")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(60) // 50 + 60 = 110，应该限制为100
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        assertEquals(100, skills.get("strength"));
    }
    
    @Test
    void testSkillChange_ClampTo0() {
        // 技能值应该限制在0以上
        StateChangeNode node = StateChangeNode.builder()
                .id("test_5")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.SUBTRACT)
                                .value(60) // 50 - 60 = -10，应该限制为0
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        assertEquals(0, skills.get("strength"));
    }
    
    @Test
    void testFavorabilityChange_Add() {
        // 增加好感度
        StateChangeNode node = StateChangeNode.builder()
                .id("test_6")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.FAVORABILITY)
                                .target("alice")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(20)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        assertEquals(80, favorability.get("alice"));
    }
    
    @Test
    void testVariableChange_Add() {
        // 增加变量值
        StateChangeNode node = StateChangeNode.builder()
                .id("test_7")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.VARIABLE)
                                .target("counter")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(5)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Object> variables = (Map<String, Object>) state.getData("variables");
        assertEquals(15, variables.get("counter"));
    }
    
    @Test
    void testVariableChange_Set() {
        // 设置变量值
        StateChangeNode node = StateChangeNode.builder()
                .id("test_8")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.VARIABLE)
                                .target("counter")
                                .operation(StateChangeNode.StateChange.OperationType.SET)
                                .value(100)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Object> variables = (Map<String, Object>) state.getData("variables");
        assertEquals(100, variables.get("counter"));
    }
    
    @Test
    void testEventChange_Trigger() {
        // 触发事件
        StateChangeNode node = StateChangeNode.builder()
                .id("test_9")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.EVENT)
                                .target("event_1")
                                .operation(StateChangeNode.StateChange.OperationType.TRIGGER)
                                .build()
                ))
                .build();
        
        node.execute(state);
        List<String> events = (List<String>) state.getData("triggered_events");
        assertTrue(events.contains("event_1"));
    }
    
    @Test
    void testItemChange_Add() {
        // 添加物品
        StateChangeNode node = StateChangeNode.builder()
                .id("test_10")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.ITEM)
                                .target("sword")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .build()
                ))
                .build();
        
        node.execute(state);
        List<String> items = (List<String>) state.getData("collected_items");
        assertTrue(items.contains("sword"));
    }
    
    @Test
    void testMultipleChanges() {
        // 多个状态变更
        StateChangeNode node = StateChangeNode.builder()
                .id("test_11")
                .changes(List.of(
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.SKILL)
                                .target("strength")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(10)
                                .build(),
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.FAVORABILITY)
                                .target("alice")
                                .operation(StateChangeNode.StateChange.OperationType.ADD)
                                .value(5)
                                .build(),
                        StateChangeNode.StateChange.builder()
                                .type(StateChangeNode.StateChange.ChangeType.EVENT)
                                .target("quest_completed")
                                .operation(StateChangeNode.StateChange.OperationType.TRIGGER)
                                .build()
                ))
                .build();
        
        node.execute(state);
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        List<String> events = (List<String>) state.getData("triggered_events");
        
        assertEquals(60, skills.get("strength"));
        assertEquals(65, favorability.get("alice"));
        assertTrue(events.contains("quest_completed"));
    }
}
