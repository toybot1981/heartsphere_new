package com.heartsphere.admin.service.impl;

import com.heartsphere.admin.dto.MentisMcpConfigDTO;
import com.heartsphere.admin.repository.MentisMcpConfigRepository;
import com.heartsphere.admin.service.MentisManagementService;
import com.heartsphere.admin.service.MentisSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mentis 管理服务实现
 * 
 * 注意：MCP 功能已从 mentis 迁移至 main。
 * - 数据表管理：直接操作 main 数据源（heartsphere 数据库）中的 mcp_server_configs 表
 * - 业务操作（测试、工具列表、工具调用）：调用 main 的 /api/v1/ai/mcp/... 接口
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MentisManagementServiceImpl implements MentisManagementService {
    
    private final MentisMcpConfigRepository mentisMcpConfigRepository;
    private final MentisSyncService mentisSyncService;
    private final RestTemplate restTemplate;
    
    @Value("${main.backend.base-url:http://localhost:8081}")
    private String mainBackendBaseUrl;
    
    @Override
    public List<MentisMcpConfigDTO> getMcpConfigs() {
        return mentisMcpConfigRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public MentisMcpConfigDTO getMcpConfig(Long id) {
        return mentisMcpConfigRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
    }
    
    @Override
    public MentisMcpConfigDTO createMcpConfig(MentisMcpConfigDTO dto) {
        MentisMcpConfigRepository.MentisMcpConfigEntity entity = toEntity(dto);
        MentisMcpConfigRepository.MentisMcpConfigEntity saved = mentisMcpConfigRepository.save(entity);
        
        // MCP 功能已迁移至 main，不再需要通知 mentis 重新加载
        // mentisSyncService.notifyMentisReload();
        
        return toDTO(saved);
    }
    
    @Override
    public MentisMcpConfigDTO updateMcpConfig(Long id, MentisMcpConfigDTO dto) {
        MentisMcpConfigRepository.MentisMcpConfigEntity existing = mentisMcpConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
        
        // 更新字段
        // templateId 在 DTO 中暂未定义，但 Entity 支持（main 表有此字段）
        // 如果将来 DTO 添加 templateId，可以在这里更新：existing.setTemplateId(dto.getTemplateId());
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
        
        MentisMcpConfigRepository.MentisMcpConfigEntity saved = mentisMcpConfigRepository.save(existing);
        
        // MCP 功能已迁移至 main，不再需要通知 mentis 重新加载
        // mentisSyncService.notifyMentisReload();
        
        return toDTO(saved);
    }
    
    @Override
    public void deleteMcpConfig(Long id) {
        mentisMcpConfigRepository.deleteById(id);
        
        // MCP 功能已迁移至 main，不再需要通知 mentis 重新加载
        // mentisSyncService.notifyMentisReload();
    }
    
    @Override
    public boolean testMcpConnection(Long id) {
        MentisMcpConfigRepository.MentisMcpConfigEntity config = mentisMcpConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
        
        try {
            // 调用 main 后端的 MCP 测试接口
            String url = mainBackendBaseUrl + "/api/v1/ai/mcp/configs/" + id + "/test";
            ResponseEntity<Object> response = restTemplate.postForEntity(url, null, Object.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            
            // 解析响应获取连接状态
            if (response.getBody() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                if (body != null && body.get("data") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    if (data != null && data.get("connected") instanceof Boolean) {
                        success = (Boolean) data.get("connected");
                    }
                }
            }
            
            // 更新连接状态
            config.setLastTestedAt(LocalDateTime.now());
            config.setConnectionStatus(success ? "CONNECTED" : "ERROR");
            if (!success) {
                config.setLastError("Connection test failed");
            } else {
                config.setLastError(null);
            }
            mentisMcpConfigRepository.save(config);
            
            return success;
        } catch (Exception e) {
            log.error("Failed to test MCP connection for config {}", id, e);
            config.setLastTestedAt(LocalDateTime.now());
            config.setConnectionStatus("ERROR");
            config.setLastError(e.getMessage());
            mentisMcpConfigRepository.save(config);
            return false;
        }
    }
    
    @Override
    public List<Object> getMcpTools(Long id) {
        try {
            // 调用 main 后端的 MCP 工具列表接口
            String url = mainBackendBaseUrl + "/api/v1/ai/mcp/configs/" + id + "/tools";
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                if (response.getBody() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> body = (Map<String, Object>) response.getBody();
                    if (body != null) {
                        Object data = body.get("data");
                        if (data instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<Object> tools = (List<Object>) data;
                            return tools;
                        }
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
    public Map<String, Object> callMcpTool(Long id, String toolName, Map<String, Object> arguments) {
        try {
            // 调用 main 后端的 MCP 工具调用接口
            String url = mainBackendBaseUrl + "/api/v1/ai/mcp/configs/" + id + "/tools/" + toolName + "/call";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("arguments", arguments);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Object> response = restTemplate.postForEntity(url, entity, Object.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                if (response.getBody() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> body = (Map<String, Object>) response.getBody();
                    if (body != null) {
                        // main 接口返回格式：{ code, message, data }
                        Object data = body.get("data");
                        if (data instanceof Map) {
                            return (Map<String, Object>) data;
                        }
                        return body;
                    }
                }
            }
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", "调用失败");
            return errorResult;
        } catch (Exception e) {
            log.error("Failed to call MCP tool {} for config {}", toolName, id, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage() != null ? e.getMessage() : "未知错误");
            return errorResult;
        }
    }
    
    @Override
    public MentisMcpConfigDTO toggleMcpConfig(Long id, Boolean enabled) {
        try {
            // 调用 main 后端的 MCP toggle 接口
            String url = mainBackendBaseUrl + "/api/v1/ai/mcp/configs/" + id + "/toggle";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            Map<String, Boolean> requestBody = new HashMap<>();
            requestBody.put("enabled", enabled);
            
            HttpEntity<Map<String, Boolean>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Object> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.PATCH, entity, Object.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                if (response.getBody() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> body = (Map<String, Object>) response.getBody();
                    if (body != null && body.get("data") != null) {
                        // main 接口返回格式：{ code, message, data }
                        // data 是 McpServerConfig 对象，需要转换为 MentisMcpConfigDTO
                        @SuppressWarnings("unchecked")
                        Map<String, Object> configData = (Map<String, Object>) body.get("data");
                        return convertMainConfigToDTO(configData);
                    }
                }
            }
            
            // 如果调用失败，直接更新本地数据库
            MentisMcpConfigRepository.MentisMcpConfigEntity configEntity = mentisMcpConfigRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
            configEntity.setEnabled(enabled);
            MentisMcpConfigRepository.MentisMcpConfigEntity saved = mentisMcpConfigRepository.save(configEntity);
            return toDTO(saved);
        } catch (Exception e) {
            log.error("Failed to toggle MCP config {}", id, e);
            // 如果调用 main 接口失败，直接更新本地数据库
            MentisMcpConfigRepository.MentisMcpConfigEntity configEntity = mentisMcpConfigRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
            configEntity.setEnabled(enabled);
            MentisMcpConfigRepository.MentisMcpConfigEntity saved = mentisMcpConfigRepository.save(configEntity);
            return toDTO(saved);
        }
    }
    
    /**
     * 将 main 返回的 McpServerConfig 转换为 MentisMcpConfigDTO
     */
    private MentisMcpConfigDTO convertMainConfigToDTO(Map<String, Object> configData) {
        MentisMcpConfigDTO dto = new MentisMcpConfigDTO();
        if (configData.get("id") != null) {
            dto.setId(Long.valueOf(configData.get("id").toString()));
        }
        if (configData.get("name") != null) {
            dto.setName(configData.get("name").toString());
        }
        if (configData.get("serverType") != null) {
            dto.setServerType(configData.get("serverType").toString());
        }
        if (configData.get("serverUrl") != null) {
            dto.setServerUrl(configData.get("serverUrl").toString());
        }
        if (configData.get("apiKey") != null) {
            dto.setApiKey(configData.get("apiKey").toString());
        }
        if (configData.get("enabled") != null) {
            dto.setEnabled(Boolean.valueOf(configData.get("enabled").toString()));
        }
        if (configData.get("description") != null) {
            dto.setDescription(configData.get("description").toString());
        }
        if (configData.get("extraConfig") != null) {
            dto.setExtraConfig(configData.get("extraConfig").toString());
        }
        if (configData.get("userId") != null) {
            dto.setUserId(Long.valueOf(configData.get("userId").toString()));
        }
        return dto;
    }
    
    @Override
    public void notifyMentisReload() {
        mentisSyncService.notifyMentisReload();
    }
    
    private MentisMcpConfigDTO toDTO(MentisMcpConfigRepository.MentisMcpConfigEntity entity) {
        MentisMcpConfigDTO dto = new MentisMcpConfigDTO();
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
    
    private MentisMcpConfigRepository.MentisMcpConfigEntity toEntity(MentisMcpConfigDTO dto) {
        MentisMcpConfigRepository.MentisMcpConfigEntity entity = new MentisMcpConfigRepository.MentisMcpConfigEntity();
        entity.setId(dto.getId());
        // templateId 在 DTO 中暂未定义，但 Entity 支持（main 表有此字段）
        // 如果将来 DTO 添加 templateId，可以在这里设置：entity.setTemplateId(dto.getTemplateId());
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
