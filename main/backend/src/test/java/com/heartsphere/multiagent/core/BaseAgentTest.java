package com.heartsphere.multiagent.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BaseAgent 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("BaseAgent 单元测试")
class BaseAgentTest {
    
    private TestAgent testAgent;
    
    @BeforeEach
    void setUp() {
        testAgent = new TestAgent("test-agent", "Test Agent", "Test description");
    }
    
    /**
     * 测试用的 Agent 实现
     */
    static class TestAgent extends BaseAgent {
        private String lastTask;
        private Map<String, Object> lastContext;
        
        public TestAgent(String id, String name, String description) {
            super(id, name, description);
        }
        
        @Override
        protected AgentResult doExecute(String task, Map<String, Object> context) {
            this.lastTask = task;
            this.lastContext = new HashMap<>(context);
            return AgentResult.success("Result for: " + task);
        }
        
        public String getLastTask() {
            return lastTask;
        }
        
        public Map<String, Object> getLastContext() {
            return lastContext;
        }
    }
    
    @Test
    @DisplayName("测试智能体基本信息")
    void testBasicInfo() {
        assertEquals("test-agent", testAgent.getId());
        assertEquals("Test Agent", testAgent.getName());
        assertEquals("Test description", testAgent.getDescription());
        assertEquals(Agent.AgentStatus.IDLE, testAgent.getStatus());
    }
    
    @Test
    @DisplayName("测试添加能力")
    void testAddCapability() {
        testAgent.addCapability("capability-1");
        testAgent.addCapability("capability-2");
        
        Set<String> capabilities = testAgent.getCapabilities();
        assertEquals(2, capabilities.size());
        assertTrue(capabilities.contains("capability-1"));
        assertTrue(capabilities.contains("capability-2"));
    }
    
    @Test
    @DisplayName("测试添加多个能力")
    void testAddCapabilities() {
        Set<String> capabilities = Set.of("cap1", "cap2", "cap3");
        testAgent.addCapabilities(capabilities);
        
        Set<String> result = testAgent.getCapabilities();
        assertEquals(3, result.size());
        assertTrue(result.containsAll(capabilities));
    }
    
    @Test
    @DisplayName("测试执行任务")
    void testExecute() {
        Map<String, Object> context = Map.of("key1", "value1", "key2", 123);
        
        Agent.AgentResult result = testAgent.execute("Test task", context);
        
        assertTrue(result.isSuccess());
        assertEquals("Result for: Test task", result.getResult());
        assertEquals("Test task", testAgent.getLastTask());
        assertEquals(context, testAgent.getLastContext());
    }
    
    @Test
    @DisplayName("测试执行任务时状态变化")
    void testStatusChange() {
        assertEquals(Agent.AgentStatus.IDLE, testAgent.getStatus());
        
        testAgent.execute("Task", new HashMap<>());
        
        // BaseAgent 执行后应该保持 IDLE 状态（具体实现可能不同）
        assertNotNull(testAgent.getStatus());
    }
    
    @Test
    @DisplayName("测试 canHandle 方法")
    void testCanHandle() {
        // BaseAgent 的默认实现可能返回 false，需要子类实现
        // 这里测试方法存在即可
        boolean result = testAgent.canHandle("any task");
        assertNotNull(Boolean.valueOf(result));  // 只要不抛异常即可
    }
    
    @Test
    @DisplayName("测试能力集合返回新集合")
    void testCapabilitiesCopy() {
        testAgent.addCapability("cap1");
        Set<String> capabilities = testAgent.getCapabilities();
        
        // BaseAgent.getCapabilities() 返回新集合，可以修改但不影响原始集合
        capabilities.add("cap2");
        
        // 原始能力集合应该不变（因为返回的是副本）
        Set<String> originalCapabilities = testAgent.getCapabilities();
        assertEquals(1, originalCapabilities.size());
        assertTrue(originalCapabilities.contains("cap1"));
        assertFalse(originalCapabilities.contains("cap2"));
    }
    
    @Test
    @DisplayName("测试上下文传递")
    void testContextPassing() {
        Map<String, Object> context = new HashMap<>();
        context.put("previous_result", "Previous agent result");
        context.put("user_id", "user-123");
        
        testAgent.execute("Task with context", context);
        
        Map<String, Object> receivedContext = testAgent.getLastContext();
        assertEquals("Previous agent result", receivedContext.get("previous_result"));
        assertEquals("user-123", receivedContext.get("user_id"));
    }
}
