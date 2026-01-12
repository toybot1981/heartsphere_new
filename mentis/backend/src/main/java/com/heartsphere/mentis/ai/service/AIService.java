package com.heartsphere.mentis.ai.service;

import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.ai.util.StreamResponseHandler;

/**
 * AI服务接口
 * 临时实现，用于 mentis 后端编译
 * 后续应移到 shared 模块或使用独立的 AI 服务模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AIService {
    
    /**
     * 生成文本
     * @param userId 用户ID
     * @param request 文本生成请求
     * @return 文本生成响应
     */
    TextGenerationResponse generateText(Long userId, TextGenerationRequest request);
    
    /**
     * 流式生成文本
     * @param userId 用户ID
     * @param request 文本生成请求
     * @param handler 流式响应处理器
     */
    void generateTextStream(Long userId, TextGenerationRequest request, 
                           StreamResponseHandler<TextGenerationResponse> handler);
}
