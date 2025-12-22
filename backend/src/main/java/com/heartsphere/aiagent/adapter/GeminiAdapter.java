package com.heartsphere.aiagent.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.exception.AIServiceException;
import com.heartsphere.aiagent.util.StreamResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Google Gemini 适配器实现
 * 通过 HTTP 调用 Google Gemini API
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiAdapter implements ModelAdapter {
    
    @Value("${spring.ai.gemini.api-key:}")
    private String defaultApiKey;
    
    @Value("${spring.ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // 支持的文本模型
    private static final List<String> TEXT_MODELS = Arrays.asList(
        "gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"
    );
    
    // 支持的图片模型
    private static final List<String> IMAGE_MODELS = Arrays.asList(
        "imagen-3.0-generate-001"
    );
    
    @Override
    public String getProviderType() {
        return "gemini";
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
    public boolean supportsTextToSpeech() {
        return false; // Gemini 暂不支持 TTS
    }
    
    @Override
    public boolean supportsSpeechToText() {
        return false; // Gemini 暂不支持 STT
    }
    
    @Override
    public boolean supportsVideoGeneration() {
        return true; // 支持 Veo 模型
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            log.debug("Gemini文本生成请求: model={}, prompt={}", request.getModel(), request.getPrompt());
            
            // 获取 API key（优先从请求中获取，否则使用默认配置）
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("Gemini API key 未配置");
            }
            
            String model = request.getModel() != null ? request.getModel() : "gemini-2.0-flash-exp";
            String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, model, apiKey);
            
            // 构建请求体
            Map<String, Object> requestBody = buildGeminiRequest(request);
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("Gemini API 调用失败: " + response.getStatusCode());
            }
            
            // 解析响应
            return parseGeminiResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("Gemini文本生成失败", e);
            throw new AIServiceException("Gemini文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void generateTextStream(TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.debug("Gemini流式文本生成请求: model={}", request.getModel());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                handler.handle(null, true);
                throw new AIServiceException("Gemini API key 未配置");
            }
            
            String model = request.getModel() != null ? request.getModel() : "gemini-2.0-flash-exp";
            String url = String.format("%s/models/%s:streamGenerateContent?key=%s", baseUrl, model, apiKey);
            
            // 构建请求体
            Map<String, Object> requestBody = buildGeminiRequest(request);
            
            // 发送流式请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 注意：这里简化实现，实际应该使用 SSE 或 WebClient 处理流式响应
            // 暂时使用同步方式，后续可以优化
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                handler.handle(null, true);
                throw new AIServiceException("Gemini API 调用失败");
            }
            
            // 解析流式响应（简化实现）
            parseGeminiStreamResponse(response.getBody(), request, handler);
            
        } catch (Exception e) {
            log.error("Gemini流式文本生成失败", e);
            handler.handle(null, true);
        }
    }
    
    @Override
    public ImageGenerationResponse generateImage(ImageGenerationRequest request) {
        try {
            log.debug("Gemini图片生成请求: model={}, prompt={}", request.getModel(), request.getPrompt());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("Gemini API key 未配置");
            }
            
            String model = request.getModel() != null ? request.getModel() : "imagen-3.0-generate-001";
            String url = String.format("%s/models/%s:predict?key=%s", baseUrl, model, apiKey);
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", request.getPrompt());
            if (request.getWidth() != null) requestBody.put("width", request.getWidth());
            if (request.getHeight() != null) requestBody.put("height", request.getHeight());
            // 默认生成1张图片
            requestBody.put("numImages", 1);
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("Gemini 图片生成 API 调用失败");
            }
            
            // 解析响应
            return parseImageResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("Gemini图片生成失败", e);
            throw new AIServiceException("Gemini图片生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public AudioResponse textToSpeech(AudioRequest request) {
        throw new AIServiceException("Gemini 暂不支持文本转语音");
    }
    
    @Override
    public AudioResponse speechToText(AudioRequest request) {
        throw new AIServiceException("Gemini 暂不支持语音转文本");
    }
    
    @Override
    public VideoGenerationResponse generateVideo(VideoGenerationRequest request) {
        try {
            log.debug("Gemini视频生成请求: prompt={}", request.getPrompt());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("Gemini API key 未配置");
            }
            
            String model = request.getModel() != null ? request.getModel() : "veo-2";
            String url = String.format("%s/models/%s:generateVideo?key=%s", baseUrl, model, apiKey);
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", request.getPrompt());
            if (request.getDuration() != null) requestBody.put("duration", request.getDuration());
            if (request.getResolution() != null) requestBody.put("resolution", request.getResolution());
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("Gemini 视频生成 API 调用失败");
            }
            
            // 解析响应
            return parseVideoResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("Gemini视频生成失败", e);
            throw new AIServiceException("Gemini视频生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<String> getSupportedModels(String capability) {
        switch (capability.toLowerCase()) {
            case "text":
                return TEXT_MODELS;
            case "image":
                return IMAGE_MODELS;
            case "video":
                return Arrays.asList("veo-2");
            default:
                return new ArrayList<>();
        }
    }
    
    /**
     * 获取 API key（优先从请求中获取，否则使用默认配置）
     * 注意：这里需要从 TextGenerationRequest 中获取 API key
     * 可以通过扩展请求对象或使用 ThreadLocal 传递
     */
    private String getApiKey(TextGenerationRequest request) {
        // TODO: 从管理后台配置中获取 API key
        // 当前先使用默认配置
        return defaultApiKey;
    }
    
    private String getApiKey(ImageGenerationRequest request) {
        // TODO: 从管理后台配置中获取 API key
        return defaultApiKey;
    }
    
    private String getApiKey(VideoGenerationRequest request) {
        // TODO: 从管理后台配置中获取 API key
        return defaultApiKey;
    }
    
    /**
     * 构建 Gemini API 请求体
     */
    private Map<String, Object> buildGeminiRequest(TextGenerationRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        
        // 添加系统指令（如果有）
        if (request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty()) {
            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "user");
            Map<String, Object> systemPart = new HashMap<>();
            systemPart.put("text", request.getSystemInstruction());
            systemMessage.put("parts", Arrays.asList(systemPart));
            contents.add(systemMessage);
        }
        
        // 添加历史消息
        if (request.getMessages() != null && !request.getMessages().isEmpty()) {
            for (TextGenerationRequest.Message msg : request.getMessages()) {
                Map<String, Object> message = new HashMap<>();
                message.put("role", "user".equals(msg.getRole()) ? "user" : "model");
                Map<String, Object> part = new HashMap<>();
                part.put("text", msg.getContent());
                message.put("parts", Arrays.asList(part));
                contents.add(message);
            }
        }
        
        // 添加当前提示词
        if (request.getPrompt() != null && !request.getPrompt().isEmpty()) {
            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            Map<String, Object> part = new HashMap<>();
            part.put("text", request.getPrompt());
            userMessage.put("parts", Arrays.asList(part));
            contents.add(userMessage);
        }
        
        requestBody.put("contents", contents);
        
        // 添加生成配置
        Map<String, Object> generationConfig = new HashMap<>();
        if (request.getTemperature() != null) {
            generationConfig.put("temperature", request.getTemperature());
        } else {
            generationConfig.put("temperature", 0.7);
        }
        if (request.getMaxTokens() != null) {
            generationConfig.put("maxOutputTokens", request.getMaxTokens());
        }
        requestBody.put("generationConfig", generationConfig);
        
        return requestBody;
    }
    
    /**
     * 解析 Gemini API 响应
     */
    private TextGenerationResponse parseGeminiResponse(JsonNode response, TextGenerationRequest request) {
        TextGenerationResponse result = new TextGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "gemini-2.0-flash-exp");
        
        try {
            // 提取内容
            JsonNode candidates = response.get("candidates");
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode candidate = candidates.get(0);
                JsonNode content = candidate.get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        JsonNode part = parts.get(0);
                        String text = part.get("text").asText();
                        result.setContent(text);
                    }
                }
                
                // 提取完成原因
                if (candidate.has("finishReason")) {
                    result.setFinishReason(candidate.get("finishReason").asText());
                }
            }
            
            // 提取 Token 使用量
            JsonNode usageMetadata = response.get("usageMetadata");
            if (usageMetadata != null) {
                TextGenerationResponse.TokenUsage usage = new TextGenerationResponse.TokenUsage();
                if (usageMetadata.has("promptTokenCount")) {
                    usage.setInputTokens(usageMetadata.get("promptTokenCount").asInt());
                }
                if (usageMetadata.has("candidatesTokenCount")) {
                    usage.setOutputTokens(usageMetadata.get("candidatesTokenCount").asInt());
                }
                if (usageMetadata.has("totalTokenCount")) {
                    usage.setTotalTokens(usageMetadata.get("totalTokenCount").asInt());
                }
                result.setUsage(usage);
            }
            
        } catch (Exception e) {
            log.warn("解析 Gemini 响应失败", e);
            result.setContent("");
        }
        
        return result;
    }
    
    /**
     * 解析 Gemini 流式响应
     */
    private void parseGeminiStreamResponse(JsonNode response, TextGenerationRequest request,
                                          StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            // 简化实现：解析流式响应
            // 实际应该处理多个 chunk
            JsonNode candidates = response.get("candidates");
            if (candidates != null && candidates.isArray()) {
                for (JsonNode candidate : candidates) {
                    JsonNode content = candidate.get("content");
                    if (content != null) {
                        JsonNode parts = content.get("parts");
                        if (parts != null && parts.isArray()) {
                            for (JsonNode part : parts) {
                                if (part.has("text")) {
                                    String text = part.get("text").asText();
                                    TextGenerationResponse chunk = new TextGenerationResponse();
                                    chunk.setProvider(getProviderType());
                                    chunk.setModel(request.getModel() != null ? request.getModel() : "gemini-2.0-flash-exp");
                                    chunk.setContent(text);
                                    handler.handle(chunk, false);
                                }
                            }
                        }
                    }
                }
            }
            
            // 完成
            TextGenerationResponse finalResponse = new TextGenerationResponse();
            finalResponse.setProvider(getProviderType());
            finalResponse.setModel(request.getModel() != null ? request.getModel() : "gemini-2.0-flash-exp");
            handler.handle(finalResponse, true);
            
        } catch (Exception e) {
            log.error("解析 Gemini 流式响应失败", e);
            handler.handle(null, true);
        }
    }
    
    /**
     * 解析图片生成响应
     */
    private ImageGenerationResponse parseImageResponse(JsonNode response, ImageGenerationRequest request) {
        ImageGenerationResponse result = new ImageGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "imagen-3.0-generate-001");
        
        try {
            List<ImageGenerationResponse.Image> images = new ArrayList<>();
            JsonNode generatedImages = response.get("generatedImages");
            if (generatedImages != null && generatedImages.isArray()) {
                for (JsonNode image : generatedImages) {
                    ImageGenerationResponse.Image img = new ImageGenerationResponse.Image();
                    if (image.has("url")) {
                        img.setUrl(image.get("url").asText());
                    }
                    if (image.has("base64")) {
                        img.setBase64(image.get("base64").asText());
                    }
                    images.add(img);
                }
            }
            result.setImages(images);
            
            ImageGenerationResponse.Usage usage = new ImageGenerationResponse.Usage();
            usage.setImagesGenerated(images.size());
            result.setUsage(usage);
            
        } catch (Exception e) {
            log.warn("解析 Gemini 图片响应失败", e);
            result.setImages(new ArrayList<>());
        }
        
        return result;
    }
    
    /**
     * 解析视频生成响应
     */
    private VideoGenerationResponse parseVideoResponse(JsonNode response, VideoGenerationRequest request) {
        VideoGenerationResponse result = new VideoGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "veo-2");
        
        try {
            if (response.has("videoUrl")) {
                result.setVideoUrl(response.get("videoUrl").asText());
                result.setStatus("completed");
            } else if (response.has("taskId")) {
                result.setVideoId(response.get("taskId").asText());
                result.setStatus("processing");
            }
        } catch (Exception e) {
            log.warn("解析 Gemini 视频响应失败", e);
            result.setStatus("failed");
        }
        
        return result;
    }
}

