package com.heartsphere.aiagent.adapter;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;

import java.util.Map;

/**
 * 大模型适配器接口
 * 统一不同提供商的模型调用接口
 */
public interface ModelAdapter {
    
    /**
     * 获取适配器类型
     */
    String getProviderType();
    
    /**
     * 是否支持文字生成
     */
    boolean supportsTextGeneration();
    
    /**
     * 是否支持图片生成
     */
    boolean supportsImageGeneration();
    
    /**
     * 是否支持语音处理
     */
    boolean supportsAudio();
    
    /**
     * 是否支持视频生成
     */
    boolean supportsVideo();
    
    /**
     * 获取文字模型
     */
    ChatModel getChatModel(String modelName);
    
    /**
     * 生成文字
     */
    ChatResponse generateText(Prompt prompt);
    
    /**
     * 获取图片模型
     */
    ImageModel getImageModel(String modelName);
    
    /**
     * 生成图片
     */
    ImageResponse generateImage(ImagePrompt imagePrompt);
    
    /**
     * 生成语音（文本转语音）
     */
    byte[] textToSpeech(String text, Map<String, Object> options);
    
    /**
     * 语音转文字
     */
    String speechToText(byte[] audioData, Map<String, Object> options);
    
    /**
     * 生成视频
     */
    String generateVideo(String prompt, Map<String, Object> options);
}

