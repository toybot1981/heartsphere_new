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
import java.util.Base64;

/**
 * OpenAI 适配器实现
 * 通过 HTTP 调用 OpenAI API
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAIAdapter implements ModelAdapter {
    
    @Value("${spring.ai.openai.api-key:}")
    private String defaultApiKey;
    
    @Value("${spring.ai.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // 支持的文本模型
    private static final List<String> TEXT_MODELS = Arrays.asList(
        "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"
    );
    
    // 支持的图片模型
    private static final List<String> IMAGE_MODELS = Arrays.asList(
        "dall-e-3", "dall-e-2"
    );
    
    @Override
    public String getProviderType() {
        return "openai";
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
        return true;
    }
    
    @Override
    public boolean supportsSpeechToText() {
        return true;
    }
    
    @Override
    public boolean supportsVideoGeneration() {
        return false; // OpenAI 暂不支持视频生成
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            log.debug("OpenAI文本生成请求: model={}, prompt={}", request.getModel(), request.getPrompt());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("OpenAI API key 未配置");
            }
            
            String url = baseUrl + "/chat/completions";
            
            // 构建请求体
            Map<String, Object> requestBody = buildOpenAIRequest(request);
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("OpenAI API 调用失败: " + response.getStatusCode());
            }
            
            // 解析响应
            return parseOpenAIResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("OpenAI文本生成失败", e);
            throw new AIServiceException("OpenAI文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void generateTextStream(TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.debug("OpenAI流式文本生成请求: model={}", request.getModel());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                handler.handle(null, true);
                throw new AIServiceException("OpenAI API key 未配置");
            }
            
            String url = baseUrl + "/chat/completions";
            
            // 构建请求体（设置 stream=true）
            Map<String, Object> requestBody = buildOpenAIRequest(request);
            requestBody.put("stream", true);
            
            // 发送流式请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 注意：这里简化实现，实际应该使用 SSE 或 WebClient 处理流式响应
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                handler.handle(null, true);
                throw new AIServiceException("OpenAI API 调用失败");
            }
            
            // 解析流式响应（简化实现）
            parseOpenAIStreamResponse(response.getBody(), request, handler);
            
        } catch (Exception e) {
            log.error("OpenAI流式文本生成失败", e);
            handler.handle(null, true);
        }
    }
    
    @Override
    public ImageGenerationResponse generateImage(ImageGenerationRequest request) {
        try {
            log.debug("OpenAI图片生成请求: model={}, prompt={}", request.getModel(), request.getPrompt());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("OpenAI API key 未配置");
            }
            
            String url = baseUrl + "/images/generations";
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", request.getPrompt());
            requestBody.put("model", request.getModel() != null ? request.getModel() : "dall-e-3");
            requestBody.put("n", 1); // 默认生成1张图片
            // 默认尺寸
            requestBody.put("size", "1024x1024");
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("OpenAI 图片生成 API 调用失败");
            }
            
            // 解析响应
            return parseImageResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("OpenAI图片生成失败", e);
            throw new AIServiceException("OpenAI图片生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public AudioResponse textToSpeech(AudioRequest request) {
        try {
            log.debug("OpenAI文本转语音请求: text={}", request.getText());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("OpenAI API key 未配置");
            }
            
            String url = baseUrl + "/audio/speech";
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", request.getModel() != null ? request.getModel() : "tts-1");
            requestBody.put("input", request.getText());
            requestBody.put("voice", request.getVoice() != null ? request.getVoice() : "alloy");
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, byte[].class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("OpenAI 文本转语音 API 调用失败");
            }
            
            AudioResponse result = new AudioResponse();
            result.setAudioBase64(Base64.getEncoder().encodeToString(response.getBody()));
            result.setProvider(getProviderType());
            result.setModel(request.getModel() != null ? request.getModel() : "tts-1");
            
            return result;
            
        } catch (Exception e) {
            log.error("OpenAI文本转语音失败", e);
            throw new AIServiceException("OpenAI文本转语音失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public AudioResponse speechToText(AudioRequest request) {
        try {
            log.debug("OpenAI语音转文本请求");
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("OpenAI API key 未配置");
            }
            
            // 简化实现：直接返回错误提示
            // 注意：OpenAI 语音转文本需要 multipart/form-data 请求
            throw new AIServiceException("OpenAI 语音转文本需要 multipart 请求，暂未实现");
            
        } catch (Exception e) {
            log.error("OpenAI语音转文本失败", e);
            throw new AIServiceException("OpenAI语音转文本失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public VideoGenerationResponse generateVideo(VideoGenerationRequest request) {
        throw new AIServiceException("OpenAI 暂不支持视频生成");
    }
    
    @Override
    public List<String> getSupportedModels(String capability) {
        switch (capability.toLowerCase()) {
            case "text":
                return TEXT_MODELS;
            case "image":
                return IMAGE_MODELS;
            case "audio":
                return Arrays.asList("tts-1", "tts-1-hd", "whisper-1");
            default:
                return new ArrayList<>();
        }
    }
    
    /**
     * 获取 API key
     */
    private String getApiKey(TextGenerationRequest request) {
        // TODO: 从管理后台配置中获取 API key
        return defaultApiKey;
    }
    
    private String getApiKey(ImageGenerationRequest request) {
        // TODO: 从管理后台配置中获取 API key
        return defaultApiKey;
    }
    
    private String getApiKey(AudioRequest request) {
        // TODO: 从管理后台配置中获取 API key
        return defaultApiKey;
    }
    
    /**
     * 构建 OpenAI API 请求体
     */
    private Map<String, Object> buildOpenAIRequest(TextGenerationRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // 设置模型
        String model = request.getModel() != null ? request.getModel() : "gpt-3.5-turbo";
        requestBody.put("model", model);
        
        // 构建消息列表
        List<Map<String, String>> messages = new ArrayList<>();
        
        // 添加系统消息
        if (request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty()) {
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", request.getSystemInstruction());
            messages.add(systemMsg);
        }
        
        // 添加历史消息
        if (request.getMessages() != null && !request.getMessages().isEmpty()) {
            for (TextGenerationRequest.Message msg : request.getMessages()) {
                Map<String, String> message = new HashMap<>();
                message.put("role", msg.getRole());
                message.put("content", msg.getContent());
                messages.add(message);
            }
        }
        
        // 添加当前提示词
        if (request.getPrompt() != null && !request.getPrompt().isEmpty()) {
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", request.getPrompt());
            messages.add(userMsg);
        }
        
        requestBody.put("messages", messages);
        
        // 添加生成参数
        if (request.getTemperature() != null) {
            requestBody.put("temperature", request.getTemperature());
        } else {
            requestBody.put("temperature", 0.7);
        }
        if (request.getMaxTokens() != null) {
            requestBody.put("max_tokens", request.getMaxTokens());
        }
        
        return requestBody;
    }
    
    /**
     * 解析 OpenAI API 响应
     */
    private TextGenerationResponse parseOpenAIResponse(JsonNode response, TextGenerationRequest request) {
        TextGenerationResponse result = new TextGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "gpt-3.5-turbo");
        
        try {
            // 提取内容
            JsonNode choices = response.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode choice = choices.get(0);
                JsonNode message = choice.get("message");
                if (message != null && message.has("content")) {
                    result.setContent(message.get("content").asText());
                }
                
                // 提取完成原因
                if (choice.has("finish_reason")) {
                    result.setFinishReason(choice.get("finish_reason").asText());
                }
            }
            
            // 提取 Token 使用量
            JsonNode usage = response.get("usage");
            if (usage != null) {
                TextGenerationResponse.TokenUsage tokenUsage = new TextGenerationResponse.TokenUsage();
                if (usage.has("prompt_tokens")) {
                    tokenUsage.setInputTokens(usage.get("prompt_tokens").asInt());
                }
                if (usage.has("completion_tokens")) {
                    tokenUsage.setOutputTokens(usage.get("completion_tokens").asInt());
                }
                if (usage.has("total_tokens")) {
                    tokenUsage.setTotalTokens(usage.get("total_tokens").asInt());
                }
                result.setUsage(tokenUsage);
            }
            
        } catch (Exception e) {
            log.warn("解析 OpenAI 响应失败", e);
            result.setContent("");
        }
        
        return result;
    }
    
    /**
     * 解析 OpenAI 流式响应
     */
    private void parseOpenAIStreamResponse(JsonNode response, TextGenerationRequest request,
                                           StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            // 简化实现：解析流式响应
            // 实际应该处理多个 SSE chunk
            JsonNode choices = response.get("choices");
            if (choices != null && choices.isArray()) {
                for (JsonNode choice : choices) {
                    JsonNode delta = choice.get("delta");
                    if (delta != null && delta.has("content")) {
                        String text = delta.get("content").asText();
                        TextGenerationResponse chunk = new TextGenerationResponse();
                        chunk.setProvider(getProviderType());
                        chunk.setModel(request.getModel() != null ? request.getModel() : "gpt-3.5-turbo");
                        chunk.setContent(text);
                        handler.handle(chunk, false);
                    }
                }
            }
            
            // 完成
            TextGenerationResponse finalResponse = new TextGenerationResponse();
            finalResponse.setProvider(getProviderType());
            finalResponse.setModel(request.getModel() != null ? request.getModel() : "gpt-3.5-turbo");
            handler.handle(finalResponse, true);
            
        } catch (Exception e) {
            log.error("解析 OpenAI 流式响应失败", e);
            handler.handle(null, true);
        }
    }
    
    /**
     * 解析图片生成响应
     */
    private ImageGenerationResponse parseImageResponse(JsonNode response, ImageGenerationRequest request) {
        ImageGenerationResponse result = new ImageGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "dall-e-3");
        
        try {
            List<ImageGenerationResponse.Image> images = new ArrayList<>();
            JsonNode data = response.get("data");
            if (data != null && data.isArray()) {
                for (JsonNode item : data) {
                    ImageGenerationResponse.Image img = new ImageGenerationResponse.Image();
                    if (item.has("url")) {
                        img.setUrl(item.get("url").asText());
                    }
                    if (item.has("b64_json")) {
                        img.setBase64(item.get("b64_json").asText());
                    }
                    images.add(img);
                }
            }
            result.setImages(images);
            
            ImageGenerationResponse.Usage usage = new ImageGenerationResponse.Usage();
            usage.setImagesGenerated(images.size());
            result.setUsage(usage);
            
        } catch (Exception e) {
            log.warn("解析 OpenAI 图片响应失败", e);
            result.setImages(new ArrayList<>());
        }
        
        return result;
    }
}

