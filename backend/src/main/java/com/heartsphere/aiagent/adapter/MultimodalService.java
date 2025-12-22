package com.heartsphere.aiagent.adapter;

import com.alibaba.cloud.ai.dashscope.image.DashScopeImageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * 多模态服务
 * 提供图片、语音、视频生成和处理功能
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MultimodalService {
    
    @Value("${spring.ai.dashscope.api-key:}")
    private String apiKey;
    
    private final DashScopeImageModel dashScopeImageModel;
    private final RestTemplate restTemplate;
    
    private static final String DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/api/v1";
    
    /**
     * 生成图片
     */
    public ImageResponse generateImage(String prompt, Map<String, Object> options) {
        try {
            ImagePrompt imagePrompt = new ImagePrompt(prompt);
            return dashScopeImageModel.call(imagePrompt);
        } catch (Exception e) {
            log.error("图片生成失败", e);
            throw new RuntimeException("图片生成失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 文本转语音（TTS）
     */
    public byte[] textToSpeech(String text, Map<String, Object> options) {
        try {
            String model = options != null && options.containsKey("model") 
                ? options.get("model").toString() 
                : "sambert-zhichu-v1";
            
            String voice = options != null && options.containsKey("voice")
                ? options.get("voice").toString()
                : "zhitian_emo";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("input", Map.of("text", text));
            requestBody.put("parameters", Map.of(
                "voice", voice,
                "format", "wav",
                "sample_rate", 16000
            ));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                DASHSCOPE_BASE_URL + "/services/audio/tts/generation",
                request,
                Map.class
            );
            
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body.containsKey("output")) {
                    Map<String, Object> output = (Map<String, Object>) body.get("output");
                    if (output.containsKey("audio")) {
                        String audioBase64 = output.get("audio").toString();
                        return Base64.getDecoder().decode(audioBase64);
                    }
                }
            }
            
            log.warn("TTS 响应格式异常，返回空数据");
            return new byte[0];
        } catch (Exception e) {
            log.error("文本转语音失败", e);
            throw new RuntimeException("文本转语音失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 语音转文本（STT）
     */
    public String speechToText(byte[] audioData, Map<String, Object> options) {
        try {
            // TODO: 实现文件上传和语音识别
            log.warn("语音转文本功能需要实现文件上传");
            return "";
        } catch (Exception e) {
            log.error("语音转文本失败", e);
            throw new RuntimeException("语音转文本失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 生成视频
     */
    public String generateVideo(String prompt, Map<String, Object> options) {
        try {
            String model = options != null && options.containsKey("model")
                ? options.get("model").toString()
                : "wanx-v1.1-video";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("input", Map.of("text_prompt", prompt));
            
            if (options != null) {
                Map<String, Object> parameters = new HashMap<>();
                if (options.containsKey("duration")) {
                    parameters.put("duration", options.get("duration"));
                }
                if (options.containsKey("resolution")) {
                    parameters.put("resolution", options.get("resolution"));
                }
                requestBody.put("parameters", parameters);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                DASHSCOPE_BASE_URL + "/services/video/generation",
                request,
                Map.class
            );
            
            Map<String, Object> result = response.getBody();
            if (result != null) {
                if (result.containsKey("output")) {
                    Object outputObj = result.get("output");
                    if (outputObj instanceof Map) {
                        Map<String, Object> output = (Map<String, Object>) outputObj;
                        if (output.containsKey("video_url")) {
                            return output.get("video_url").toString();
                        }
                        if (output.containsKey("task_id")) {
                            String taskId = output.get("task_id").toString();
                            log.info("视频生成任务已提交，task_id: {}", taskId);
                            return "task_id:" + taskId;
                        }
                    }
                }
                if (result.containsKey("code")) {
                    String errorMsg = result.get("message") != null 
                        ? result.get("message").toString() 
                        : "视频生成失败";
                    log.error("视频生成失败: {}", errorMsg);
                    throw new RuntimeException(errorMsg);
                }
            }
            
            log.warn("视频生成响应格式异常: {}", result);
            return "";
        } catch (Exception e) {
            log.error("视频生成失败", e);
            throw new RuntimeException("视频生成失败: " + e.getMessage(), e);
        }
    }
}


