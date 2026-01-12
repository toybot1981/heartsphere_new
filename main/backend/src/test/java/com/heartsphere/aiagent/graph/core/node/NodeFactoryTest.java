package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * NodeFactory测试类
 * 
 * @author HeartSphere
 * @version 1.0
 */
class NodeFactoryTest {
    
    private final NodeFactory factory = new NodeFactory();
    
    @Test
    void testCreateDialogueNode() {
        Map<String, Object> config = new HashMap<>();
        config.put("id", "dialogue_1");
        config.put("text", "你好！");
        config.put("characterId", "char_1");
        config.put("characterName", "角色A");
        config.put("type", "dialogue");
        
        GraphEngine.GraphNode node = factory.createNode("dialogue", config);
        
        assertNotNull(node);
        assertTrue(node instanceof DialogueNode);
        assertEquals("dialogue_1", node.getId());
    }
    
    @Test
    void testCreateDialogueNodeFromJson() {
        String json = "{\n" +
            "  \"id\": \"dialogue_1\",\n" +
            "  \"text\": \"你好！\",\n" +
            "  \"characterId\": \"char_1\",\n" +
            "  \"characterName\": \"角色A\",\n" +
            "  \"type\": \"dialogue\"\n" +
            "}";
        
        DialogueNode node = factory.createDialogueNodeFromJson(json);
        
        assertNotNull(node);
        assertEquals("dialogue_1", node.getId());
        assertEquals("你好！", node.getText());
        assertEquals("char_1", node.getCharacterId());
        assertEquals("角色A", node.getCharacterName());
    }
    
    @Test
    void testCreateUnsupportedNodeType() {
        Map<String, Object> config = new HashMap<>();
        config.put("id", "choice_1");
        
        assertThrows(UnsupportedOperationException.class, () -> {
            factory.createNode("choice", config);
        });
    }
    
    @Test
    void testCreateUnknownNodeType() {
        Map<String, Object> config = new HashMap<>();
        
        assertThrows(IllegalArgumentException.class, () -> {
            factory.createNode("unknown_type", config);
        });
    }
}
