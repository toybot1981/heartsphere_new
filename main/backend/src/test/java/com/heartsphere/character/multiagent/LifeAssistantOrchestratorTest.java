package com.heartsphere.character.multiagent;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.Agent.AgentResult;
import com.heartsphere.multiagent.core.Agent.AgentStatus;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.core.AgentRegistryImpl;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import com.heartsphere.multiagent.router.AgentRouter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * LifeAssistantOrchestrator 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("LifeAssistantOrchestrator 单元测试")
class LifeAssistantOrchestratorTest {
    
    private LifeAssistantOrchestrator orchestrator;
    private AgentRegistry agentRegistry;
    private Agent testAgent1;
    private Agent testAgent2;
    
    @Mock
    private CollaborationOrchestrator collaborationOrchestrator;
    
    @Mock
    private LifeAssistantRouter router;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        agentRegistry = new AgentRegistryImpl();
        
        // 创建测试智能体
        testAgent1 = createTestAgent("agent-1", "时小光", Set.of("time-management"));
        testAgent2 = createTestAgent("agent-2", "康小健", Set.of("health"));
        
        agentRegistry.register(testAgent1);
        agentRegistry.register(testAgent2);
        
        // 创建 LifeAssistantOrchestrator
        orchestrator = new LifeAssistantOrchestrator(collaborationOrchestrator, router);
    }
    
    private Agent createTestAgent(String id, String name, Set<String> capabilities) {
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
                return "Test agent: " + name;
            }
            
            @Override
            public Set<String> getCapabilities() {
                return capabilities;
            }
            
            @Override
            public AgentResult execute(String task, Map<String, Object> context) {
                return Agent.AgentResult.success("Result from " + name);
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
    @DisplayName("测试协作请求 - 单智能体")
    void testCollaborateSingleAgent() throws Exception {
        String userRequest = "我想提高工作效率";
        String userId = "user-1";
        String sessionId = "session-1";
        
        // Mock 路由器的响应
        when(router.route(anyString(), any(AgentRouter.RoutingContext.class)))
            .thenReturn(Arrays.asList(testAgent1));
        
        // Mock 协作编排器的响应
        CollaborationOrchestrator.CollaborationResult mockResult = 
            new CollaborationOrchestrator.CollaborationResult();
        mockResult.setSuccess(true);
        mockResult.setResult("协作完成");
        mockResult.setCollaborationId("collab-1");
        
        when(collaborationOrchestrator.createCollaboration(
            anyString(), anyList(), any(CollaborationOrchestrator.CollaborationContext.class)
        )).thenReturn("collab-1");
        
        when(collaborationOrchestrator.execute("collab-1"))
            .thenReturn(CompletableFuture.completedFuture(mockResult));
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        assertTrue(result.isSuccess());
        
        // 验证路由器被调用
        verify(router, atLeastOnce()).route(
            anyString(), any(AgentRouter.RoutingContext.class)
        );
        
        // 验证协作编排器被调用
        verify(collaborationOrchestrator, atLeastOnce()).createCollaboration(
            anyString(), anyList(), any(CollaborationOrchestrator.CollaborationContext.class)
        );
    }
    
    @Test
    @DisplayName("测试协作请求 - 多智能体")
    void testCollaborateMultipleAgents() throws Exception {
        String userRequest = "我想提高工作效率，同时保持健康的生活方式";
        String userId = "user-1";
        String sessionId = "session-1";
        
        // Mock 路由器的响应
        when(router.route(anyString(), any(AgentRouter.RoutingContext.class)))
            .thenReturn(Arrays.asList(testAgent1, testAgent2));
        
        // Mock 协作编排器的响应
        CollaborationOrchestrator.CollaborationResult mockResult = 
            new CollaborationOrchestrator.CollaborationResult();
        mockResult.setSuccess(true);
        mockResult.setResult("多智能体协作完成");
        mockResult.setCollaborationId("collab-2");
        
        Map<String, Object> agentResults = new HashMap<>();
        agentResults.put("agent-1", "时间管理建议");
        agentResults.put("agent-2", "健康建议");
        mockResult.setAgentResults(agentResults);
        
        when(collaborationOrchestrator.createCollaboration(
            anyString(), anyList(), any(CollaborationOrchestrator.CollaborationContext.class)
        )).thenReturn("collab-2");
        
        when(collaborationOrchestrator.execute("collab-2"))
            .thenReturn(CompletableFuture.completedFuture(mockResult));
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getAgentResults());
        assertTrue(result.getAgentResults().size() >= 1);
    }
    
    @Test
    @DisplayName("测试空请求处理")
    void testCollaborateEmptyRequest() throws Exception {
        String userRequest = "";
        String userId = "user-1";
        String sessionId = "session-1";
        
        // Mock 路由器返回空列表
        when(router.route(anyString(), any(AgentRouter.RoutingContext.class)))
            .thenReturn(Collections.emptyList());
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        // 空请求应该返回失败或提示信息
        assertFalse(result.isSuccess());
        assertNotNull(result.getResult());
    }
    
    @Test
    @DisplayName("测试协作失败处理")
    void testCollaborateFailure() throws Exception {
        String userRequest = "测试请求";
        String userId = "user-1";
        String sessionId = "session-1";
        
        // Mock 路由器的响应
        when(router.route(anyString(), any(AgentRouter.RoutingContext.class)))
            .thenReturn(Arrays.asList(testAgent1));
        
        // Mock 协作编排器的失败响应
        CollaborationOrchestrator.CollaborationResult mockResult = 
            new CollaborationOrchestrator.CollaborationResult();
        mockResult.setSuccess(false);
        mockResult.setResult("协作失败");
        mockResult.setErrors(Arrays.asList("错误1", "错误2"));
        
        when(collaborationOrchestrator.createCollaboration(
            anyString(), anyList(), any(CollaborationOrchestrator.CollaborationContext.class)
        )).thenReturn("collab-fail");
        
        when(collaborationOrchestrator.execute("collab-fail"))
            .thenReturn(CompletableFuture.completedFuture(mockResult));
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrors());
        assertFalse(result.getErrors().isEmpty());
    }
    
    @Test
    @DisplayName("测试上下文传递")
    void testContextPassing() throws Exception {
        String userRequest = "我想提高工作效率";
        String userId = "user-1";
        String sessionId = "session-1";
        
        // Mock 路由器的响应
        when(router.route(anyString(), any(AgentRouter.RoutingContext.class)))
            .thenReturn(Arrays.asList(testAgent1));
        
        // Mock 协作编排器的响应
        CollaborationOrchestrator.CollaborationResult mockResult = 
            new CollaborationOrchestrator.CollaborationResult();
        mockResult.setSuccess(true);
        mockResult.setResult("协作完成");
        
        when(collaborationOrchestrator.createCollaboration(
            anyString(), anyList(), any(CollaborationOrchestrator.CollaborationContext.class)
        )).thenAnswer(invocation -> {
            CollaborationOrchestrator.CollaborationContext context = 
                invocation.getArgument(2);
            // 验证上下文包含用户ID和会话ID
            assertEquals(userId, context.getUserId());
            assertEquals(sessionId, context.getSessionId());
            return "collab-context";
        });
        
        when(collaborationOrchestrator.execute("collab-context"))
            .thenReturn(CompletableFuture.completedFuture(mockResult));
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }
}
