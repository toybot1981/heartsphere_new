package com.heartsphere.aiagent.tool;

import com.heartsphere.aiagent.adapter.MultimodalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.Base64;

/**
 * 语音合成工具
 * 支持多种音色和语言
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VoiceSynthesisTool implements Tool {
    
    private final MultimodalService multimodalService;
    
    // 预设音色列表
    private static final Map<String, String> VOICE_PRESETS = Map.of(
        "warm_female", "zhitian_emo",      // 温和女声
        "deep_male", "zhiyan",              // 深沉男声
        "energetic_female", "zhiqi",        // 有力女声
        "gentle_male", "zhijia",            // 温和男声
        "professional_female", "zhibei"     // 专业女声
    );
    
    @Override
    public String getName() {
        return "text_to_speech";
    }
    
    @Override
    public String getDescription() {
        return "文本转语音。参数：text(文本内容), voice(音色: warm_female/deep_male/energetic_female/gentle_male/professional_female), language(语言: zh/en,默认zh)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String text = parameters.getOrDefault("text", "").toString();
            String voicePreset = parameters.getOrDefault("voice", "warm_female").toString();
            String language = parameters.getOrDefault("language", "zh").toString();
            
            log.info("语音合成: textLength={}, voice={}, language={}", 
                text.length(), voicePreset, language);
            
            // 获取音色 ID
            String voiceId = VOICE_PRESETS.getOrDefault(voicePreset, "zhitian_emo");
            
            // 构建 TTS 选项
            Map<String, Object> options = new HashMap<>();
            options.put("voice", voiceId);
            options.put("language", language);
            
            // 调用 TTS 服务
            byte[] audioData = multimodalService.textToSpeech(text, options);
            
            if (audioData != null && audioData.length > 0) {
                // 将音频数据转换为 base64
                String audioBase64 = Base64.getEncoder().encodeToString(audioData);
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("audioBase64", audioBase64);
                result.put("audioFormat", "wav");
                result.put("text", text);
                result.put("voice", voicePreset);
                result.put("language", language);
                result.put("duration", estimateDuration(text.length()));
                
                return result;
            }
            
            return Map.of("success", false, "error", "语音合成失败");
        } catch (Exception e) {
            log.error("语音合成失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private int estimateDuration(int textLength) {
        // 粗略估算：中文约 3 字/秒，英文约 5 字/秒
        return (int) Math.ceil(textLength / 3.0);
    }
}








