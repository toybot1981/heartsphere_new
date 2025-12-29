package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIProvider;
import com.heartsphere.billing.repository.AIProviderRepository;
import com.heartsphere.billing.service.ResourcePoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 计费数据初始化服务
 * 注意：ai_models表已被ai_model_config替代，此服务仅初始化provider和资源池
 * 模型配置和定价配置现在通过管理后台在ai_model_config中管理
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingInitializationService {

    private final AIProviderRepository providerRepository;
    private final ResourcePoolService resourcePoolService;

    /**
     * 初始化提供商和资源池
     * 注意：不再初始化模型，模型配置现在通过ai_model_config管理
     */
    @Transactional
    public void initializeBillingData() {
        log.info("开始初始化计费数据（仅初始化provider和资源池）...");

        // 1. 初始化提供商
        AIProvider openaiProvider = initOrGetProvider("openai", "OpenAI", true);
        AIProvider dashscopeProvider = initOrGetProvider("dashscope", "阿里云通义千问", true);
        AIProvider geminiProvider = initOrGetProvider("gemini", "Google Gemini", true);
        AIProvider zhipuProvider = initOrGetProvider("zhipu", "智谱AI", true);
        AIProvider bigmodelProvider = initOrGetProvider("bigmodel", "智谱AI BigModel", true);
        AIProvider doubaoProvider = initOrGetProvider("doubao", "字节跳动豆包", true);

        // 2. 为每个提供商初始化资源池
        resourcePoolService.getOrCreatePool(openaiProvider.getId());
        resourcePoolService.getOrCreatePool(dashscopeProvider.getId());
        resourcePoolService.getOrCreatePool(geminiProvider.getId());
        resourcePoolService.getOrCreatePool(zhipuProvider.getId());
        resourcePoolService.getOrCreatePool(bigmodelProvider.getId());
        resourcePoolService.getOrCreatePool(doubaoProvider.getId());
        log.info("资源池初始化完成");

        log.info("计费数据初始化完成（模型配置请通过管理后台在ai_model_config中管理）");
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
}

