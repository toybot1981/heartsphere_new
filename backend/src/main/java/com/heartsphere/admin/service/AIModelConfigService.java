package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.AIModelConfigDTO;
import com.heartsphere.admin.entity.AIModelConfig;
import com.heartsphere.admin.repository.AIModelConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI模型配置服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIModelConfigService {
    
    private final AIModelConfigRepository modelConfigRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取所有模型配置
     */
    public List<AIModelConfigDTO> getAllModelConfigs() {
        return modelConfigRepository.findAllByIsActiveTrueOrderByCapabilityAscPriorityAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据能力类型获取模型配置
     */
    public List<AIModelConfigDTO> getModelConfigsByCapability(String capability) {
        return modelConfigRepository.findByCapabilityAndIsActiveTrueOrderByPriorityAsc(capability)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据提供商和能力类型获取模型配置
     */
    public List<AIModelConfigDTO> getModelConfigsByProviderAndCapability(String provider, String capability) {
        return modelConfigRepository.findByProviderAndCapabilityAndIsActiveTrue(provider, capability)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据ID获取模型配置
     */
    public AIModelConfigDTO getModelConfigById(Long id) {
        AIModelConfig config = modelConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI模型配置不存在: " + id));
        return toDTO(config);
    }
    
    /**
     * 创建模型配置
     */
    @Transactional
    public AIModelConfigDTO createModelConfig(AIModelConfigDTO dto) {
        // 如果设置为默认模型，需要先取消其他默认模型
        if (dto.getIsDefault() != null && dto.getIsDefault()) {
            clearDefaultModel(dto.getCapability());
        }
        
        AIModelConfig config = new AIModelConfig();
        config.setProvider(dto.getProvider());
        config.setModelName(dto.getModelName());
        config.setCapability(dto.getCapability());
        config.setApiKey(dto.getApiKey()); // 实际应该加密存储
        config.setBaseUrl(dto.getBaseUrl());
        config.setModelParams(dto.getModelParams());
        config.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);
        config.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        config.setCostPerToken(dto.getCostPerToken());
        config.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        config.setDescription(dto.getDescription());
        
        AIModelConfig saved = modelConfigRepository.save(config);
        log.info("创建AI模型配置: provider={}, model={}, capability={}", 
                saved.getProvider(), saved.getModelName(), saved.getCapability());
        return toDTO(saved);
    }
    
    /**
     * 更新模型配置
     */
    @Transactional
    public AIModelConfigDTO updateModelConfig(Long id, AIModelConfigDTO dto) {
        AIModelConfig config = modelConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI模型配置不存在: " + id));
        
        // 如果设置为默认模型，需要先取消其他默认模型
        if (dto.getIsDefault() != null && dto.getIsDefault() && !config.getIsDefault()) {
            clearDefaultModel(config.getCapability());
        }
        
        if (dto.getProvider() != null) config.setProvider(dto.getProvider());
        if (dto.getModelName() != null) config.setModelName(dto.getModelName());
        if (dto.getCapability() != null) config.setCapability(dto.getCapability());
        if (dto.getApiKey() != null) config.setApiKey(dto.getApiKey()); // 实际应该加密存储
        if (dto.getBaseUrl() != null) config.setBaseUrl(dto.getBaseUrl());
        if (dto.getModelParams() != null) config.setModelParams(dto.getModelParams());
        if (dto.getIsDefault() != null) config.setIsDefault(dto.getIsDefault());
        if (dto.getPriority() != null) config.setPriority(dto.getPriority());
        if (dto.getCostPerToken() != null) config.setCostPerToken(dto.getCostPerToken());
        if (dto.getIsActive() != null) config.setIsActive(dto.getIsActive());
        if (dto.getDescription() != null) config.setDescription(dto.getDescription());
        
        AIModelConfig saved = modelConfigRepository.save(config);
        log.info("更新AI模型配置: id={}, provider={}, model={}", 
                saved.getId(), saved.getProvider(), saved.getModelName());
        return toDTO(saved);
    }
    
    /**
     * 删除模型配置
     */
    @Transactional
    public void deleteModelConfig(Long id) {
        AIModelConfig config = modelConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI模型配置不存在: " + id));
        modelConfigRepository.delete(config);
        log.info("删除AI模型配置: id={}", id);
    }
    
    /**
     * 设置模型为默认模型
     */
    @Transactional
    public AIModelConfigDTO setDefaultModel(Long id) {
        AIModelConfig config = modelConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI模型配置不存在: " + id));
        
        // 清除同能力类型的其他默认模型
        clearDefaultModel(config.getCapability());
        
        // 设置当前模型为默认
        config.setIsDefault(true);
        AIModelConfig saved = modelConfigRepository.save(config);
        log.info("设置默认模型: id={}, provider={}, model={}, capability={}", 
                saved.getId(), saved.getProvider(), saved.getModelName(), saved.getCapability());
        return toDTO(saved);
    }
    
    /**
     * 清除指定能力类型的默认模型
     */
    @Transactional
    private void clearDefaultModel(String capability) {
        List<AIModelConfig> defaultConfigs = modelConfigRepository
                .findByIsDefaultTrueAndCapabilityAndIsActiveTrue(capability);
        for (AIModelConfig config : defaultConfigs) {
            config.setIsDefault(false);
            modelConfigRepository.save(config);
        }
    }
    
    /**
     * 根据ID获取模型配置（包含完整API key，用于内部使用）
     */
    public AIModelConfig getModelConfigWithApiKey(Long id) {
        return modelConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI模型配置不存在: " + id));
    }
    
    /**
     * 根据提供商、模型名称和能力类型获取模型配置（包含完整API key，用于内部使用）
     */
    public AIModelConfig getModelConfigWithApiKey(String provider, String modelName, String capability) {
        return modelConfigRepository.findByProviderAndModelNameAndCapability(provider, modelName, capability)
                .orElseThrow(() -> new RuntimeException(
                    String.format("AI模型配置不存在: provider=%s, model=%s, capability=%s", 
                            provider, modelName, capability)
                ));
    }
    
    /**
     * 转换为DTO
     */
    private AIModelConfigDTO toDTO(AIModelConfig config) {
        AIModelConfigDTO dto = new AIModelConfigDTO();
        dto.setId(config.getId());
        dto.setProvider(config.getProvider());
        dto.setModelName(config.getModelName());
        dto.setCapability(config.getCapability());
        // API Key部分隐藏
        if (config.getApiKey() != null && config.getApiKey().length() > 8) {
            dto.setApiKey(config.getApiKey().substring(0, 4) + "****" + 
                         config.getApiKey().substring(config.getApiKey().length() - 4));
        } else {
            dto.setApiKey(config.getApiKey());
        }
        dto.setBaseUrl(config.getBaseUrl());
        dto.setModelParams(config.getModelParams());
        dto.setIsDefault(config.getIsDefault());
        dto.setPriority(config.getPriority());
        dto.setCostPerToken(config.getCostPerToken());
        dto.setIsActive(config.getIsActive());
        dto.setDescription(config.getDescription());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());
        return dto;
    }
    
    /**
     * 转换为DTO（包含完整API key，用于内部使用）
     */
    public AIModelConfigDTO toDTOWithApiKey(AIModelConfig config) {
        AIModelConfigDTO dto = new AIModelConfigDTO();
        dto.setId(config.getId());
        dto.setProvider(config.getProvider());
        dto.setModelName(config.getModelName());
        dto.setCapability(config.getCapability());
        dto.setApiKey(config.getApiKey()); // 包含完整API key
        dto.setBaseUrl(config.getBaseUrl());
        dto.setModelParams(config.getModelParams());
        dto.setIsDefault(config.getIsDefault());
        dto.setPriority(config.getPriority());
        dto.setCostPerToken(config.getCostPerToken());
        dto.setIsActive(config.getIsActive());
        dto.setDescription(config.getDescription());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());
        return dto;
    }
}

