package com.heartsphere.multiagent.protocol.a2a;

import java.util.concurrent.CompletableFuture;

/**
 * Agent-to-Agent 协议接口
 * 
 * 定义智能体间通信的标准接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AgentToAgentProtocol {
    
    /**
     * 发送消息
     * 
     * @param message 消息
     * @return 是否发送成功
     */
    boolean send(A2AMessage message);
    
    /**
     * 发送消息并等待响应
     * 
     * @param message 请求消息
     * @return 响应消息的 Future
     */
    CompletableFuture<A2AMessage> sendAndWait(A2AMessage message);
    
    /**
     * 注册消息处理器
     * 
     * @param agentId 智能体 ID
     * @param handler 消息处理器
     */
    void registerHandler(String agentId, MessageHandler handler);
    
    /**
     * 注销消息处理器
     * 
     * @param agentId 智能体 ID
     */
    void unregisterHandler(String agentId);
    
    /**
     * 消息处理器接口
     */
    @FunctionalInterface
    interface MessageHandler {
        /**
         * 处理消息
         * 
         * @param message 接收到的消息
         * @return 响应消息（如果是请求消息）
         */
        A2AMessage handle(A2AMessage message);
    }
}
