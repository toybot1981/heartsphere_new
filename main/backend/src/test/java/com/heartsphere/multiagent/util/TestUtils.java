package com.heartsphere.multiagent.util;

import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 测试工具类
 * 
 * <p>提供测试中常用的工具方法</p>
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class TestUtils {
    
    /**
     * 等待协作完成并返回结果
     */
    public static CollaborationOrchestrator.CollaborationResult waitForCollaboration(
            CompletableFuture<CollaborationOrchestrator.CollaborationResult> future,
            long timeoutSeconds) throws Exception {
        return future.get(timeoutSeconds, TimeUnit.SECONDS);
    }
    
    /**
     * 创建测试用的协作上下文
     */
    public static CollaborationOrchestrator.CollaborationContext createTestContext(
            String userId, String sessionId, 
            CollaborationOrchestrator.WorkflowMode mode) {
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext(userId, sessionId);
        context.setMode(mode);
        return context;
    }
    
    /**
     * 验证协作结果
     */
    public static void assertCollaborationSuccess(
            CollaborationOrchestrator.CollaborationResult result) {
        assertNotNull(result, "协作结果不应为 null");
        assertTrue(result.isSuccess(), "协作应该成功");
        assertNotNull(result.getResult(), "协作结果不应为空");
    }
    
    /**
     * 验证协作结果包含指定智能体的结果
     */
    public static void assertAgentResultExists(
            CollaborationOrchestrator.CollaborationResult result, String agentId) {
        assertNotNull(result.getAgentResults(), "智能体结果映射不应为 null");
        assertTrue(result.getAgentResults().containsKey(agentId), 
            "应该包含智能体 " + agentId + " 的结果");
    }
    
    /**
     * 生成测试用的用户ID
     */
    public static String generateUserId() {
        return "test-user-" + System.currentTimeMillis();
    }
    
    /**
     * 生成测试用的会话ID
     */
    public static String generateSessionId() {
        return "test-session-" + System.currentTimeMillis();
    }
    
    /**
     * 等待指定时间（用于测试异步操作）
     */
    public static void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
