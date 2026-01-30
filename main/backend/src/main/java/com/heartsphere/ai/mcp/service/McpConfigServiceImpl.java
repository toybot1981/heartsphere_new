package com.heartsphere.ai.mcp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.mcp.entity.McpServerConfig;
import com.heartsphere.ai.mcp.entity.McpServiceTemplate;
import com.heartsphere.ai.mcp.repository.McpServerConfigRepository;
import com.heartsphere.ai.mcp.util.McpUrlValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        validateServerUrl(config);
        return repository.save(config);
    }

    @Override
    @Transactional
    public McpServerConfig updateConfig(Long id, McpServerConfig config) {
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
        validateServerUrl(existing);
        return repository.save(existing);
    }

    @Override
    @Transactional
    public McpServerConfig createConfigFromTemplate(Long templateId, Map<String, String> parameters) {
        McpServiceTemplate template = templateService.getTemplateById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("模板不存在: " + templateId));
        McpServerConfig config = new McpServerConfig();
        config.setTemplateId(templateId);
        config.setName(template.getTemplateName());
        config.setServerType(template.getServerType());
        config.setDescription(template.getDescription());
        config.setEnabled(false);

        if (template.getDefaultUrlTemplate() != null) {
            String url = template.getDefaultUrlTemplate();
            for (Map.Entry<String, String> e : parameters.entrySet()) {
                url = url.replace("{" + e.getKey() + "}", e.getValue());
            }
            config.setServerUrl(url);
        } else if (template.getDefaultUrl() != null) {
            config.setServerUrl(template.getDefaultUrl());
        }

        try {
            if (template.getRequiredParams() != null) {
                List<String> required = objectMapper.readValue(template.getRequiredParams(), new TypeReference<>() {});
                for (String p : required) {
                    String v = parameters.get(p);
                    if (v == null || v.isEmpty()) throw new IllegalArgumentException("缺少必需参数: " + p);
                    if ("apiKey".equals(p) || "token".equals(p)) config.setApiKey(v);
                }
            }
            Map<String, Object> extra = new HashMap<>();
            if (template.getOptionalParams() != null) {
                Map<String, Object> opt = objectMapper.readValue(template.getOptionalParams(), new TypeReference<>() {});
                for (Map.Entry<String, Object> e : opt.entrySet()) {
                    String v = parameters.getOrDefault(e.getKey(), e.getValue() != null ? e.getValue().toString() : null);
                    if (v != null) extra.put(e.getKey(), v);
                }
            }
            for (Map.Entry<String, String> e : parameters.entrySet()) {
                if (!"apiKey".equals(e.getKey()) && !"token".equals(e.getKey()))
                    extra.put(e.getKey(), e.getValue());
            }
            if (!extra.isEmpty()) config.setExtraConfig(objectMapper.writeValueAsString(extra));
        } catch (Exception e) {
            log.error("createConfigFromTemplate params", e);
            throw new RuntimeException("处理模板参数失败: " + e.getMessage(), e);
        }
        validateServerUrl(config);
        return repository.save(config);
    }

    @Override
    @Transactional
    public void deleteConfig(Long id) {
        repository.deleteById(id);
    }

    @Override
    public McpServerConfig getConfig(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
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
            log.error("testConnection config {} failed", id, e);
            config.setConnectionStatus("ERROR");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(e.getMessage());
            repository.save(config);
            return false;
        }
    }
    
    /**
     * 验证 serverUrl 格式
     * 当前仅支持 HTTP/HTTPS 类型的 MCP 服务器
     */
    private void validateServerUrl(McpServerConfig config) {
        McpUrlValidator.validateUrl(
            config.getServerUrl(),
            config.getId(),
            config.getName(),
            config.getServerType()
        );
    }
}
