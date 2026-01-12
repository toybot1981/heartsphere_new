package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.entity.UserAIConfig;
import com.heartsphere.aiagent.entity.SystemAIConfig;
import com.heartsphere.aiagent.repository.UserAIConfigRepository;
import com.heartsphere.aiagent.repository.SystemAIConfigRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * AI配置服务
 * 管理用户和系统的AI配置
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIConfigService {
    
    private final UserAIConfigRepository userAIConfigRepository;
    private final SystemAIConfigRepository systemAIConfigRepository;
    private final ObjectMapper objectMapper;
    
    // 默认配置值
    private static final String DEFAULT_TEXT_PROVIDER = "dashscope";
    private static final String DEFAULT_TEXT_MODEL = "qwen-max";
    private static final String DEFAULT_IMAGE_PROVIDER = "dashscope";
    private static final String DEFAULT_IMAGE_MODEL = "wanx-v1";
    private static final Double DEFAULT_TEMPERATURE = 0.7;
    private static final Integer DEFAULT_MAX_TOKENS = 2000;
    
    /**
     * 获取用户配置（如果不存在则创建默认配置）
     */
    @Transactional
    public UserAIConfig getUserConfig(Long userId) {
        Optional<UserAIConfig> configOpt = userAIConfigRepository.findByUserId(userId);
        
        if (configOpt.isPresent()) {
            return configOpt.get();
        }
        
        // 创建默认配置
        UserAIConfig defaultConfig = new UserAIConfig();
        defaultConfig.setUserId(userId);
        defaultConfig.setTextProvider(getSystemConfigValue("default_text_provider", DEFAULT_TEXT_PROVIDER));
        defaultConfig.setTextModel(getSystemConfigValue("default_text_model", DEFAULT_TEXT_MODEL));
        defaultConfig.setImageProvider(getSystemConfigValue("default_image_provider", DEFAULT_IMAGE_PROVIDER));
        defaultConfig.setImageModel(getSystemConfigValue("default_image_model", DEFAULT_IMAGE_MODEL));
        defaultConfig.setDefaultTemperature(DEFAULT_TEMPERATURE);
        defaultConfig.setDefaultMaxTokens(DEFAULT_MAX_TOKENS);
        
        return userAIConfigRepository.save(defaultConfig);
    }
    
    /**
     * 更新用户配置
     */
    @Transactional
    public UserAIConfig updateUserConfig(Long userId, UserAIConfig config) {
        UserAIConfig existingConfig = getUserConfig(userId);
        
        // 更新字段
        if (config.getTextProvider() != null) {
            existingConfig.setTextProvider(config.getTextProvider());
        }
        if (config.getTextModel() != null) {
            existingConfig.setTextModel(config.getTextModel());
        }
        if (config.getImageProvider() != null) {
            existingConfig.setImageProvider(config.getImageProvider());
        }
        if (config.getImageModel() != null) {
            existingConfig.setImageModel(config.getImageModel());
        }
        if (config.getAudioProvider() != null) {
            existingConfig.setAudioProvider(config.getAudioProvider());
        }
        if (config.getAudioModel() != null) {
            existingConfig.setAudioModel(config.getAudioModel());
        }
        if (config.getVideoProvider() != null) {
            existingConfig.setVideoProvider(config.getVideoProvider());
        }
        if (config.getVideoModel() != null) {
            existingConfig.setVideoModel(config.getVideoModel());
        }
        if (config.getDefaultTemperature() != null) {
            existingConfig.setDefaultTemperature(config.getDefaultTemperature());
        }
        if (config.getDefaultMaxTokens() != null) {
            existingConfig.setDefaultMaxTokens(config.getDefaultMaxTokens());
        }
        if (config.getConfigJson() != null) {
            existingConfig.setConfigJson(config.getConfigJson());
        }
        
        return userAIConfigRepository.save(existingConfig);
    }
    
    /**
     * 获取系统配置值
     */
    private String getSystemConfigValue(String key, String defaultValue) {
        Optional<SystemAIConfig> configOpt = systemAIConfigRepository.findByConfigKeyAndIsActiveTrue(key);
        
        if (configOpt.isPresent()) {
            String value = configOpt.get().getConfigValue();
            // 如果值是JSON字符串（带引号），去除引号
            if (value != null && value.startsWith("\"") && value.endsWith("\"")) {
                return value.substring(1, value.length() - 1);
            }
            return value;
        }
        
        return defaultValue;
    }
    
    /**
     * 获取用户的文本生成提供商
     */
    public String getUserTextProvider(Long userId) {
        UserAIConfig config = getUserConfig(userId);
        return config.getTextProvider() != null ? config.getTextProvider() : DEFAULT_TEXT_PROVIDER;
    }
    
    /**
     * 获取用户的文本生成模型
     */
    public String getUserTextModel(Long userId) {
        UserAIConfig config = getUserConfig(userId);
        return config.getTextModel() != null ? config.getTextModel() : DEFAULT_TEXT_MODEL;
    }
    
    /**
     * 获取用户的图片生成提供商
     */
    public String getUserImageProvider(Long userId) {
        UserAIConfig config = getUserConfig(userId);
        return config.getImageProvider() != null ? config.getImageProvider() : DEFAULT_IMAGE_PROVIDER;
    }
    
    /**
     * 获取用户的图片生成模型
     */
    public String getUserImageModel(Long userId) {
        UserAIConfig config = getUserConfig(userId);
        return config.getImageModel() != null ? config.getImageModel() : DEFAULT_IMAGE_MODEL;
    }
}


