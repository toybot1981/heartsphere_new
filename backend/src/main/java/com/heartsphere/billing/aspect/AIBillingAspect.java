package com.heartsphere.billing.aspect;

import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.service.UnifiedModelRoutingService;
import com.heartsphere.aiagent.service.AIConfigService;
import com.heartsphere.aiagent.util.StreamResponseHandler;
import com.heartsphere.admin.dto.AIModelConfigDTO;
import com.heartsphere.admin.service.SystemConfigService;
import com.heartsphere.billing.annotation.RequiresTokenQuota;
import com.heartsphere.billing.exception.QuotaInsufficientException;
import com.heartsphere.billing.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * AI计费切面
 * 拦截AI服务调用，进行配额检查和扣费
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AIBillingAspect {
    
    private final TokenQuotaService quotaService;
    private final PricingService pricingService;
    private final UsageRecordService usageRecordService;
    private final AIModelLookupService modelLookupService;
    private final com.heartsphere.billing.service.ResourcePoolService resourcePoolService;
    private final UnifiedModelRoutingService unifiedRoutingService;
    private final AIConfigService configService;
    private final SystemConfigService systemConfigService;
    
    /**
     * 拦截标注了@RequiresTokenQuota的方法
     */
    @Around("@annotation(com.heartsphere.billing.annotation.RequiresTokenQuota)")
    public Object interceptAIUsage(ProceedingJoinPoint joinPoint) throws Throwable {
        RequiresTokenQuota annotation = getAnnotation(joinPoint);
        String quotaType = annotation.quotaType();
        String usageType = annotation.usageType();
        
        // 获取方法参数
        Object[] args = joinPoint.getArgs();
        Long userId = extractUserId(args);
        if (userId == null) {
            log.warn("无法获取userId，跳过计费检查");
            return joinPoint.proceed();
        }
        
        // 获取请求对象
        Object requestObj = extractRequest(args);
        if (requestObj == null) {
            log.warn("无法获取请求对象，跳过计费检查");
            return joinPoint.proceed();
        }
        
        // 提取provider和model
        String initialProvider = extractProvider(requestObj);
        String initialModelCode = extractModelCode(requestObj);
        
        log.info("[计费] 开始计费检查: userId={}, provider={}, model={}, quotaType={}, usageType={}", 
                userId, initialProvider, initialModelCode, quotaType, usageType);
        
        // 如果provider和model为null，尝试从统一路由服务或用户配置获取
        String provider = initialProvider;
        String modelCode = initialModelCode;
        AIModelConfigDTO modelConfigFromRouting = null; // 保存从统一路由获取的模型配置
        
        if ((provider == null || provider.isEmpty()) && (modelCode == null || modelCode.isEmpty())) {
            log.info("[计费] provider和model为null，尝试从统一路由服务获取");
            try {
                // 根据usageType确定capability类型
                String capability = getCapabilityFromUsageType(usageType);
                modelConfigFromRouting = unifiedRoutingService.selectModel(capability);
                provider = modelConfigFromRouting.getProvider();
                modelCode = modelConfigFromRouting.getModelName();
                // 设置到请求对象中，这样AIServiceImpl就不需要再设置了
                setProviderAndModel(requestObj, provider, modelCode);
                log.info("[计费] 从统一路由服务获取到模型: provider={}, model={}", provider, modelCode);
            } catch (Exception e) {
                log.warn("[计费] 统一路由服务获取失败，尝试从用户配置获取: {}", e.getMessage());
                try {
                    // 回退到用户配置
                    String userProvider = getUserProvider(userId, usageType);
                    String userModel = getUserModel(userId, usageType);
                    if (userProvider != null && userModel != null) {
                        provider = userProvider;
                        modelCode = userModel;
                        setProviderAndModel(requestObj, provider, modelCode);
                        log.info("[计费] 从用户配置获取到模型: provider={}, model={}", provider, modelCode);
                    }
                } catch (Exception ex) {
                    log.warn("[计费] 从用户配置获取失败: {}", ex.getMessage());
                }
            }
        }
        
        // 最终确定provider和model（用于后续使用）
        final String finalProvider = provider;
        final String finalModelCode = modelCode;
        final AIModelConfigDTO finalModelConfig = modelConfigFromRouting;
        
        // 如果provider或model仍然为null，无法继续计费
        if (finalProvider == null || finalModelCode == null) {
            log.warn("[计费] provider或model为null，跳过计费: provider={}, model={}", finalProvider, finalModelCode);
            return joinPoint.proceed();
        }
        
        // 获取定价使用的模型ID（使用ai_model_config的ID）
        Optional<Long> pricingModelIdOpt = Optional.empty();
        if (finalModelConfig != null && finalModelConfig.getId() != null) {
            pricingModelIdOpt = Optional.of(finalModelConfig.getId());
            log.info("[计费] 使用模型配置ID作为定价模型ID: modelConfigId={}", finalModelConfig.getId());
        }
        
        // 如果无法获取模型配置ID，无法继续计费
        if (pricingModelIdOpt.isEmpty()) {
            log.warn("[计费] 无法获取模型配置ID，跳过计费: provider={}, model={}", finalProvider, finalModelCode);
            return joinPoint.proceed();
        }
        
        // 从模型配置中获取正确的provider名称（确保provider和model的对应关系正确）
        String actualProvider = finalProvider;
        if (finalModelConfig != null && finalModelConfig.getProvider() != null && !finalModelConfig.getProvider().isEmpty()) {
            actualProvider = finalModelConfig.getProvider();
            log.info("[计费] 使用模型配置中的provider: {} (原provider: {})", actualProvider, finalProvider);
        }
        
        // 查找计费系统中的provider（使用模型配置中的provider名称）
        Optional<Long> providerIdOpt = modelLookupService.findProviderId(actualProvider);
        
        // 如果计费系统中的provider不存在，尝试自动创建
        if (providerIdOpt.isEmpty()) {
            log.info("[计费] 计费系统中的provider不存在，尝试自动创建: provider={}", actualProvider);
            try {
                // 创建或获取provider
                String providerDisplayName = getProviderDisplayName(actualProvider);
                com.heartsphere.billing.entity.AIProvider aiProvider = 
                    modelLookupService.findOrCreateProvider(actualProvider, providerDisplayName);
                providerIdOpt = Optional.of(aiProvider.getId());
                
                log.info("[计费] 自动创建provider成功: providerId={}, provider={}", 
                        providerIdOpt.get(), actualProvider);
            } catch (Exception e) {
                log.error("[计费] 自动创建provider失败: provider={}, error={}", 
                        actualProvider, e.getMessage(), e);
                // 如果创建失败，仍然允许调用，但使用默认值
                providerIdOpt = Optional.of(0L);
            }
        }
        
        Long providerId = providerIdOpt.get();
        Long modelId = pricingModelIdOpt.get(); // 统一使用 ai_model_config.id
        
        log.info("[计费] 模型配置查找成功: modelId={} (ai_model_config), providerId={}", 
                modelId, providerId);
        
        // 检查资源池余额（在配额检查之前）
        java.util.Optional<com.heartsphere.billing.entity.ProviderResourcePool> poolOpt = 
                resourcePoolService.getPool(providerId);
        if (poolOpt.isPresent()) {
            com.heartsphere.billing.entity.ProviderResourcePool pool = poolOpt.get();
            log.info("[计费] 资源池余额检查: providerId={}, availableBalance={}", 
                    providerId, pool.getAvailableBalance());
            if (pool.getAvailableBalance().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                log.warn("资源池余额不足，阻止服务调用: providerId={}, availableBalance={}", 
                        providerId, pool.getAvailableBalance());
                throw new QuotaInsufficientException("resource_pool", 0L, 0L);
            }
        } else {
            log.info("[计费] 资源池不存在，将自动创建: providerId={}", providerId);
        }
        
        // 预估使用量（用于配额检查）
        Long estimatedAmount = estimateUsage(requestObj, usageType);
        log.info("[计费] 预估使用量: userId={}, quotaType={}, estimatedAmount={}", 
                userId, quotaType, estimatedAmount);
        
        // 检查是否启用配额拦截开关
        boolean quotaEnforcementEnabled = systemConfigService.isBillingQuotaEnforcementEnabled();
        log.info("[计费] 配额拦截开关状态: enabled={}", quotaEnforcementEnabled);
        
        // 检查用户配额
        boolean hasUserQuota = quotaService.hasEnoughQuota(userId, quotaType, estimatedAmount);
        
        // 如果用户配额不足，检查是否可以使用资源池
        if (!hasUserQuota) {
            log.warn("[计费] 用户配额不足: userId={}, quotaType={}, required={}", userId, quotaType, estimatedAmount);
            
            // 如果启用了配额拦截开关，直接拒绝请求（不管资源池是否有余额）
            if (quotaEnforcementEnabled) {
                log.warn("[计费] 配额拦截已启用，用户配额不足，拒绝请求: userId={}, quotaType={}, required={}", 
                        userId, quotaType, estimatedAmount);
                throw new QuotaInsufficientException(quotaType, estimatedAmount, 0L);
            }
            
            // 配额拦截开关关闭时，检查资源池是否有余额
            boolean canUseResourcePool = false;
            if (poolOpt.isPresent()) {
                com.heartsphere.billing.entity.ProviderResourcePool pool = poolOpt.get();
                BigDecimal poolBalance = pool.getAvailableBalance();
                // 如果资源池有余额，允许使用
                if (poolBalance.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    canUseResourcePool = true;
                    log.info("[计费] 配额拦截已关闭，用户配额不足但资源池有余额，允许使用资源池: userId={}, poolBalance={}", 
                            userId, poolBalance);
                } else {
                    log.warn("[计费] 配额拦截已关闭，用户配额不足且资源池余额也为0: userId={}, quotaType={}, required={}, poolBalance={}", 
                            userId, quotaType, estimatedAmount, poolBalance);
                }
            } else {
                log.warn("[计费] 配额拦截已关闭，用户配额不足且资源池不存在: userId={}, quotaType={}, required={}", 
                        userId, quotaType, estimatedAmount);
            }
            
            // 如果配额拦截开关关闭，但既没有用户配额，也没有资源池余额，则拒绝请求
            if (!canUseResourcePool) {
                log.warn("[计费] 配额拦截已关闭，但用户配额不足且资源池余额不足，拒绝请求: userId={}, quotaType={}, required={}", 
                        userId, quotaType, estimatedAmount);
                throw new QuotaInsufficientException(quotaType, estimatedAmount, 0L);
            }
        } else {
            log.info("[计费] 用户配额检查通过: userId={}, quotaType={}, estimatedAmount={}", 
                    userId, quotaType, estimatedAmount);
        }
        
        // 检查是否为流式调用（void返回类型且有StreamResponseHandler参数）
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        boolean isStreamCall = signature.getReturnType() == void.class && args.length >= 3 
            && args[2] instanceof StreamResponseHandler;
        
        if (isStreamCall) {
            log.info("[计费] 流式调用模式: userId={}, provider={}, model={}", userId, finalProvider, finalModelCode);
            // 流式调用：包装handler，在done=true时进行计费
            @SuppressWarnings("unchecked")
            StreamResponseHandler<TextGenerationResponse> originalHandler = 
                (StreamResponseHandler<TextGenerationResponse>) args[2];
            
            StreamResponseHandler<TextGenerationResponse> wrappedHandler = (response, done) -> {
                // 先调用原始handler
                originalHandler.handle(response, done);
                
                // 如果完成，进行计费
                if (done) {
                    log.info("[计费] 流式调用完成，开始计费: userId={}, provider={}, model={}", 
                            userId, finalProvider, finalModelCode);
                    recordUsage(userId, providerId, modelId, usageType, requestObj, response, null, quotaType);
                }
            };
            
            // 替换handler参数
            Object[] newArgs = args.clone();
            newArgs[2] = wrappedHandler;
            
            // 执行调用
            try {
                return joinPoint.proceed(newArgs);
            } catch (Throwable e) {
                // 流式调用失败时也记录
                log.warn("[计费] 流式调用失败: userId={}, provider={}, model={}, error={}", 
                        userId, finalProvider, finalModelCode, e.getMessage());
                recordUsage(userId, providerId, modelId, usageType, requestObj, null, 
                    e instanceof Exception ? (Exception) e : new Exception(e), quotaType);
                throw e;
            }
        } else {
            log.info("[计费] 同步调用模式，开始执行AI服务: userId={}, provider={}, model={}", 
                    userId, finalProvider, finalModelCode);
            // 同步调用：正常处理
            Object result = null;
            Exception exception = null;
            try {
                result = joinPoint.proceed();
                log.info("[计费] AI服务调用成功: userId={}, provider={}, model={}", 
                        userId, finalProvider, finalModelCode);
            } catch (Exception e) {
                exception = e;
                log.warn("[计费] AI服务调用失败: userId={}, provider={}, model={}, error={}", 
                        userId, finalProvider, finalModelCode, e.getMessage());
                throw e;
            } finally {
                // 记录使用情况（无论成功或失败）
                if (result != null || exception != null) {
                    recordUsage(userId, providerId, modelId, usageType, requestObj, result, exception, quotaType);
                }
            }
            
            return result;
        }
    }
    
    /**
     * 获取注解
     */
    private RequiresTokenQuota getAnnotation(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        return signature.getMethod().getAnnotation(RequiresTokenQuota.class);
    }
    
    /**
     * 从参数中提取userId（通常是第一个参数）
     */
    private Long extractUserId(Object[] args) {
        if (args.length > 0 && args[0] instanceof Long) {
            return (Long) args[0];
        }
        return null;
    }
    
    /**
     * 从参数中提取请求对象（通常是第二个参数）
     */
    private Object extractRequest(Object[] args) {
        if (args.length > 1) {
            return args[1];
        }
        return null;
    }
    
    /**
     * 提取provider
     */
    private String extractProvider(Object requestObj) {
        if (requestObj instanceof TextGenerationRequest) {
            return ((TextGenerationRequest) requestObj).getProvider();
        } else if (requestObj instanceof ImageGenerationRequest) {
            return ((ImageGenerationRequest) requestObj).getProvider();
        } else if (requestObj instanceof AudioRequest) {
            return ((AudioRequest) requestObj).getProvider();
        } else if (requestObj instanceof VideoGenerationRequest) {
            return ((VideoGenerationRequest) requestObj).getProvider();
        }
        return null;
    }
    
    /**
     * 提取model code
     */
    private String extractModelCode(Object requestObj) {
        if (requestObj instanceof TextGenerationRequest) {
            return ((TextGenerationRequest) requestObj).getModel();
        } else if (requestObj instanceof ImageGenerationRequest) {
            return ((ImageGenerationRequest) requestObj).getModel();
        } else if (requestObj instanceof AudioRequest) {
            return ((AudioRequest) requestObj).getModel();
        } else if (requestObj instanceof VideoGenerationRequest) {
            return ((VideoGenerationRequest) requestObj).getModel();
        }
        return null;
    }
    
    /**
     * 设置provider和model到请求对象
     */
    private void setProviderAndModel(Object requestObj, String provider, String model) {
        if (requestObj instanceof TextGenerationRequest) {
            TextGenerationRequest req = (TextGenerationRequest) requestObj;
            req.setProvider(provider);
            req.setModel(model);
        } else if (requestObj instanceof ImageGenerationRequest) {
            ImageGenerationRequest req = (ImageGenerationRequest) requestObj;
            req.setProvider(provider);
            req.setModel(model);
        } else if (requestObj instanceof AudioRequest) {
            AudioRequest req = (AudioRequest) requestObj;
            req.setProvider(provider);
            req.setModel(model);
        } else if (requestObj instanceof VideoGenerationRequest) {
            VideoGenerationRequest req = (VideoGenerationRequest) requestObj;
            req.setProvider(provider);
            req.setModel(model);
        }
    }
    
    /**
     * 从usageType获取capability类型
     */
    private String getCapabilityFromUsageType(String usageType) {
        switch (usageType) {
            case "text_generation":
                return "text";
            case "image_generation":
                return "image";
            case "audio_tts":
            case "audio_stt":
                return "audio";
            case "video_generation":
                return "video";
            default:
                return "text"; // 默认
        }
    }
    
    
    /**
     * 获取provider的显示名称
     */
    private String getProviderDisplayName(String providerName) {
        if (providerName == null) {
            return null;
        }
        // 常见provider的显示名称映射
        switch (providerName.toLowerCase()) {
            case "openai":
                return "OpenAI";
            case "dashscope":
                return "阿里云通义千问";
            case "gemini":
                return "Google Gemini";
            case "zhipu":
                return "智谱AI";
            case "doubao":
                return "字节跳动豆包";
            default:
                // 如果没有映射，使用首字母大写的provider名称
                return providerName.substring(0, 1).toUpperCase() + 
                       (providerName.length() > 1 ? providerName.substring(1) : "");
        }
    }
    
    /**
     * 从用户配置获取provider
     */
    private String getUserProvider(Long userId, String usageType) {
        try {
            switch (usageType) {
                case "text_generation":
                    return configService.getUserTextProvider(userId);
                case "image_generation":
                    return configService.getUserImageProvider(userId);
                case "audio_tts":
                case "audio_stt":
                    // 音频暂时使用文本配置
                    return configService.getUserTextProvider(userId);
                case "video_generation":
                    // 视频暂时使用文本配置
                    return configService.getUserTextProvider(userId);
                default:
                    return configService.getUserTextProvider(userId);
            }
        } catch (Exception e) {
            log.warn("[计费] 获取用户provider失败: userId={}, usageType={}, error={}", 
                    userId, usageType, e.getMessage());
            return null;
        }
    }
    
    /**
     * 从用户配置获取model
     */
    private String getUserModel(Long userId, String usageType) {
        try {
            switch (usageType) {
                case "text_generation":
                    return configService.getUserTextModel(userId);
                case "image_generation":
                    return configService.getUserImageModel(userId);
                case "audio_tts":
                case "audio_stt":
                    // 音频暂时使用文本配置
                    return configService.getUserTextModel(userId);
                case "video_generation":
                    // 视频暂时使用文本配置
                    return configService.getUserTextModel(userId);
                default:
                    return configService.getUserTextModel(userId);
            }
        } catch (Exception e) {
            log.warn("[计费] 获取用户model失败: userId={}, usageType={}, error={}", 
                    userId, usageType, e.getMessage());
            return null;
        }
    }
    
    /**
     * 预估使用量（用于配额检查）
     */
    private Long estimateUsage(Object requestObj, String usageType) {
        switch (usageType) {
            case "text_generation":
                if (requestObj instanceof TextGenerationRequest) {
                    TextGenerationRequest req = (TextGenerationRequest) requestObj;
                    // 简单预估：输入token + 最大输出token
                    int inputEstimate = estimateInputTokens(req);
                    int outputEstimate = req.getMaxTokens() != null ? req.getMaxTokens() : 1000;
                    return (long) (inputEstimate + outputEstimate);
                }
                return 1000L; // 默认预估
                
            case "image_generation":
                return 1L; // 1张图片
                
            case "audio_tts":
            case "audio_stt":
                if (requestObj instanceof AudioRequest) {
                    // 音频时长估算（这里简化处理）
                    return 60L; // 预估1分钟
                }
                return 60L;
                
            case "video_generation":
                return 10L; // 预估10秒
                
            default:
                return 1000L;
        }
    }
    
    /**
     * 预估输入Token数
     */
    private int estimateInputTokens(TextGenerationRequest request) {
        int tokens = 0;
        if (request.getPrompt() != null) {
            tokens += request.getPrompt().length() / 3; // 简单估算：3个字符≈1个token
        }
        if (request.getMessages() != null) {
            for (TextGenerationRequest.Message msg : request.getMessages()) {
                if (msg.getContent() != null) {
                    tokens += msg.getContent().length() / 3;
                }
            }
        }
        if (request.getSystemInstruction() != null) {
            tokens += request.getSystemInstruction().length() / 3;
        }
        return tokens;
    }
    
    /**
     * 记录使用情况
     */
    private void recordUsage(Long userId, Long providerId, Long modelId, String usageType,
                            Object requestObj, Object result, Exception exception, String quotaType) {
        try {
            // 提取实际使用量
            Integer inputTokens = null;
            Integer outputTokens = null;
            Integer totalTokens = null;
            Integer imageCount = null;
            Integer audioDuration = null;
            Integer videoDuration = null;
            Long tokenConsumed = 0L;
            
            boolean success = exception == null;
            String errorMessage = exception != null ? exception.getMessage() : null;
            
            // 从响应中提取实际使用量
            if (result instanceof TextGenerationResponse) {
                TextGenerationResponse response = (TextGenerationResponse) result;
                if (response.getUsage() != null) {
                    inputTokens = response.getUsage().getInputTokens();
                    outputTokens = response.getUsage().getOutputTokens();
                    totalTokens = response.getUsage().getTotalTokens();
                    tokenConsumed = totalTokens != null ? totalTokens.longValue() : 0L;
                }
            } else if (result instanceof ImageGenerationResponse) {
                ImageGenerationResponse response = (ImageGenerationResponse) result;
                log.info("[计费] 处理图像生成响应: hasUsage={}, hasImages={}", 
                    response.getUsage() != null, response.getImages() != null);
                
                if (response.getUsage() != null && response.getUsage().getImagesGenerated() != null) {
                    imageCount = response.getUsage().getImagesGenerated();
                    tokenConsumed = imageCount.longValue();
                    log.info("[计费] 从usage中提取图像数量: imageCount={}, tokenConsumed={}", 
                        imageCount, tokenConsumed);
                } else if (response.getImages() != null) {
                    imageCount = response.getImages().size();
                    tokenConsumed = imageCount.longValue();
                    log.info("[计费] 从images列表中提取图像数量: imageCount={}, tokenConsumed={}", 
                        imageCount, tokenConsumed);
                } else {
                    log.warn("[计费] 图像生成响应中未找到usage或images，无法确定图像数量");
                }
            } else if (result instanceof AudioResponse) {
                // 音频处理时长估算
                audioDuration = 60; // 简化处理，实际应该从响应中获取
                tokenConsumed = 1L; // 音频按次数计费
            } else if (result instanceof VideoGenerationResponse) {
                // 视频时长估算
                videoDuration = 10; // 简化处理
                tokenConsumed = 10L;
            }
            
            // 计算费用
            Map<String, Object> usageData = new HashMap<>();
            usageData.put("inputTokens", inputTokens);
            usageData.put("outputTokens", outputTokens);
            usageData.put("imageCount", imageCount);
            usageData.put("audioDuration", audioDuration);
            usageData.put("videoDuration", videoDuration);
            
            // 使用定价模型ID（ai_model_config的ID）计算费用
            BigDecimal costAmount = BigDecimal.ZERO;
            try {
                log.info("[计费] 开始计算费用: userId={}, modelId={}, usageType={}, " +
                        "imageCount={}", userId, modelId, usageType, imageCount);
                costAmount = pricingService.calculateCost(modelId, usageType, usageData);
                log.info("[计费] 费用计算完成: userId={}, modelId={}, usageType={}, costAmount={}, " +
                        "inputTokens={}, outputTokens={}, totalTokens={}, imageCount={}, " +
                        "audioDuration={}, videoDuration={}, success={}",
                        userId, modelId, usageType, costAmount,
                        inputTokens, outputTokens, totalTokens, imageCount,
                        audioDuration, videoDuration, success);
            } catch (Exception e) {
                log.error("[计费] 费用计算失败: userId={}, modelId={}, usageType={}, " +
                        "imageCount={}, error={}", userId, modelId, usageType, imageCount, 
                        e.getMessage(), e);
                // 费用计算失败时，仍然记录使用情况，但费用为0
                costAmount = BigDecimal.ZERO;
            }
            
            // 扣除配额（如果成功）
            // 先检查用户配额是否充足，如果充足则扣除用户配额，否则只使用资源池
            boolean useResourcePoolOnly = false;
            if (success && tokenConsumed > 0) {
                // 先检查用户是否有足够的配额
                boolean hasUserQuota = quotaService.hasEnoughQuota(userId, quotaType, tokenConsumed);
                
                if (hasUserQuota) {
                    // 用户配额充足，扣除用户配额
                    log.info("[计费] 开始扣除用户配额: userId={}, quotaType={}, tokenConsumed={}", 
                            userId, quotaType, tokenConsumed);
                    boolean deducted = quotaService.consumeQuota(userId, quotaType, tokenConsumed);
                    if (!deducted) {
                        log.warn("[计费] 用户配额扣除失败，将使用资源池: userId={}, quotaType={}, amount={}", 
                                userId, quotaType, tokenConsumed);
                        useResourcePoolOnly = true;
                    } else {
                        log.info("[计费] 用户配额扣除成功: userId={}, quotaType={}, tokenConsumed={}", 
                                userId, quotaType, tokenConsumed);
                    }
                } else {
                    // 用户配额不足，仅使用资源池
                    log.info("[计费] 用户配额不足，将仅使用资源池: userId={}, quotaType={}, tokenConsumed={}", 
                            userId, quotaType, tokenConsumed);
                    useResourcePoolOnly = true;
                }
            }
            
            // 记录使用记录（使用 ai_model_config 的模型ID）
            log.info("[计费] 准备记录使用情况: userId={}, providerId={}, modelId={}, usageType={}, " +
                    "inputTokens={}, outputTokens={}, totalTokens={}, imageCount={}, " +
                    "audioDuration={}, videoDuration={}, costAmount={}, tokenConsumed={}, status={}",
                    userId, providerId, modelId, usageType,
                    inputTokens, outputTokens, totalTokens, imageCount,
                    audioDuration, videoDuration, costAmount, tokenConsumed,
                    success ? "success" : "failed");
            
            usageRecordService.recordUsage(
                userId, providerId, modelId, usageType,
                inputTokens, outputTokens, totalTokens,
                imageCount, audioDuration, videoDuration,
                costAmount, tokenConsumed,
                success ? "success" : "failed",
                errorMessage
            );
            log.info("[计费] 使用记录已保存: userId={}, providerId={}, modelId={}, usageType={}, " +
                    "imageCount={}, tokenConsumed={}, status={}", 
                    userId, providerId, modelId, usageType, imageCount, tokenConsumed,
                    success ? "success" : "failed");
            
            // 扣除资源池余额（如果成功）
            // 资源池余额总是需要扣除，因为这是实际产生的成本
            if (success && costAmount.compareTo(BigDecimal.ZERO) > 0) {
                try {
                    if (useResourcePoolOnly) {
                        log.info("[计费] 仅使用资源池，开始扣除资源池余额: providerId={}, costAmount={}", 
                                providerId, costAmount);
                    } else {
                        log.info("[计费] 扣除资源池余额（同时已扣除用户配额）: providerId={}, costAmount={}", 
                                providerId, costAmount);
                    }
                    resourcePoolService.deductBalance(providerId, costAmount);
                    log.info("[计费] 资源池余额扣除成功: providerId={}, costAmount={}", providerId, costAmount);
                } catch (Exception e) {
                    log.error("[计费] 扣除资源池余额失败: providerId={}, amount={}", providerId, costAmount, e);
                    // 不抛出异常，避免影响主流程
                }
            }
            
            log.info("[计费] 计费流程完成: userId={}, providerId={}, modelId={}, costAmount={}, success={}", 
                    userId, providerId, modelId, costAmount, success);
            
        } catch (Exception e) {
            log.error("记录使用情况失败", e);
            // 不抛出异常，避免影响主流程
        }
    }
}

