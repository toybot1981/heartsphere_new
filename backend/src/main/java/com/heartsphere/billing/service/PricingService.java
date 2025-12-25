package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIModelPricing;
import com.heartsphere.billing.exception.PricingNotFoundException;
import com.heartsphere.billing.repository.AIModelPricingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 资费服务
 * 负责查询模型资费和计算费用
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PricingService {
    
    private final AIModelPricingRepository pricingRepository;
    
    /**
     * 获取模型资费配置
     */
    @Transactional(readOnly = true)
    public AIModelPricing getPricing(Long modelId, String pricingType) {
        return pricingRepository.findActivePricing(modelId, pricingType, LocalDateTime.now())
            .orElseThrow(() -> new PricingNotFoundException(modelId, pricingType));
    }
    
    /**
     * 计算文本生成费用
     * @param modelId 模型ID
     * @param inputTokens 输入Token数
     * @param outputTokens 输出Token数
     * @return 费用（元）
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTextGenerationCost(Long modelId, Integer inputTokens, Integer outputTokens) {
        BigDecimal totalCost = BigDecimal.ZERO;
        
        // 计算输入Token费用
        if (inputTokens != null && inputTokens > 0) {
            AIModelPricing inputPricing = getPricing(modelId, "input_token");
            BigDecimal inputCost = calculateTokenCost(inputPricing, inputTokens);
            totalCost = totalCost.add(inputCost);
        }
        
        // 计算输出Token费用
        if (outputTokens != null && outputTokens > 0) {
            AIModelPricing outputPricing = getPricing(modelId, "output_token");
            BigDecimal outputCost = calculateTokenCost(outputPricing, outputTokens);
            totalCost = totalCost.add(outputCost);
        }
        
        return totalCost.setScale(6, RoundingMode.HALF_UP);
    }
    
    /**
     * 计算Token费用
     */
    private BigDecimal calculateTokenCost(AIModelPricing pricing, Integer tokens) {
        if (tokens == null || tokens <= 0) {
            return BigDecimal.ZERO;
        }
        
        // 按千Token计费
        BigDecimal tokenCount = BigDecimal.valueOf(tokens);
        BigDecimal thousandTokens = tokenCount.divide(BigDecimal.valueOf(1000), 6, RoundingMode.CEILING);
        
        // 应用最低计费单位
        BigDecimal minCharge = pricing.getMinChargeUnit();
        if (minCharge.compareTo(BigDecimal.ZERO) > 0 && thousandTokens.compareTo(minCharge) < 0) {
            thousandTokens = minCharge;
        }
        
        return pricing.getUnitPrice().multiply(thousandTokens);
    }
    
    /**
     * 计算图片生成费用
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateImageGenerationCost(Long modelId, Integer imageCount) {
        if (imageCount == null || imageCount <= 0) {
            return BigDecimal.ZERO;
        }
        
        AIModelPricing pricing = getPricing(modelId, "image");
        return pricing.getUnitPrice().multiply(BigDecimal.valueOf(imageCount))
            .setScale(6, RoundingMode.HALF_UP);
    }
    
    /**
     * 计算语音处理费用
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateAudioCost(Long modelId, Integer durationSeconds) {
        if (durationSeconds == null || durationSeconds <= 0) {
            return BigDecimal.ZERO;
        }
        
        AIModelPricing pricing = getPricing(modelId, "audio_minute");
        // 转换为分钟（向上取整）
        BigDecimal minutes = BigDecimal.valueOf(durationSeconds)
            .divide(BigDecimal.valueOf(60), 0, RoundingMode.CEILING);
        
        return pricing.getUnitPrice().multiply(minutes)
            .setScale(6, RoundingMode.HALF_UP);
    }
    
    /**
     * 计算视频生成费用
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateVideoCost(Long modelId, Integer durationSeconds) {
        if (durationSeconds == null || durationSeconds <= 0) {
            return BigDecimal.ZERO;
        }
        
        AIModelPricing pricing = getPricing(modelId, "video_second");
        return pricing.getUnitPrice().multiply(BigDecimal.valueOf(durationSeconds))
            .setScale(6, RoundingMode.HALF_UP);
    }
    
    /**
     * 根据使用类型和参数计算费用
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCost(Long modelId, String usageType, Map<String, Object> usageData) {
        BigDecimal cost;
        switch (usageType) {
            case "text_generation":
                Integer inputTokens = (Integer) usageData.get("inputTokens");
                Integer outputTokens = (Integer) usageData.get("outputTokens");
                cost = calculateTextGenerationCost(modelId, inputTokens, outputTokens);
                log.info("[费用计算] 文本生成费用: modelId={}, inputTokens={}, outputTokens={}, cost={}", 
                        modelId, inputTokens, outputTokens, cost);
                return cost;
                
            case "image_generation":
                Integer imageCount = (Integer) usageData.get("imageCount");
                cost = calculateImageGenerationCost(modelId, imageCount != null ? imageCount : 1);
                log.info("[费用计算] 图片生成费用: modelId={}, imageCount={}, cost={}", 
                        modelId, imageCount != null ? imageCount : 1, cost);
                return cost;
                
            case "audio_tts":
            case "audio_stt":
                Integer audioDuration = (Integer) usageData.get("audioDuration");
                cost = calculateAudioCost(modelId, audioDuration);
                log.info("[费用计算] 音频处理费用: modelId={}, usageType={}, audioDuration={}, cost={}", 
                        modelId, usageType, audioDuration, cost);
                return cost;
                
            case "video_generation":
                Integer videoDuration = (Integer) usageData.get("videoDuration");
                cost = calculateVideoCost(modelId, videoDuration);
                log.info("[费用计算] 视频生成费用: modelId={}, videoDuration={}, cost={}", 
                        modelId, videoDuration, cost);
                return cost;
                
            default:
                log.warn("未知的使用类型: {}", usageType);
                return BigDecimal.ZERO;
        }
    }
}

