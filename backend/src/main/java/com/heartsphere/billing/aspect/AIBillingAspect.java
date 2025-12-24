package com.heartsphere.billing.aspect;

import com.heartsphere.aiagent.dto.request.*;
import com.heartsphere.aiagent.dto.response.*;
import com.heartsphere.aiagent.util.StreamResponseHandler;
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
        String provider = extractProvider(requestObj);
        String modelCode = extractModelCode(requestObj);
        
        // 查找模型ID
        Optional<Long> modelIdOpt = modelLookupService.findModelId(provider, modelCode);
        Optional<Long> providerIdOpt = modelLookupService.findProviderId(provider);
        
        if (modelIdOpt.isEmpty() || providerIdOpt.isEmpty()) {
            log.warn("未找到模型配置，跳过计费: provider={}, model={}", provider, modelCode);
            // 如果模型未配置，仍然允许调用，但不计费
            return joinPoint.proceed();
        }
        
        Long modelId = modelIdOpt.get();
        Long providerId = providerIdOpt.get();
        
        // 检查资源池余额（在配额检查之前）
        java.util.Optional<com.heartsphere.billing.entity.ProviderResourcePool> poolOpt = 
                resourcePoolService.getPool(providerId);
        if (poolOpt.isPresent()) {
            com.heartsphere.billing.entity.ProviderResourcePool pool = poolOpt.get();
            if (pool.getAvailableBalance().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                log.warn("资源池余额不足，阻止服务调用: providerId={}, availableBalance={}", 
                        providerId, pool.getAvailableBalance());
                throw new QuotaInsufficientException("resource_pool", 0L, 0L);
            }
        }
        
        // 预估使用量（用于配额检查）
        Long estimatedAmount = estimateUsage(requestObj, usageType);
        
        // 检查配额
        if (!quotaService.hasEnoughQuota(userId, quotaType, estimatedAmount)) {
            log.warn("配额不足: userId={}, quotaType={}, required={}", userId, quotaType, estimatedAmount);
            throw new QuotaInsufficientException(quotaType, estimatedAmount, 0L);
        }
        
        // 检查是否为流式调用（void返回类型且有StreamResponseHandler参数）
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        boolean isStreamCall = signature.getReturnType() == void.class && args.length >= 3 
            && args[2] instanceof StreamResponseHandler;
        
        if (isStreamCall) {
            // 流式调用：包装handler，在done=true时进行计费
            @SuppressWarnings("unchecked")
            StreamResponseHandler<TextGenerationResponse> originalHandler = 
                (StreamResponseHandler<TextGenerationResponse>) args[2];
            
            StreamResponseHandler<TextGenerationResponse> wrappedHandler = (response, done) -> {
                // 先调用原始handler
                originalHandler.handle(response, done);
                
                // 如果完成，进行计费
                if (done) {
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
                recordUsage(userId, providerId, modelId, usageType, requestObj, null, 
                    e instanceof Exception ? (Exception) e : new Exception(e), quotaType);
                throw e;
            }
        } else {
            // 同步调用：正常处理
            Object result = null;
            Exception exception = null;
            try {
                result = joinPoint.proceed();
            } catch (Exception e) {
                exception = e;
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
                if (response.getUsage() != null && response.getUsage().getImagesGenerated() != null) {
                    imageCount = response.getUsage().getImagesGenerated();
                    tokenConsumed = imageCount.longValue();
                } else if (response.getImages() != null) {
                    imageCount = response.getImages().size();
                    tokenConsumed = imageCount.longValue();
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
            
            BigDecimal costAmount = pricingService.calculateCost(modelId, usageType, usageData);
            
            // 扣除配额（如果成功）
            if (success && tokenConsumed > 0) {
                boolean deducted = quotaService.consumeQuota(userId, quotaType, tokenConsumed);
                if (!deducted) {
                    log.warn("配额扣除失败: userId={}, quotaType={}, amount={}", userId, quotaType, tokenConsumed);
                }
            }
            
            // 记录使用记录
            usageRecordService.recordUsage(
                userId, providerId, modelId, usageType,
                inputTokens, outputTokens, totalTokens,
                imageCount, audioDuration, videoDuration,
                costAmount, tokenConsumed,
                success ? "success" : "failed",
                errorMessage
            );
            
            // 扣除资源池余额（如果成功）
            if (success && costAmount.compareTo(BigDecimal.ZERO) > 0) {
                try {
                    resourcePoolService.deductBalance(providerId, costAmount);
                } catch (Exception e) {
                    log.error("扣除资源池余额失败: providerId={}, amount={}", providerId, costAmount, e);
                    // 不抛出异常，避免影响主流程
                }
            }
            
        } catch (Exception e) {
            log.error("记录使用情况失败", e);
            // 不抛出异常，避免影响主流程
        }
    }
}

