package com.heartsphere.multiagent.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * AgentRegistry 测试
 */
@ExtendWith(MockitoExtension.class)
class AgentRegistryTest {

    private AgentRegistry agentRegistry;

    @Mock
    private Agent agent1;

    @Mock
    private Agent agent2;

    @BeforeEach
    void setUp() {
        agentRegistry = new AgentRegistryImpl();
        
        // 设置 mock agent
        when(agent1.getId()).thenReturn("agent-1");
        when(agent1.getName()).thenReturn("Agent 1");
        when(agent1.getCapabilities()).thenReturn(Set.of("time-management", "efficiency"));
        
        when(agent2.getId()).thenReturn("agent-2");
        when(agent2.getName()).thenReturn("Agent 2");
        when(agent2.getCapabilities()).thenReturn(Set.of("health", "nutrition"));
    }

    @Test
    void testRegisterAgent() {
        agentRegistry.register(agent1);
        
        assertTrue(agentRegistry.exists("agent-1"));
        assertEquals(1, agentRegistry.size());
    }

    @Test
    void testRegisterMultipleAgents() {
        agentRegistry.register(agent1);
        agentRegistry.register(agent2);
        
        assertEquals(2, agentRegistry.size());
    }

    @Test
    void testGetAgent() {
        agentRegistry.register(agent1);
        
        Optional<Agent> found = agentRegistry.getAgent("agent-1");
        assertTrue(found.isPresent());
        assertEquals("agent-1", found.get().getId());
    }

    @Test
    void testGetNonExistentAgent() {
        Optional<Agent> found = agentRegistry.getAgent("non-existent");
        assertFalse(found.isPresent());
    }

    @Test
    void testFindAgentsByCapability() {
        agentRegistry.register(agent1);
        agentRegistry.register(agent2);
        
        List<Agent> agents = agentRegistry.findAgentsByCapability("time-management");
        assertEquals(1, agents.size());
        assertEquals("agent-1", agents.get(0).getId());
    }

    @Test
    void testFindAgentsByCapabilities() {
        agentRegistry.register(agent1);
        agentRegistry.register(agent2);
        
        List<Agent> agents = agentRegistry.findAgentsByCapabilities(Set.of("time-management", "efficiency"));
        assertEquals(1, agents.size());
        assertEquals("agent-1", agents.get(0).getId());
    }

    @Test
    void testUnregisterAgent() {
        agentRegistry.register(agent1);
        agentRegistry.register(agent2);
        
        agentRegistry.unregister("agent-1");
        
        assertFalse(agentRegistry.exists("agent-1"));
        assertTrue(agentRegistry.exists("agent-2"));
        assertEquals(1, agentRegistry.size());
    }

    @Test
    void testGetAllAgents() {
        agentRegistry.register(agent1);
        agentRegistry.register(agent2);
        
        List<Agent> allAgents = agentRegistry.getAllAgents();
        assertEquals(2, allAgents.size());
    }
}
