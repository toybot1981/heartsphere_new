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
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 智谱AI BigModel适配器实现
 * 使用 OpenAPI 兼容模式通过 HTTP 调用智谱AI API
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BigModelAdapter implements ModelAdapter {
    
    @Value("${spring.ai.bigmodel.api-key:}")
    private String defaultApiKey;
    
    @Value("${spring.ai.bigmodel.base-url:https://open.bigmodel.cn/api/paas/v4}")
    private String baseUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    
    // 支持的文本模型
    private static final List<String> TEXT_MODELS = Arrays.asList(
        "glm-4.7"
    );
    
    @Override
    public String getProviderType() {
        return "bigmodel";
    }
    
    @Override
    public boolean supportsTextGeneration() {
        return true;
    }
    
    @Override
    public boolean supportsImageGeneration() {
        return false;
    }
    
    @Override
    public boolean supportsTextToSpeech() {
        return false;
    }
    
    @Override
    public boolean supportsSpeechToText() {
        return false;
    }
    
    @Override
    public boolean supportsVideoGeneration() {
        return false;
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            log.info("[BigModelAdapter] 开始文本生成 - provider={}, model={}, hasPrompt={}, hasMessages={}, messagesCount={}, hasSystemInstruction={}", 
                getProviderType(), 
                request.getModel(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0,
                request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("智谱AI API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[BigModelAdapter] 使用baseUrl: {}", effectiveBaseUrl);
            
            String url = effectiveBaseUrl + "/chat/completions";
            
            // 构建请求体
            Map<String, Object> requestBody = buildBigModelRequest(request);
            
            // 记录构建的请求体（不记录完整内容，只记录关键信息）
            @SuppressWarnings("unchecked")
            List<Map<String, String>> messagesList = (List<Map<String, String>>) requestBody.get("messages");
            log.debug("[BigModelAdapter] 构建的请求体 - model={}, messagesCount={}, hasTemperature={}, hasMaxTokens={}", 
                requestBody.get("model"),
                messagesList != null ? messagesList.size() : 0,
                requestBody.containsKey("temperature"),
                requestBody.containsKey("max_tokens"));
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            try {
                ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, JsonNode.class
                );
                
                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    String errorMsg = parseErrorResponse(response.getBody(), response.getStatusCode());
                    log.error("[BigModelAdapter] API调用失败 - Status: {}, Error: {}", response.getStatusCode(), errorMsg);
                    throw new AIServiceException("智谱AI API 调用失败: " + errorMsg);
                }
                
                // 解析响应
                return parseBigModelResponse(response.getBody(), request);
                
            } catch (HttpStatusCodeException e) {
                // 处理HTTP错误响应（如429, 401等）
                String errorMsg = parseErrorResponseFromException(e);
                log.error("[BigModelAdapter] 文本生成失败 - Status: {}, Error: {}", e.getStatusCode(), errorMsg);
                throw new AIServiceException("智谱AI文本生成失败: " + errorMsg, e);
            }
            
        } catch (AIServiceException e) {
            // 重新抛出AIServiceException
            throw e;
        } catch (Exception e) {
            log.error("[BigModelAdapter] 文本生成失败", e);
            throw new AIServiceException("智谱AI文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void generateTextStream(TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.info("[BigModelAdapter] 开始流式文本生成 - provider={}, model={}, hasPrompt={}, hasMessages={}, messagesCount={}", 
                getProviderType(), 
                request.getModel(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0);
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                handler.handle(null, true);
                throw new AIServiceException("智谱AI API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[BigModelAdapter] 流式请求使用baseUrl: {}", effectiveBaseUrl);
            
            String url = effectiveBaseUrl + "/chat/completions";
            
            // 构建请求体（设置 stream=true）
            Map<String, Object> requestBody = buildBigModelRequest(request);
            requestBody.put("stream", true);
            
            // 使用 WebClient 处理流式响应
            // 使用 DataBuffer 并按行分割 SSE 数据
            // 添加重试机制处理连接错误
            Flux<String> responseFlux = webClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(DataBuffer.class)
                .retryWhen(reactor.util.retry.Retry.backoff(3, java.time.Duration.ofSeconds(1))
                    .filter(throwable -> {
                        // 仅对连接相关的错误进行重试
                        String message = throwable.getMessage() != null 
                            ? throwable.getMessage().toLowerCase() 
                            : "";
                        boolean shouldRetry = message.contains("connection refused") ||
                            message.contains("connection reset") ||
                            message.contains("connection timeout") ||
                            message.contains("connection closed") ||
                            message.contains("connection reset by peer") ||
                            throwable instanceof java.net.ConnectException ||
                            throwable instanceof java.net.SocketTimeoutException;
                        
                        if (shouldRetry) {
                            log.warn("[BigModelAdapter] 检测到连接错误，将重试: {}", throwable.getMessage());
                        }
                        return shouldRetry;
                    })
                    .doBeforeRetry(retrySignal -> {
                        log.warn("[BigModelAdapter] 准备重试流式请求 - 重试次数: {}/3", retrySignal.totalRetries() + 1);
                    })
                    .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> {
                        log.error("[BigModelAdapter] 流式请求重试耗尽，最终失败 - 总重试次数: {}", retrySignal.totalRetries());
                        return retrySignal.failure();
                    }))
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
                                log.info("[BigModelAdapter] 收到完成信号");
                                TextGenerationResponse finalResponse = new TextGenerationResponse();
                                finalResponse.setProvider(getProviderType());
                                finalResponse.setModel(request.getModel() != null ? request.getModel() : "glm-4.7");
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
                                        chunk.setModel(request.getModel() != null ? request.getModel() : "glm-4.7");
                                        chunk.setContent(content);
                                        chunkCount[0]++;
                                        if (chunkCount[0] <= 5 || chunkCount[0] % 10 == 0) {
                                            log.info("[BigModelAdapter] 调用handler.handle - chunkCount={}, contentLength={}, content={}", 
                                                chunkCount[0], content.length(), 
                                                content.length() > 50 ? content.substring(0, 50) + "..." : content);
                                        }
                                        handler.handle(chunk, false);
                                    } else {
                                        if (chunkCount[0] <= 5) {
                                            log.debug("[BigModelAdapter] delta没有content字段 - chunkCount={}", chunkCount[0]);
                                        }
                                    }
                                    
                                    // 检查是否完成
                                    if (choice.has("finish_reason") && choice.get("finish_reason") != null) {
                                        String finishReason = choice.get("finish_reason").asText();
                                        if (finishReason != null && !finishReason.isEmpty() && !"null".equals(finishReason)) {
                                            log.info("[BigModelAdapter] 流式响应完成 - finishReason={}", finishReason);
                                            
                                            // 提取 Token 使用量
                                            TextGenerationResponse finalResponse = new TextGenerationResponse();
                                            finalResponse.setProvider(getProviderType());
                                            finalResponse.setModel(request.getModel() != null ? request.getModel() : "glm-4.7");
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
                                log.warn("[BigModelAdapter] 解析JSON失败: {} - jsonStr: {}", e.getMessage(), jsonStr.substring(0, Math.min(200, jsonStr.length())));
                            }
                        }
                    } catch (Exception e) {
                        log.warn("[BigModelAdapter] 解析SSE数据失败: {} - line: {}", e.getMessage(), line.substring(0, Math.min(100, line.length())));
                    }
                },
                error -> {
                    log.error("[BigModelAdapter] 流式响应错误", error);
                    handler.handle(null, true);
                },
                () -> {
                    log.info("[BigModelAdapter] 流式响应完成 - 总chunks={}", chunkCount[0]);
                    // 如果流完成但没有收到done信号，发送一个完成信号
                    if (chunkCount[0] > 0) {
                        TextGenerationResponse finalResponse = new TextGenerationResponse();
                        finalResponse.setProvider(getProviderType());
                        finalResponse.setModel(request.getModel() != null ? request.getModel() : "glm-4.7");
                        handler.handle(finalResponse, true);
                    }
                }
            );
            
        } catch (Exception e) {
            log.error("[BigModelAdapter] 流式文本生成异常", e);
            handler.handle(null, true);
            throw new AIServiceException("智谱AI流式文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public ImageGenerationResponse generateImage(ImageGenerationRequest request) {
        throw new AIServiceException("智谱AI暂不支持图片生成");
    }
    
    @Override
    public AudioResponse textToSpeech(AudioRequest request) {
        throw new AIServiceException("智谱AI暂不支持文本转语音");
    }
    
    @Override
    public AudioResponse speechToText(AudioRequest request) {
        throw new AIServiceException("智谱AI暂不支持语音转文本");
    }
    
    @Override
    public VideoGenerationResponse generateVideo(VideoGenerationRequest request) {
        throw new AIServiceException("智谱AI暂不支持视频生成");
    }
    
    @Override
    public List<String> getSupportedModels(String capability) {
        switch (capability.toLowerCase()) {
            case "text":
                return TEXT_MODELS;
            default:
                return new ArrayList<>();
        }
    }
    
    /**
     * 获取 API key
     * 优先级：请求中的API key（从数据库配置获取）> 配置文件
     */
    private String getApiKey(TextGenerationRequest request) {
        // 优先从请求中获取 API key（由 AIServiceImpl 从数据库配置注入）
        if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
            log.debug("[BigModelAdapter] 使用请求中的 API key（从数据库配置获取）");
            return request.getApiKey();
        }
        // 否则使用配置文件中的默认 API key
        return defaultApiKey;
    }
    
    /**
     * 构建智谱AI API 请求体（OpenAPI 兼容格式）
     */
    private Map<String, Object> buildBigModelRequest(TextGenerationRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // 设置模型
        String model = request.getModel() != null ? request.getModel() : "glm-4.7";
        requestBody.put("model", model);
        
        // 构建消息列表
        List<Map<String, Object>> messages = new ArrayList<>();
        
        // 添加系统消息
        if (request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty()) {
            Map<String, Object> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", request.getSystemInstruction());
            messages.add(systemMsg);
        }
        
        // 添加历史消息
        if (request.getMessages() != null && !request.getMessages().isEmpty()) {
            for (TextGenerationRequest.Message msg : request.getMessages()) {
                Map<String, Object> message = new HashMap<>();
                message.put("role", msg.getRole());
                message.put("content", msg.getContent());
                messages.add(message);
            }
        }
        
        // 添加当前提示词
        if (request.getPrompt() != null && !request.getPrompt().isEmpty()) {
            Map<String, Object> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", request.getPrompt());
            messages.add(userMsg);
        }
        
        // 验证：确保至少有一个消息
        if (messages.isEmpty()) {
            log.error("[BigModelAdapter] buildBigModelRequest - messages列表为空！request详情: systemInstruction={}, hasMessages={}, messagesCount={}, hasPrompt={}, prompt={}", 
                request.getSystemInstruction() != null && !request.getSystemInstruction().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0,
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getPrompt());
            throw new AIServiceException("请求中必须包含至少一个消息（systemInstruction、messages或prompt）");
        }
        
        log.debug("[BigModelAdapter] buildBigModelRequest - 构建的消息列表大小: {}", messages.size());
        requestBody.put("messages", messages);
        
        // 添加生成参数
        if (request.getTemperature() != null) {
            requestBody.put("temperature", request.getTemperature());
        } else {
            requestBody.put("temperature", 1.0); // 智谱AI默认temperature为1.0
        }
        if (request.getMaxTokens() != null) {
            requestBody.put("max_tokens", request.getMaxTokens());
        } else {
            requestBody.put("max_tokens", 65536); // 智谱AI默认max_tokens为65536
        }
        
        // 添加thinking配置（智谱AI特有）
        Map<String, Object> thinking = new HashMap<>();
        thinking.put("type", "enabled");
        requestBody.put("thinking", thinking);
        
        return requestBody;
    }
    
    /**
     * 解析智谱AI API 响应（OpenAPI 兼容格式）
     */
    private TextGenerationResponse parseBigModelResponse(JsonNode response, TextGenerationRequest request) {
        TextGenerationResponse result = new TextGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "glm-4.7");
        
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
            log.warn("解析智谱AI响应失败", e);
            result.setContent("");
        }
        
        return result;
    }
    
    /**
     * 解析错误响应
     */
    private String parseErrorResponse(JsonNode errorBody, HttpStatusCode statusCode) {
        if (errorBody == null) {
            return statusCode.toString();
        }
        
        try {
            // 智谱AI错误格式：{"error":{"code":"1113","message":"余额不足或无可用资源包,请充值。"}}
            if (errorBody.has("error")) {
                JsonNode error = errorBody.get("error");
                String code = error.has("code") ? error.get("code").asText() : "";
                String message = error.has("message") ? error.get("message").asText() : "";
                if (!message.isEmpty()) {
                    return String.format("%s (错误代码: %s)", message, code);
                }
            }
            // 如果没有error字段，返回整个响应体
            return errorBody.toString();
        } catch (Exception e) {
            log.warn("[BigModelAdapter] 解析错误响应失败", e);
            return errorBody.toString();
        }
    }
    
    /**
     * 从HttpStatusCodeException中解析错误响应
     */
    private String parseErrorResponseFromException(HttpStatusCodeException e) {
        try {
            String responseBody = e.getResponseBodyAsString();
            if (responseBody != null && !responseBody.isEmpty()) {
                JsonNode errorBody = objectMapper.readTree(responseBody);
                return parseErrorResponse(errorBody, e.getStatusCode());
            }
        } catch (Exception ex) {
            log.warn("[BigModelAdapter] 解析异常响应体失败", ex);
        }
        return e.getStatusCode() + ": " + e.getMessage();
    }
}

