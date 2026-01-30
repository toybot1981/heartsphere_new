package com.heartsphere.shared.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.shared.entity.ToolConfig;
import com.heartsphere.shared.repository.ToolConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 工具配置服务
 * 提供工具配置的读取和更新功能，支持缓存
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ToolConfigService {
    
    private final ToolConfigRepository toolConfigRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 根据工具名称获取配置（带缓存）
     */
    @Cacheable(value = "toolConfigs", key = "#toolName")
    public Optional<ToolConfig> getConfigByToolName(String toolName) {
        log.info("从数据库读取工具配置: toolName={}", toolName);
        return toolConfigRepository.findByToolName(toolName);
    }
    
    /**
     * 根据分类获取所有启用的配置
     */
    public List<ToolConfig> getConfigsByCategory(String category) {
        return toolConfigRepository.findByCategoryAndIsActiveTrue(category);
    }
    
    /**
     * 获取所有启用的配置
     */
    public List<ToolConfig> getAllActiveConfigs() {
        return toolConfigRepository.findByIsActiveTrue();
    }
    
    /**
     * 保存或更新工具配置
     */
    @Transactional
    @CacheEvict(value = "toolConfigs", key = "#config.toolName")
    public ToolConfig saveConfig(ToolConfig config) {
        log.info("保存工具配置: toolName={}", config.getToolName());
        return toolConfigRepository.save(config);
    }
    
    /**
     * 删除工具配置
     */
    @Transactional
    @CacheEvict(value = "toolConfigs", key = "#toolName")
    public void deleteConfig(String toolName) {
        log.info("删除工具配置: toolName={}", toolName);
        toolConfigRepository.findByToolName(toolName)
            .ifPresent(toolConfigRepository::delete);
    }
    
    /**
     * 检查工具配置是否存在
     */
    public boolean existsByToolName(String toolName) {
        return toolConfigRepository.existsByToolName(toolName);
    }
    
    /**
     * 解析指令模板（JSON 格式）
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> parseInstructionTemplate(String instructionTemplate) {
        if (instructionTemplate == null || instructionTemplate.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return (Map<String, Object>) objectMapper.readValue(instructionTemplate, Map.class);
        } catch (Exception e) {
            log.warn("解析指令模板失败: {}", e.getMessage());
            return new HashMap<>();
        }
    }
    
    /**
     * 序列化指令模板为 JSON
     */
    public String serializeInstructionTemplate(Map<String, Object> instruction) {
        try {
            return objectMapper.writeValueAsString(instruction);
        } catch (Exception e) {
            log.warn("序列化指令模板失败: {}", e.getMessage());
            return "{}";
        }
    }
    
    /**
     * 解析参数模式（JSON Schema 格式）
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> parseParametersSchema(String parametersSchema) {
        if (parametersSchema == null || parametersSchema.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return (Map<String, Object>) objectMapper.readValue(parametersSchema, Map.class);
        } catch (Exception e) {
            log.warn("解析参数模式失败: {}", e.getMessage());
            return new HashMap<>();
        }
    }
    
    /**
     * 序列化参数模式为 JSON
     */
    public String serializeParametersSchema(Map<String, Object> schema) {
        try {
            return objectMapper.writeValueAsString(schema);
        } catch (Exception e) {
            log.warn("序列化参数模式失败: {}", e.getMessage());
            return "{}";
        }
    }
}
