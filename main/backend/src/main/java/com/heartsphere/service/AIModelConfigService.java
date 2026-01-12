package com.heartsphere.service;

import com.heartsphere.dto.AIModelConfigDTO;
import com.heartsphere.entity.AIModelConfig;
import com.heartsphere.repository.AIModelConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI模型配置服务
 * 注意：此服务直接访问数据库，admin 只负责配置
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
