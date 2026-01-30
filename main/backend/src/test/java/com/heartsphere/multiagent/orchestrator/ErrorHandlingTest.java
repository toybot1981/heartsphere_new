package com.heartsphere.multiagent.orchestrator;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.Agent.AgentResult;
import com.heartsphere.multiagent.core.Agent.AgentStatus;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.core.AgentRegistryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 异常处理和错误恢复测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("异常处理和错误恢复测试")
class ErrorHandlingTest {
    
    private CollaborationOrchestratorImpl orchestrator;
    private AgentRegistry agentRegistry;
    private Agent failingAgent;
    private Agent normalAgent;
    
    @BeforeEach
    void setUp() {
        agentRegistry = new AgentRegistryImpl();
        orchestrator = new CollaborationOrchestratorImpl();
        
        // 创建会失败的智能体
        failingAgent = createFailingAgent("failing-agent", "Failing Agent", 
            Set.of("test-capability"), "模拟执行失败");
        
        // 创建正常智能体
        normalAgent = createNormalAgent("normal-agent", "Normal Agent", 
            Set.of("test-capability"));
        
        agentRegistry.register(failingAgent);
        agentRegistry.register(normalAgent);
    }
    
    private Agent createFailingAgent(String id, String name, Set<String> capabilities, 
                                    String errorMessage) {
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
                return "Test agent that fails";
            }
            
            @Override
            public Set<String> getCapabilities() {
                return capabilities;
            }
            
            @Override
            public AgentResult execute(String task, Map<String, Object> context) {
                return AgentResult.failure(errorMessage);
            }
            
            @Override
            public boolean canHandle(String task) {
                return true;
            }
            
            @Override
            public AgentStatus getStatus() {
                return AgentStatus.ERROR;
            }
        };
    }
    
    private Agent createNormalAgent(String id, String name, Set<String> capabilities) {
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
                return AgentResult.success("Success result");
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
    @DisplayName("测试智能体执行失败处理")
    void testAgentExecutionFailure() throws Exception {
        List<Agent> agents = Arrays.asList(failingAgent);
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
        
        assertNotNull(result);
        // 即使智能体失败，协作也应该完成（但标记为失败）
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrors());
        assertFalse(result.getErrors().isEmpty());
    }
    
    @Test
    @DisplayName("测试部分智能体失败的处理")
    void testPartialAgentFailure() throws Exception {
        List<Agent> agents = Arrays.asList(normalAgent, failingAgent);
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
        
        assertNotNull(result);
        // 部分失败时，应该包含成功和失败的结果
        assertNotNull(result.getAgentResults());
        assertNotNull(result.getErrors());
    }
    
    @Test
    @DisplayName("测试空智能体列表处理")
    void testEmptyAgentList() {
        List<Agent> agents = Collections.emptyList();
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        
        assertThrows(IllegalArgumentException.class, () -> {
            orchestrator.createCollaboration("Test task", agents, context);
        });
    }
    
    @Test
    @DisplayName("测试空任务描述处理")
    void testEmptyTaskDescription() {
        List<Agent> agents = Arrays.asList(normalAgent);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        
        // 空任务描述可能被接受（取决于实现），这里验证不会崩溃
        String collaborationId = orchestrator.createCollaboration("", agents, context);
        
        // 验证协作ID不为空（如果创建成功）
        assertNotNull(collaborationId);
        // 注意：实际实现可能接受空任务描述，这是可以接受的
    }
    
    @Test
    @DisplayName("测试取消协作")
    void testCancelCollaboration() {
        List<Agent> agents = Arrays.asList(normalAgent);
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        
        String collaborationId = orchestrator.createCollaboration(
            "Test task", agents, context
        );
        
        // 取消协作
        orchestrator.cancel(collaborationId);
        
        // 验证状态
        CollaborationOrchestrator.CollaborationStatus status = 
            orchestrator.getStatus(collaborationId);
        assertEquals(CollaborationOrchestrator.CollaborationStatus.CANCELLED, status);
    }
    
    @Test
    @DisplayName("测试获取不存在的协作状态")
    void testGetNonExistentCollaborationStatus() {
        CollaborationOrchestrator.CollaborationStatus status = 
            orchestrator.getStatus("non-existent-id");
        
        assertNull(status);
    }
    
    @Test
    @DisplayName("测试执行不存在的协作")
    void testExecuteNonExistentCollaboration() {
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute("non-existent-id");
        
        assertThrows(Exception.class, () -> {
            future.get(1, TimeUnit.SECONDS);
        });
    }
    
    @Test
    @DisplayName("测试错误恢复 - 从错误状态恢复")
    void testErrorRecovery() throws Exception {
        // 创建一个会抛出异常的智能体
        Agent exceptionAgent = new Agent() {
            @Override
            public String getId() {
                return "exception-agent";
            }
            
            @Override
            public String getName() {
                return "Exception Agent";
            }
            
            @Override
            public String getDescription() {
                return "Test agent";
            }
            
            @Override
            public Set<String> getCapabilities() {
                return Set.of("test");
            }
            
            @Override
            public AgentResult execute(String task, Map<String, Object> context) {
                throw new RuntimeException("模拟异常");
            }
            
            @Override
            public boolean canHandle(String task) {
                return true;
            }
            
            @Override
            public AgentStatus getStatus() {
                return AgentStatus.ERROR;
            }
        };
        
        List<Agent> agents = Arrays.asList(exceptionAgent);
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
        
        assertNotNull(result);
        // 异常应该被捕获并记录在错误列表中
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrors());
    }
}
