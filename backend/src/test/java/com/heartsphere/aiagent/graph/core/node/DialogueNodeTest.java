package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DialogueNode测试类
 * 
 * @author HeartSphere
 * @version 1.0
 */
class DialogueNodeTest {
    
    @Test
    void testCreateSimpleDialogueNode() {
        DialogueNode node = DialogueNode.create("dialogue_1", "你好，欢迎来到心域！");
        
        assertNotNull(node);
        assertEquals("dialogue_1", node.getId());
        assertEquals("你好，欢迎来到心域！", node.getText());
        assertNull(node.getCharacterId());
        assertEquals(DialogueNode.DialogueType.DIALOGUE, node.getType());
    }
    
    @Test
    void testCreateDialogueNodeWithCharacter() {
        DialogueNode node = DialogueNode.create(
            "dialogue_2", 
            "很高兴见到你！", 
            "character_123", 
            "角色A"
        );
        
        assertNotNull(node);
        assertEquals("dialogue_2", node.getId());
        assertEquals("很高兴见到你！", node.getText());
        assertEquals("character_123", node.getCharacterId());
        assertEquals("角色A", node.getCharacterName());
    }
    
    @Test
    void testCreateNarrationNode() {
        DialogueNode node = DialogueNode.createNarration("narration_1", "阳光透过窗户洒进房间。");
        
        assertNotNull(node);
        assertEquals("narration_1", node.getId());
        assertEquals("阳光透过窗户洒进房间。", node.getText());
        assertEquals(DialogueNode.DialogueType.NARRATION, node.getType());
    }
    
    @Test
    void testCreateThoughtNode() {
        DialogueNode node = DialogueNode.createThought("thought_1", "我想这是对的。");
        
        assertNotNull(node);
        assertEquals("thought_1", node.getId());
        assertEquals("我想这是对的。", node.getText());
        assertEquals(DialogueNode.DialogueType.THOUGHT, node.getType());
    }
    
    @Test
    void testExecuteDialogueNode() {
        DialogueNode node = DialogueNode.create("dialogue_1", "你好！", "char_1", "角色A");
        GraphEngine.GraphState state = new GraphEngine.SimpleGraphState();
        
        GraphEngine.GraphState resultState = node.execute(state);
        
        assertNotNull(resultState);
        assertEquals(node, resultState.getData("current_dialogue"));
        assertEquals("你好！", resultState.getData("dialogue_text"));
        assertEquals("char_1", resultState.getData("dialogue_character_id"));
        assertEquals("角色A", resultState.getData("dialogue_character_name"));
        assertEquals("DIALOGUE", resultState.getData("dialogue_type"));
    }
    
    @Test
    void testDialogueHistory() {
        DialogueNode node1 = DialogueNode.create("dialogue_1", "第一句");
        DialogueNode node2 = DialogueNode.create("dialogue_2", "第二句");
        
        GraphEngine.GraphState state = new GraphEngine.SimpleGraphState();
        
        node1.execute(state);
        node2.execute(state);
        
        @SuppressWarnings("unchecked")
        java.util.List<DialogueNode> history = 
            (java.util.List<DialogueNode>) state.getData("dialogue_history");
        
        assertNotNull(history);
        assertEquals(2, history.size());
        assertEquals(node1, history.get(0));
        assertEquals(node2, history.get(1));
    }
}
