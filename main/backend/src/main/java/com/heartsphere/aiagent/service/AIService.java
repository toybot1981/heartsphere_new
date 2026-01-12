package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.entity.UserAIConfig;

/**
 * AI服务接口
 * 提供统一的AI服务调用接口
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
                           com.heartsphere.aiagent.util.StreamResponseHandler<TextGenerationResponse> handler);
    
    /**
     * 生成图片
     * @param userId 用户ID
     * @param request 图片生成请求
     * @return 图片生成响应
     */
    ImageGenerationResponse generateImage(Long userId, ImageGenerationRequest request);
    
    /**
     * 文本转语音
     * @param userId 用户ID
     * @param request 音频请求
     * @return 音频响应
     */
    AudioResponse textToSpeech(Long userId, AudioRequest request);
    
    /**
     * 语音转文本
     * @param userId 用户ID
     * @param request 音频请求
     * @return 音频响应
     */
    AudioResponse speechToText(Long userId, AudioRequest request);
    
    /**
     * 生成视频
     * @param userId 用户ID
     * @param request 视频生成请求
     * @return 视频生成响应
     */
    VideoGenerationResponse generateVideo(Long userId, VideoGenerationRequest request);
    
    /**
     * 获取用户AI配置
     * @param userId 用户ID
     * @return 用户AI配置
     */
    UserAIConfig getUserConfig(Long userId);
    
    /**
     * 更新用户AI配置
     * @param userId 用户ID
     * @param config 用户AI配置
     * @return 更新后的用户AI配置
     */
    UserAIConfig updateUserConfig(Long userId, UserAIConfig config);
}
