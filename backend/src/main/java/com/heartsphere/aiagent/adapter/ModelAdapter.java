package com.heartsphere.aiagent.adapter;

import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.util.StreamResponseHandler;

import java.util.List;

/**
 * 大模型适配器接口
 * 统一不同提供商的模型调用接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ModelAdapter {
    
    /**
     * 获取适配器类型（提供商名称）
     * @return 提供商名称，如：dashscope, gemini, openai
     */
    String getProviderType();
    
    /**
     * 是否支持文本生成
     */
    boolean supportsTextGeneration();
    
    /**
     * 是否支持图片生成
     */
    boolean supportsImageGeneration();
    
    /**
     * 是否支持文本转语音
     */
    boolean supportsTextToSpeech();
    
    /**
     * 是否支持语音转文本
     */
    boolean supportsSpeechToText();
    
    /**
     * 是否支持视频生成
     */
    boolean supportsVideoGeneration();
    
    /**
     * 生成文本
     * @param request 文本生成请求
     * @return 文本生成响应
     */
    TextGenerationResponse generateText(TextGenerationRequest request);
    
    /**
     * 流式生成文本
     * @param request 文本生成请求
     * @param handler 流式响应处理器
     */
    void generateTextStream(TextGenerationRequest request, 
                           StreamResponseHandler<TextGenerationResponse> handler);
    
    /**
     * 生成图片
     * @param request 图片生成请求
     * @return 图片生成响应
     */
    ImageGenerationResponse generateImage(ImageGenerationRequest request);
    
    /**
     * 文本转语音
     * @param request 音频请求
     * @return 音频响应
     */
    AudioResponse textToSpeech(AudioRequest request);
    
    /**
     * 语音转文本
     * @param request 音频请求
     * @return 音频响应
     */
    AudioResponse speechToText(AudioRequest request);
    
    /**
     * 生成视频
     * @param request 视频生成请求
     * @return 视频生成响应
     */
    VideoGenerationResponse generateVideo(VideoGenerationRequest request);
    
    /**
     * 获取支持的模型列表
     * @param capability 能力类型：text, image, audio, video
     * @return 支持的模型列表
     */
    List<String> getSupportedModels(String capability);
}
