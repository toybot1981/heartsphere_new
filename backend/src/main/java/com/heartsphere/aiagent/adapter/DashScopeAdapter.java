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
                            log.warn("[DashScopeAdapter] 检测到连接错误，将重试: {}", throwable.getMessage());
                        }
                        return shouldRetry;
                    })
                    .doBeforeRetry(retrySignal -> {
                        log.warn("[DashScopeAdapter] 准备重试流式请求 - 重试次数: {}/3", retrySignal.totalRetries() + 1);
                    })
                    .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> {
                        log.error("[DashScopeAdapter] 流式请求重试耗尽，最终失败 - 总重试次数: {}", retrySignal.totalRetries());
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
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("DashScope API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : "https://dashscope.aliyuncs.com/api/v1";
            log.debug("[DashScopeAdapter] 使用baseUrl: {}", effectiveBaseUrl);
            
            // 判断使用哪个API端点
            String model = request.getModel() != null ? request.getModel() : "wanx-v1";
            
            // qwen-image-plus 使用 multimodal-generation API
            if ("qwen-image-plus".equals(model) || model.startsWith("qwen-image")) {
                return generateImageWithMultimodalAPI(request, apiKey, effectiveBaseUrl, model);
            } else {
                // 其他模型使用 image-synthesis API
                String url = effectiveBaseUrl + "/services/aigc/text2image/image-synthesis";
                log.info("[DashScopeAdapter] 使用image-synthesis API - URL: {}, Model: {}, Prompt: {}", 
                    url, model, request.getPrompt());
                
                // 构建请求体
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", model);
                requestBody.put("input", Map.of("prompt", request.getPrompt()));
                
                // 构建参数
                Map<String, Object> parameters = new HashMap<>();
                if (request.getWidth() != null && request.getHeight() != null) {
                    parameters.put("size", request.getWidth() + "*" + request.getHeight());
                } else if (request.getAspectRatio() != null) {
                    // 根据宽高比设置尺寸
                    String[] ratio = request.getAspectRatio().split(":");
                    if (ratio.length == 2) {
                        int width = Integer.parseInt(ratio[0]) * 512;
                        int height = Integer.parseInt(ratio[1]) * 512;
                        parameters.put("size", width + "*" + height);
                    }
                } else {
                    // 默认尺寸
                    parameters.put("size", "1024*1024");
                }
                
                if (request.getNegativePrompt() != null && !request.getNegativePrompt().isEmpty()) {
                    parameters.put("negative_prompt", request.getNegativePrompt());
                }
                
                if (request.getStyle() != null && !request.getStyle().isEmpty()) {
                    parameters.put("style", request.getStyle());
                }
                
                if (!parameters.isEmpty()) {
                    requestBody.put("parameters", parameters);
                }
                
                // 发送请求
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);
                headers.set("X-DashScope-Async", "enable"); // 启用异步模式
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                log.info("[DashScopeAdapter] image-synthesis请求 - URL: {}, Model: {}, RequestBody: {}", 
                    url, model, objectMapper.writeValueAsString(requestBody));
                
                ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, JsonNode.class
                );
                
                log.info("[DashScopeAdapter] image-synthesis响应 - Status: {}, Body: {}", 
                    response.getStatusCode(), 
                    response.getBody() != null ? response.getBody().toString() : "null");
                
                if (!response.getStatusCode().is2xxSuccessful()) {
                    String errorMsg = response.getBody() != null 
                        ? response.getBody().toString() 
                        : "HTTP " + response.getStatusCode();
                    log.error("[DashScopeAdapter] image-synthesis API调用失败 - Status: {}, Error: {}", 
                        response.getStatusCode(), errorMsg);
                    throw new AIServiceException("DashScope图片生成API调用失败: " + errorMsg);
                }
                
                JsonNode responseBody = response.getBody();
                if (responseBody == null) {
                    throw new AIServiceException("DashScope图片生成API返回空响应");
                }
                
                // 解析响应
                return parseImageResponse(responseBody, request, model);
            }
            
        } catch (Exception e) {
            log.error("DashScope图片生成失败", e);
            throw new AIServiceException("DashScope图片生成失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解析DashScope图片生成响应
     */
    private ImageGenerationResponse parseImageResponse(JsonNode response, ImageGenerationRequest request, String model) {
        ImageGenerationResponse result = new ImageGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(model);
        
        try {
            List<ImageGenerationResponse.Image> images = new ArrayList<>();
            
            // DashScope 异步模式：先返回 task_id，需要轮询获取结果
            if (response.has("output") && response.get("output").has("task_id")) {
                String taskId = response.get("output").get("task_id").asText();
                log.debug("DashScope图片生成任务ID: {}", taskId);
                
                // 轮询获取结果（最多30次，每次间隔2秒）
                String resultUrl = "https://dashscope.aliyuncs.com/api/v1/tasks/" + taskId;
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + getApiKey(request));
                
                for (int i = 0; i < 30; i++) {
                    try {
                        Thread.sleep(2000); // 等待2秒
                        
                        HttpEntity<String> entity = new HttpEntity<>(headers);
                        ResponseEntity<JsonNode> taskResponse = restTemplate.exchange(
                            resultUrl, HttpMethod.GET, entity, JsonNode.class
                        );
                        
                        if (taskResponse.getStatusCode().is2xxSuccessful()) {
                            JsonNode taskBody = taskResponse.getBody();
                            if (taskBody == null) {
                                log.warn("DashScope任务查询返回空响应，继续轮询");
                                continue;
                            }
                            
                            // 检查任务状态
                            if (taskBody.has("task") && taskBody.get("task").has("status")) {
                                String status = taskBody.get("task").get("status").asText();
                                
                                if ("SUCCEEDED".equals(status)) {
                                    // 任务成功，获取图片URL
                                    JsonNode output = taskBody.get("output");
                                    if (output != null && output.has("results")) {
                                        JsonNode results = output.get("results");
                                        if (results.isArray()) {
                                            for (JsonNode item : results) {
                                                ImageGenerationResponse.Image image = new ImageGenerationResponse.Image();
                                                if (item.has("url")) {
                                                    image.setUrl(item.get("url").asText());
                                                }
                                                images.add(image);
                                            }
                                        }
                                    }
                                    break;
                                } else if ("FAILED".equals(status)) {
                                    String errorMsg = taskBody.has("message") 
                                        ? taskBody.get("message").asText() 
                                        : "任务失败";
                                    throw new AIServiceException("DashScope图片生成任务失败: " + errorMsg);
                                }
                                // PENDING 或 RUNNING 状态，继续轮询
                            }
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        throw new AIServiceException("轮询任务结果被中断");
                    }
                }
                
                if (images.isEmpty()) {
                    throw new AIServiceException("DashScope图片生成超时，未获取到结果");
                }
            } else if (response.has("output") && response.get("output").has("results")) {
                // 同步模式：直接返回结果
                JsonNode results = response.get("output").get("results");
                if (results.isArray()) {
                    for (JsonNode item : results) {
                        ImageGenerationResponse.Image image = new ImageGenerationResponse.Image();
                        if (item.has("url")) {
                            image.setUrl(item.get("url").asText());
                        }
                        images.add(image);
                    }
                }
            }
            
            result.setImages(images);
            
            ImageGenerationResponse.Usage usage = new ImageGenerationResponse.Usage();
            usage.setImagesGenerated(images.size());
            result.setUsage(usage);
            
        } catch (Exception e) {
            log.warn("解析DashScope图片响应失败", e);
            result.setImages(new ArrayList<>());
        }
        
        return result;
    }
    
    /**
     * 使用 multimodal-generation API 生成图片（适用于 qwen-image-plus）
     */
    private ImageGenerationResponse generateImageWithMultimodalAPI(ImageGenerationRequest request, 
                                                                   String apiKey, 
                                                                   String baseUrl, 
                                                                   String model) {
        try {
            String url = baseUrl + "/services/aigc/multimodal-generation/generation";
            
            log.info("[DashScopeAdapter] 使用multimodal-generation API - URL: {}, Model: {}, Prompt: {}", 
                url, model, request.getPrompt());
            
            // 构建请求体（multimodal-generation API 格式）
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            // 构建 input.messages 格式
            Map<String, Object> textContent = new HashMap<>();
            textContent.put("text", request.getPrompt());
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", Arrays.asList(textContent));
            
            Map<String, Object> input = new HashMap<>();
            input.put("messages", Arrays.asList(message));
            requestBody.put("input", input);
            
            // 构建参数
            Map<String, Object> parameters = new HashMap<>();
            
            // qwen-image-plus 只支持固定尺寸：1664*928, 1472*1140, 1328*1328, 1140*1472, 928*1664
            String[] allowedSizes = {"1664*928", "1472*1140", "1328*1328", "1140*1472", "928*1664"};
            String selectedSize = "1328*1328"; // 默认尺寸
            
            if (request.getWidth() != null && request.getHeight() != null) {
                // 如果指定了具体尺寸，检查是否在允许列表中
                String requestedSize = request.getWidth() + "*" + request.getHeight();
                boolean isValid = false;
                for (String size : allowedSizes) {
                    if (size.equals(requestedSize)) {
                        isValid = true;
                        selectedSize = requestedSize;
                        break;
                    }
                }
                if (!isValid) {
                    log.warn("[DashScopeAdapter] qwen-image-plus不支持的尺寸: {}, 将使用默认尺寸: 1328*1328", requestedSize);
                }
            } else if (request.getAspectRatio() != null) {
                // 根据宽高比映射到最接近的允许尺寸
                selectedSize = mapAspectRatioToAllowedSize(request.getAspectRatio(), allowedSizes);
                log.debug("[DashScopeAdapter] 宽高比 {} 映射到尺寸: {}", request.getAspectRatio(), selectedSize);
            }
            
            parameters.put("size", selectedSize);
            
            if (request.getNegativePrompt() != null && !request.getNegativePrompt().isEmpty()) {
                parameters.put("negative_prompt", request.getNegativePrompt());
            } else {
                parameters.put("negative_prompt", "");
            }
            
            // 多模态生成API特有参数
            parameters.put("prompt_extend", true); // 启用提示词扩展
            parameters.put("watermark", false); // 不添加水印
            
            requestBody.put("parameters", parameters);
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("[DashScopeAdapter] multimodal-generation请求 - URL: {}, Model: {}, RequestBody: {}", 
                url, model, objectMapper.writeValueAsString(requestBody));
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            log.info("[DashScopeAdapter] multimodal-generation响应 - Status: {}, Body: {}", 
                response.getStatusCode(), 
                response.getBody() != null ? response.getBody().toString() : "null");
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorMsg = response.getBody() != null 
                    ? response.getBody().toString() 
                    : "HTTP " + response.getStatusCode();
                log.error("[DashScopeAdapter] multimodal-generation API调用失败 - Status: {}, Error: {}", 
                    response.getStatusCode(), errorMsg);
                throw new AIServiceException("DashScope图片生成API调用失败: " + errorMsg);
            }
            
            JsonNode responseBody = response.getBody();
            if (responseBody == null) {
                throw new AIServiceException("DashScope图片生成API返回空响应");
            }
            
            // 解析响应（multimodal-generation 格式）
            return parseMultimodalImageResponse(responseBody, request, model, apiKey, baseUrl);
            
        } catch (Exception e) {
            log.error("[DashScopeAdapter] multimodal-generation图片生成失败", e);
            throw new AIServiceException("DashScope图片生成失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解析 multimodal-generation API 的响应（适用于 qwen-image-plus）
     */
    private ImageGenerationResponse parseMultimodalImageResponse(JsonNode response, 
                                                                 ImageGenerationRequest request, 
                                                                 String model,
                                                                 String apiKey,
                                                                 String baseUrl) {
        ImageGenerationResponse result = new ImageGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(model);
        
        try {
            List<ImageGenerationResponse.Image> images = new ArrayList<>();
            
            // multimodal-generation API 可能返回 task_id（异步模式）或直接返回结果（同步模式）
            if (response.has("output")) {
                JsonNode output = response.get("output");
                
                // 检查是否有 task_id（异步模式）
                if (output.has("task_id")) {
                    String taskId = output.get("task_id").asText();
                    log.info("[DashScopeAdapter] multimodal-generation任务ID: {}", taskId);
                    
                    // 轮询获取结果（最多30次，每次间隔2秒）
                    String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                        ? request.getBaseUrl() 
                        : baseUrl;
                    String resultUrl = effectiveBaseUrl + "/tasks/" + taskId;
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("Authorization", "Bearer " + apiKey);
                    
                    for (int i = 0; i < 30; i++) {
                        try {
                            Thread.sleep(2000); // 等待2秒
                            
                            HttpEntity<String> entity = new HttpEntity<>(headers);
                            ResponseEntity<JsonNode> taskResponse = restTemplate.exchange(
                                resultUrl, HttpMethod.GET, entity, JsonNode.class
                            );
                            
                            if (taskResponse.getStatusCode().is2xxSuccessful()) {
                                JsonNode taskBody = taskResponse.getBody();
                                if (taskBody == null) {
                                    log.warn("[DashScopeAdapter] multimodal-generation任务查询返回空响应，继续轮询");
                                    continue;
                                }
                                
                                log.debug("[DashScopeAdapter] multimodal-generation任务查询响应 (第{}次): {}", i + 1, taskBody.toString());
                                
                                // 检查任务状态
                                // multimodal-generation API的任务响应格式可能是：
                                // 1. task.task.status (标准格式)
                                // 2. output.status (直接格式)
                                // 3. status (最外层格式)
                                String status = null;
                                JsonNode taskOutput = null;
                                
                                if (taskBody.has("task") && taskBody.get("task").has("status")) {
                                    // 标准格式：task.task.status
                                    status = taskBody.get("task").get("status").asText();
                                    taskOutput = taskBody.get("output");
                                    log.debug("[DashScopeAdapter] 使用标准格式 - status={}, hasOutput={}", status, taskOutput != null);
                                } else if (taskBody.has("output") && taskBody.get("output").has("status")) {
                                    // 输出中直接包含状态
                                    taskOutput = taskBody.get("output");
                                    status = taskOutput.get("status").asText();
                                    log.debug("[DashScopeAdapter] 使用output格式 - status={}", status);
                                } else if (taskBody.has("status")) {
                                    // 最外层状态
                                    status = taskBody.get("status").asText();
                                    taskOutput = taskBody.has("output") ? taskBody.get("output") : null;
                                    log.debug("[DashScopeAdapter] 使用外层格式 - status={}, hasOutput={}", status, taskOutput != null);
                                }
                                
                                if (status != null) {
                                    if ("SUCCEEDED".equals(status) || "SUCCESS".equals(status)) {
                                        // 任务成功，获取图片
                                        if (taskOutput != null) {
                                            images = extractImagesFromMultimodalOutput(taskOutput);
                                            log.info("[DashScopeAdapter] multimodal-generation任务成功，提取到{}张图片", images.size());
                                        } else {
                                            // 尝试从整个响应中提取
                                            images = extractImagesFromMultimodalOutput(taskBody);
                                            log.info("[DashScopeAdapter] multimodal-generation任务成功，从响应根提取到{}张图片", images.size());
                                        }
                                        if (!images.isEmpty()) {
                                            break;
                                        } else {
                                            log.warn("[DashScopeAdapter] 任务状态为成功但未找到图片，响应: {}", taskBody.toString());
                                        }
                                    } else if ("FAILED".equals(status) || "ERROR".equals(status)) {
                                        String errorMsg = taskBody.has("message") 
                                            ? taskBody.get("message").asText() 
                                            : (taskBody.has("output") && taskBody.get("output").has("message")
                                                ? taskBody.get("output").get("message").asText()
                                                : "任务失败");
                                        log.error("[DashScopeAdapter] multimodal-generation任务失败 - status={}, message={}", status, errorMsg);
                                        throw new AIServiceException("DashScope图片生成任务失败: " + errorMsg);
                                    } else {
                                        // PENDING, RUNNING 或其他进行中状态，继续轮询
                                        log.debug("[DashScopeAdapter] multimodal-generation任务进行中 - status={}", status);
                                    }
                                } else {
                                    log.warn("[DashScopeAdapter] 无法识别任务状态格式，响应: {}", taskBody.toString());
                                    // 尝试直接从响应中提取图片（可能是同步响应）
                                    images = extractImagesFromMultimodalOutput(taskBody);
                                    if (!images.isEmpty()) {
                                        log.info("[DashScopeAdapter] 从未知格式响应中提取到{}张图片", images.size());
                                        break;
                                    }
                                }
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            throw new AIServiceException("轮询任务结果被中断");
                        }
                    }
                    
                    if (images.isEmpty()) {
                        throw new AIServiceException("DashScope图片生成超时，未获取到结果");
                    }
                } else {
                    // 同步模式：直接返回结果
                    images = extractImagesFromMultimodalOutput(output);
                }
            }
            
            result.setImages(images);
            
            ImageGenerationResponse.Usage usage = new ImageGenerationResponse.Usage();
            usage.setImagesGenerated(images.size());
            result.setUsage(usage);
            
        } catch (Exception e) {
            log.warn("[DashScopeAdapter] 解析multimodal-generation响应失败", e);
            result.setImages(new ArrayList<>());
        }
        
        return result;
    }
    
    /**
     * 从 multimodal-generation API 的 output 中提取图片
     */
    private List<ImageGenerationResponse.Image> extractImagesFromMultimodalOutput(JsonNode output) {
        List<ImageGenerationResponse.Image> images = new ArrayList<>();
        
        try {
            // multimodal-generation 响应格式：
            // output.choices[0].message.content[] 或 output.results[]
            if (output.has("choices") && output.get("choices").isArray()) {
                JsonNode choices = output.get("choices");
                if (choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                        JsonNode content = firstChoice.get("message").get("content");
                        if (content.isArray()) {
                            for (JsonNode item : content) {
                                if (item.has("image")) {
                                    String imageUrl = item.get("image").asText();
                                    ImageGenerationResponse.Image image = new ImageGenerationResponse.Image();
                                    image.setUrl(imageUrl);
                                    images.add(image);
                                }
                            }
                        }
                    }
                }
            } else if (output.has("results") && output.get("results").isArray()) {
                // 备用格式：results 数组
                JsonNode results = output.get("results");
                for (JsonNode item : results) {
                    if (item.has("url")) {
                        ImageGenerationResponse.Image image = new ImageGenerationResponse.Image();
                        image.setUrl(item.get("url").asText());
                        images.add(image);
                    } else if (item.has("image")) {
                        ImageGenerationResponse.Image image = new ImageGenerationResponse.Image();
                        image.setUrl(item.get("image").asText());
                        images.add(image);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[DashScopeAdapter] 提取multimodal-generation图片失败", e);
        }
        
        return images;
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
     * 优先级：请求中的API key（从数据库配置获取）> 配置文件
     */
    private String getApiKey(TextGenerationRequest request) {
        // 优先从请求中获取 API key（由 AIServiceImpl 从数据库配置注入）
        if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
            log.debug("[DashScopeAdapter] 使用请求中的 API key（从数据库配置获取）");
            return request.getApiKey();
        }
        // 否则使用配置文件中的默认 API key
        return defaultApiKey;
    }
    
    private String getApiKey(ImageGenerationRequest request) {
        // 优先从请求中获取 API key（由 AIServiceImpl 从数据库配置注入）
        if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
            log.debug("[DashScopeAdapter] 使用请求中的 API key（从数据库配置获取）(image)");
            return request.getApiKey();
        }
        // 否则使用配置文件中的默认 API key
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
    
    /**
     * 将宽高比映射到 qwen-image-plus 允许的尺寸
     * 允许的尺寸：1664*928 (16:9), 1472*1140 (4:3), 1328*1328 (1:1), 1140*1472 (3:4), 928*1664 (9:16)
     */
    private String mapAspectRatioToAllowedSize(String aspectRatio, String[] allowedSizes) {
        try {
            String[] ratio = aspectRatio.split(":");
            if (ratio.length == 2) {
                double widthRatio = Double.parseDouble(ratio[0]);
                double heightRatio = Double.parseDouble(ratio[1]);
                double aspect = widthRatio / heightRatio;
                
                double minDiff = Double.MAX_VALUE;
                String bestMatch = "1328*1328"; // 默认
                
                for (String size : allowedSizes) {
                    String[] dims = size.split("\\*");
                    if (dims.length == 2) {
                        double sizeAspect = Double.parseDouble(dims[0]) / Double.parseDouble(dims[1]);
                        double diff = Math.abs(aspect - sizeAspect);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestMatch = size;
                        }
                    }
                }
                
                log.debug("[DashScopeAdapter] 宽高比 {} (比例: {}) 映射到尺寸: {}", aspectRatio, aspect, bestMatch);
                return bestMatch;
            }
        } catch (Exception e) {
            log.warn("[DashScopeAdapter] 解析宽高比失败: {}, 使用默认尺寸", aspectRatio, e);
        }
        
        return "1328*1328"; // 默认尺寸
    }
}
