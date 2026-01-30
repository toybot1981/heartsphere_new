package com.heartsphere.multiagent.performance;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.core.AgentRegistryImpl;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestratorImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 多智能体协作性能测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("多智能体协作性能测试")
class CollaborationPerformanceTest {
    
    private AgentRegistry agentRegistry;
    private CollaborationOrchestrator orchestrator;
    private List<Agent> testAgents;
    
    @BeforeEach
    void setUp() {
        agentRegistry = new AgentRegistryImpl();
        orchestrator = new CollaborationOrchestratorImpl();
        
        // 创建多个测试智能体
        testAgents = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Agent agent = createTestAgent("agent-" + i, Set.of("capability-" + (i % 3)));
            testAgents.add(agent);
            agentRegistry.register(agent);
        }
    }
    
    private Agent createTestAgent(String id, Set<String> capabilities) {
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
                // 模拟执行时间
                try {
                    Thread.sleep(10);  // 10ms 执行时间
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                return Agent.AgentResult.success("Result from " + id);
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
    @DisplayName("测试单智能体执行性能")
    void testSingleAgentPerformance() throws Exception {
        List<Agent> agents = Arrays.asList(testAgents.get(0));
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Single agent task", agents, context
        );
        
        long startTime = System.currentTimeMillis();
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute(collaborationId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        
        long executionTime = endTime - startTime;
        
        assertTrue(result.isSuccess());
        assertTrue(executionTime < 1000, "单智能体执行应该在1秒内完成，实际: " + executionTime + "ms");
        
        System.out.println("单智能体执行时间: " + executionTime + "ms");
    }
    
    @Test
    @DisplayName("测试多智能体顺序协作性能")
    void testSequentialCollaborationPerformance() throws Exception {
        List<Agent> agents = testAgents.subList(0, 5);  // 使用5个智能体
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Sequential task", agents, context
        );
        
        long startTime = System.currentTimeMillis();
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute(collaborationId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(10, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        
        long executionTime = endTime - startTime;
        
        assertTrue(result.isSuccess());
        // 顺序执行：5个智能体 * 10ms = 至少50ms，加上开销应该在200ms内
        assertTrue(executionTime < 500, 
            "顺序协作应该在500ms内完成，实际: " + executionTime + "ms");
        
        System.out.println("顺序协作执行时间: " + executionTime + "ms (5个智能体)");
    }
    
    @Test
    @DisplayName("测试多智能体并行协作性能")
    void testParallelCollaborationPerformance() throws Exception {
        List<Agent> agents = testAgents.subList(0, 5);  // 使用5个智能体
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
        context.setMode(CollaborationOrchestrator.WorkflowMode.PARALLEL);
        
        String collaborationId = orchestrator.createCollaboration(
            "Parallel task", agents, context
        );
        
        long startTime = System.currentTimeMillis();
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            orchestrator.execute(collaborationId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(10, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        
        long executionTime = endTime - startTime;
        
        assertTrue(result.isSuccess());
        // 并行执行：应该接近单个智能体的执行时间（10ms），加上开销应该在100ms内
        assertTrue(executionTime < 200, 
            "并行协作应该在200ms内完成，实际: " + executionTime + "ms");
        
        System.out.println("并行协作执行时间: " + executionTime + "ms (5个智能体)");
    }
    
    @Test
    @DisplayName("测试负载性能 - 并发协作请求")
    void testLoadPerformance() throws Exception {
        int concurrentRequests = 20;
        List<CompletableFuture<CollaborationOrchestrator.CollaborationResult>> futures = 
            new ArrayList<>();
        
        long startTime = System.currentTimeMillis();
        
        // 创建多个并发协作请求
        for (int i = 0; i < concurrentRequests; i++) {
            List<Agent> agents = Arrays.asList(testAgents.get(i % testAgents.size()));
            CollaborationOrchestrator.CollaborationContext context = 
                new CollaborationOrchestrator.CollaborationContext("user-" + i, "session-" + i);
            context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
            
            String collaborationId = orchestrator.createCollaboration(
                "Task " + i, agents, context
            );
            
            CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
                orchestrator.execute(collaborationId);
            futures.add(future);
        }
        
        // 等待所有请求完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get(30, TimeUnit.SECONDS);
        
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        
        // 验证所有请求都成功
        long successCount = futures.stream()
            .map(f -> {
                try {
                    return f.get(1, TimeUnit.SECONDS);
                } catch (Exception e) {
                    return null;
                }
            })
            .filter(r -> r != null && r.isSuccess())
            .count();
        
        assertEquals(concurrentRequests, successCount, 
            "所有并发请求应该成功");
        
        double avgTime = totalTime / (double) concurrentRequests;
        System.out.println(String.format(
            "负载测试: %d 个并发请求，总时间: %dms，平均: %.2fms/请求",
            concurrentRequests, totalTime, avgTime));
        
        // 平均每个请求应该在500ms内完成
        assertTrue(avgTime < 1000, 
            "平均请求时间应该在1秒内，实际: " + avgTime + "ms");
    }
    
    @Test
    @DisplayName("测试扩展性 - 智能体数量增长")
    void testScalability() throws Exception {
        int[] agentCounts = {1, 3, 5, 10};
        
        for (int count : agentCounts) {
            List<Agent> agents = testAgents.subList(0, Math.min(count, testAgents.size()));
            CollaborationOrchestrator.CollaborationContext context = 
                new CollaborationOrchestrator.CollaborationContext("user-1", "session-1");
            context.setMode(CollaborationOrchestrator.WorkflowMode.PARALLEL);
            
            String collaborationId = orchestrator.createCollaboration(
                "Scalability test", agents, context
            );
            
            long startTime = System.currentTimeMillis();
            CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
                orchestrator.execute(collaborationId);
            
            CollaborationOrchestrator.CollaborationResult result = 
                future.get(10, TimeUnit.SECONDS);
            long endTime = System.currentTimeMillis();
            
            long executionTime = endTime - startTime;
            
            assertTrue(result.isSuccess());
            System.out.println(String.format(
                "扩展性测试: %d 个智能体，执行时间: %dms",
                count, executionTime));
            
            // 并行执行时间不应该随智能体数量线性增长
            assertTrue(executionTime < 500, 
                String.format("%d 个智能体并行执行应该在500ms内，实际: %dms", 
                    count, executionTime));
        }
    }
}
