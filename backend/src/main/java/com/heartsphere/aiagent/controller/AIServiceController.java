package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * AI服务控制器
 * 提供统一的AI服务REST API接口
 * 遵循OpenAPI规范，与客户端适配器接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "AI服务", description = "统一AI服务API，支持文本生成、图片生成、音频处理、视频生成")
public class AIServiceController {

    private final AIService aiService;

    /**
     * 文本生成（同步）
     * 
     * 接口格式与客户端适配器保持一致：
     * - 请求格式：TextGenerationRequest（与前端types.ts中的接口一致）
     * - 响应格式：TextGenerationResponse（与前端types.ts中的接口一致）
     */
    @Operation(
        summary = "文本生成",
        description = "生成文本内容，支持多模型提供商（gemini、openai、qwen、doubao）。接口格式与客户端适配器保持一致。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "生成成功",
            content = @Content(schema = @Schema(implementation = TextGenerationResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "请求参数错误"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "未授权"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "服务器内部错误"
        )
    })
    @PostMapping("/text/generate")
    public ResponseEntity<ApiResponse<TextGenerationResponse>> generateText(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "文本生成请求，格式与客户端适配器接口一致",
                required = true,
                content = @Content(schema = @Schema(implementation = TextGenerationRequest.class))
            )
            @RequestBody TextGenerationRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            TextGenerationResponse response = aiService.generateText(userId, request);
            return ResponseEntity.ok(ApiResponse.success("文本生成成功", response));
        } catch (IllegalArgumentException e) {
            log.error("文本生成请求参数错误", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            log.error("文本生成失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "文本生成失败: " + e.getMessage()));
        }
    }

    /**
     * 流式文本生成（Server-Sent Events）
     * 
     * 接口格式与客户端适配器保持一致：
     * - 请求格式：TextGenerationRequest（stream=true）
     * - 响应格式：SSE流，每个chunk格式为 {"content": "...", "done": false}
     */
    @Operation(
        summary = "流式文本生成",
        description = "流式生成文本内容，使用Server-Sent Events (SSE)协议。接口格式与客户端适配器保持一致。"
    )
    @PostMapping(value = "/text/generate/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generateTextStream(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "文本生成请求（stream=true）",
                required = true,
                content = @Content(schema = @Schema(implementation = TextGenerationRequest.class))
            )
            @RequestBody TextGenerationRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        try {
            Long userId = getCurrentUserId(authentication);
            log.info("[AIServiceController] /text/generate/stream - 收到流式文本生成请求 - userId={}, provider={}, model={}, stream={}, hasPrompt={}, hasMessages={}, messagesCount={}", 
                userId, 
                request.getProvider(), 
                request.getModel(), 
                request.getStream(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0);
            log.info("[AIServiceController] /text/generate/stream - 创建SseEmitter，准备返回给客户端");
            log.debug("[AIServiceController] 请求详情 - prompt={}, systemInstruction={}, temperature={}, maxTokens={}", 
                request.getPrompt(), 
                request.getSystemInstruction(), 
                request.getTemperature(), 
                request.getMaxTokens());
            
            // 设置emitter的错误回调
            emitter.onError((error) -> {
                log.error("[AIServiceController] SSE连接错误 - userId={}", userId, error);
            });
            
            emitter.onTimeout(() -> {
                log.error("[AIServiceController] SSE连接超时 - userId={}", userId);
            });
            
            emitter.onCompletion(() -> {
                log.info("[AIServiceController] SSE连接完成 - userId={}", userId);
            });
            
            // 异步处理流式响应
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("[AIServiceController] 开始调用AIService.generateTextStream - userId={}", userId);
                    final String responseId = "chatcmpl-" + UUID.randomUUID().toString().substring(0, 8);
                    final String model = request.getModel() != null ? request.getModel() : "unknown";
                    final int[] chunkCounter = {0};
                    
                    aiService.generateTextStream(userId, request, (response, done) -> {
                        try {
                            chunkCounter[0]++;
                            log.info("[AIServiceController] /text/generate/stream - handler回调 - chunkCounter={}, hasResponse={}, hasContent={}, contentLength={}, done={}", 
                                chunkCounter[0],
                                response != null,
                                response != null && response.getContent() != null,
                                response != null && response.getContent() != null ? response.getContent().length() : 0,
                                done);
                            
                            if (response != null && response.getContent() != null) {
                                // 发送OpenAPI兼容格式的数据块（与/v1/chat/completions保持一致）
                                String content = escapeJson(response.getContent());
                                String data = String.format(
                                    "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"%s\"},\"finish_reason\":null}]}",
                                    responseId,
                                    System.currentTimeMillis() / 1000,
                                    model,
                                    content
                                );
                                if (chunkCounter[0] <= 5 || chunkCounter[0] % 10 == 0) {
                                    log.info("[AIServiceController] /text/generate/stream - 发送内容chunk #{} - contentLength={}", 
                                        chunkCounter[0], content.length());
                                }
                                try {
                                    emitter.send(SseEmitter.event().data(data));
                                } catch (IOException e) {
                                    log.error("[AIServiceController] /text/generate/stream - 发送SSE数据失败", e);
                                    throw e;
                                }
                            }
                            
                            if (done) {
                                log.info("[AIServiceController] /text/generate/stream - 流式响应完成 - 总chunks={}, hasResponse={}, hasUsage={}", 
                                    chunkCounter[0], response != null, response != null && response.getUsage() != null);
                                
                                // 如果response为null，说明发生了错误
                                if (response == null) {
                                    log.warn("[AIServiceController] /text/generate/stream - 收到null响应，可能发生了错误");
                                    try {
                                        // 发送错误信息（OpenAPI格式）
                                        String errorData = String.format(
                                            "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"error\":{\"message\":\"AI服务调用失败，可能是网络连接问题或DNS解析失败。请稍后重试或联系管理员。\",\"type\":\"server_error\"}}",
                                            responseId,
                                            System.currentTimeMillis() / 1000,
                                            model
                                        );
                                        emitter.send(SseEmitter.event().data(errorData));
                                    } catch (IllegalStateException e) {
                                        log.warn("[AIServiceController] /text/generate/stream - emitter已完成，无法发送错误信息: {}", e.getMessage());
                                    } catch (Exception e) {
                                        log.error("[AIServiceController] /text/generate/stream - 发送错误信息失败", e);
                                    }
                                } else {
                                    try {
                                        // 发送完成信号（OpenAPI格式）
                                        if (response.getUsage() != null) {
                                            String usageJson = String.format(
                                                "{\"prompt_tokens\":%d,\"completion_tokens\":%d,\"total_tokens\":%d}",
                                                response.getUsage().getInputTokens() != null ? response.getUsage().getInputTokens() : 0,
                                                response.getUsage().getOutputTokens() != null ? response.getUsage().getOutputTokens() : 0,
                                                response.getUsage().getTotalTokens() != null ? response.getUsage().getTotalTokens() : 0
                                            );
                                            String finalData = String.format(
                                                "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":%s}",
                                                responseId,
                                                System.currentTimeMillis() / 1000,
                                                model,
                                                usageJson
                                            );
                                            emitter.send(SseEmitter.event().data(finalData));
                                        } else {
                                            String finalData = String.format(
                                                "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}]}",
                                                responseId,
                                                System.currentTimeMillis() / 1000,
                                                model
                                            );
                                            emitter.send(SseEmitter.event().data(finalData));
                                        }
                                        // 完成SSE连接
                                        emitter.complete();
                                        log.info("[AIServiceController] /text/generate/stream - SSE流式响应完成");
                                    } catch (IllegalStateException e) {
                                        log.debug("[AIServiceController] /text/generate/stream - emitter已完成，无需再次发送完成信号: {}", e.getMessage());
                                    } catch (Exception e) {
                                        log.error("[AIServiceController] /text/generate/stream - 发送完成信号失败", e);
                                        try {
                                            emitter.complete();
                                        } catch (Exception ex) {
                                            log.debug("[AIServiceController] /text/generate/stream - 完成SSE连接失败（可能已完成）: {}", ex.getMessage());
                                        }
                                    }
                                }
                            }
                        } catch (IOException e) {
                            log.error("[AIServiceController] 发送SSE数据失败 - userId={}", userId, e);
                            emitter.completeWithError(e);
                        }
                    });
                } catch (Exception e) {
                    log.error("[AIServiceController] 流式文本生成失败 - userId={}, provider={}, model={}", 
                        userId, request.getProvider(), request.getModel(), e);
                    try {
                        String errorMessage = e.getMessage() != null ? e.getMessage() : "流式文本生成失败";
                        // 获取根本原因
                        Throwable cause = e.getCause();
                        if (cause != null) {
                            String causeMessage = cause.getMessage();
                            if (causeMessage != null && !causeMessage.isEmpty()) {
                                errorMessage = causeMessage;
                            }
                        }
                        log.error("[AIServiceController] 发送错误信息给前端 - errorMessage={}", errorMessage);
                        emitter.send(SseEmitter.event()
                                .data("{\"error\":\"" + escapeJson(errorMessage) + "\",\"done\":true}"));
                        emitter.complete();
                    } catch (IOException ex) {
                        log.error("[AIServiceController] 发送错误信息失败", ex);
                        emitter.completeWithError(ex);
                    }
                }
            });
            
        } catch (Exception e) {
            log.error("创建流式响应失败", e);
            emitter.completeWithError(e);
        }
        
        return emitter;
    }

    /**
     * 图片生成
     * 
     * 接口格式与客户端适配器保持一致：
     * - 请求格式：ImageGenerationRequest（与前端types.ts中的接口一致）
     * - 响应格式：ImageGenerationResponse（与前端types.ts中的接口一致）
     */
    @Operation(
        summary = "图片生成",
        description = "生成图片，支持多模型提供商。接口格式与客户端适配器保持一致。"
    )
    @PostMapping("/image/generate")
    public ResponseEntity<ApiResponse<ImageGenerationResponse>> generateImage(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "图片生成请求，格式与客户端适配器接口一致",
                required = true,
                content = @Content(schema = @Schema(implementation = ImageGenerationRequest.class))
            )
            @RequestBody ImageGenerationRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            ImageGenerationResponse response = aiService.generateImage(userId, request);
            return ResponseEntity.ok(ApiResponse.success("图片生成成功", response));
        } catch (IllegalArgumentException e) {
            log.error("图片生成请求参数错误", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            log.error("图片生成失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "图片生成失败: " + e.getMessage()));
        }
    }

    /**
     * 文本转语音
     */
    @Operation(summary = "文本转语音", description = "将文本转换为语音")
    @PostMapping("/audio/tts")
    public ResponseEntity<ApiResponse<AudioResponse>> textToSpeech(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "文本转语音请求",
                required = true,
                content = @Content(schema = @Schema(implementation = AudioRequest.class))
            )
            @RequestBody AudioRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            AudioResponse response = aiService.textToSpeech(userId, request);
            return ResponseEntity.ok(ApiResponse.success("文本转语音成功", response));
        } catch (IllegalArgumentException e) {
            log.error("文本转语音请求参数错误", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            log.error("文本转语音失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "文本转语音失败: " + e.getMessage()));
        }
    }

    /**
     * 语音转文本
     */
    @Operation(summary = "语音转文本", description = "将语音转换为文本")
    @PostMapping("/audio/stt")
    public ResponseEntity<ApiResponse<AudioResponse>> speechToText(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "语音转文本请求",
                required = true,
                content = @Content(schema = @Schema(implementation = AudioRequest.class))
            )
            @RequestBody AudioRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            AudioResponse response = aiService.speechToText(userId, request);
            return ResponseEntity.ok(ApiResponse.success("语音转文本成功", response));
        } catch (IllegalArgumentException e) {
            log.error("语音转文本请求参数错误", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            log.error("语音转文本失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "语音转文本失败: " + e.getMessage()));
        }
    }

    /**
     * 视频生成
     */
    @Operation(summary = "视频生成", description = "生成视频内容")
    @PostMapping("/video/generate")
    public ResponseEntity<ApiResponse<VideoGenerationResponse>> generateVideo(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "视频生成请求",
                required = true,
                content = @Content(schema = @Schema(implementation = VideoGenerationRequest.class))
            )
            @RequestBody VideoGenerationRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            VideoGenerationResponse response = aiService.generateVideo(userId, request);
            return ResponseEntity.ok(ApiResponse.success("视频生成成功", response));
        } catch (IllegalArgumentException e) {
            log.error("视频生成请求参数错误", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            log.error("视频生成失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "视频生成失败: " + e.getMessage()));
        }
    }

    /**
     * 获取用户配置
     */
    @Operation(summary = "获取用户AI配置", description = "获取当前用户的AI服务配置")
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Object>> getConfig(
            @Parameter(hidden = true) Authentication authentication) {
        try {
            getCurrentUserId(authentication);
            // TODO: 实现配置获取逻辑
            return ResponseEntity.ok(ApiResponse.success("获取配置成功", null));
        } catch (Exception e) {
            log.error("获取配置失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "获取配置失败: " + e.getMessage()));
        }
    }

    /**
     * 更新用户配置
     */
    @Operation(summary = "更新用户AI配置", description = "更新当前用户的AI服务配置")
    @PutMapping("/config")
    public ResponseEntity<ApiResponse<Object>> updateConfig(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "用户配置",
                required = true
            )
            @RequestBody Object config,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            getCurrentUserId(authentication);
            // TODO: 实现配置更新逻辑
            return ResponseEntity.ok(ApiResponse.success("更新配置成功", null));
        } catch (Exception e) {
            log.error("更新配置失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "更新配置失败: " + e.getMessage()));
        }
    }

    /**
     * 从Authentication中获取用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("未授权：请重新登录");
        }
        
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new IllegalArgumentException("未授权：请重新登录");
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    /**
     * OpenAPI兼容的聊天完成接口
     * 格式与OpenAI/Qwen/Doubao的/chat/completions接口保持一致
     * 
     * 请求格式：
     * {
     *   "model": "gemini-2.0-flash-exp",
     *   "messages": [{"role": "user", "content": "你好"}],
     *   "temperature": 0.7,
     *   "max_tokens": 2048,
     *   "stream": false
     * }
     * 
     * 响应格式：
     * {
     *   "id": "chatcmpl-123",
     *   "object": "chat.completion",
     *   "created": 1677652288,
     *   "model": "gemini-2.0-flash-exp",
     *   "choices": [{
     *     "index": 0,
     *     "message": {"role": "assistant", "content": "你好！"},
     *     "finish_reason": "stop"
     *   }],
     *   "usage": {
     *     "prompt_tokens": 100,
     *     "completion_tokens": 200,
     *     "total_tokens": 300
     *   }
     * }
     */
    @Operation(
        summary = "OpenAPI兼容的聊天完成接口",
        description = "提供与OpenAI/Qwen/Doubao兼容的/chat/completions接口格式，与gemini.ts中的调用方式保持一致"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "生成成功",
            content = @Content(schema = @Schema(implementation = ChatCompletionResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "请求参数错误"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "未授权"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "服务器内部错误"
        )
    })
    @PostMapping(value = "/v1/chat/completions")
    public Object chatCompletions(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "OpenAPI兼容的聊天完成请求，格式与OpenAI/Qwen/Doubao一致",
                required = true,
                content = @Content(schema = @Schema(implementation = ChatCompletionRequest.class))
            )
            @RequestBody ChatCompletionRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            
            // 如果stream=true，返回流式响应
            if (Boolean.TRUE.equals(request.getStream())) {
                return chatCompletionsStreamInternal(request, userId);
            }
            
            // 转换为内部TextGenerationRequest格式
            TextGenerationRequest internalRequest = convertToInternalRequest(request);
            
            // 调用内部服务
            TextGenerationResponse internalResponse = aiService.generateText(userId, internalRequest);
            
            // 转换为OpenAPI兼容的响应格式
            ChatCompletionResponse response = convertToOpenAPIResponse(internalResponse, request.getModel());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("聊天完成请求参数错误", e);
            throw e;
        } catch (Exception e) {
            log.error("聊天完成失败", e);
            throw new RuntimeException("聊天完成失败: " + e.getMessage(), e);
        }
    }

    /**
     * 流式聊天完成（内部方法，由chatCompletions调用）
     */
    private SseEmitter chatCompletionsStreamInternal(
            ChatCompletionRequest request,
            Long userId) {
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        try {
            
            // 转换为内部TextGenerationRequest格式
            TextGenerationRequest internalRequest = convertToInternalRequest(request);
            internalRequest.setStream(true);
            
            String responseId = "chatcmpl-" + UUID.randomUUID().toString().substring(0, 8);
            String model = request.getModel();
            
            // 异步处理流式响应
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("[AIServiceController] 统一接入模式 - 开始流式响应处理 - userId={}, model={}, responseId={}", 
                        userId, model, responseId);
                    final int[] chunkCounter = {0};
                    aiService.generateTextStream(userId, internalRequest, (response, done) -> {
                        try {
                            chunkCounter[0]++;
                            log.info("[AIServiceController] 统一接入模式 - handler回调被调用 - chunkCounter={}, response={}, done={}, hasContent={}, contentLength={}", 
                                chunkCounter[0], 
                                response != null ? "not null" : "null",
                                done,
                                response != null && response.getContent() != null,
                                response != null && response.getContent() != null ? response.getContent().length() : 0);
                            
                            // 即使content为空，只要不是done，也发送（第一个chunk可能是空的role设置）
                            if (response != null && response.getContent() != null) {
                                // 发送OpenAPI格式的数据块（包括空内容）
                                String content = escapeJson(response.getContent());
                                String data = String.format(
                                    "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"%s\"},\"finish_reason\":null}]}",
                                    responseId,
                                    System.currentTimeMillis() / 1000,
                                    model,
                                    content
                                );
                                if (chunkCounter[0] <= 5 || chunkCounter[0] % 10 == 0) {
                                    log.info("[AIServiceController] 统一接入模式 - 发送内容chunk #{} - contentLength={}, contentPreview={}", 
                                        chunkCounter[0], content.length(), 
                                        content.length() > 50 ? content.substring(0, 50) + "..." : content);
                                }
                                try {
                                    emitter.send(SseEmitter.event().data(data));
                                    if (chunkCounter[0] <= 5) {
                                        log.debug("[AIServiceController] 统一接入模式 - SSE数据已发送 - chunkCounter={}", chunkCounter[0]);
                                    }
                                } catch (IOException e) {
                                    log.error("[AIServiceController] 统一接入模式 - 发送SSE数据失败 - chunkCounter={}", chunkCounter[0], e);
                                    throw e;
                                }
                            } else if (response != null) {
                                if (chunkCounter[0] <= 5) {
                                    log.debug("[AIServiceController] 统一接入模式 - response不为null但content为null - chunkCounter={}", chunkCounter[0]);
                                }
                            }
                            
                            if (done) {
                                log.info("[AIServiceController] 统一接入模式 - 发送完成信号 - 总chunks={}", chunkCounter[0]);
                                // 发送完成信号
                                if (response != null && response.getUsage() != null) {
                                    String usageJson = String.format(
                                        "{\"prompt_tokens\":%d,\"completion_tokens\":%d,\"total_tokens\":%d}",
                                        response.getUsage().getInputTokens() != null ? response.getUsage().getInputTokens() : 0,
                                        response.getUsage().getOutputTokens() != null ? response.getUsage().getOutputTokens() : 0,
                                        response.getUsage().getTotalTokens() != null ? response.getUsage().getTotalTokens() : 0
                                    );
                                    String finalData = String.format(
                                        "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":%s}",
                                        responseId,
                                        System.currentTimeMillis() / 1000,
                                        model,
                                        usageJson
                                    );
                                    log.info("[AIServiceController] 统一接入模式 - 发送完成chunk（带usage） - usage={}", usageJson);
                                    emitter.send(SseEmitter.event().data(finalData));
                                } else {
                                    String finalData = String.format(
                                        "{\"id\":\"%s\",\"object\":\"chat.completion.chunk\",\"created\":%d,\"model\":\"%s\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}]}",
                                        responseId,
                                        System.currentTimeMillis() / 1000,
                                        model
                                    );
                                    log.info("[AIServiceController] 统一接入模式 - 发送完成chunk（无usage）");
                                    emitter.send(SseEmitter.event().data(finalData));
                                }
                                emitter.send(SseEmitter.event().data("[DONE]"));
                                log.info("[AIServiceController] 统一接入模式 - 流式响应完成 - 总chunks={}", chunkCounter[0]);
                                emitter.complete();
                            }
                        } catch (IOException e) {
                            log.error("[AIServiceController] 统一接入模式 - 发送SSE数据失败", e);
                            emitter.completeWithError(e);
                        }
                    });
                } catch (Exception e) {
                    log.error("流式聊天完成失败", e);
                    try {
                        String errorData = String.format(
                            "{\"error\":{\"message\":\"%s\",\"type\":\"server_error\"}}",
                            escapeJson(e.getMessage())
                        );
                        emitter.send(SseEmitter.event().data(errorData));
                        emitter.complete();
                    } catch (IOException ex) {
                        emitter.completeWithError(ex);
                    }
                }
            });
            
        } catch (Exception e) {
            log.error("创建流式响应失败", e);
            emitter.completeWithError(e);
        }
        
        return emitter;
    }

    /**
     * 将OpenAPI格式的请求转换为内部格式
     */
    private TextGenerationRequest convertToInternalRequest(ChatCompletionRequest request) {
        TextGenerationRequest internalRequest = new TextGenerationRequest();
        
        // 从model字段提取provider（如果包含provider信息）
        // 例如：model可能是 "gemini-2.0-flash-exp" 或 "openai:gpt-4"
        String model = request.getModel();
        if (model != null && model.contains(":")) {
            String[] parts = model.split(":", 2);
            internalRequest.setProvider(parts[0]);
            internalRequest.setModel(parts[1]);
        } else {
            internalRequest.setModel(model);
            // 根据模型名称推断provider（简单实现，可以根据实际需求优化）
            if (model != null) {
                if (model.startsWith("gemini") || model.startsWith("imagen") || model.startsWith("veo")) {
                    internalRequest.setProvider("gemini");
                } else if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("dall-e")) {
                    internalRequest.setProvider("openai");
                } else if (model.startsWith("qwen")) {
                    internalRequest.setProvider("qwen");
                } else if (model.startsWith("doubao") || model.startsWith("ep-")) {
                    internalRequest.setProvider("doubao");
                }
            }
        }
        
        // 转换messages
        if (request.getMessages() != null && !request.getMessages().isEmpty()) {
            List<TextGenerationRequest.Message> internalMessages = new ArrayList<>();
            String systemInstruction = null;
            
            for (ChatCompletionRequest.ChatMessage msg : request.getMessages()) {
                if ("system".equals(msg.getRole())) {
                    systemInstruction = msg.getContent();
                } else {
                    TextGenerationRequest.Message internalMsg = new TextGenerationRequest.Message();
                    internalMsg.setRole(msg.getRole());
                    internalMsg.setContent(msg.getContent());
                    internalMessages.add(internalMsg);
                }
            }
            
            internalRequest.setSystemInstruction(systemInstruction);
            if (!internalMessages.isEmpty()) {
                internalRequest.setMessages(internalMessages);
            } else if (systemInstruction != null) {
                // 如果只有system消息，将其作为prompt
                internalRequest.setPrompt(systemInstruction);
            }
        }
        
        // 转换参数
        internalRequest.setTemperature(request.getTemperature());
        internalRequest.setMaxTokens(request.getMax_tokens());
        internalRequest.setStream(request.getStream());
        
        return internalRequest;
    }

    /**
     * 将内部响应格式转换为OpenAPI格式
     */
    private ChatCompletionResponse convertToOpenAPIResponse(TextGenerationResponse internalResponse, String model) {
        ChatCompletionResponse response = new ChatCompletionResponse();
        response.setId("chatcmpl-" + UUID.randomUUID().toString().substring(0, 8));
        response.setObject("chat.completion");
        response.setCreated(System.currentTimeMillis() / 1000);
        response.setModel(model != null ? model : internalResponse.getModel());
        
        // 构建choices
        List<ChatCompletionResponse.Choice> choices = new ArrayList<>();
        ChatCompletionResponse.Choice choice = new ChatCompletionResponse.Choice();
        choice.setIndex(0);
        
        ChatCompletionResponse.ChatMessage message = new ChatCompletionResponse.ChatMessage();
        message.setRole("assistant");
        message.setContent(internalResponse.getContent());
        choice.setMessage(message);
        choice.setFinish_reason(internalResponse.getFinishReason() != null ? internalResponse.getFinishReason() : "stop");
        
        choices.add(choice);
        response.setChoices(choices);
        
        // 转换usage
        if (internalResponse.getUsage() != null) {
            ChatCompletionResponse.Usage usage = new ChatCompletionResponse.Usage();
            usage.setPrompt_tokens(internalResponse.getUsage().getInputTokens());
            usage.setCompletion_tokens(internalResponse.getUsage().getOutputTokens());
            usage.setTotal_tokens(internalResponse.getUsage().getTotalTokens());
            response.setUsage(usage);
        }
        
        return response;
    }

    /**
     * 转义JSON字符串
     */
    private String escapeJson(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
