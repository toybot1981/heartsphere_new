package com.heartsphere.multiagent.orchestrator;

import com.heartsphere.multiagent.core.Agent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * LoadBalancer 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("LoadBalancer 单元测试")
class LoadBalancerTest {
    
    private LoadBalancer loadBalancer;
    private Agent agent1;
    private Agent agent2;
    private Agent agent3;
    
    @BeforeEach
    void setUp() {
        loadBalancer = new LoadBalancer();
        
        // 创建测试智能体
        agent1 = createMockAgent("agent-1", Set.of("capability-1", "capability-2"));
        agent2 = createMockAgent("agent-2", Set.of("capability-1"));
        agent3 = createMockAgent("agent-3", Set.of("capability-2", "capability-3"));
    }
    
    private Agent createMockAgent(String id, Set<String> capabilities) {
        return new Agent() {
            @Override
            public String getId() {
                return id;
            }
            
            @Override
            public String getName() {
                return "Agent " + id;
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
                return AgentResult.success("Result");
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
    @DisplayName("测试智能体选择 - 按能力匹配")
    void testSelectAgentsByCapability() {
        List<Agent> candidates = Arrays.asList(agent1, agent2, agent3);
        Set<String> requiredCapabilities = Set.of("capability-1");
        
        List<Agent> selected = loadBalancer.selectAgents(candidates, requiredCapabilities);
        
        assertNotNull(selected);
        assertFalse(selected.isEmpty());
        // 应该选择具备 capability-1 的智能体
        assertTrue(selected.stream().anyMatch(a -> a.getId().equals("agent-1")));
        assertTrue(selected.stream().anyMatch(a -> a.getId().equals("agent-2")));
    }
    
    @Test
    @DisplayName("测试智能体选择 - 多个能力要求")
    void testSelectAgentsByMultipleCapabilities() {
        List<Agent> candidates = Arrays.asList(agent1, agent2, agent3);
        Set<String> requiredCapabilities = Set.of("capability-1", "capability-2");
        
        List<Agent> selected = loadBalancer.selectAgents(candidates, requiredCapabilities);
        
        assertNotNull(selected);
        // 只有 agent-1 同时具备两个能力
        assertEquals(1, selected.size());
        assertEquals("agent-1", selected.get(0).getId());
    }
    
    @Test
    @DisplayName("测试智能体选择 - 无匹配能力")
    void testSelectAgentsNoMatch() {
        List<Agent> candidates = Arrays.asList(agent1, agent2);
        Set<String> requiredCapabilities = Set.of("non-existent-capability");
        
        List<Agent> selected = loadBalancer.selectAgents(candidates, requiredCapabilities);
        
        assertTrue(selected.isEmpty());
    }
    
    @Test
    @DisplayName("测试负载记录")
    void testLoadRecording() {
        String agentId = "agent-1";
        
        // 记录任务开始
        loadBalancer.recordTaskStart(agentId);
        
        LoadBalancer.AgentLoadMetrics metrics = loadBalancer.getMetrics(agentId);
        assertNotNull(metrics);
        assertEquals(1, metrics.getCurrentTaskCount());
        
        // 记录任务完成
        loadBalancer.recordTaskComplete(agentId, 1000);
        
        metrics = loadBalancer.getMetrics(agentId);
        assertEquals(0, metrics.getCurrentTaskCount());
        assertTrue(metrics.getAverageExecutionTime() > 0);
    }
    
    @Test
    @DisplayName("测试负载分数计算")
    void testLoadScore() {
        String agentId = "agent-1";
        
        // 增加多个任务
        loadBalancer.recordTaskStart(agentId);
        loadBalancer.recordTaskStart(agentId);
        
        LoadBalancer.AgentLoadMetrics metrics = loadBalancer.getMetrics(agentId);
        double loadScore = metrics.getLoadScore();
        
        // 负载分数应该在 0-1 之间
        assertTrue(loadScore >= 0.0 && loadScore <= 1.0);
    }
    
    @Test
    @DisplayName("测试空候选列表")
    void testSelectAgentsEmptyCandidates() {
        List<Agent> candidates = Collections.emptyList();
        Set<String> requiredCapabilities = Set.of("capability-1");
        
        List<Agent> selected = loadBalancer.selectAgents(candidates, requiredCapabilities);
        
        assertTrue(selected.isEmpty());
    }
    
    @Test
    @DisplayName("测试空能力要求")
    void testSelectAgentsEmptyCapabilities() {
        List<Agent> candidates = Arrays.asList(agent1, agent2);
        Set<String> requiredCapabilities = Collections.emptySet();
        
        List<Agent> selected = loadBalancer.selectAgents(candidates, requiredCapabilities);
        
        // 空能力要求应该返回所有候选智能体
        assertEquals(2, selected.size());
    }
}
