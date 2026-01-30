package com.heartsphere.character.multiagent;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import com.heartsphere.multiagent.router.AgentRouter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 生活助手编排服务
 * 
 * 使用基础设施的编排引擎，配置生活助手特定的协作策略
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LifeAssistantOrchestrator {
    
    private final CollaborationOrchestrator collaborationOrchestrator;
    private final LifeAssistantRouter router;
    
    /**
     * 启动生活助手协作
     * 
     * @param userRequest 用户请求
     * @param userId 用户 ID
     * @param sessionId 会话 ID
     * @return 协作结果的 Future
     */
    public CompletableFuture<CollaborationOrchestrator.CollaborationResult> collaborate(
            String userRequest, String userId, String sessionId) {
        
        log.info("Starting life assistant collaboration: request={}, userId={}", 
            userRequest, userId);
        
        // 路由到合适的智能体
        AgentRouter.RoutingContext routingContext = 
            new AgentRouter.RoutingContext(userId, sessionId);
        List<Agent> agents = router.route(userRequest, routingContext);
        
        if (agents.isEmpty()) {
            log.warn("No agents found for request: {}", userRequest);
            CompletableFuture<CollaborationOrchestrator.CollaborationResult> future = 
                new CompletableFuture<>();
            CollaborationOrchestrator.CollaborationResult result = 
                new CollaborationOrchestrator.CollaborationResult();
            result.setSuccess(false);
            result.setResult("未找到合适的助手来处理您的请求");
            future.complete(result);
            return future;
        }
        
        // 创建协作上下文
        CollaborationOrchestrator.CollaborationContext context = 
            new CollaborationOrchestrator.CollaborationContext(userId, sessionId);
        
        // 根据智能体数量选择协作模式
        if (agents.size() == 1) {
            context.setMode(CollaborationOrchestrator.WorkflowMode.SEQUENTIAL);
        } else {
            // 多个智能体时，使用并行模式以提高效率
            context.setMode(CollaborationOrchestrator.WorkflowMode.PARALLEL);
        }
        
        // 创建并执行协作
        String collaborationId = collaborationOrchestrator.createCollaboration(
            userRequest, agents, context
        );
        
        return collaborationOrchestrator.execute(collaborationId);
    }
    
    /**
     * 获取协作状态
     */
    public CollaborationOrchestrator.CollaborationStatus getStatus(String collaborationId) {
        return collaborationOrchestrator.getStatus(collaborationId);
    }
    
    /**
     * 取消协作
     */
    public void cancel(String collaborationId) {
        collaborationOrchestrator.cancel(collaborationId);
    }
}
