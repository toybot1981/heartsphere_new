package com.heartsphere.admin.service.impl;

import com.heartsphere.admin.config.DataSourceContextHolder;
import com.heartsphere.admin.dto.McpConfigDTO;
import com.heartsphere.admin.repository.McpConfigRepository;
import com.heartsphere.admin.service.MentisManagementService;
import com.heartsphere.admin.service.MentisSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mentis 管理服务实现
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MentisManagementServiceImpl implements MentisManagementService {
    
    private final McpConfigRepository mcpConfigRepository;
    private final MentisSyncService mentisSyncService;
    private final RestTemplate restTemplate;
    
    @Value("${mentis.backend.base-url:http://localhost:8082}")
    private String mentisBackendBaseUrl;
    
    @Override
    public List<McpConfigDTO> getMcpConfigs() {
        return mcpConfigRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public McpConfigDTO getMcpConfig(Long id) {
        return mcpConfigRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
    }
    
    @Override
    public McpConfigDTO createMcpConfig(McpConfigDTO dto) {
        McpConfigRepository.McpConfigEntity entity = toEntity(dto);
        McpConfigRepository.McpConfigEntity saved = mcpConfigRepository.save(entity);
        
        // 通知 Mentis 重新加载配置
        mentisSyncService.notifyMentisReload();
        
        return toDTO(saved);
    }
    
    @Override
    public McpConfigDTO updateMcpConfig(Long id, McpConfigDTO dto) {
        McpConfigRepository.McpConfigEntity existing = mcpConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
        
        // 更新字段
        existing.setName(dto.getName());
        existing.setServerType(dto.getServerType());
        existing.setServerUrl(dto.getServerUrl());
        if (dto.getApiKey() != null && !dto.getApiKey().isEmpty()) {
            existing.setApiKey(dto.getApiKey());
        }
        existing.setEnabled(dto.getEnabled());
        existing.setDescription(dto.getDescription());
        existing.setExtraConfig(dto.getExtraConfig());
        existing.setUserId(dto.getUserId());
        
        McpConfigRepository.McpConfigEntity saved = mcpConfigRepository.save(existing);
        
        // 通知 Mentis 重新加载配置
        mentisSyncService.notifyMentisReload();
        
        return toDTO(saved);
    }
    
    @Override
    public void deleteMcpConfig(Long id) {
        mcpConfigRepository.deleteById(id);
        
        // 通知 Mentis 重新加载配置
        mentisSyncService.notifyMentisReload();
    }
    
    @Override
    public boolean testMcpConnection(Long id) {
        McpConfigRepository.McpConfigEntity config = mcpConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
        
        try {
            // 调用 Mentis 后端的测试接口
            String url = mentisBackendBaseUrl + "/api/mentis/mcp/configs/" + id + "/test";
            ResponseEntity<Object> response = restTemplate.postForEntity(url, null, Object.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            
            // 更新连接状态
            config.setLastTestedAt(LocalDateTime.now());
            config.setConnectionStatus(success ? "CONNECTED" : "ERROR");
            if (!success) {
                config.setLastError("Connection test failed");
            } else {
                config.setLastError(null);
            }
            mcpConfigRepository.save(config);
            
            return success;
        } catch (Exception e) {
            log.error("Failed to test MCP connection for config {}", id, e);
            config.setLastTestedAt(LocalDateTime.now());
            config.setConnectionStatus("ERROR");
            config.setLastError(e.getMessage());
            mcpConfigRepository.save(config);
            return false;
        }
    }
    
    @Override
    public List<Object> getMcpTools(Long id) {
        try {
            String url = mentisBackendBaseUrl + "/api/mentis/mcp/configs/" + id + "/tools";
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // 假设返回的是包含 tools 列表的对象
                if (response.getBody() instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> body = (java.util.Map<String, Object>) response.getBody();
                    Object data = body.get("data");
                    if (data != null && data instanceof java.util.List) {
                        @SuppressWarnings("unchecked")
                        List<Object> tools = (List<Object>) data;
                        return tools;
                    }
                }
            }
            return List.of();
        } catch (Exception e) {
            log.error("Failed to get MCP tools for config {}", id, e);
            return List.of();
        }
    }
    
    @Override
    public void notifyMentisReload() {
        mentisSyncService.notifyMentisReload();
    }
    
    private McpConfigDTO toDTO(McpConfigRepository.McpConfigEntity entity) {
        McpConfigDTO dto = new McpConfigDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setServerType(entity.getServerType());
        dto.setServerUrl(entity.getServerUrl());
        dto.setApiKey(entity.getApiKey()); // 注意：前端应该掩码显示
        dto.setEnabled(entity.getEnabled());
        dto.setDescription(entity.getDescription());
        dto.setExtraConfig(entity.getExtraConfig());
        dto.setUserId(entity.getUserId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setLastTestedAt(entity.getLastTestedAt());
        dto.setConnectionStatus(entity.getConnectionStatus());
        dto.setLastError(entity.getLastError());
        return dto;
    }
    
    private McpConfigRepository.McpConfigEntity toEntity(McpConfigDTO dto) {
        McpConfigRepository.McpConfigEntity entity = new McpConfigRepository.McpConfigEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setServerType(dto.getServerType());
        entity.setServerUrl(dto.getServerUrl());
        entity.setApiKey(dto.getApiKey());
        entity.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        entity.setDescription(dto.getDescription());
        entity.setExtraConfig(dto.getExtraConfig());
        entity.setUserId(dto.getUserId());
        entity.setConnectionStatus(dto.getConnectionStatus() != null ? dto.getConnectionStatus() : "DISCONNECTED");
        return entity;
    }
}
