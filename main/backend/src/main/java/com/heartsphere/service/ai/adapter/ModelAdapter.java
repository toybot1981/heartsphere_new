package com.heartsphere.service.ai.adapter;

import com.heartsphere.dto.ai.*;

import java.util.List;
import java.util.function.Consumer;

/**
 * 大模型适配器接口
 * 所有模型适配器必须实现此接口
 */
public interface ModelAdapter {
    
    /**
     * 获取适配器类型（提供商名称）
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
     */
    TextGenerationResponse generateText(TextGenerationRequest request);
    
    /**
     * 流式生成文本
     * @param request 请求
     * @param chunkHandler 每个chunk的回调，参数为生成的文本片段
     * @param completionHandler 完成回调，参数为完整的响应
     */
    void generateTextStream(TextGenerationRequest request, 
                           Consumer<String> chunkHandler,
                           Consumer<TextGenerationResponse> completionHandler);
    
    /**
     * 生成图片
     */
    ImageGenerationResponse generateImage(ImageGenerationRequest request);
    
    /**
     * 文本转语音
     */
    AudioResponse textToSpeech(AudioRequest request);
    
    /**
     * 语音转文本
     */
    AudioResponse speechToText(AudioRequest request);
    
    /**
     * 生成视频
     */
    VideoGenerationResponse generateVideo(VideoGenerationRequest request);
    
    /**
     * 获取支持的模型列表
     * @param capability 能力类型：text, image, audio, video
     * @return 支持的模型列表
     */
    List<String> getSupportedModels(String capability);
}

