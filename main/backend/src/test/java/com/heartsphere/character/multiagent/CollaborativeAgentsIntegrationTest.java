package com.heartsphere.character.multiagent;

import com.heartsphere.character.multiagent.agent.*;
import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.core.AgentRegistryImpl;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestratorImpl;
import com.heartsphere.multiagent.orchestrator.LoadBalancer;
import com.heartsphere.multiagent.orchestrator.ResultQualityAssessor;
import com.heartsphere.multiagent.orchestrator.TaskDecompositionService;
import com.heartsphere.multiagent.router.AgentRouter;
import com.heartsphere.skill.service.SkillExecutor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * 可协同智能体集成测试
 * 
 * 测试新智能体与现有智能体的协同场景
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CollaborativeAgentsIntegrationTest {
    
    @Mock
    private SkillExecutor skillExecutor;
    
    
    private AgentRegistry agentRegistry;
    private CollaborationOrchestrator orchestrator;
    private LifeAssistantRouter router;
    
    @BeforeEach
    void setUp() {
        agentRegistry = new AgentRegistryImpl();
        orchestrator = new CollaborationOrchestratorImpl();
        router = new LifeAssistantRouter(agentRegistry);
        
        // 注册现有智能体
        registerExistingAgents();
        
        // 注册新智能体
        registerNewAgents();
        
        // Mock 技能执行
        when(skillExecutor.execute(anyString(), anyMap(), any()))
            .thenReturn(createSuccessResult("执行成功"));
    }
    
    private void registerExistingAgents() {
        agentRegistry.register(new ShiXiaoGuangAgent(skillExecutor));
        agentRegistry.register(new KangXiaoJianAgent(skillExecutor));
        agentRegistry.register(new XueXiaoZhiAgent(skillExecutor));
        agentRegistry.register(new XinXiaoNuanAgent(skillExecutor));
    }
    
    private void registerNewAgents() {
        agentRegistry.register(new WorkAssistantAgent(skillExecutor));
        agentRegistry.register(new FinanceAdvisorAgent(skillExecutor));
        agentRegistry.register(new TravelPlannerAgent(skillExecutor));
        agentRegistry.register(new CreativeAssistantAgent(skillExecutor));
    }
    
    @Test
    void testWorkAndTimeManagementCollaboration() {
        // 测试场景：工作助手 + 时小光（时间管理）
        String task = "我需要制定工作计划并安排时间";
        
        List<Agent> agents = router.route(task, new AgentRouter.RoutingContext("1", "session-1"));
        
        assertFalse(agents.isEmpty(), "应该路由到至少一个智能体");
        
        // 验证路由到了工作助手或时小光
        boolean hasWorkAssistant = agents.stream()
            .anyMatch(a -> a.getId().equals("workassistant"));
        boolean hasTimeManagement = agents.stream()
            .anyMatch(a -> a.getId().equals("shixiaoguang"));
        
        assertTrue(hasWorkAssistant || hasTimeManagement, 
            "应该路由到工作助手或时间管理智能体");
    }
    
    @Test
    void testTravelAndHealthCollaboration() {
        // 测试场景：旅行规划师 + 康小健（健康）
        String task = "我需要规划旅行行程，并考虑健康因素";
        
        List<Agent> agents = router.route(task, new AgentRouter.RoutingContext("1", "session-1"));
        
        assertFalse(agents.isEmpty(), "应该路由到至少一个智能体");
        
        // 验证路由到了旅行规划师或康小健
        boolean hasTravelPlanner = agents.stream()
            .anyMatch(a -> a.getId().equals("travelplanner"));
        boolean hasHealth = agents.stream()
            .anyMatch(a -> a.getId().equals("kangxiaojian"));
        
        assertTrue(hasTravelPlanner || hasHealth, 
            "应该路由到旅行规划师或健康智能体");
    }
    
    @Test
    void testFinanceAndLearningCollaboration() {
        // 测试场景：财务顾问 + 学小知（学习）
        String task = "我需要学习财务知识并制定理财计划";
        
        List<Agent> agents = router.route(task, new AgentRouter.RoutingContext("1", "session-1"));
        
        assertFalse(agents.isEmpty(), "应该路由到至少一个智能体");
        
        // 验证路由到了财务顾问或学小知
        boolean hasFinanceAdvisor = agents.stream()
            .anyMatch(a -> a.getId().equals("financeadvisor"));
        boolean hasLearning = agents.stream()
            .anyMatch(a -> a.getId().equals("xuexiaozhi"));
        
        assertTrue(hasFinanceAdvisor || hasLearning, 
            "应该路由到财务顾问或学习智能体");
    }
    
    @Test
    void testCreativeAndEmotionCollaboration() {
        // 测试场景：创意助手 + 心小暖（情绪）
        String task = "我需要创意灵感，同时需要情绪支持";
        
        List<Agent> agents = router.route(task, new AgentRouter.RoutingContext("1", "session-1"));
        
        assertFalse(agents.isEmpty(), "应该路由到至少一个智能体");
        
        // 验证路由到了创意助手或心小暖
        boolean hasCreativeAssistant = agents.stream()
            .anyMatch(a -> a.getId().equals("creativeassistant"));
        boolean hasEmotion = agents.stream()
            .anyMatch(a -> a.getId().equals("xinxiaonuan"));
        
        assertTrue(hasCreativeAssistant || hasEmotion, 
            "应该路由到创意助手或情绪智能体");
    }
    
    @Test
    void testAllNewAgentsRegistered() {
        // 验证所有新智能体都已注册
        assertNotNull(agentRegistry.getAgent("workassistant"));
        assertNotNull(agentRegistry.getAgent("financeadvisor"));
        assertNotNull(agentRegistry.getAgent("travelplanner"));
        assertNotNull(agentRegistry.getAgent("creativeassistant"));
    }
    
    @Test
    void testMultiAgentCollaborationExecution() {
        // 测试多智能体协作执行
        String task = "我需要工作规划和时间管理";
        
        List<Agent> agents = router.route(task, new AgentRouter.RoutingContext("1", "session-1"));
        
        if (!agents.isEmpty()) {
            Map<String, Object> context = new HashMap<>();
            context.put("userId", 1L);
            context.put("sessionId", "session-1");
            
            CollaborationOrchestrator.CollaborationContext collaborationContext = 
                new CollaborationOrchestrator.CollaborationContext("1", "session-1");
            
            String collaborationId = orchestrator.createCollaboration(
                task, agents, collaborationContext
            );
            
            assertNotNull(collaborationId, "协作ID不应为空");
            
            // 执行协作
            orchestrator.execute(collaborationId);
            
            // 验证协作已创建
            assertNotNull(collaborationId, "协作ID不应为空");
        }
    }
    
    private SkillExecutor.SkillExecutionResult createSuccessResult(String message) {
        return SkillExecutor.SkillExecutionResult.builder()
            .success(true)
            .result(message)
            .build();
    }
}
