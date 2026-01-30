package com.heartsphere.multiagent.protocol.a2a;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Agent 消息路由器
 * 
 * 负责消息的路由和分发
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class AgentMessageRouter implements AgentToAgentProtocol {
    
    private final Map<String, AgentToAgentProtocol.MessageHandler> handlers = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<A2AMessage>> pendingRequests = new ConcurrentHashMap<>();
    
    @Override
    public boolean send(A2AMessage message) {
        if (message == null) {
            log.warn("Cannot send null message");
            return false;
        }
        
        try {
            // 如果是响应消息，查找对应的等待者
            if (message.getType() == A2AMessage.MessageType.RESPONSE) {
                CompletableFuture<A2AMessage> future = pendingRequests.remove(message.getMessageId());
                if (future != null) {
                    future.complete(message);
                    return true;
                }
            }
            
            // 路由到目标智能体
            String targetAgentId = message.getToAgentId();
            if (targetAgentId == null) {
                // 广播消息
                handlers.values().forEach(handler -> {
                    try {
                        handler.handle(message);
                    } catch (Exception e) {
                        log.error("Error handling broadcast message: {}", e.getMessage(), e);
                    }
                });
                return true;
            }
            
            AgentToAgentProtocol.MessageHandler handler = handlers.get(targetAgentId);
            if (handler != null) {
                A2AMessage response = handler.handle(message);
                // 如果有响应且是请求消息，发送响应
                if (response != null && message.getType() == A2AMessage.MessageType.REQUEST) {
                    response.setToAgentId(message.getFromAgentId());
                    send(response);
                }
                return true;
            } else {
                log.warn("No handler found for agent: {}", targetAgentId);
                return false;
            }
        } catch (Exception e) {
            log.error("Error routing message: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public CompletableFuture<A2AMessage> sendAndWait(A2AMessage message) {
        CompletableFuture<A2AMessage> future = new CompletableFuture<>();
        
        // 如果是请求消息，注册等待响应
        if (message.getType() == A2AMessage.MessageType.REQUEST) {
            pendingRequests.put(message.getMessageId(), future);
            
            // 设置超时
            future.orTimeout(30, TimeUnit.SECONDS)
                .exceptionally(throwable -> {
                    pendingRequests.remove(message.getMessageId());
                    log.warn("Request timeout: {}", message.getMessageId());
                    return null;
                });
        }
        
        // 发送消息
        boolean sent = send(message);
        if (!sent) {
            pendingRequests.remove(message.getMessageId());
            future.completeExceptionally(new RuntimeException("Failed to send message"));
        }
        
        return future;
    }
    
    @Override
    public void registerHandler(String agentId, AgentToAgentProtocol.MessageHandler handler) {
        if (agentId == null || handler == null) {
            throw new IllegalArgumentException("Agent ID and handler cannot be null");
        }
        handlers.put(agentId, handler);
        log.info("Message handler registered for agent: {}", agentId);
    }
    
    @Override
    public void unregisterHandler(String agentId) {
        handlers.remove(agentId);
        log.info("Message handler unregistered for agent: {}", agentId);
    }
}
