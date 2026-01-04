package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

/**
 * WaitNode单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class WaitNodeTest {
    
    private GraphEngine.SimpleGraphState state;
    
    @BeforeEach
    void setUp() {
        state = new GraphEngine.SimpleGraphState();
    }
    
    @Test
    void testWaitNode_UserInput() {
        WaitNode node = WaitNode.builder()
                .id("wait_1")
                .waitType(WaitNode.WaitType.USER_INPUT)
                .nextNodeId("node_after_wait")
                .build();
        
        GraphEngine.GraphState result = node.execute(state);
        
        assertTrue((Boolean) result.getData("waiting"));
        assertEquals("wait_1", result.getData("wait_node_id"));
        assertEquals("USER_INPUT", result.getData("wait_type"));
        assertEquals("node_after_wait", result.getData("next_node"));
    }
    
    @Test
    void testWaitNode_Event() {
        WaitNode node = WaitNode.builder()
                .id("wait_2")
                .waitType(WaitNode.WaitType.EVENT)
                .waitCondition("event_1")
                .nextNodeId("node_after_wait")
                .build();
        
        GraphEngine.GraphState result = node.execute(state);
        
        assertTrue((Boolean) result.getData("waiting"));
        assertEquals("EVENT", result.getData("wait_type"));
        assertEquals("event_1", result.getData("wait_condition"));
    }
    
    @Test
    void testWaitNode_CheckEventCondition_NotTriggered() {
        WaitNode node = WaitNode.builder()
                .id("wait_3")
                .waitType(WaitNode.WaitType.EVENT)
                .waitCondition("event_1")
                .build();
        
        node.execute(state);
        
        // 事件未触发，条件不满足
        assertFalse(node.checkWaitCondition(state));
    }
    
    @Test
    void testWaitNode_CheckEventCondition_Triggered() {
        WaitNode node = WaitNode.builder()
                .id("wait_4")
                .waitType(WaitNode.WaitType.EVENT)
                .waitCondition("event_1")
                .build();
        
        // 设置触发的事件
        state.setData("triggered_events", new java.util.ArrayList<>(java.util.List.of("event_1")));
        
        node.execute(state);
        
        // 事件已触发，条件满足
        assertTrue(node.checkWaitCondition(state));
    }
    
    @Test
    void testWaitNode_CheckUserInputCondition_NotCompleted() {
        WaitNode node = WaitNode.builder()
                .id("wait_5")
                .waitType(WaitNode.WaitType.USER_INPUT)
                .build();
        
        node.execute(state);
        
        // 用户输入未完成，条件不满足
        assertFalse(node.checkWaitCondition(state));
    }
    
    @Test
    void testWaitNode_CheckUserInputCondition_Completed() {
        WaitNode node = WaitNode.builder()
                .id("wait_6")
                .waitType(WaitNode.WaitType.USER_INPUT)
                .build();
        
        // 标记等待完成
        state.setData("wait_completed", true);
        
        node.execute(state);
        
        // 用户输入已完成，条件满足
        assertTrue(node.checkWaitCondition(state));
    }
    
    @Test
    void testWaitNode_WithTimeout() {
        WaitNode node = WaitNode.builder()
                .id("wait_7")
                .waitType(WaitNode.WaitType.TIMER)
                .timeout(5000L)
                .nextNodeId("node_after_timeout")
                .build();
        
        GraphEngine.GraphState result = node.execute(state);
        
        assertEquals(5000L, result.getData("wait_timeout"));
        assertEquals("node_after_timeout", result.getData("next_node"));
    }
}
