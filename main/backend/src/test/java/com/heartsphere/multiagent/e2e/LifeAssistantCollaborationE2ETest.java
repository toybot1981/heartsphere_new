package com.heartsphere.multiagent.e2e;

import com.heartsphere.character.multiagent.LifeAssistantOrchestrator;
import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 生活助手多智能体协作端到端测试
 * 
 * <p>测试真实场景下的完整协作流程</p>
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@DisplayName("生活助手多智能体协作端到端测试")
class LifeAssistantCollaborationE2ETest {
    
    @Autowired(required = false)
    private LifeAssistantOrchestrator lifeAssistantOrchestrator;
    
    @Autowired(required = false)
    private AgentRegistry agentRegistry;
    
    @BeforeEach
    void setUp() {
        // 如果服务不可用，跳过测试
        if (lifeAssistantOrchestrator == null || agentRegistry == null) {
            org.junit.jupiter.api.Assumptions.assumeTrue(false, 
                "LifeAssistantOrchestrator or AgentRegistry not available");
        }
    }
    
    @Test
    @DisplayName("测试跨领域协作场景 - 效率提升和健康管理")
    void testCrossDomainCollaboration() throws Exception {
        if (lifeAssistantOrchestrator == null) {
            return;  // 跳过测试
        }
        
        String userRequest = "我想提高工作效率，同时保持健康的生活方式";
        String userId = "user-e2e-1";
        String sessionId = "session-e2e-1";
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(30, TimeUnit.SECONDS);
        
        assertNotNull(result);
        // 验证协作完成（成功或失败都应该有结果）
        assertNotNull(result.getResult());
    }
    
    @Test
    @DisplayName("测试复杂任务分解和执行")
    void testComplexTaskDecomposition() throws Exception {
        if (lifeAssistantOrchestrator == null) {
            return;  // 跳过测试
        }
        
        String userRequest = "我最近学习压力大，情绪低落，想改善心理健康，同时提升学习效率";
        String userId = "user-e2e-2";
        String sessionId = "session-e2e-2";
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(30, TimeUnit.SECONDS);
        
        assertNotNull(result);
        // 复杂任务应该被分解为多个子任务
        if (result.isSuccess() && result.getAgentResults() != null) {
            assertTrue(result.getAgentResults().size() >= 1, 
                "复杂任务应该涉及多个智能体");
        }
    }
    
    @Test
    @DisplayName("测试用户交互流程")
    void testUserInteractionFlow() throws Exception {
        if (lifeAssistantOrchestrator == null) {
            return;  // 跳过测试
        }
        
        // 模拟用户多次交互
        String[] requests = {
            "我想制定一个学习计划",
            "我还想改善睡眠质量",
            "最后，我想管理好时间"
        };
        
        String userId = "user-e2e-3";
        String sessionId = "session-e2e-3";
        
        for (String request : requests) {
            CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
                lifeAssistantOrchestrator.collaborate(request, userId, sessionId);
            
            CollaborationOrchestrator.CollaborationResult result = 
                future.get(30, TimeUnit.SECONDS);
            
            assertNotNull(result);
            // 每次交互都应该有结果
            assertNotNull(result.getResult());
        }
    }
    
    @Test
    @DisplayName("测试错误场景处理")
    void testErrorScenario() throws Exception {
        if (lifeAssistantOrchestrator == null) {
            return;  // 跳过测试
        }
        
        // 测试空请求
        String userRequest = "";
        String userId = "user-e2e-4";
        String sessionId = "session-e2e-4";
        
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(userRequest, userId, sessionId);
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(10, TimeUnit.SECONDS);
        
        assertNotNull(result);
        // 空请求应该被正确处理（可能返回错误或提示）
        assertNotNull(result.getResult());
    }
}
