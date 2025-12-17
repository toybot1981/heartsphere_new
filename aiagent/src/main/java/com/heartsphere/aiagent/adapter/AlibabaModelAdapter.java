package com.heartsphere.aiagent.adapter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.alibaba.cloud.ai.dashscope.image.DashScopeImageModel;
import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 阿里云通义千问模型适配器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AlibabaModelAdapter implements ModelAdapter {
    
    @Value("${spring.ai.dashscope.api-key:}")
    private String apiKey;
    
    private final DashScopeChatModel dashScopeChatModel;
    private final DashScopeImageModel dashScopeImageModel;
    private final MultimodalService multimodalService;
    
    @Override
    public String getProviderType() {
        return "alibaba";
    }
    
    @Override
    public boolean supportsTextGeneration() {
        return true;
    }
    
    @Override
    public boolean supportsImageGeneration() {
        return true;
    }
    
    @Override
    public boolean supportsAudio() {
        return true; // 通义千问支持语音
    }
    
    @Override
    public boolean supportsVideo() {
        return true; // 通义万相支持视频生成
    }
    
    @Override
    public ChatModel getChatModel(String modelName) {
        // 可以根据 modelName 返回不同的模型实例
        return dashScopeChatModel;
    }
    
    @Override
    public ChatResponse generateText(Prompt prompt) {
        return dashScopeChatModel.call(prompt);
    }
    
    @Override
    public ImageModel getImageModel(String modelName) {
        return dashScopeImageModel;
    }
    
    @Override
    public ImageResponse generateImage(ImagePrompt imagePrompt) {
        try {
            return dashScopeImageModel.call(imagePrompt);
        } catch (Exception e) {
            log.error("图片生成失败，使用备用方法", e);
            // 备用方法：使用 MultimodalService
            String prompt = imagePrompt.getInstructions().get(0).getText();
            return multimodalService.generateImage(prompt, null);
        }
    }
    
    @Override
    public byte[] textToSpeech(String text, Map<String, Object> options) {
        return multimodalService.textToSpeech(text, options);
    }
    
    @Override
    public String speechToText(byte[] audioData, Map<String, Object> options) {
        return multimodalService.speechToText(audioData, options);
    }
    
    @Override
    public String generateVideo(String prompt, Map<String, Object> options) {
        return multimodalService.generateVideo(prompt, options);
    }
}
