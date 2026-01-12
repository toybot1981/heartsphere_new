package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SkillCheckNode单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class SkillCheckNodeTest {
    
    private GraphEngine.SimpleGraphState state;
    
    @BeforeEach
    void setUp() {
        state = new GraphEngine.SimpleGraphState();
        
        // 初始化技能
        Map<String, Integer> skills = new HashMap<>();
        skills.put("strength", 60);
        skills.put("intelligence", 40);
        skills.put("charisma", 80);
        state.setData("character_skills", skills);
    }
    
    @Test
    void testSkillCheck_GreaterEqual_Success() {
        // 技能值 >= 需要值，应该成功
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_1")
                .skillId("strength")
                .operator(">=")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("node_success", result.getData("next_node"));
        assertEquals(60, result.getData("skill_check_current_value"));
    }
    
    @Test
    void testSkillCheck_GreaterEqual_Failure() {
        // 技能值 < 需要值，应该失败
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_2")
                .skillId("intelligence")
                .operator(">=")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertFalse((Boolean) result.getData("skill_check_result"));
        assertEquals("node_failure", result.getData("next_node"));
        assertEquals(40, result.getData("skill_check_current_value"));
    }
    
    @Test
    void testSkillCheck_Equal_Success() {
        // 技能值 == 需要值，应该成功
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_3")
                .skillId("charisma")
                .operator("==")
                .requiredValue(80)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("node_success", result.getData("next_node"));
    }
    
    @Test
    void testSkillCheck_Equal_Failure() {
        // 技能值 != 需要值，应该失败
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_4")
                .skillId("strength")
                .operator("==")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertFalse((Boolean) result.getData("skill_check_result"));
        assertEquals("node_failure", result.getData("next_node"));
    }
    
    @Test
    void testSkillCheck_Greater_Success() {
        // 技能值 > 需要值，应该成功
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_5")
                .skillId("strength")
                .operator(">")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("node_success", result.getData("next_node"));
    }
    
    @Test
    void testSkillCheck_Less_Success() {
        // 技能值 < 需要值，应该成功
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_6")
                .skillId("intelligence")
                .operator("<")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("node_success", result.getData("next_node"));
    }
    
    @Test
    void testSkillCheck_LessEqual_Success() {
        // 技能值 <= 需要值，应该成功
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_7")
                .skillId("intelligence")
                .operator("<=")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("node_success", result.getData("next_node"));
    }
    
    @Test
    void testSkillCheck_NotEqual_Success() {
        // 技能值 != 需要值，应该成功
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_8")
                .skillId("strength")
                .operator("!=")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("node_success", result.getData("next_node"));
    }
    
    @Test
    void testSkillCheck_MissingSkill() {
        // 技能不存在，默认值为0
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_9")
                .skillId("nonexistent_skill")
                .operator(">=")
                .requiredValue(10)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertFalse((Boolean) result.getData("skill_check_result"));
        assertEquals("node_failure", result.getData("next_node"));
        assertEquals(0, result.getData("skill_check_current_value"));
    }
    
    @Test
    void testSkillCheck_WithCharacterId() {
        // 带角色ID的技能检查（目前简化处理，使用skillId）
        SkillCheckNode node = SkillCheckNode.builder()
                .id("test_10")
                .characterId("char_1")
                .skillId("strength")
                .operator(">=")
                .requiredValue(50)
                .successNodeId("node_success")
                .failureNodeId("node_failure")
                .build();
        
        GraphEngine.GraphState result = node.execute(state.clone());
        assertTrue((Boolean) result.getData("skill_check_result"));
        assertEquals("char_1", result.getData("skill_check_character_id"));
    }
}
