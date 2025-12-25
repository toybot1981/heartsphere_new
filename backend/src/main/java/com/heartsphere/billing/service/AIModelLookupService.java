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
        try {
            Optional<AIModel> modelOpt = modelRepository.findByProviderIdAndModelCode(
                providerOpt.get().getId(), modelCode);
            
            if (modelOpt.isEmpty()) {
                log.warn("未找到model: provider={}, modelCode={}", providerName, modelCode);
                return Optional.empty();
            }
            
            return Optional.of(modelOpt.get().getId());
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
            // 如果返回多条记录，使用findAll获取第一条
            log.warn("发现重复的模型记录: provider={}, modelCode={}, 使用第一条", providerName, modelCode);
            java.util.List<AIModel> models = modelRepository.findAllByProviderIdAndModelCode(
                providerOpt.get().getId(), modelCode);
            if (models.isEmpty()) {
                log.warn("未找到model: provider={}, modelCode={}", providerName, modelCode);
                return Optional.empty();
            }
            return Optional.of(models.get(0).getId());
        }
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
     * 如果存在重复记录，返回第一条，并记录警告
     */
    @Transactional
    public AIModel findOrCreateModel(Long providerId, String modelCode, String modelName, String modelType) {
        // 先尝试使用Optional方法查找
        Optional<AIModel> modelOpt = modelRepository.findByProviderIdAndModelCode(providerId, modelCode);
        
        // 如果找到，直接返回
        if (modelOpt.isPresent()) {
            return modelOpt.get();
        }
        
        // 如果没有找到，检查是否有重复记录（并发创建可能导致）
        // 注意：由于findByProviderIdAndModelCode使用了ORDER BY，应该只返回一条
        // 但为了安全，这里再次尝试查找
        try {
            Optional<AIModel> retryOpt = modelRepository.findByProviderIdAndModelCode(providerId, modelCode);
            if (retryOpt.isPresent()) {
                return retryOpt.get();
            }
        } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
            // 如果仍然返回多条记录，使用自定义查询获取第一条
            log.warn("发现重复的模型记录: providerId={}, modelCode={}, 尝试使用findAllByProviderIdAndModelCode", 
                    providerId, modelCode);
            java.util.List<AIModel> models = modelRepository.findAllByProviderIdAndModelCode(providerId, modelCode);
            if (!models.isEmpty()) {
                log.warn("使用第一条重复记录: providerId={}, modelCode={}, count={}, modelId={}", 
                        providerId, modelCode, models.size(), models.get(0).getId());
                return models.get(0);
            }
        }
        
        // 创建新模型
        AIModel model = new AIModel();
        model.setProviderId(providerId);
        model.setModelCode(modelCode);
        model.setModelName(modelName != null ? modelName : modelCode);
        model.setModelType(modelType != null ? modelType : "text");
        model.setEnabled(true);
        
        try {
            return modelRepository.save(model);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 如果保存时发生唯一性约束冲突，说明并发创建了，再次查找
            log.warn("并发创建模型导致冲突，重新查找: providerId={}, modelCode={}", providerId, modelCode);
            try {
                Optional<AIModel> retryOpt = modelRepository.findByProviderIdAndModelCode(providerId, modelCode);
                if (retryOpt.isPresent()) {
                    return retryOpt.get();
                }
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException ex) {
                // 如果仍然返回多条记录，使用findAll获取第一条
                java.util.List<AIModel> models = modelRepository.findAllByProviderIdAndModelCode(providerId, modelCode);
                if (!models.isEmpty()) {
                    log.warn("并发创建后找到重复记录，使用第一条: providerId={}, modelCode={}, count={}", 
                            providerId, modelCode, models.size());
                    return models.get(0);
                }
            }
            throw e;
        }
    }
}

