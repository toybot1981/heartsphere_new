package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * StartNode单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class StartNodeTest {
    
    private GraphEngine.SimpleGraphState state;
    
    @BeforeEach
    void setUp() {
        state = new GraphEngine.SimpleGraphState();
    }
    
    @Test
    void testStartNode_Execute() {
        StartNode node = StartNode.builder()
                .id("start")
                .build();
        
        GraphEngine.GraphState result = node.execute(state);
        
        assertTrue((Boolean) result.getData("graph_started"));
        assertEquals("start", result.getData("start_node_id"));
    }
    
    @Test
    void testStartNode_DefaultId() {
        StartNode node = StartNode.builder()
                .id("my_start")
                .build();
        
        assertEquals("my_start", node.getId());
    }
}
