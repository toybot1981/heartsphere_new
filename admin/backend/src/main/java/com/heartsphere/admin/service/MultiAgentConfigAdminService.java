package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.MultiAgentSystemConfigDTO;
import com.heartsphere.admin.entity.SystemConfig;
import com.heartsphere.admin.repository.SystemConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * 多智能体系统配置管理服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MultiAgentConfigAdminService {
    
    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper;
    
    private static final String SYSTEM_CONFIG_KEY = "multi_agent_system_config";
    
    /**
     * 获取系统配置
     */
    public MultiAgentSystemConfigDTO getSystemConfig() {
        SystemConfig config = systemConfigRepository.findByConfigKey(SYSTEM_CONFIG_KEY)
            .orElse(null);
        
        if (config == null || config.getConfigValue() == null) {
            return getDefaultSystemConfig();
        }
        
        try {
            return objectMapper.readValue(config.getConfigValue(), MultiAgentSystemConfigDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse system config", e);
            return getDefaultSystemConfig();
        }
    }
    
    /**
     * 更新系统配置
     */
    @Transactional
    public void updateSystemConfig(MultiAgentSystemConfigDTO configDTO) {
        try {
            // 验证配置
            validateConfig(configDTO);
            
            String configValue = objectMapper.writeValueAsString(configDTO);
            
            SystemConfig config = systemConfigRepository.findByConfigKey(SYSTEM_CONFIG_KEY)
                .orElse(new SystemConfig());
            
            config.setConfigKey(SYSTEM_CONFIG_KEY);
            config.setConfigValue(configValue);
            config.setDescription("多智能体系统配置");
            
            systemConfigRepository.save(config);
            
            log.info("System config updated");
        } catch (Exception e) {
            log.error("Failed to update system config", e);
            throw new RuntimeException("Failed to update system config: " + e.getMessage(), e);
        }
    }
    
    /**
     * 验证配置
     */
    private void validateConfig(MultiAgentSystemConfigDTO configDTO) {
        if (configDTO.getCollaborationTimeoutSeconds() != null && 
            configDTO.getCollaborationTimeoutSeconds() < 1) {
            throw new IllegalArgumentException("Collaboration timeout must be at least 1 second");
        }
        
        if (configDTO.getMaxRetryCount() != null && 
            configDTO.getMaxRetryCount() < 0) {
            throw new IllegalArgumentException("Max retry count cannot be negative");
        }
        
        if (configDTO.getMaxConcurrentCollaborations() != null && 
            configDTO.getMaxConcurrentCollaborations() < 1) {
            throw new IllegalArgumentException("Max concurrent collaborations must be at least 1");
        }
    }
    
    /**
     * 获取默认系统配置
     */
    private MultiAgentSystemConfigDTO getDefaultSystemConfig() {
        MultiAgentSystemConfigDTO.AgentScopeConfigDTO agentScopeConfig = 
            MultiAgentSystemConfigDTO.AgentScopeConfigDTO.builder()
                .enabled(true)
                .modelName("qwen-max")
                .maxIters(10)
                .stream(false)
                .build();
        
        return MultiAgentSystemConfigDTO.builder()
            .collaborationTimeoutSeconds(30)
            .maxRetryCount(3)
            .maxConcurrentCollaborations(10)
            .logLevel("INFO")
            .agentScopeConfig(agentScopeConfig)
            .build();
    }
}
