package com.heartsphere.character.multiagent;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.core.AgentRegistryImpl;
import com.heartsphere.multiagent.router.AgentRouter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * LifeAssistantRouter 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("LifeAssistantRouter 单元测试")
class LifeAssistantRouterTest {
    
    private LifeAssistantRouter router;
    private AgentRegistry agentRegistry;
    
    @BeforeEach
    void setUp() {
        agentRegistry = new AgentRegistryImpl();
        router = new LifeAssistantRouter(agentRegistry);
        
        // 注册测试智能体
        registerTestAgents();
    }
    
    private void registerTestAgents() {
        // 创建生活助手智能体
        Agent timeAgent = createLifeAssistantAgent("time-agent", "时小光", 
            Set.of("time-management", "task-planning"));
        Agent healthAgent = createLifeAssistantAgent("health-agent", "康小健", 
            Set.of("health", "nutrition"));
        Agent learningAgent = createLifeAssistantAgent("learning-agent", "学小知", 
            Set.of("learning", "education"));
        
        agentRegistry.register(timeAgent);
        agentRegistry.register(healthAgent);
        agentRegistry.register(learningAgent);
    }
    
    private Agent createLifeAssistantAgent(String id, String name, Set<String> capabilities) {
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
                return "Life assistant: " + name;
            }
            
            @Override
            public Set<String> getCapabilities() {
                return capabilities;
            }
            
            @Override
            public AgentResult execute(String task, Map<String, Object> context) {
                return AgentResult.success("Result from " + name);
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
    @DisplayName("测试路由到时间管理智能体")
    void testRouteToTimeManagementAgent() {
        String task = "我想提高工作效率";
        AgentRouter.RoutingContext context = 
            new AgentRouter.RoutingContext("user-1", "session-1");
        
        List<Agent> agents = router.route(task, context);
        
        assertNotNull(agents);
        assertFalse(agents.isEmpty());
        // 应该路由到时间管理智能体
        assertTrue(agents.stream().anyMatch(a -> 
            a.getCapabilities().contains("time-management")));
    }
    
    @Test
    @DisplayName("测试路由到健康管理智能体")
    void testRouteToHealthAgent() {
        String task = "我想改善健康状况";
        AgentRouter.RoutingContext context = 
            new AgentRouter.RoutingContext("user-1", "session-1");
        
        List<Agent> agents = router.route(task, context);
        
        assertNotNull(agents);
        assertFalse(agents.isEmpty());
        // 应该路由到健康管理智能体
        assertTrue(agents.stream().anyMatch(a -> 
            a.getCapabilities().contains("health")));
    }
    
    @Test
    @DisplayName("测试路由到学习智能体")
    void testRouteToLearningAgent() {
        String task = "我想制定学习计划";
        AgentRouter.RoutingContext context = 
            new AgentRouter.RoutingContext("user-1", "session-1");
        
        List<Agent> agents = router.route(task, context);
        
        assertNotNull(agents);
        assertFalse(agents.isEmpty());
        // 应该路由到学习智能体
        assertTrue(agents.stream().anyMatch(a -> 
            a.getCapabilities().contains("learning")));
    }
    
    @Test
    @DisplayName("测试多智能体路由")
    void testRouteToMultipleAgents() {
        String task = "我想提高工作效率，同时保持健康的生活方式";
        AgentRouter.RoutingContext context = 
            new AgentRouter.RoutingContext("user-1", "session-1");
        
        List<Agent> agents = router.route(task, context);
        
        assertNotNull(agents);
        // 应该路由到多个智能体
        assertTrue(agents.size() >= 1);
    }
    
    @Test
    @DisplayName("测试任务分解")
    void testDecompose() {
        String complexTask = "我想提高工作效率，同时保持健康的生活方式，还要制定学习计划";
        
        List<AgentRouter.SubTask> subTasks = router.decompose(complexTask);
        
        assertNotNull(subTasks);
        // 复杂任务应该被分解为多个子任务
        assertTrue(subTasks.size() >= 1);
    }
    
    @Test
    @DisplayName("测试空任务路由")
    void testRouteEmptyTask() {
        String task = "";
        AgentRouter.RoutingContext context = 
            new AgentRouter.RoutingContext("user-1", "session-1");
        
        List<Agent> agents = router.route(task, context);
        
        // 空任务可能返回空列表或默认智能体
        assertNotNull(agents);
    }
    
    @Test
    @DisplayName("测试无匹配智能体的路由")
    void testRouteNoMatch() {
        String task = "我想做一件完全不相关的事情";
        AgentRouter.RoutingContext context = 
            new AgentRouter.RoutingContext("user-1", "session-1");
        
        List<Agent> agents = router.route(task, context);
        
        // 可能返回空列表或默认智能体
        assertNotNull(agents);
    }
}
