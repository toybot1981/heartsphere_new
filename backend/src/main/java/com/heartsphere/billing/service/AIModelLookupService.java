package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIModel;
import com.heartsphere.billing.entity.AIProvider;
import com.heartsphere.billing.repository.AIModelRepository;
import com.heartsphere.billing.repository.AIProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * AI模型查找服务
 * 根据provider和model code查找模型ID
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIModelLookupService {
    
    private final AIProviderRepository providerRepository;
    private final AIModelRepository modelRepository;
    
    /**
     * 根据provider名称和model code查找模型ID
     */
    @Transactional(readOnly = true)
    public Optional<Long> findModelId(String providerName, String modelCode) {
        if (providerName == null || modelCode == null) {
            return Optional.empty();
        }
        
        // 查找provider
        Optional<AIProvider> providerOpt = providerRepository.findByName(providerName);
        if (providerOpt.isEmpty()) {
            log.warn("未找到provider: {}", providerName);
            return Optional.empty();
        }
        
        // 查找model
        Optional<AIModel> modelOpt = modelRepository.findByProviderIdAndModelCode(
            providerOpt.get().getId(), modelCode);
        
        if (modelOpt.isEmpty()) {
            log.warn("未找到model: provider={}, modelCode={}", providerName, modelCode);
            return Optional.empty();
        }
        
        return Optional.of(modelOpt.get().getId());
    }
    
    /**
     * 根据provider名称和model code查找provider ID
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
    
    /**
     * 根据provider ID和model code查找或创建model
     */
    @Transactional
    public AIModel findOrCreateModel(Long providerId, String modelCode, String modelName, String modelType) {
        return modelRepository.findByProviderIdAndModelCode(providerId, modelCode)
            .orElseGet(() -> {
                AIModel model = new AIModel();
                model.setProviderId(providerId);
                model.setModelCode(modelCode);
                model.setModelName(modelName != null ? modelName : modelCode);
                model.setModelType(modelType != null ? modelType : "text");
                model.setEnabled(true);
                return modelRepository.save(model);
            });
    }
}

