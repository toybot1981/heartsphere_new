package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIProvider;
import com.heartsphere.billing.repository.AIProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * AI Provider查找服务
 * 注意：ai_models表已被ai_model_config替代，此服务仅处理provider相关操作
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIModelLookupService {
    
    private final AIProviderRepository providerRepository;
    
    /**
     * 根据provider名称查找provider ID
     */
    @Transactional(readOnly = true)
    public Optional<Long> findProviderId(String providerName) {
        return providerRepository.findByName(providerName)
            .map(AIProvider::getId);
    }
    
    /**
     * 根据provider名称查找或创建provider
     */
    @Transactional
    public AIProvider findOrCreateProvider(String providerName, String displayName) {
        return providerRepository.findByName(providerName)
            .orElseGet(() -> {
                AIProvider provider = new AIProvider();
                provider.setName(providerName);
                provider.setDisplayName(displayName != null ? displayName : providerName);
                provider.setEnabled(true);
                return providerRepository.save(provider);
            });
    }
}

