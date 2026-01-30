package com.heartsphere.multiagent.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AgentRegistry 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("AgentRegistry 单元测试")
class AgentRegistryImplTest {
    
    private AgentRegistryImpl registry;
    private Agent testAgent1;
    private Agent testAgent2;
    private Agent testAgent3;
    
    @BeforeEach
    void setUp() {
        registry = new AgentRegistryImpl();
        
        // 创建测试智能体
        testAgent1 = createMockAgent("agent-1", "Agent 1", 
            Set.of("time-management", "task-planning"));
        testAgent2 = createMockAgent("agent-2", "Agent 2", 
            Set.of("health", "nutrition"));
        testAgent3 = createMockAgent("agent-3", "Agent 3", 
            Set.of("time-management", "health"));
    }
    
    /**
     * 创建 Mock 智能体
     */
    private Agent createMockAgent(String id, String name, Set<String> capabilities) {
        return new Agent() {
            @Override
            public String getId() {
                return id;
            }
            
            @Override
            public String getName() {
                return name;
            }
            
            @Override
            public String getDescription() {
                return "Test agent";
            }
            
            @Override
            public Set<String> getCapabilities() {
                return capabilities;
            }
            
            @Override
            public AgentResult execute(String task, Map<String, Object> context) {
                return AgentResult.success("Result from " + id);
            }
            
            @Override
            public boolean canHandle(String task) {
                return true;
            }
            
            @Override
            public AgentStatus getStatus() {
                return AgentStatus.IDLE;
            }
        };
    }
    
    @Test
    @DisplayName("测试智能体注册")
    void testRegister() {
        // 注册智能体
        registry.register(testAgent1);
        
        // 验证注册成功
        assertTrue(registry.exists("agent-1"));
        Optional<Agent> agent = registry.getAgent("agent-1");
        assertTrue(agent.isPresent());
        assertEquals("agent-1", agent.get().getId());
    }
    
    @Test
    @DisplayName("测试注册 null 智能体应抛出异常")
    void testRegisterNullAgent() {
        assertThrows(IllegalArgumentException.class, () -> {
            registry.register(null);
        });
    }
    
    @Test
    @DisplayName("测试智能体注销")
    void testUnregister() {
        // 注册智能体
        registry.register(testAgent1);
        assertTrue(registry.exists("agent-1"));
        
        // 注销智能体
        registry.unregister("agent-1");
        
        // 验证注销成功
        assertFalse(registry.exists("agent-1"));
        Optional<Agent> agent = registry.getAgent("agent-1");
        assertFalse(agent.isPresent());
    }
    
    @Test
    @DisplayName("测试注销不存在的智能体")
    void testUnregisterNonExistent() {
        // 注销不存在的智能体不应抛出异常
        assertDoesNotThrow(() -> {
            registry.unregister("non-existent");
        });
    }
    
    @Test
    @DisplayName("测试获取所有智能体")
    void testGetAllAgents() {
        // 注册多个智能体
        registry.register(testAgent1);
        registry.register(testAgent2);
        registry.register(testAgent3);
        
        // 获取所有智能体
        List<Agent> allAgents = registry.getAllAgents();
        
        // 验证数量
        assertEquals(3, allAgents.size());
        assertEquals(3, registry.size());
    }
    
    @Test
    @DisplayName("测试按能力查找智能体")
    void testFindAgentsByCapability() {
        // 注册智能体
        registry.register(testAgent1);
        registry.register(testAgent2);
        registry.register(testAgent3);
        
        // 查找具备 time-management 能力的智能体
        List<Agent> agents = registry.findAgentsByCapability("time-management");
        
        // 验证结果
        assertEquals(2, agents.size());
        assertTrue(agents.stream().anyMatch(a -> a.getId().equals("agent-1")));
        assertTrue(agents.stream().anyMatch(a -> a.getId().equals("agent-3")));
    }
    
    @Test
    @DisplayName("测试按多个能力查找智能体")
    void testFindAgentsByCapabilities() {
        // 注册智能体
        registry.register(testAgent1);
        registry.register(testAgent2);
        registry.register(testAgent3);
        
        // 查找同时具备 time-management 和 health 能力的智能体
        Set<String> capabilities = Set.of("time-management", "health");
        List<Agent> agents = registry.findAgentsByCapabilities(capabilities);
        
        // 验证结果：只有 agent-3 同时具备这两个能力
        assertEquals(1, agents.size());
        assertEquals("agent-3", agents.get(0).getId());
    }
    
    @Test
    @DisplayName("测试查找不存在的能力")
    void testFindAgentsByNonExistentCapability() {
        // 注册智能体
        registry.register(testAgent1);
        
        // 查找不存在的能力
        List<Agent> agents = registry.findAgentsByCapability("non-existent");
        
        // 验证结果为空
        assertTrue(agents.isEmpty());
    }
    
    @Test
    @DisplayName("测试能力索引更新")
    void testCapabilityIndexUpdate() {
        // 注册智能体
        registry.register(testAgent1);
        
        // 验证能力索引
        List<Agent> agents1 = registry.findAgentsByCapability("time-management");
        assertEquals(1, agents1.size());
        
        List<Agent> agents2 = registry.findAgentsByCapability("task-planning");
        assertEquals(1, agents2.size());
        
        // 注销智能体
        registry.unregister("agent-1");
        
        // 验证能力索引已更新
        List<Agent> agents3 = registry.findAgentsByCapability("time-management");
        assertTrue(agents3.isEmpty());
    }
    
    @Test
    @DisplayName("测试重新注册智能体")
    void testReregister() {
        // 注册智能体
        registry.register(testAgent1);
        assertEquals(1, registry.size());
        
        // 创建新的智能体（相同ID）
        Agent newAgent = createMockAgent("agent-1", "New Agent 1", 
            Set.of("new-capability"));
        
        // 重新注册
        registry.register(newAgent);
        
        // 验证已更新
        assertEquals(1, registry.size());
        Optional<Agent> agent = registry.getAgent("agent-1");
        assertTrue(agent.isPresent());
        assertTrue(agent.get().getCapabilities().contains("new-capability"));
    }
    
    @Test
    @DisplayName("测试空能力集合查找")
    void testFindAgentsByEmptyCapabilities() {
        // 注册智能体
        registry.register(testAgent1);
        registry.register(testAgent2);
        
        // 查找空能力集合应返回所有智能体
        List<Agent> agents = registry.findAgentsByCapabilities(Collections.emptySet());
        
        // 验证返回所有智能体
        assertEquals(2, agents.size());
    }
}
