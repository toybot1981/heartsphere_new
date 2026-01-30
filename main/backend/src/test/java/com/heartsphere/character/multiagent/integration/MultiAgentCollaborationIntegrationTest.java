package com.heartsphere.character.multiagent.integration;

import com.heartsphere.character.multiagent.LifeAssistantOrchestrator;
import com.heartsphere.character.multiagent.LifeAssistantRouter;
import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 多智能体协作集成测试
 */
@SpringBootTest
@ActiveProfiles("test")
class MultiAgentCollaborationIntegrationTest {

    @Autowired
    private AgentRegistry agentRegistry;

    @Autowired
    private CollaborationOrchestrator collaborationOrchestrator;

    @Autowired
    private LifeAssistantRouter router;

    private LifeAssistantOrchestrator lifeAssistantOrchestrator;

    @BeforeEach
    void setUp() {
        lifeAssistantOrchestrator = new LifeAssistantOrchestrator(
            collaborationOrchestrator,
            router
        );
    }

    @Test
    void testTimeManagementCollaboration() throws Exception {
        // 测试时间管理相关的协作
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(
                "我需要时间管理帮助，提高工作效率",
                "user-1",
                "session-1"
            );
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(10, TimeUnit.SECONDS);
        
        assertNotNull(result);
        // 验证结果不为空
    }

    @Test
    void testMultiDomainCollaboration() throws Exception {
        // 测试跨领域协作
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(
                "我想提高工作效率，同时保持健康的生活方式",
                "user-1",
                "session-1"
            );
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(10, TimeUnit.SECONDS);
        
        assertNotNull(result);
        // 验证多个智能体参与
    }

    @Test
    void testEmptyRequest() throws Exception {
        // 测试空请求
        CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
            lifeAssistantOrchestrator.collaborate(
                "",
                "user-1",
                "session-1"
            );
        
        CollaborationOrchestrator.CollaborationResult result = 
            future.get(5, TimeUnit.SECONDS);
        
        assertFalse(result.isSuccess());
    }
}
