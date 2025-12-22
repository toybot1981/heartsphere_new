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
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * DashScope（通义千问）适配器实现
 * 使用 OpenAPI 兼容模式通过 HTTP 调用 DashScope API
 * 
 * @author HeartSphere
 * @version 2.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DashScopeAdapter implements ModelAdapter {
    
    @Value("${spring.ai.dashscope.api-key:}")
    private String defaultApiKey;
    
    @Value("${spring.ai.dashscope.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String baseUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final MultimodalService multimodalService;
    
    // 支持的文本模型
    private static final List<String> TEXT_MODELS = Arrays.asList(
        "qwen-max", "qwen-plus", "qwen-turbo", "qwen3-max"
    );
    
    // 支持的图片模型
    private static final List<String> IMAGE_MODELS = Arrays.asList(
        "wanx-v1", "wanx-v2"
    );
    
    @Override
    public String getProviderType() {
        return "dashscope";
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
        return true;
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            log.info("[DashScopeAdapter] 开始文本生成 - provider={}, model={}, hasPrompt={}, hasMessages={}, messagesCount={}, hasSystemInstruction={}", 
                getProviderType(), 
                request.getModel(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0,
                request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("DashScope API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[DashScopeAdapter] 使用baseUrl: {}", effectiveBaseUrl);
            
            String url = effectiveBaseUrl + "/chat/completions";
            
            // 构建请求体
            Map<String, Object> requestBody = buildDashScopeRequest(request);
            
            // 记录构建的请求体（不记录完整内容，只记录关键信息）
            @SuppressWarnings("unchecked")
            List<Map<String, String>> messagesList = (List<Map<String, String>>) requestBody.get("messages");
            log.debug("[DashScopeAdapter] 构建的请求体 - model={}, messagesCount={}, hasTemperature={}, hasMaxTokens={}", 
                requestBody.get("model"),
                messagesList != null ? messagesList.size() : 0,
                requestBody.containsKey("temperature"),
                requestBody.containsKey("max_tokens"));
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AIServiceException("DashScope API 调用失败: " + response.getStatusCode());
            }
            
            // 解析响应
            return parseDashScopeResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("[DashScopeAdapter] 文本生成失败", e);
            throw new AIServiceException("DashScope文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void generateTextStream(TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.info("[DashScopeAdapter] 开始流式文本生成 - provider={}, model={}, hasPrompt={}, hasMessages={}, messagesCount={}", 
                getProviderType(), 
                request.getModel(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0);
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                handler.handle(null, true);
                throw new AIServiceException("DashScope API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[DashScopeAdapter] 流式请求使用baseUrl: {}", effectiveBaseUrl);
            
            String url = effectiveBaseUrl + "/chat/completions";
            
            // 构建请求体（设置 stream=true）
            Map<String, Object> requestBody = buildDashScopeRequest(request);
            requestBody.put("stream", true);
            
            // 使用 WebClient 处理流式响应
            // 使用 DataBuffer 并按行分割 SSE 数据
            Flux<String> responseFlux = webClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(DataBuffer.class)
                .map(buffer -> {
                    byte[] bytes = new byte[buffer.readableByteCount()];
                    buffer.read(bytes);
                    DataBufferUtils.release(buffer);
                    return new String(bytes, StandardCharsets.UTF_8);
                })
                .flatMap(data -> {
                    // 按行分割数据，处理可能包含多行的chunk
                    String[] lines = data.split("\n", -1);
                    return Flux.fromArray(lines);
                });
            
            // 处理 SSE 流式响应
            final int[] chunkCount = {0};
            
            responseFlux.subscribe(
                line -> {
                    try {
                        String trimmed = line.trim();
                        
                        // 跳过空行
                        if (trimmed.isEmpty()) {
                            return;
                        }
                        
                        // 处理 SSE 格式：data: {...}
                        if (trimmed.startsWith("data: ")) {
                            String jsonStr = trimmed.substring(6).trim(); // 跳过 "data: "
                            
                            if ("[DONE]".equals(jsonStr)) {
                                log.info("[DashScopeAdapter] 收到完成信号");
                                TextGenerationResponse finalResponse = new TextGenerationResponse();
                                finalResponse.setProvider(getProviderType());
                                finalResponse.setModel(request.getModel() != null ? request.getModel() : "qwen-max");
                                handler.handle(finalResponse, true);
                                return;
                            }
                            
                            try {
                                JsonNode json = objectMapper.readTree(jsonStr);
                                
                                // 提取内容
                                JsonNode choices = json.get("choices");
                                if (choices != null && choices.isArray() && choices.size() > 0) {
                                    JsonNode choice = choices.get(0);
                                    JsonNode delta = choice.get("delta");
                                    if (delta != null && delta.has("content")) {
                                        String content = delta.get("content").asText();
                                        TextGenerationResponse chunk = new TextGenerationResponse();
                                        chunk.setProvider(getProviderType());
                                        chunk.setModel(request.getModel() != null ? request.getModel() : "qwen-max");
                                        chunk.setContent(content);
                                        chunkCount[0]++;
                                        if (chunkCount[0] <= 5 || chunkCount[0] % 10 == 0) {
                                            log.info("[DashScopeAdapter] 统一接入模式 - 调用handler.handle - chunkCount={}, contentLength={}, content={}", 
                                                chunkCount[0], content.length(), 
                                                content.length() > 50 ? content.substring(0, 50) + "..." : content);
                                        }
                                        handler.handle(chunk, false);
                                    } else {
                                        if (chunkCount[0] <= 5) {
                                            log.debug("[DashScopeAdapter] 统一接入模式 - delta没有content字段 - chunkCount={}", chunkCount[0]);
                                        }
                                    }
                                    
                                    // 检查是否完成
                                    if (choice.has("finish_reason") && choice.get("finish_reason") != null) {
                                        String finishReason = choice.get("finish_reason").asText();
                                        if (finishReason != null && !finishReason.isEmpty() && !"null".equals(finishReason)) {
                                            log.info("[DashScopeAdapter] 流式响应完成 - finishReason={}", finishReason);
                                            
                                            // 提取 Token 使用量
                                            TextGenerationResponse finalResponse = new TextGenerationResponse();
                                            finalResponse.setProvider(getProviderType());
                                            finalResponse.setModel(request.getModel() != null ? request.getModel() : "qwen-max");
                                            finalResponse.setFinishReason(finishReason);
                                            
                                            JsonNode usage = json.get("usage");
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
                                                finalResponse.setUsage(tokenUsage);
                                            }
                                            
                                            handler.handle(finalResponse, true);
                                        }
                                    }
                                }
                            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                                log.warn("[DashScopeAdapter] 解析JSON失败: {} - jsonStr: {}", e.getMessage(), jsonStr.substring(0, Math.min(200, jsonStr.length())));
                            }
                        }
                    } catch (Exception e) {
                        log.warn("[DashScopeAdapter] 解析SSE数据失败: {} - line: {}", e.getMessage(), line.substring(0, Math.min(100, line.length())));
                    }
                },
                error -> {
                    log.error("[DashScopeAdapter] 流式响应错误", error);
                    handler.handle(null, true);
                },
                () -> {
                    log.info("[DashScopeAdapter] 流式响应完成 - 总chunks={}", chunkCount[0]);
                    // 如果流完成但没有收到done信号，发送一个完成信号
                    if (chunkCount[0] > 0) {
                        TextGenerationResponse finalResponse = new TextGenerationResponse();
                        finalResponse.setProvider(getProviderType());
                        finalResponse.setModel(request.getModel() != null ? request.getModel() : "qwen-max");
                        handler.handle(finalResponse, true);
                    }
                }
            );
            
        } catch (Exception e) {
            log.error("[DashScopeAdapter] 流式文本生成异常", e);
            handler.handle(null, true);
            throw new AIServiceException("DashScope流式文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public ImageGenerationResponse generateImage(ImageGenerationRequest request) {
        try {
            log.debug("DashScope图片生成请求: provider={}, model={}, prompt={}", 
                getProviderType(), request.getModel(), request.getPrompt());
            
            // 图片生成暂时使用 MultimodalService（返回 Spring AI 的 ImageResponse，需要转换）
            org.springframework.ai.image.ImageResponse imageResponse = multimodalService.generateImage(request.getPrompt(), null);
            
            // 转换为 ImageGenerationResponse
            ImageGenerationResponse response = new ImageGenerationResponse();
            response.setProvider(getProviderType());
            response.setModel(request.getModel() != null ? request.getModel() : "wanx-v1");
            
            List<ImageGenerationResponse.Image> images = new ArrayList<>();
            if (imageResponse.getResults() != null) {
                for (var result : imageResponse.getResults()) {
                    ImageGenerationResponse.Image image = new ImageGenerationResponse.Image();
                    if (result.getOutput() != null && result.getOutput().getUrl() != null) {
                        image.setUrl(result.getOutput().getUrl());
                    }
                    images.add(image);
                }
            }
            response.setImages(images);
            
            ImageGenerationResponse.Usage usage = new ImageGenerationResponse.Usage();
            usage.setImagesGenerated(images.size());
            response.setUsage(usage);
            
            return response;
            
        } catch (Exception e) {
            log.error("DashScope图片生成失败", e);
            throw new AIServiceException("DashScope图片生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public AudioResponse textToSpeech(AudioRequest request) {
        try {
            log.debug("DashScope文本转语音请求: text={}", request.getText());
            
            Map<String, Object> options = new HashMap<>();
            if (request.getModel() != null) {
                options.put("model", request.getModel());
            }
            if (request.getVoice() != null) {
                options.put("voice", request.getVoice());
            }
            
            byte[] audioData = multimodalService.textToSpeech(request.getText(), options);
            
            AudioResponse response = new AudioResponse();
            response.setAudioBase64(Base64.getEncoder().encodeToString(audioData));
            response.setProvider(getProviderType());
            response.setModel(request.getModel() != null ? request.getModel() : "sambert-zhichu-v1");
            
            return response;
        } catch (Exception e) {
            log.error("DashScope文本转语音失败", e);
            throw new AIServiceException("DashScope文本转语音失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public AudioResponse speechToText(AudioRequest request) {
        try {
            log.debug("DashScope语音转文本请求");
            
            byte[] audioData = Base64.getDecoder().decode(request.getAudioData());
            
            Map<String, Object> options = new HashMap<>();
            if (request.getModel() != null) {
                options.put("model", request.getModel());
            }
            if (request.getLanguage() != null) {
                options.put("language", request.getLanguage());
            }
            
            String text = multimodalService.speechToText(audioData, options);
            
            AudioResponse response = new AudioResponse();
            response.setContent(text);
            response.setProvider(getProviderType());
            response.setModel(request.getModel() != null ? request.getModel() : "paraformer-v2");
            
            return response;
        } catch (Exception e) {
            log.error("DashScope语音转文本失败", e);
            throw new AIServiceException("DashScope语音转文本失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public VideoGenerationResponse generateVideo(VideoGenerationRequest request) {
        try {
            log.debug("DashScope视频生成请求: prompt={}", request.getPrompt());
            
            Map<String, Object> options = new HashMap<>();
            if (request.getModel() != null) {
                options.put("model", request.getModel());
            }
            if (request.getDuration() != null) {
                options.put("duration", request.getDuration());
            }
            if (request.getResolution() != null) {
                options.put("resolution", request.getResolution());
            }
            
            String videoUrl = multimodalService.generateVideo(request.getPrompt(), options);
            
            VideoGenerationResponse response = new VideoGenerationResponse();
            response.setVideoUrl(videoUrl);
            response.setProvider(getProviderType());
            response.setModel(request.getModel() != null ? request.getModel() : "wanx-v1.1-video");
            response.setStatus(videoUrl.startsWith("task_id:") ? "processing" : "completed");
            
            if (videoUrl.startsWith("task_id:")) {
                response.setVideoId(videoUrl.substring("task_id:".length()));
            }
            
            return response;
        } catch (Exception e) {
            log.error("DashScope视频生成失败", e);
            throw new AIServiceException("DashScope视频生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<String> getSupportedModels(String capability) {
        switch (capability.toLowerCase()) {
            case "text":
                return TEXT_MODELS;
            case "image":
                return IMAGE_MODELS;
            case "audio":
            case "video":
                return Arrays.asList("wanx-v1"); // 待完善
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
    
    /**
     * 构建 DashScope API 请求体（OpenAPI 兼容格式）
     */
    private Map<String, Object> buildDashScopeRequest(TextGenerationRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // 设置模型
        String model = request.getModel() != null ? request.getModel() : "qwen-max";
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
        
        // 验证：确保至少有一个消息
        if (messages.isEmpty()) {
            log.error("[DashScopeAdapter] buildDashScopeRequest - messages列表为空！request详情: systemInstruction={}, hasMessages={}, messagesCount={}, hasPrompt={}, prompt={}", 
                request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0,
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getPrompt());
            throw new AIServiceException("请求中必须包含至少一个消息（systemInstruction、messages或prompt）");
        }
        
        log.debug("[DashScopeAdapter] buildDashScopeRequest - 构建的消息列表大小: {}", messages.size());
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
     * 解析 DashScope API 响应（OpenAPI 兼容格式）
     */
    private TextGenerationResponse parseDashScopeResponse(JsonNode response, TextGenerationRequest request) {
        TextGenerationResponse result = new TextGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "qwen-max");
        
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
            log.warn("解析 DashScope 响应失败", e);
            result.setContent("");
        }
        
        return result;
    }
}
