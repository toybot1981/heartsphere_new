package com.heartsphere.multiagent.orchestrator;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
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
 * CollaborationOrchestrator 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("CollaborationOrchestrator 单元测试")
class CollaborationOrchestratorImplTest {
    
    private CollaborationOrchestratorImpl orchestrator;
    
    @Mock
    private Agent mockAgent1;
    
    @Mock
    private Agent mockAgent2;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        orchestrator = new CollaborationOrchestratorImpl();
        
        // 设置 Mock Agent
        when(mockAgent1.getId()).thenReturn("agent-1");
        when(mockAgent1.getName()).thenReturn("Agent 1");
        when(mockAgent1.getCapabilities()).thenReturn(Set.of("capability-1"));
        when(mockAgent1.execute(anyString(), anyMap())).thenReturn(
            Agent.AgentResult.success("Result from agent-1")
        );
        
        when(mockAgent2.getId()).thenReturn("agent-2");
        when(mockAgent2.getName()).thenReturn("Agent 2");
        when(mockAgent2.getCapabilities()).thenReturn(Set.of("capability-2"));
        when(mockAgent2.execute(anyString(), anyMap())).thenReturn(
            Agent.AgentResult.success("Result from agent-2")
        );
    }
    
    @Test
    @DisplayName("测试创建协作任务")
    void testCreateCollaboration() {
        List<Agent> agents = Arrays.asList(mockAgent1, mockAgent2);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        assertNotNull(collaborationId);
        assertFalse(collaborationId.isEmpty());
        
        // 验证状态
        CollaborationOrchestrator.CollaborationStatus status = 
            orchestrator.getStatus(collaborationId);
        assertEquals(CollaborationOrchestrator.CollaborationStatus.PENDING, status);
    }
    
    @Test
    @DisplayName("测试创建协作任务时参数验证")
    void testCreateCollaborationValidation() {
        List<Agent> agents = Arrays.asList(mockAgent1);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        
        // 测试 null 任务描述
        assertThrows(IllegalArgumentException.class, () -> {
            orchestrator.createCollaboration(null, agents, context);
        });
        
        // 测试空智能体列表
        assertThrows(IllegalArgumentException.class, () -> {
            orchestrator.createCollaboration("Task", Collections.emptyList(), context);
        });
    }
    
    @Test
    @DisplayName("测试顺序执行协作")
    void testSequentialExecution() throws Exception {
        List<Agent> agents = Arrays.asList(mockAgent1, mockAgent2);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute(collaborationId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertTrue(result.isSuccess());
        assertNotNull(result.getResult());
        assertEquals(2, result.getAgentResults().size());
        assertTrue(result.getAgentResults().containsKey("agent-1"));
        assertTrue(result.getAgentResults().containsKey("agent-2"));
        
        // 验证智能体被调用
        verify(mockAgent1, times(1)).execute(anyString(), anyMap());
        verify(mockAgent2, times(1)).execute(anyString(), anyMap());
    }
    
    @Test
    @DisplayName("测试并行执行协作")
    void testParallelExecution() throws Exception {
        List<Agent> agents = Arrays.asList(mockAgent1, mockAgent2);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.PARALLEL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute(collaborationId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertTrue(result.isSuccess());
        assertEquals(2, result.getAgentResults().size());
    }
    
    @Test
    @DisplayName("测试获取协作状态")
    void testGetStatus() {
        List<Agent> agents = Arrays.asList(mockAgent1);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        // 初始状态应该是 PENDING
        CollaborationOrchestrator.CollaborationStatus status = 
            orchestrator.getStatus(collaborationId);
        assertEquals(CollaborationOrchestrator.CollaborationStatus.PENDING, status);
        
        // 执行后状态应该是 COMPLETED
        orchestrator.execute(collaborationId);
        try {
            Thread.sleep(100);  // 等待执行完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        status = orchestrator.getStatus(collaborationId);
        assertTrue(status == CollaborationOrchestrator.CollaborationStatus.COMPLETED ||
                   status == CollaborationOrchestrator.CollaborationStatus.RUNNING);
    }
    
    @Test
    @DisplayName("测试取消协作")
    void testCancel() {
        List<Agent> agents = Arrays.asList(mockAgent1);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        orchestrator.cancel(collaborationId);
        
        CollaborationOrchestrator.CollaborationStatus status = 
            orchestrator.getStatus(collaborationId);
        assertEquals(CollaborationOrchestrator.CollaborationStatus.CANCELLED, status);
    }
    
    @Test
    @DisplayName("测试执行不存在的协作")
    void testExecuteNonExistent() {
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute("non-existent-id");
        
        assertThrows(Exception.class, () -> {
            future.get(1, TimeUnit.SECONDS);
        });
    }
    
    @Test
    @DisplayName("测试智能体执行失败处理")
    void testAgentExecutionFailure() throws Exception {
        // 设置智能体执行失败
        when(mockAgent1.execute(anyString(), anyMap())).thenReturn(
            Agent.AgentResult.failure("Execution failed")
        );
        
        List<Agent> agents = Arrays.asList(mockAgent1);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute(collaborationId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        // 即使智能体失败，协作也应该完成（但标记为失败）
        assertNotNull(result);
        assertFalse(result.getErrors().isEmpty());
    }
}
