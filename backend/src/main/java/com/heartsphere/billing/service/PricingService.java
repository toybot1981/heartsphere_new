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
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        try {
            return pricingRepository.findActivePricing(modelId, pricingType, LocalDateTime.now())
                .orElseThrow(() -> new PricingNotFoundException(modelId, pricingType));
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
            // 如果返回多条记录，获取第一条（按生效日期倒序，ID倒序）
            log.warn("[PricingService] 发现重复的定价配置: modelId={}, pricingType={}, 使用最新的记录", modelId, pricingType);
            LocalDateTime now = LocalDateTime.now();
            List<AIModelPricing> pricings = pricingRepository.findByModelIdAndPricingType(modelId, pricingType)
                .stream()
                .filter(p -> p.getIsActive() 
                    && (p.getEffectiveDate() == null || p.getEffectiveDate().isBefore(now) || p.getEffectiveDate().isEqual(now))
                    && (p.getExpiryDate() == null || p.getExpiryDate().isAfter(now)))
                .sorted((a, b) -> {
                    int dateCompare = b.getEffectiveDate().compareTo(a.getEffectiveDate());
                    if (dateCompare != 0) return dateCompare;
                    return Long.compare(b.getId(), a.getId());
                })
                .toList();
            if (pricings.isEmpty()) {
                throw new PricingNotFoundException(modelId, pricingType);
            }
            log.info("[PricingService] 从 {} 条重复记录中选择最新的一条: modelId={}, pricingType={}, selectedId={}", 
                    pricings.size(), modelId, pricingType, pricings.get(0).getId());
            return pricings.get(0);
        }
    }
    
    /**
     * 根据分辨率和类型获取视频定价
     */
    @Transactional(readOnly = true)
    public AIModelPricing getVideoPricing(Long modelId, String resolution) {
        // 如果指定了分辨率，尝试查找带分辨率后缀的unit
        if (resolution != null && !resolution.isEmpty()) {
            // 查找所有该模型的视频定价
            List<AIModelPricing> allVideoPricings = pricingRepository.findByModelIdAndPricingType(modelId, "video_second");
            LocalDateTime now = LocalDateTime.now();
            
            // 优先查找匹配分辨率的定价
            Optional<AIModelPricing> matchingPricing = allVideoPricings.stream()
                .filter(p -> p.getIsActive() 
                    && p.getEffectiveDate().isBefore(now) 
                    && (p.getExpiryDate() == null || p.getExpiryDate().isAfter(now))
                    && p.getUnit().contains(resolution))
                .sorted((a, b) -> b.getEffectiveDate().compareTo(a.getEffectiveDate()))
                .findFirst();
            
            if (matchingPricing.isPresent()) {
                return matchingPricing.get();
            }
        }
        // 如果没有指定分辨率或找不到匹配的，使用默认方法
        return getPricing(modelId, "video_second");
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
     * 支持 per_1k_tokens（每千token）和 per_1m_tokens（每百万token）
     */
    private BigDecimal calculateTokenCost(AIModelPricing pricing, Integer tokens) {
        if (tokens == null || tokens <= 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal tokenCount = BigDecimal.valueOf(tokens);
        BigDecimal unitCount;
        
        // 根据单位类型计算
        if ("per_1m_tokens".equals(pricing.getUnit()) || pricing.getUnit().startsWith("per_1m_tokens")) {
            // 每百万token计费
            unitCount = tokenCount.divide(BigDecimal.valueOf(1000000), 6, RoundingMode.CEILING);
        } else {
            // 默认：每千token计费
            unitCount = tokenCount.divide(BigDecimal.valueOf(1000), 6, RoundingMode.CEILING);
        }
        
        // 应用最低计费单位
        BigDecimal minCharge = pricing.getMinChargeUnit();
        if (minCharge != null && minCharge.compareTo(BigDecimal.ZERO) > 0 && unitCount.compareTo(minCharge) < 0) {
            unitCount = minCharge;
        }
        
        return pricing.getUnitPrice().multiply(unitCount);
    }
    
    /**
     * 计算图片生成费用
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateImageGenerationCost(Long modelId, Integer imageCount) {
        log.info("[费用计算] calculateImageGenerationCost 调用: modelId={}, imageCount={}", modelId, imageCount);
        if (imageCount == null || imageCount <= 0) {
            log.warn("[费用计算] 图片数量无效，返回0: modelId={}, imageCount={}", modelId, imageCount);
            return BigDecimal.ZERO;
        }
        
        log.info("[费用计算] 查找图片定价配置: modelId={}, pricingType=image", modelId);
        AIModelPricing pricing = getPricing(modelId, "image");
        log.info("[费用计算] 找到图片定价配置: modelId={}, unitPrice={}, unit={}", 
                modelId, pricing.getUnitPrice(), pricing.getUnit());
        BigDecimal cost = pricing.getUnitPrice().multiply(BigDecimal.valueOf(imageCount))
            .setScale(6, RoundingMode.HALF_UP);
        log.info("[费用计算] 图片生成费用计算结果: modelId={}, imageCount={}, unitPrice={}, cost={}", 
                modelId, imageCount, pricing.getUnitPrice(), cost);
        return cost;
    }
    
    /**
     * 计算语音合成费用
     * 单位：元/每万字符
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateAudioCost(Long modelId, Integer characterCount) {
        if (characterCount == null || characterCount <= 0) {
            return BigDecimal.ZERO;
        }
        
        AIModelPricing pricing = getPricing(modelId, "audio_tts");
        // 转换为每万字符（向上取整）
        BigDecimal tenThousandChars = BigDecimal.valueOf(characterCount)
            .divide(BigDecimal.valueOf(10000), 6, RoundingMode.CEILING);
        
        // 应用最低计费单位
        BigDecimal minCharge = pricing.getMinChargeUnit();
        if (minCharge != null && minCharge.compareTo(BigDecimal.ZERO) > 0 && 
            tenThousandChars.compareTo(minCharge) < 0) {
            tenThousandChars = minCharge;
        }
        
        return pricing.getUnitPrice().multiply(tenThousandChars)
            .setScale(6, RoundingMode.HALF_UP);
    }
    
    /**
     * 计算语音处理费用（兼容旧接口，使用时长）
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateAudioCostByDuration(Long modelId, Integer durationSeconds) {
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
     * 单位：元/每秒（支持720P、1080P等分辨率）
     * @param modelId 模型ID
     * @param durationSeconds 视频时长（秒）
     * @param resolution 分辨率（720p, 1080p等，可选）
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateVideoCost(Long modelId, Integer durationSeconds, String resolution) {
        if (durationSeconds == null || durationSeconds <= 0) {
            return BigDecimal.ZERO;
        }
        
        // 根据分辨率查找对应的定价
        AIModelPricing pricing = getVideoPricing(modelId, resolution);
        
        return pricing.getUnitPrice().multiply(BigDecimal.valueOf(durationSeconds))
            .setScale(6, RoundingMode.HALF_UP);
    }
    
    /**
     * 计算视频生成费用（重载方法，兼容旧代码）
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateVideoCost(Long modelId, Integer durationSeconds) {
        return calculateVideoCost(modelId, durationSeconds, null);
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
                log.info("[费用计算] 开始计算图片生成费用: modelId={}, imageCount={}", 
                        modelId, imageCount != null ? imageCount : 1);
                try {
                    cost = calculateImageGenerationCost(modelId, imageCount != null ? imageCount : 1);
                    log.info("[费用计算] 图片生成费用计算成功: modelId={}, imageCount={}, cost={}", 
                            modelId, imageCount != null ? imageCount : 1, cost);
                } catch (Exception e) {
                    log.error("[费用计算] 图片生成费用计算失败: modelId={}, imageCount={}, error={}", 
                            modelId, imageCount != null ? imageCount : 1, e.getMessage(), e);
                    throw e;
                }
                return cost;
                
            case "audio_tts":
                Integer characterCount = (Integer) usageData.get("characterCount");
                cost = calculateAudioCost(modelId, characterCount);
                log.info("[费用计算] 语音合成费用: modelId={}, characterCount={}, cost={}", 
                        modelId, characterCount, cost);
                return cost;
            case "audio_stt":
                // 语音识别仍使用时长
                Integer audioDuration = (Integer) usageData.get("audioDuration");
                cost = calculateAudioCostByDuration(modelId, audioDuration);
                log.info("[费用计算] 语音识别费用: modelId={}, audioDuration={}, cost={}", 
                        modelId, audioDuration, cost);
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

