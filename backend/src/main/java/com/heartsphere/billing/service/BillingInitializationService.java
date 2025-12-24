package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIModel;
import com.heartsphere.billing.entity.AIModelPricing;
import com.heartsphere.billing.entity.AIProvider;
import com.heartsphere.billing.repository.AIModelPricingRepository;
import com.heartsphere.billing.repository.AIModelRepository;
import com.heartsphere.billing.repository.AIProviderRepository;
import com.heartsphere.billing.service.ResourcePoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 计费数据初始化服务
 * 在应用启动时初始化主流的AI模型及其计费信息
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingInitializationService {

    private final AIProviderRepository providerRepository;
    private final AIModelRepository modelRepository;
    private final AIModelPricingRepository pricingRepository;
    private final ResourcePoolService resourcePoolService;

    /**
     * 初始化提供商、模型和计费信息
     */
    @Transactional
    public void initializeBillingData() {
        log.info("开始初始化计费数据...");

        // 1. 初始化提供商
        AIProvider openaiProvider = initOrGetProvider("openai", "OpenAI", true);
        AIProvider dashscopeProvider = initOrGetProvider("dashscope", "阿里云通义千问", true);
        AIProvider geminiProvider = initOrGetProvider("gemini", "Google Gemini", true);
        AIProvider zhipuProvider = initOrGetProvider("zhipu", "智谱AI", true);
        AIProvider doubaoProvider = initOrGetProvider("doubao", "字节跳动豆包", true);

        // 2. 初始化OpenAI模型
        AIModel gpt4 = initOrGetModel(openaiProvider.getId(), "gpt-4", "GPT-4", "text", true);
        AIModel gpt4Turbo = initOrGetModel(openaiProvider.getId(), "gpt-4-turbo", "GPT-4 Turbo", "text", true);
        AIModel gpt35Turbo = initOrGetModel(openaiProvider.getId(), "gpt-3.5-turbo", "GPT-3.5 Turbo", "text", true);
        AIModel dallE3 = initOrGetModel(openaiProvider.getId(), "dall-e-3", "DALL-E 3", "image", true);

        // 3. 初始化通义千问模型
        AIModel qwenMax = initOrGetModel(dashscopeProvider.getId(), "qwen-max", "通义千问-Max", "text", true);
        AIModel qwenPlus = initOrGetModel(dashscopeProvider.getId(), "qwen-plus", "通义千问-Plus", "text", true);
        AIModel qwenTurbo = initOrGetModel(dashscopeProvider.getId(), "qwen-turbo", "通义千问-Turbo", "text", true);
        AIModel wanx = initOrGetModel(dashscopeProvider.getId(), "wanx-v1", "通义万相", "image", true);

        // 4. 初始化Gemini模型
        AIModel geminiPro = initOrGetModel(geminiProvider.getId(), "gemini-pro", "Gemini Pro", "text", true);
        AIModel geminiProVision = initOrGetModel(geminiProvider.getId(), "gemini-pro-vision", "Gemini Pro Vision", "text", true);

        // 5. 初始化智谱AI模型
        AIModel glm4 = initOrGetModel(zhipuProvider.getId(), "glm-4", "GLM-4", "text", true);
        AIModel glm3Turbo = initOrGetModel(zhipuProvider.getId(), "glm-3-turbo", "GLM-3 Turbo", "text", true);

        // 6. 初始化豆包模型
        AIModel doubaoPro = initOrGetModel(doubaoProvider.getId(), "doubao-pro-32k", "豆包Pro", "text", true);
        AIModel doubaoLite = initOrGetModel(doubaoProvider.getId(), "doubao-lite-32k", "豆包Lite", "text", true);

        // 7. 初始化计费信息
        initPricing(gpt4, "input_token", new BigDecimal("0.03"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(gpt4, "output_token", new BigDecimal("0.06"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(gpt4Turbo, "input_token", new BigDecimal("0.01"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(gpt4Turbo, "output_token", new BigDecimal("0.03"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(gpt35Turbo, "input_token", new BigDecimal("0.0015"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(gpt35Turbo, "output_token", new BigDecimal("0.002"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(dallE3, "image", new BigDecimal("0.04"), "per_image", BigDecimal.ZERO);

        initPricing(qwenMax, "input_token", new BigDecimal("0.008"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(qwenMax, "output_token", new BigDecimal("0.008"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(qwenPlus, "input_token", new BigDecimal("0.002"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(qwenPlus, "output_token", new BigDecimal("0.002"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(qwenTurbo, "input_token", new BigDecimal("0.0008"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(qwenTurbo, "output_token", new BigDecimal("0.0008"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(wanx, "image", new BigDecimal("0.012"), "per_image", BigDecimal.ZERO);

        initPricing(geminiPro, "input_token", new BigDecimal("0.0005"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(geminiPro, "output_token", new BigDecimal("0.0015"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(geminiProVision, "input_token", new BigDecimal("0.0005"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(geminiProVision, "output_token", new BigDecimal("0.0015"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(glm4, "input_token", new BigDecimal("0.05"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(glm4, "output_token", new BigDecimal("0.05"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(glm3Turbo, "input_token", new BigDecimal("0.005"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(glm3Turbo, "output_token", new BigDecimal("0.005"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(doubaoPro, "input_token", new BigDecimal("0.0008"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(doubaoPro, "output_token", new BigDecimal("0.0008"), "per_1k_tokens", BigDecimal.ZERO);

        initPricing(doubaoLite, "input_token", new BigDecimal("0.00055"), "per_1k_tokens", BigDecimal.ZERO);
        initPricing(doubaoLite, "output_token", new BigDecimal("0.00055"), "per_1k_tokens", BigDecimal.ZERO);

        // 8. 为每个提供商初始化资源池
        resourcePoolService.getOrCreatePool(openaiProvider.getId());
        resourcePoolService.getOrCreatePool(dashscopeProvider.getId());
        resourcePoolService.getOrCreatePool(geminiProvider.getId());
        resourcePoolService.getOrCreatePool(zhipuProvider.getId());
        resourcePoolService.getOrCreatePool(doubaoProvider.getId());
        log.info("资源池初始化完成");

        log.info("计费数据初始化完成");
    }

    /**
     * 初始化或获取提供商
     */
    private AIProvider initOrGetProvider(String name, String displayName, boolean enabled) {
        return providerRepository.findByName(name)
                .orElseGet(() -> {
                    AIProvider provider = new AIProvider();
                    provider.setName(name);
                    provider.setDisplayName(displayName);
                    provider.setEnabled(enabled);
                    AIProvider saved = providerRepository.save(provider);
                    log.info("初始化提供商: {} ({})", displayName, name);
                    return saved;
                });
    }

    /**
     * 初始化或获取模型
     */
    private AIModel initOrGetModel(Long providerId, String modelCode, String modelName, String modelType, boolean enabled) {
        return modelRepository.findByProviderIdAndModelCode(providerId, modelCode)
                .orElseGet(() -> {
                    AIModel model = new AIModel();
                    model.setProviderId(providerId);
                    model.setModelCode(modelCode);
                    model.setModelName(modelName);
                    model.setModelType(modelType);
                    model.setEnabled(enabled);
                    AIModel saved = modelRepository.save(model);
                    log.info("初始化模型: {} ({})", modelName, modelCode);
                    return saved;
                });
    }

    /**
     * 初始化计费配置（如果不存在）
     */
    private void initPricing(AIModel model, String pricingType, BigDecimal unitPrice, String unit, BigDecimal minChargeUnit) {
        // 检查是否已存在相同的计费配置
        List<AIModelPricing> existing = pricingRepository.findByModelIdAndPricingType(model.getId(), pricingType);
        if (!existing.isEmpty()) {
            // 检查是否有活跃的配置
            LocalDateTime now = LocalDateTime.now();
            boolean hasActive = existing.stream().anyMatch(p -> 
                p.getIsActive() && 
                p.getEffectiveDate().isBefore(now) && 
                (p.getExpiryDate() == null || p.getExpiryDate().isAfter(now))
            );
            if (hasActive) {
                log.debug("模型 {} 的 {} 计费配置已存在，跳过初始化", model.getModelName(), pricingType);
                return;
            }
        }

        AIModelPricing pricing = new AIModelPricing();
        pricing.setModelId(model.getId());
        pricing.setPricingType(pricingType);
        pricing.setUnitPrice(unitPrice);
        pricing.setUnit(unit);
        pricing.setMinChargeUnit(minChargeUnit);
        pricing.setEffectiveDate(LocalDateTime.now());
        pricing.setExpiryDate(null); // 永久有效
        pricing.setIsActive(true);
        pricingRepository.save(pricing);
        log.info("初始化计费配置: {} - {} - ¥{}/{}", model.getModelName(), pricingType, unitPrice, unit);
    }
}

