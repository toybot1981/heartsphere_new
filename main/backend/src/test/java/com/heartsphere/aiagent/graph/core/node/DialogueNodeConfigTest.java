package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DialogueNodeConfig测试类
 * 
 * @author HeartSphere
 * @version 1.0
 */
class DialogueNodeConfigTest {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Test
    void testCreateFromConfig() {
        DialogueNodeConfig config = DialogueNodeConfig.builder()
            .id("dialogue_1")
            .text("你好！")
            .characterId("char_1")
            .characterName("角色A")
            .type("dialogue")
            .build();
        
        DialogueNode node = config.toDialogueNode();
        
        assertNotNull(node);
        assertEquals("dialogue_1", node.getId());
        assertEquals("你好！", node.getText());
        assertEquals("char_1", node.getCharacterId());
        assertEquals("角色A", node.getCharacterName());
        assertEquals(DialogueNode.DialogueType.DIALOGUE, node.getType());
    }
    
    @Test
    void testCreateNarrationFromConfig() {
        DialogueNodeConfig config = DialogueNodeConfig.builder()
            .id("narration_1")
            .text("阳光明媚")
            .type("narration")
            .build();
        
        DialogueNode node = config.toDialogueNode();
        
        assertEquals(DialogueNode.DialogueType.NARRATION, node.getType());
    }
    
    @Test
    void testCreateThoughtFromConfig() {
        DialogueNodeConfig config = DialogueNodeConfig.builder()
            .id("thought_1")
            .text("我想...")
            .type("thought")
            .build();
        
        DialogueNode node = config.toDialogueNode();
        
        assertEquals(DialogueNode.DialogueType.THOUGHT, node.getType());
    }
    
    @Test
    void testDefaultType() {
        DialogueNodeConfig config = DialogueNodeConfig.builder()
            .id("dialogue_1")
            .text("你好")
            .build();
        
        DialogueNode node = config.toDialogueNode();
        
        assertEquals(DialogueNode.DialogueType.DIALOGUE, node.getType());
    }
    
    @Test
    void testInvalidType() {
        DialogueNodeConfig config = DialogueNodeConfig.builder()
            .id("dialogue_1")
            .text("你好")
            .type("invalid_type")
            .build();
        
        DialogueNode node = config.toDialogueNode();
        
        // 无效类型应该使用默认值
        assertEquals(DialogueNode.DialogueType.DIALOGUE, node.getType());
    }
}
