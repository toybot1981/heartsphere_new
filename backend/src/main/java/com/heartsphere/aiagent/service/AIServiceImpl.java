package com.heartsphere.aiagent.service;

import com.heartsphere.admin.dto.AIModelConfigDTO;
import com.heartsphere.aiagent.adapter.ModelAdapter;
import com.heartsphere.aiagent.adapter.ModelAdapterManager;
import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.entity.UserAIConfig;
import com.heartsphere.aiagent.exception.AIServiceException;
import com.heartsphere.aiagent.util.StreamResponseHandler;
import com.heartsphere.billing.annotation.RequiresTokenQuota;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * AI服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {
    
    private final ModelAdapterManager adapterManager;
    private final AIConfigService configService;
    private final UnifiedModelRoutingService unifiedRoutingService;
    
    @Override
    @RequiresTokenQuota(quotaType = "text_token", usageType = "text_generation")
    public TextGenerationResponse generateText(Long userId, TextGenerationRequest request) {
        try {
            log.debug("文本生成请求，userId={}, provider={}, model={}", 
                userId, request.getProvider(), request.getModel());
            
            // 统一接入模式：使用管理后台配置的模型和路由策略
            // 如果请求中没有指定provider和model，则从统一路由服务获取
            if ((request.getProvider() == null || request.getProvider().isEmpty()) &&
                (request.getModel() == null || request.getModel().isEmpty())) {
                try {
                    AIModelConfigDTO modelConfig = unifiedRoutingService.selectModel("text");
                    // 统一转为小写，确保与适配器注册名称一致
                    String provider = (modelConfig.getProvider() != null) 
                        ? modelConfig.getProvider().toLowerCase() 
                        : null;
                    request.setProvider(provider);
                    request.setModel(modelConfig.getModelName());
                    if (modelConfig.getBaseUrl() != null && !modelConfig.getBaseUrl().isEmpty()) {
                        request.setBaseUrl(modelConfig.getBaseUrl());
                        log.debug("统一接入模式：设置baseUrl={}", modelConfig.getBaseUrl());
                    }
                    if (modelConfig.getApiKey() != null && !modelConfig.getApiKey().isEmpty()) {
                        request.setApiKey(modelConfig.getApiKey());
                        log.debug("统一接入模式：设置apiKey（已从数据库获取）");
                    }
                    log.debug("统一接入模式：使用模型配置 provider={}, model={}", 
                        modelConfig.getProvider(), modelConfig.getModelName());
                } catch (Exception e) {
                    log.warn("统一接入模式路由失败，回退到用户配置: {}", e.getMessage());
                    // 回退到用户配置
                    String provider = configService.getUserTextProvider(userId);
                    String model = configService.getUserTextModel(userId);
                    request.setProvider(provider);
                    request.setModel(model);
                }
            } else {
                // 如果请求中已指定，优先使用请求中的
                if (request.getProvider() == null || request.getProvider().isEmpty()) {
                    request.setProvider(configService.getUserTextProvider(userId));
                }
                if (request.getModel() == null || request.getModel().isEmpty()) {
                    request.setModel(configService.getUserTextModel(userId));
                }
            }
            
            // 设置默认参数
            if (request.getTemperature() == null) {
                // 可以从用户配置中获取默认温度
                request.setTemperature(0.7);
            }
            
            // 获取适配器
            ModelAdapter adapter = adapterManager.getAdapter(request.getProvider());
            
            // 调用适配器生成文本
            TextGenerationResponse response = adapter.generateText(request);
            log.debug("文本生成成功，userId={}, provider={}, model={}", 
                userId, response.getProvider(), response.getModel());
            
            return response;
            
        } catch (Exception e) {
            log.error("文本生成失败，userId={}, provider={}, model={}", 
                userId, request.getProvider(), request.getModel(), e);
            throw new AIServiceException("文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @RequiresTokenQuota(quotaType = "text_token", usageType = "text_generation")
    public void generateTextStream(Long userId, TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.info("[AIServiceImpl] 开始流式文本生成 - userId={}, 请求provider={}, 请求model={}, hasPrompt={}, hasMessages={}, messagesCount={}", 
                userId, 
                request.getProvider(), 
                request.getModel(),
                request.getPrompt() != null && !request.getPrompt().isEmpty(),
                request.getMessages() != null,
                request.getMessages() != null ? request.getMessages().size() : 0);
            
            // 统一接入模式：使用管理后台配置的模型和路由策略
            // 如果请求中没有指定provider和model，则从统一路由服务获取
            if ((request.getProvider() == null || request.getProvider().isEmpty()) &&
                (request.getModel() == null || request.getModel().isEmpty())) {
                   try {
                       log.info("[AIServiceImpl] 请求未指定provider/model，尝试从统一路由服务获取");
                       AIModelConfigDTO modelConfig = unifiedRoutingService.selectModel("text");
                       // 统一转为小写，确保与适配器注册名称一致
                    String provider = (modelConfig.getProvider() != null) 
                        ? modelConfig.getProvider().toLowerCase() 
                        : null;
                    request.setProvider(provider);
                       request.setModel(modelConfig.getModelName());
                       if (modelConfig.getBaseUrl() != null && !modelConfig.getBaseUrl().isEmpty()) {
                           request.setBaseUrl(modelConfig.getBaseUrl());
                           log.info("[AIServiceImpl] 统一接入模式：设置baseUrl={}", modelConfig.getBaseUrl());
                       }
                       if (modelConfig.getApiKey() != null && !modelConfig.getApiKey().isEmpty()) {
                           request.setApiKey(modelConfig.getApiKey());
                           log.info("[AIServiceImpl] 统一接入模式：设置apiKey（已从数据库获取）");
                       }
                       log.info("[AIServiceImpl] 统一接入模式：使用模型配置 provider={}, model={}", 
                           modelConfig.getProvider(), modelConfig.getModelName());
                } catch (Exception e) {
                    log.warn("[AIServiceImpl] 统一接入模式路由失败，回退到用户配置: {}", e.getMessage());
                    // 回退到用户配置
                    String provider = configService.getUserTextProvider(userId);
                    String model = configService.getUserTextModel(userId);
                    request.setProvider(provider);
                    request.setModel(model);
                    log.info("[AIServiceImpl] 使用用户配置 provider={}, model={}", provider, model);
                }
            } else {
                // 如果请求中已指定，优先使用请求中的
                if (request.getProvider() == null || request.getProvider().isEmpty()) {
                    String provider = configService.getUserTextProvider(userId);
                    request.setProvider(provider);
                    log.info("[AIServiceImpl] 请求未指定provider，使用用户配置 provider={}", provider);
                }
                if (request.getModel() == null || request.getModel().isEmpty()) {
                    String model = configService.getUserTextModel(userId);
                    request.setModel(model);
                    log.info("[AIServiceImpl] 请求未指定model，使用用户配置 model={}", model);
                }
            }
            
            // 设置默认参数
            if (request.getTemperature() == null) {
                request.setTemperature(0.7);
            }
            if (request.getMaxTokens() == null) {
                request.setMaxTokens(2048);
            }
            
            log.info("[AIServiceImpl] 最终请求参数 - provider={}, model={}, temperature={}, maxTokens={}", 
                request.getProvider(), request.getModel(), request.getTemperature(), request.getMaxTokens());
            
            // 获取适配器
            ModelAdapter adapter = adapterManager.getAdapter(request.getProvider());
            if (adapter == null) {
                log.error("[AIServiceImpl] 适配器不存在 - provider={}, userId={}", request.getProvider(), userId);
                throw new AIServiceException("适配器不存在: " + request.getProvider());
            }
            
            log.info("[AIServiceImpl] 获取适配器成功 - provider={}, adapterClass={}", 
                request.getProvider(), adapter.getClass().getSimpleName());
            
            // 调用适配器流式生成文本
            log.info("[AIServiceImpl] 统一接入模式 - 开始调用适配器.generateTextStream - provider={}, model={}, baseUrl={}", 
                request.getProvider(), request.getModel(), request.getBaseUrl());
            
            // 创建一个包装的handler来记录日志
            final StreamResponseHandler<TextGenerationResponse> loggingHandler = new StreamResponseHandler<TextGenerationResponse>() {
                private int chunkCount = 0;
                
                @Override
                public void handle(TextGenerationResponse response, boolean done) {
                    chunkCount++;
                    if (response != null) {
                        if (response.getContent() != null && !response.getContent().isEmpty()) {
                            if (chunkCount <= 5 || chunkCount % 10 == 0) {
                                log.info("[AIServiceImpl] 统一接入模式 - 收到chunk #{} - contentLength={}, contentPreview={}", 
                                    chunkCount, response.getContent().length(),
                                    response.getContent().length() > 50 ? response.getContent().substring(0, 50) + "..." : response.getContent());
                            }
                        } else {
                            if (chunkCount <= 5) {
                                log.debug("[AIServiceImpl] 统一接入模式 - 收到空内容chunk #{}", chunkCount);
                            }
                        }
                        if (done) {
                            log.info("[AIServiceImpl] 统一接入模式 - 流式响应完成 - 总chunks={}, hasUsage={}", 
                                chunkCount, response.getUsage() != null);
                            if (response.getUsage() != null) {
                                log.info("[AIServiceImpl] 统一接入模式 - Token使用量 - input={}, output={}, total={}", 
                                    response.getUsage().getInputTokens(), 
                                    response.getUsage().getOutputTokens(), 
                                    response.getUsage().getTotalTokens());
                            }
                        }
                    } else if (done) {
                        log.warn("[AIServiceImpl] 统一接入模式 - 收到null响应且done=true（可能是错误）");
                    }
                    // 调用原始handler
                    handler.handle(response, done);
                }
            };
            
            // 注意：Flux的错误是异步的，不会立即抛出异常
            // 错误会在Flux的error handler中处理，并通过handler.handle(null, true)传递
            adapter.generateTextStream(request, loggingHandler);
            log.info("[AIServiceImpl] 统一接入模式 - 适配器.generateTextStream调用完成（异步执行，错误通过Flux的error handler处理）");
            
        } catch (Exception e) {
            log.error("[AIServiceImpl] 流式文本生成失败 - userId={}, provider={}, model={}", 
                userId, request.getProvider(), request.getModel(), e);
            throw new AIServiceException("流式文本生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @RequiresTokenQuota(quotaType = "image", usageType = "image_generation")
    public ImageGenerationResponse generateImage(Long userId, ImageGenerationRequest request) {
        try {
            log.debug("图片生成请求，userId={}, provider={}, model={}", 
                userId, request.getProvider(), request.getModel());
            
            // 统一接入模式：如果请求中没有指定provider和model，从统一路由服务获取
            if ((request.getProvider() == null || request.getProvider().isEmpty()) &&
                (request.getModel() == null || request.getModel().isEmpty())) {
                try {
                    AIModelConfigDTO modelConfig = unifiedRoutingService.selectModel("image");
                    // 统一转为小写，确保与适配器注册名称一致
                    String provider = (modelConfig.getProvider() != null) 
                        ? modelConfig.getProvider().toLowerCase() 
                        : null;
                    request.setProvider(provider);
                    request.setModel(modelConfig.getModelName());
                    if (modelConfig.getBaseUrl() != null && !modelConfig.getBaseUrl().isEmpty()) {
                        request.setBaseUrl(modelConfig.getBaseUrl());
                        log.debug("统一接入模式：设置baseUrl={}", modelConfig.getBaseUrl());
                    }
                    if (modelConfig.getApiKey() != null && !modelConfig.getApiKey().isEmpty()) {
                        request.setApiKey(modelConfig.getApiKey());
                        log.debug("统一接入模式：设置apiKey（已从数据库获取）");
                    }
                    log.debug("统一接入模式：使用模型配置 provider={}, model={}", 
                        modelConfig.getProvider(), modelConfig.getModelName());
                } catch (Exception e) {
                    log.warn("统一接入模式路由失败，回退到用户配置: {}", e.getMessage());
                    // 回退到用户配置
                    String provider = configService.getUserImageProvider(userId);
                    String model = configService.getUserImageModel(userId);
                    request.setProvider(provider);
                    request.setModel(model);
                }
            } else {
                // 如果请求中已指定，优先使用请求中的
                if (request.getProvider() == null || request.getProvider().isEmpty()) {
                    request.setProvider(configService.getUserImageProvider(userId));
                }
                if (request.getModel() == null || request.getModel().isEmpty()) {
                    request.setModel(configService.getUserImageModel(userId));
                }
            }
            
            // 获取适配器
            ModelAdapter adapter = adapterManager.getAdapter(request.getProvider());
            
            // 调用适配器生成图片
            ImageGenerationResponse response = adapter.generateImage(request);
            log.debug("图片生成成功，userId={}, provider={}, model={}", 
                userId, response.getProvider(), response.getModel());
            
            return response;
            
        } catch (Exception e) {
            log.error("图片生成失败，userId={}, provider={}, model={}", 
                userId, request.getProvider(), request.getModel(), e);
            throw new AIServiceException("图片生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @RequiresTokenQuota(quotaType = "audio", usageType = "audio_tts")
    public AudioResponse textToSpeech(Long userId, AudioRequest request) {
        try {
            // 确定provider
            String provider = request.getProvider() != null ? 
                request.getProvider() : "dashscope";
            
            // 获取适配器
            ModelAdapter adapter = adapterManager.getAdapter(provider);
            
            // 调用适配器文本转语音
            return adapter.textToSpeech(request);
            
        } catch (Exception e) {
            log.error("文本转语音失败，userId={}", userId, e);
            throw new AIServiceException("文本转语音失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @RequiresTokenQuota(quotaType = "audio", usageType = "audio_stt")
    public AudioResponse speechToText(Long userId, AudioRequest request) {
        try {
            // 确定provider
            String provider = request.getProvider() != null ? 
                request.getProvider() : "dashscope";
            
            // 获取适配器
            ModelAdapter adapter = adapterManager.getAdapter(provider);
            
            // 调用适配器语音转文本
            return adapter.speechToText(request);
            
        } catch (Exception e) {
            log.error("语音转文本失败，userId={}", userId, e);
            throw new AIServiceException("语音转文本失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @RequiresTokenQuota(quotaType = "video", usageType = "video_generation")
    public VideoGenerationResponse generateVideo(Long userId, VideoGenerationRequest request) {
        try {
            // 确定provider
            String provider = request.getProvider() != null ? 
                request.getProvider() : "dashscope";
            
            // 获取适配器
            ModelAdapter adapter = adapterManager.getAdapter(provider);
            
            // 调用适配器生成视频
            return adapter.generateVideo(request);
            
        } catch (Exception e) {
            log.error("视频生成失败，userId={}", userId, e);
            throw new AIServiceException("视频生成失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public UserAIConfig getUserConfig(Long userId) {
        return configService.getUserConfig(userId);
    }
    
    @Override
    public UserAIConfig updateUserConfig(Long userId, UserAIConfig config) {
        return configService.updateUserConfig(userId, config);
    }
}
