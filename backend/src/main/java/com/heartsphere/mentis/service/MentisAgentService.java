package com.heartsphere.mentis.service;

import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;

/**
 * Mentis 智能体核心服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MentisAgentService {
    
    /**
     * 处理用户消息，返回响应
     * 
     * @param userId 用户ID
     * @param request 聊天请求
     * @return 聊天响应
     */
    ChatResponseDTO processMessage(Long userId, ChatRequestDTO request);
    
    /**
     * 流式处理消息
     * 
     * @param userId 用户ID
     * @param request 聊天请求
     * @param handler 流式响应处理器
     */
    void processMessageStream(Long userId, ChatRequestDTO request, 
                              StreamResponseHandler handler);
    
    /**
     * 流式响应处理器接口
     */
    @FunctionalInterface
    interface StreamResponseHandler {
        /**
         * 处理流式响应块
         * @param response 部分响应数据
         */
        void handle(ChatResponseDTO response);
    }
}
