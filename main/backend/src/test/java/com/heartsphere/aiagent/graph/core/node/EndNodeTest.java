package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * EndNode单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class EndNodeTest {
    
    private GraphEngine.SimpleGraphState state;
    
    @BeforeEach
    void setUp() {
        state = new GraphEngine.SimpleGraphState();
    }
    
    @Test
    void testEndNode_Execute() {
        EndNode node = EndNode.builder()
                .id("end_1")
                .endingType("GOOD")
                .endingDescription("完美结局")
                .build();
        
        GraphEngine.GraphState result = node.execute(state);
        
        assertTrue((Boolean) result.getData("graph_ended"));
        assertEquals("end_1", result.getData("end_node_id"));
        assertEquals("GOOD", result.getData("ending_type"));
        assertEquals("完美结局", result.getData("ending_description"));
        assertNull(result.getData("next_node"));
    }
    
    @Test
    void testEndNode_WithoutDescription() {
        EndNode node = EndNode.builder()
                .id("end_2")
                .endingType("BAD")
                .build();
        
        GraphEngine.GraphState result = node.execute(state);
        
        assertTrue((Boolean) result.getData("graph_ended"));
        assertEquals("BAD", result.getData("ending_type"));
        assertNull(result.getData("ending_description"));
    }
    
    @Test
    void testEndNode_MultipleEndings() {
        // 测试多个结局节点
        EndNode goodEnd = EndNode.builder()
                .id("end_good")
                .endingType("GOOD")
                .endingDescription("好结局")
                .build();
        
        EndNode badEnd = EndNode.builder()
                .id("end_bad")
                .endingType("BAD")
                .endingDescription("坏结局")
                .build();
        
        GraphEngine.GraphState result1 = goodEnd.execute(state.clone());
        GraphEngine.GraphState result2 = badEnd.execute(state.clone());
        
        assertEquals("end_good", result1.getData("end_node_id"));
        assertEquals("end_bad", result2.getData("end_node_id"));
        assertEquals("好结局", result1.getData("ending_description"));
        assertEquals("坏结局", result2.getData("ending_description"));
    }
}
