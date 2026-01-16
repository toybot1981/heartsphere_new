package com.heartsphere.mentis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mentis.entity.McpServerConfig;
import com.heartsphere.mentis.entity.McpServiceTemplate;
import com.heartsphere.mentis.repository.McpServerConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP 服务器配置管理服务实现
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class McpConfigServiceImpl implements McpConfigService {

    private final McpServerConfigRepository repository;
    private final McpClientService mcpClientService;
    private final McpServiceTemplateService templateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public McpServerConfig createConfig(McpServerConfig config) {
        log.info("Creating MCP server config: {}", config.getName());
        return repository.save(config);
    }

    @Override
    @Transactional
    public McpServerConfig updateConfig(Long id, McpServerConfig config) {
        log.info("Updating MCP server config: {}", id);
        McpServerConfig existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
        
        existing.setName(config.getName());
        existing.setServerType(config.getServerType());
        existing.setServerUrl(config.getServerUrl());
        existing.setApiKey(config.getApiKey());
        existing.setEnabled(config.getEnabled());
        existing.setDescription(config.getDescription());
        existing.setExtraConfig(config.getExtraConfig());
        existing.setTemplateId(config.getTemplateId());
        
        return repository.save(existing);
    }
    
    /**
     * 从模板创建配置
     */
    @Override
    @Transactional
    public McpServerConfig createConfigFromTemplate(Long templateId, Map<String, String> parameters) {
        log.info("从模板创建 MCP 配置: templateId={}", templateId);
        
        McpServiceTemplate template = templateService.getTemplateById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("模板不存在: " + templateId));
        
        McpServerConfig config = new McpServerConfig();
        config.setTemplateId(templateId);
        config.setName(template.getTemplateName());
        config.setServerType(template.getServerType());
        config.setDescription(template.getDescription());
        config.setEnabled(false); // 默认禁用，需要测试通过后启用
        
        // 处理 URL
        if (template.getDefaultUrlTemplate() != null) {
            String url = template.getDefaultUrlTemplate();
            // 替换模板变量
            for (Map.Entry<String, String> param : parameters.entrySet()) {
                url = url.replace("{" + param.getKey() + "}", param.getValue());
            }
            config.setServerUrl(url);
        } else if (template.getDefaultUrl() != null) {
            config.setServerUrl(template.getDefaultUrl());
        }
        
        // 处理必需参数
        try {
            if (template.getRequiredParams() != null) {
                List<String> requiredParams = objectMapper.readValue(
                        template.getRequiredParams(), 
                        new TypeReference<List<String>>() {});
                
                for (String paramName : requiredParams) {
                    String value = parameters.get(paramName);
                    if (value == null || value.isEmpty()) {
                        throw new IllegalArgumentException("缺少必需参数: " + paramName);
                    }
                    
                    // API Key 特殊处理
                    if ("apiKey".equals(paramName) || "token".equals(paramName)) {
                        config.setApiKey(value);
                    }
                }
            }
            
            // 处理可选参数
            Map<String, Object> extraConfig = new HashMap<>();
            if (template.getOptionalParams() != null) {
                Map<String, Object> optionalParams = objectMapper.readValue(
                        template.getOptionalParams(),
                        new TypeReference<Map<String, Object>>() {});
                
                for (Map.Entry<String, Object> entry : optionalParams.entrySet()) {
                    String paramName = entry.getKey();
                    Object defaultValue = entry.getValue();
                    String value = parameters.getOrDefault(paramName, defaultValue != null ? defaultValue.toString() : null);
                    if (value != null) {
                        extraConfig.put(paramName, value);
                    }
                }
            }
            
            // 添加用户提供的其他参数
            for (Map.Entry<String, String> param : parameters.entrySet()) {
                if (!param.getKey().equals("apiKey") && !param.getKey().equals("token")) {
                    extraConfig.put(param.getKey(), param.getValue());
                }
            }
            
            if (!extraConfig.isEmpty()) {
                config.setExtraConfig(objectMapper.writeValueAsString(extraConfig));
            }
            
        } catch (Exception e) {
            log.error("处理模板参数失败", e);
            throw new RuntimeException("处理模板参数失败: " + e.getMessage(), e);
        }
        
        return repository.save(config);
    }

    @Override
    @Transactional
    public void deleteConfig(Long id) {
        log.info("Deleting MCP server config: {}", id);
        repository.deleteById(id);
    }

    @Override
    public McpServerConfig getConfig(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
    }

    @Override
    public List<McpServerConfig> getAllConfigs() {
        return repository.findAll();
    }

    @Override
    public List<McpServerConfig> getUserConfigs(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<McpServerConfig> getEnabledConfigs() {
        return repository.findByEnabledTrue();
    }

    @Override
    @Transactional
    public McpServerConfig toggleConfig(Long id, Boolean enabled) {
        McpServerConfig config = getConfig(id);
        config.setEnabled(enabled);
        return repository.save(config);
    }

    @Override
    @Transactional
    public boolean testConnection(Long id) {
        McpServerConfig config = getConfig(id);
        try {
            boolean connected = mcpClientService.testConnection(config);
            config.setConnectionStatus(connected ? "CONNECTED" : "DISCONNECTED");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(null);
            repository.save(config);
            return connected;
        } catch (Exception e) {
            log.error("Failed to test MCP connection for config: {}", id, e);
            config.setConnectionStatus("ERROR");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(e.getMessage());
            repository.save(config);
            return false;
        }
    }
}
