package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ChoiceNode测试类
 * 
 * @author HeartSphere
 * @version 1.0
 */
class ChoiceNodeTest {
    
    @Test
    void testCreateSimpleChoiceNode() {
        List<ChoiceNode.ChoiceOption> options = new ArrayList<>();
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("选项1")
            .nextNodeId("node_1")
            .build());
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_2")
            .text("选项2")
            .nextNodeId("node_2")
            .build());
        
        ChoiceNode node = ChoiceNode.create("choice_1", "请选择：", options);
        
        assertNotNull(node);
        assertEquals("choice_1", node.getId());
        assertEquals("请选择：", node.getPrompt());
        assertEquals(2, node.getOptions().size());
    }
    
    @Test
    void testGetAvailableOptions() {
        GraphEngine.GraphState state = new GraphEngine.SimpleGraphState();
        
        // 设置好感度
        Map<String, Integer> favorability = new HashMap<>();
        favorability.put("char_1", 50);
        state.setData("character_favorability", favorability);
        
        // 创建带条件的选项
        List<ChoiceNode.ChoiceOption> options = new ArrayList<>();
        
        // 选项1：需要好感度>=50
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("选项1（需要好感度>=50）")
            .nextNodeId("node_1")
            .conditions(List.of(
                ChoiceNode.ChoiceCondition.builder()
                    .type(ChoiceNode.ChoiceCondition.ConditionType.FAVORABILITY)
                    .target("char_1")
                    .operator(">=")
                    .value(50)
                    .build()
            ))
            .build());
        
        // 选项2：需要好感度>=80（不满足）
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_2")
            .text("选项2（需要好感度>=80）")
            .nextNodeId("node_2")
            .conditions(List.of(
                ChoiceNode.ChoiceCondition.builder()
                    .type(ChoiceNode.ChoiceCondition.ConditionType.FAVORABILITY)
                    .target("char_1")
                    .operator(">=")
                    .value(80)
                    .build()
            ))
            .build());
        
        ChoiceNode node = ChoiceNode.builder()
            .id("choice_1")
            .options(options)
            .build();
        
        List<ChoiceNode.ChoiceOption> availableOptions = node.getAvailableOptions(state);
        
        assertEquals(1, availableOptions.size());
        assertEquals("opt_1", availableOptions.get(0).getId());
    }
    
    @Test
    void testHandleChoice() {
        GraphEngine.GraphState state = new GraphEngine.SimpleGraphState();
        
        List<ChoiceNode.ChoiceOption> options = new ArrayList<>();
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("选项1")
            .nextNodeId("node_1")
            .effect(ChoiceNode.ChoiceEffect.builder()
                .favorabilityChange(Map.of("char_1", 10))
                .build())
            .build());
        
        ChoiceNode node = ChoiceNode.builder()
            .id("choice_1")
            .options(options)
            .build();
        
        // 执行节点
        node.execute(state);
        
        // 处理选择
        String nextNodeId = node.handleChoice("opt_1", state);
        
        assertEquals("node_1", nextNodeId);
        assertFalse((Boolean) state.getData("waiting_for_choice"));
        assertEquals("opt_1", state.getData("selected_option_id"));
        
        // 检查效果是否应用
        @SuppressWarnings("unchecked")
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        assertNotNull(favorability);
        assertEquals(10, favorability.get("char_1"));
    }
    
    @Test
    void testApplyEffect() {
        GraphEngine.GraphState state = new GraphEngine.SimpleGraphState();
        
        ChoiceNode.ChoiceEffect effect = ChoiceNode.ChoiceEffect.builder()
            .favorabilityChange(Map.of("char_1", 10, "char_2", -5))
            .skillChange(Map.of("skill_1", 5))
            .triggerEvents(List.of("event_1"))
            .addItems(List.of("item_1"))
            .setVariables(Map.of("var_1", "value_1"))
            .build();
        
        ChoiceNode.ChoiceOption option = ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("选项1")
            .nextNodeId("node_1")
            .effect(effect)
            .build();
        
        ChoiceNode node = ChoiceNode.builder()
            .id("choice_1")
            .options(List.of(option))
            .build();
        
        node.applyEffect(option, state);
        
        // 检查效果
        @SuppressWarnings("unchecked")
        Map<String, Integer> favorability = (Map<String, Integer>) state.getData("character_favorability");
        assertEquals(10, favorability.get("char_1"));
        assertEquals(-5, favorability.get("char_2"));
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> skills = (Map<String, Integer>) state.getData("character_skills");
        assertEquals(5, skills.get("skill_1"));
        
        @SuppressWarnings("unchecked")
        List<String> events = (List<String>) state.getData("triggered_events");
        assertTrue(events.contains("event_1"));
        
        @SuppressWarnings("unchecked")
        List<String> items = (List<String>) state.getData("items");
        assertTrue(items.contains("item_1"));
        
        assertEquals("value_1", state.getData("variable_var_1"));
    }
}
