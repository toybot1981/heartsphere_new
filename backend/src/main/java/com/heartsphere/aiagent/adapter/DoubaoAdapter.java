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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 豆包（字节跳动）适配器实现
 * 通过 HTTP 调用豆包 API
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DoubaoAdapter implements ModelAdapter {
    
    @Value("${spring.ai.doubao.api-key:}")
    private String defaultApiKey;
    
    @Value("${spring.ai.doubao.base-url:https://ark.cn-beijing.volces.com/api/v3}")
    private String baseUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    
    // 可选：注入 ModelConfigService 以从数据库读取 API key
    // private final com.heartsphere.admin.service.AIModelConfigService modelConfigService;
    
    // 支持的文本模型
    private static final List<String> TEXT_MODELS = Arrays.asList(
        "doubao-1-5-pro-32k-250115",  // 最新Pro 32K模型（推荐）
        "doubao-pro-4k", 
        "doubao-lite-4k", 
        "doubao-pro-32k", 
        "doubao-lite-32k"
    );
    
    // 支持的图片模型（数据库中的模型名称）
    private static final List<String> IMAGE_MODELS = Arrays.asList(
        "Doubao-Seedream-4.5",
        "Doubao-Seedream-4.0",
        "Doubao-Seedream-3.0-t2i"
    );
    
    /**
     * 将数据库中的模型名称映射为API需要的模型名称
     */
    private String mapModelNameToApiFormat(String modelName) {
        if (modelName == null || modelName.isEmpty()) {
            return "doubao-seedream-4-5-251128"; // 默认模型
        }
        
        // 将数据库模型名称映射为API格式
        // Doubao-Seedream-4.5 -> doubao-seedream-4-5-251128
        if ("Doubao-Seedream-4.5".equals(modelName)) {
            return "doubao-seedream-4-5-251128";
        } else if ("Doubao-Seedream-4.0".equals(modelName)) {
            return "doubao-seedream-4-0"; // 根据实际API文档调整
        } else if ("Doubao-Seedream-3.0-t2i".equals(modelName)) {
            return "doubao-seedream-3-0-t2i"; // 根据实际API文档调整
        }
        
        // 如果已经是API格式（全小写，使用连字符），直接返回
        // 否则转换为小写并使用连字符
        return modelName.toLowerCase().replace("_", "-").replace(".", "-");
    }
    
    @Override
    public String getProviderType() {
        return "doubao";
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
        return false; // 豆包暂不支持 TTS
    }
    
    @Override
    public boolean supportsSpeechToText() {
        return false; // 豆包暂不支持 STT
    }
    
    @Override
    public boolean supportsVideoGeneration() {
        return false; // 豆包暂不支持视频生成
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            log.debug("豆包文本生成请求: model={}, prompt={}", request.getModel(), request.getPrompt());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("豆包 API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[DoubaoAdapter] 使用baseUrl: {}", effectiveBaseUrl);
            
            String url = effectiveBaseUrl + "/chat/completions";
            
            // 构建请求体
            Map<String, Object> requestBody = buildDoubaoRequest(request);
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 记录请求详情（不记录完整的API key，只记录前4位和后4位）
            String apiKeyMasked = apiKey.length() > 8 
                ? apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length() - 4)
                : "****";
            log.info("[DoubaoAdapter] 发送请求 - URL: {}, Model: {}, MessagesCount: {}, APIKey: {}", 
                url, requestBody.get("model"), ((List<?>) requestBody.get("messages")).size(), apiKeyMasked);
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            log.info("[DoubaoAdapter] 收到响应 - Status: {}, HasBody: {}", 
                response.getStatusCode(), response.getBody() != null);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                String errorBody = response.getBody() != null ? response.getBody().toString() : "无响应体";
                log.error("[DoubaoAdapter] API调用失败 - Status: {}, Body: {}", response.getStatusCode(), errorBody);
                throw new AIServiceException("豆包 API 调用失败: " + response.getStatusCode() + " - " + errorBody);
            }
            
            // 解析响应
            return parseDoubaoResponse(response.getBody(), request);
            
        } catch (Exception e) {
            log.error("豆包文本生成失败", e);
            throw new AIServiceException("豆包文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void generateTextStream(TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.info("[DoubaoAdapter] 开始流式文本生成 - provider={}, model={}, hasPrompt={}, hasMessages={}", 
                getProviderType(), 
                request.getModel(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null);
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                handler.handle(null, true);
                throw new AIServiceException("豆包 API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[DoubaoAdapter] 流式请求使用baseUrl: {}", effectiveBaseUrl);
            
            String url = effectiveBaseUrl + "/chat/completions";
            
            // 构建请求体（设置 stream=true，OpenAPI 兼容格式）
            Map<String, Object> requestBody = buildDoubaoRequest(request);
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
            final boolean[] isCompleted = {false}; // 标记是否已完成
            
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
                                log.info("[DoubaoAdapter] 收到完成信号");
                                if (!isCompleted[0]) {
                                    isCompleted[0] = true;
                                    TextGenerationResponse finalResponse = new TextGenerationResponse();
                                    finalResponse.setProvider(getProviderType());
                                    finalResponse.setModel(request.getModel() != null ? request.getModel() : "doubao-1-5-pro-32k-250115");
                                    handler.handle(finalResponse, true);
                                } else {
                                    log.debug("[DoubaoAdapter] 流式响应已完成，忽略[DONE]信号");
                                }
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
                                        if (content != null && !content.isEmpty()) {
                                            TextGenerationResponse chunk = new TextGenerationResponse();
                                            chunk.setProvider(getProviderType());
                                            chunk.setModel(request.getModel() != null ? request.getModel() : "doubao-1-5-pro-32k-250115");
                                            chunk.setContent(content);
                                            chunkCount[0]++;
                                            if (chunkCount[0] <= 5 || chunkCount[0] % 10 == 0) {
                                                log.info("[DoubaoAdapter] 流式响应 - chunkCount={}, contentLength={}, content={}", 
                                                    chunkCount[0], content.length(), 
                                                    content.length() > 50 ? content.substring(0, 50) + "..." : content);
                                            }
                                            handler.handle(chunk, false);
                                        }
                                    }
                                    
                                    // 检查是否完成
                                    if (choice.has("finish_reason") && choice.get("finish_reason") != null) {
                                        String finishReason = choice.get("finish_reason").asText();
                                        if (finishReason != null && !finishReason.isEmpty() && !"null".equals(finishReason)) {
                                            log.info("[DoubaoAdapter] 流式响应完成 - finishReason={}, chunkCount={}", finishReason, chunkCount[0]);
                                            
                                            // 提取 Token 使用量
                                            TextGenerationResponse finalResponse = new TextGenerationResponse();
                                            finalResponse.setProvider(getProviderType());
                                            finalResponse.setModel(request.getModel() != null ? request.getModel() : "doubao-1-5-pro-32k-250115");
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
                                            
                                            if (!isCompleted[0]) {
                                                isCompleted[0] = true;
                                                handler.handle(finalResponse, true);
                                            } else {
                                                log.debug("[DoubaoAdapter] 流式响应已完成，忽略重复的完成信号");
                                            }
                                        }
                                    }
                                }
                            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                                log.warn("[DoubaoAdapter] 解析JSON失败: {} - jsonStr: {}", e.getMessage(), 
                                    jsonStr.length() > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr);
                            }
                        }
                    } catch (Exception e) {
                        log.warn("[DoubaoAdapter] 解析SSE数据失败: {} - line: {}", e.getMessage(), 
                            line.length() > 100 ? line.substring(0, 100) : line);
                    }
                },
                error -> {
                    log.error("[DoubaoAdapter] 流式响应错误", error);
                    handler.handle(null, true);
                },
                () -> {
                    log.info("[DoubaoAdapter] 流式响应完成 - 总chunks={}, isCompleted={}", chunkCount[0], isCompleted[0]);
                    // 如果流完成但没有收到done信号，发送一个完成信号
                    if (!isCompleted[0]) {
                        if (chunkCount[0] > 0) {
                            isCompleted[0] = true;
                            TextGenerationResponse finalResponse = new TextGenerationResponse();
                            finalResponse.setProvider(getProviderType());
                            finalResponse.setModel(request.getModel() != null ? request.getModel() : "doubao-1-5-pro-32k-250115");
                            handler.handle(finalResponse, true);
                        } else {
                            log.warn("[DoubaoAdapter] 流式响应中没有找到有效内容");
                            isCompleted[0] = true;
                            handler.handle(null, true);
                        }
                    } else {
                        log.debug("[DoubaoAdapter] 流式响应已完成，忽略完成回调中的重复完成信号");
                    }
                }
            );
            
        } catch (Exception e) {
            log.error("[DoubaoAdapter] 豆包流式文本生成失败", e);
            handler.handle(null, true);
        }
    }
    
    @Override
    public ImageGenerationResponse generateImage(ImageGenerationRequest request) {
        try {
            log.info("[DoubaoAdapter] 开始图片生成 - provider={}, model={}, prompt={}", 
                getProviderType(), request.getModel(), request.getPrompt());
            
            // 获取 API key
            String apiKey = getApiKey(request);
            if (apiKey == null || apiKey.isEmpty()) {
                throw new AIServiceException("豆包 API key 未配置");
            }
            
            // 优先使用请求中的 baseUrl（从配置表获取），如果没有则使用配置文件中的默认值
            String effectiveBaseUrl = (request.getBaseUrl() != null && !request.getBaseUrl().isEmpty()) 
                ? request.getBaseUrl() 
                : baseUrl;
            log.debug("[DoubaoAdapter] 使用baseUrl: {}", effectiveBaseUrl);
            
            // 火山引擎 Seedream 模型使用 /images/generations 端点（OpenAPI兼容格式）
            String url = effectiveBaseUrl + "/images/generations";
            
            // 判断模型类型，默认使用 Doubao-Seedream-4.5
            String modelName = request.getModel() != null ? request.getModel() : "Doubao-Seedream-4.5";
            // 将数据库模型名称映射为API格式（如：Doubao-Seedream-4.5 -> doubao-seedream-4-5-251128）
            String apiModelName = mapModelNameToApiFormat(modelName);
            
            log.info("[DoubaoAdapter] 豆包图片生成请求 - URL: {}, Model: {} (数据库: {}), Prompt: {}", 
                url, apiModelName, modelName, request.getPrompt());
            
            // 构建请求体（火山引擎 Seedream API 格式）
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", apiModelName);
            requestBody.put("prompt", request.getPrompt());
            
            // 生成图片数量（火山引擎API使用 n 参数）
            int numberOfImages = request.getNumberOfImages() != null && request.getNumberOfImages() > 0 
                ? request.getNumberOfImages() 
                : 1;
            requestBody.put("n", numberOfImages);
            
            // 设置尺寸（火山引擎要求至少 3686400 像素，约 1920x1920）
            // 注意：虽然API文档提到 "2K" 格式，但实际API可能要求具体像素值
            // 最小尺寸：sqrt(3686400) ≈ 1920，所以最小为 1920x1920
            if (request.getWidth() != null && request.getHeight() != null) {
                // 如果指定了具体宽高，使用像素格式
                int width = request.getWidth();
                int height = request.getHeight();
                // 确保满足最小像素要求（至少 3686400 像素）
                if (width * height < 3686400) {
                    // 按比例放大到满足最小要求
                    double scale = Math.sqrt(3686400.0 / (width * height));
                    width = (int) Math.ceil(width * scale);
                    height = (int) Math.ceil(height * scale);
                    log.debug("[DoubaoAdapter] 尺寸 {}x{} 不满足最小要求，调整为 {}x{}", 
                        request.getWidth(), request.getHeight(), width, height);
                }
                requestBody.put("size", width + "x" + height);
            } else if (request.getAspectRatio() != null) {
                // 根据宽高比映射到标准尺寸（确保满足最小像素要求）
                String size = mapAspectRatioToSize(request.getAspectRatio());
                requestBody.put("size", size);
                log.debug("[DoubaoAdapter] 宽高比 {} 映射到尺寸: {}", request.getAspectRatio(), size);
            } else {
                // 默认使用 1920x1920（满足最小像素要求：3686400）
                requestBody.put("size", "1920x1920");
            }
            
            // 负面提示词
            if (request.getNegativePrompt() != null && !request.getNegativePrompt().isEmpty()) {
                requestBody.put("negative_prompt", request.getNegativePrompt());
            }
            
            // 其他API参数（根据API文档）
            requestBody.put("sequential_image_generation", "disabled"); // 顺序生成，默认关闭
            requestBody.put("response_format", "url"); // 响应格式：url 或 b64_json
            requestBody.put("stream", false); // 图片生成不支持流式
            requestBody.put("watermark", true); // 默认添加水印
            
            // 发送请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("[DoubaoAdapter] 豆包图片生成请求体: {}", objectMapper.writeValueAsString(requestBody));
            
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, JsonNode.class
            );
            
            log.info("[DoubaoAdapter] 豆包图片生成响应 - Status: {}, Body: {}", 
                response.getStatusCode(), 
                response.getBody() != null ? response.getBody().toString() : "null");
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorMsg = response.getBody() != null 
                    ? response.getBody().toString() 
                    : "HTTP " + response.getStatusCode();
                log.error("[DoubaoAdapter] 豆包图片生成API调用失败 - Status: {}, Error: {}", 
                    response.getStatusCode(), errorMsg);
                throw new AIServiceException("豆包图片生成API调用失败: " + errorMsg);
            }
            
            JsonNode responseBody = response.getBody();
            if (responseBody == null) {
                throw new AIServiceException("豆包图片生成API返回空响应");
            }
            
            // 解析响应
            return parseImageResponse(responseBody, request);
            
        } catch (Exception e) {
            log.error("[DoubaoAdapter] 豆包图片生成失败", e);
            throw new AIServiceException("豆包图片生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public AudioResponse textToSpeech(AudioRequest request) {
        throw new AIServiceException("豆包 暂不支持文本转语音");
    }
    
    @Override
    public AudioResponse speechToText(AudioRequest request) {
        throw new AIServiceException("豆包 暂不支持语音转文本");
    }
    
    @Override
    public VideoGenerationResponse generateVideo(VideoGenerationRequest request) {
        throw new AIServiceException("豆包 暂不支持视频生成");
    }
    
    @Override
    public List<String> getSupportedModels(String capability) {
        switch (capability.toLowerCase()) {
            case "text":
                return TEXT_MODELS;
            case "image":
                return IMAGE_MODELS;
            default:
                return new ArrayList<>();
        }
    }
    
    /**
     * 获取 API key
     * 优先级：请求中的API key（从数据库配置获取）> 配置文件 > 环境变量
     */
    private String getApiKey(TextGenerationRequest request) {
        // 1. 优先从请求中获取 API key（由 AIServiceImpl 从数据库配置注入）
        if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
            log.debug("DoubaoAdapter: 使用请求中的 API key（从数据库配置获取）");
            return request.getApiKey();
        }
        
        // 2. 使用配置文件中的 API key
        if (defaultApiKey != null && !defaultApiKey.trim().isEmpty()) {
            log.debug("DoubaoAdapter: 使用配置文件中的 API key");
        return defaultApiKey;
        }
        
        // 3. 尝试从环境变量获取
        String envApiKey = System.getenv("DOUBAO_API_KEY");
        if (envApiKey != null && !envApiKey.trim().isEmpty()) {
            log.debug("DoubaoAdapter: 使用环境变量中的 API key");
            return envApiKey;
        }
        
        log.warn("DoubaoAdapter: 未找到 API key 配置，请检查数据库配置、配置文件或环境变量");
        return null;
    }
    
    private String getApiKey(ImageGenerationRequest request) {
        // 1. 优先从请求中获取 API key（由 AIServiceImpl 从数据库配置注入）
        if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
            log.debug("DoubaoAdapter: 使用请求中的 API key（从数据库配置获取）(image)");
            return request.getApiKey();
        }
        
        // 2. 使用配置文件中的 API key
        if (defaultApiKey != null && !defaultApiKey.trim().isEmpty()) {
            log.debug("DoubaoAdapter: 使用配置文件中的 API key (image)");
        return defaultApiKey;
        }
        
        // 3. 尝试从环境变量获取
        String envApiKey = System.getenv("DOUBAO_API_KEY");
        if (envApiKey != null && !envApiKey.trim().isEmpty()) {
            log.debug("DoubaoAdapter: 使用环境变量中的 API key (image)");
            return envApiKey;
        }
        
        log.warn("DoubaoAdapter: 未找到 API key 配置 (image)，请检查数据库配置、配置文件或环境变量");
        return null;
    }
    
    /**
     * 构建豆包 API 请求体（OpenAPI 兼容格式）
     */
    private Map<String, Object> buildDoubaoRequest(TextGenerationRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // 设置模型（默认使用最新的Pro 32K模型）
        String model = request.getModel() != null ? request.getModel() : "doubao-1-5-pro-32k-250115";
        requestBody.put("model", model);
        
        // 构建消息列表（OpenAPI 兼容格式）
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
        
        // 验证：确保至少有一个消息（OpenAPI要求）
        if (messages.isEmpty()) {
            log.error("[DoubaoAdapter] 请求中必须包含至少一个消息（systemInstruction、messages或prompt）");
            throw new AIServiceException("请求中必须包含至少一个消息（systemInstruction、messages或prompt）");
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
        
        log.debug("[DoubaoAdapter] 构建的请求体 - model={}, messagesCount={}, temperature={}, maxTokens={}", 
            model, messages.size(), requestBody.get("temperature"), requestBody.get("max_tokens"));
        
        return requestBody;
    }
    
    /**
     * 解析豆包 API 响应
     */
    private TextGenerationResponse parseDoubaoResponse(JsonNode response, TextGenerationRequest request) {
        TextGenerationResponse result = new TextGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "doubao-1-5-pro-32k-250115");
        
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
            log.warn("解析豆包响应失败", e);
            result.setContent("");
        }
        
        return result;
    }
    
    /**
     * 解析图片生成响应
     */
    private ImageGenerationResponse parseImageResponse(JsonNode response, ImageGenerationRequest request) {
        ImageGenerationResponse result = new ImageGenerationResponse();
        result.setProvider(getProviderType());
        result.setModel(request.getModel() != null ? request.getModel() : "Doubao-Seedream-4.5");
        
        try {
            List<ImageGenerationResponse.Image> images = new ArrayList<>();
            
            // 火山引擎 Seedream API 响应格式：data 数组中包含生成的图片
            if (response.has("data") && response.get("data").isArray()) {
                JsonNode dataArray = response.get("data");
                log.debug("[DoubaoAdapter] 解析图片响应，找到 {} 张图片", dataArray.size());
                
                for (JsonNode item : dataArray) {
                    ImageGenerationResponse.Image img = new ImageGenerationResponse.Image();
                    
                    // 优先使用 url 字段
                    if (item.has("url")) {
                        img.setUrl(item.get("url").asText());
                        log.debug("[DoubaoAdapter] 提取图片URL: {}", img.getUrl());
                    } 
                    // 如果返回 base64 编码的图片
                    else if (item.has("b64_json")) {
                        img.setUrl("data:image/png;base64," + item.get("b64_json").asText());
                        log.debug("[DoubaoAdapter] 提取Base64编码图片");
                    }
                    // 某些API可能直接返回图片数据在 image 字段
                    else if (item.has("image")) {
                        img.setUrl(item.get("image").asText());
                        log.debug("[DoubaoAdapter] 从image字段提取图片URL");
                    }
                    
                    if (img.getUrl() != null && !img.getUrl().isEmpty()) {
                    images.add(img);
                    }
                }
            } else {
                log.warn("[DoubaoAdapter] 响应中未找到data数组，响应内容: {}", response.toString());
            }
            
            result.setImages(images);
            
            ImageGenerationResponse.Usage usage = new ImageGenerationResponse.Usage();
            usage.setImagesGenerated(images.size());
            result.setUsage(usage);
            
            log.info("[DoubaoAdapter] 成功解析 {} 张图片", images.size());
            
        } catch (Exception e) {
            log.error("[DoubaoAdapter] 解析豆包图片响应失败", e);
            result.setImages(new ArrayList<>());
        }
        
        return result;
    }
    
    /**
     * 将宽高比映射到火山引擎API支持的尺寸格式
     * API要求至少 3686400 像素（约 1920x1920），因此所有尺寸都需要满足此要求
     */
    private String mapAspectRatioToSize(String aspectRatio) {
        try {
            String[] ratio = aspectRatio.split(":");
            if (ratio.length == 2) {
                double widthRatio = Double.parseDouble(ratio[0]);
                double heightRatio = Double.parseDouble(ratio[1]);
                double aspect = widthRatio / heightRatio;
                
                // 映射到常用尺寸（确保满足最小像素要求：至少 3686400 像素，约 1920x1920）
                // 注意：虽然API文档提到 "2K" 格式，但实际API可能要求具体像素值
                if (Math.abs(aspect - 1.0) < 0.1) {
                    // 1:1 - 使用 1920x1920（满足最小像素要求：3686400）
                    return "1920x1920";
                } else if (Math.abs(aspect - 4.0/3.0) < 0.1) {
                    // 4:3 - 使用 2217x1663（满足最小像素要求：2217*1663 = 3,686,871 > 3,686,400）
                    // 计算：height = ceil(sqrt(3686400 * 3/4)) ≈ 1663.8, 取整为 1663
                    //      width = ceil(1663 * 4/3) ≈ 2217.3, 取整为 2217
                    return "2217x1663";
                } else if (Math.abs(aspect - 3.0/4.0) < 0.1) {
                    // 3:4 - 使用 1663x2218（满足最小像素要求：1663*2218 = 3,688,534 > 3,686,400）
                    return "1663x2218";
                } else if (Math.abs(aspect - 16.0/9.0) < 0.1) {
                    // 16:9 - 使用 2560x1440（满足最小像素要求：3686400）
                    return "2560x1440";
                } else if (Math.abs(aspect - 9.0/16.0) < 0.1) {
                    // 9:16 - 使用 1440x2560（满足最小像素要求：3686400）
                    return "1440x2560";
                } else {
                    // 默认使用 1920x1920（满足最小像素要求）
                    log.debug("[DoubaoAdapter] 未匹配的宽高比: {}，使用默认尺寸 1920x1920", aspectRatio);
                    return "1920x1920";
                }
            }
        } catch (Exception e) {
            log.warn("[DoubaoAdapter] 解析宽高比失败: {}, 使用默认尺寸", aspectRatio, e);
        }
        
        return "1920x1920"; // 默认尺寸（满足最小像素要求：3686400）
    }
}

