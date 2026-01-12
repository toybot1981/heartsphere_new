package com.heartsphere.admin.service.impl;

import com.heartsphere.admin.config.DataSourceContextHolder;
import com.heartsphere.admin.dto.AgentRoleDTO;
import com.heartsphere.admin.dto.MentisAgentConfigDTO;
import com.heartsphere.admin.repository.MentisAgentConfigRepository;
import com.heartsphere.admin.service.MentisAgentService;
import com.heartsphere.admin.service.MentisSyncService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Mentis Agent 服务实现
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MentisAgentServiceImpl implements MentisAgentService {
    
    private final RestTemplate restTemplate;
    private final MentisAgentConfigRepository agentConfigRepository;
    private final MentisSyncService mentisSyncService;
    private final ObjectMapper objectMapper;
    
    @Value("${main.backend.base-url:http://localhost:8081}")
    private String mainBackendBaseUrl;
    
    @Override
    public List<AgentRoleDTO> fetchAvailableAgents() {
        try {
            // 调用 main 后端的角色列表接口
            String url = mainBackendBaseUrl + "/api/preset-characters";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                List<Map<String, Object>> body = response.getBody();
                if (body != null) {
                    return body.stream()
                            .filter(this::isRichAgent) // 过滤出有丰富能力的角色
                            .map(this::toAgentRoleDTO)
                            .collect(Collectors.toList());
                }
            }
            
            return List.of();
        } catch (Exception e) {
            log.error("Failed to fetch available agents from main backend", e);
            return List.of();
        }
    }
    
    @Override
    public List<MentisAgentConfigDTO> getConfiguredAgents() {
        return agentConfigRepository.findAll().stream()
                .map(this::toMentisAgentConfigDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public MentisAgentConfigDTO configureAgentForMentis(Long agentId, Map<String, Object> configuration) {
        // 检查是否已存在
        Optional<MentisAgentConfigRepository.MentisAgentConfigEntity> existing = 
                agentConfigRepository.findByAgentId(agentId);
        
        MentisAgentConfigRepository.MentisAgentConfigEntity entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setConfiguration(configuration);
            entity.setUpdatedAt(LocalDateTime.now());
        } else {
            entity = new MentisAgentConfigRepository.MentisAgentConfigEntity();
            entity.setAgentId(agentId);
            entity.setConfiguration(configuration);
            entity.setEnabled(true);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
        }
        
        // 获取 agent 名称
        try {
            List<AgentRoleDTO> agents = fetchAvailableAgents();
            Optional<AgentRoleDTO> agent = agents.stream()
                    .filter(a -> a.getId().equals(agentId))
                    .findFirst();
            if (agent.isPresent()) {
                entity.setAgentName(agent.get().getName());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch agent name for agentId: {}", agentId, e);
        }
        
        MentisAgentConfigRepository.MentisAgentConfigEntity saved = agentConfigRepository.save(entity);
        
        // 通知 Mentis 重新加载配置
        mentisSyncService.notifyMentisReload();
        
        return toMentisAgentConfigDTO(saved);
    }
    
    @Override
    public void removeAgentConfig(Long id) {
        agentConfigRepository.deleteById(id);
        
        // 通知 Mentis 重新加载配置
        mentisSyncService.notifyMentisReload();
    }
    
    @Override
    public Map<String, Object> getAgentCapabilities(Long agentId) {
        try {
            List<AgentRoleDTO> agents = fetchAvailableAgents();
            Optional<AgentRoleDTO> agent = agents.stream()
                    .filter(a -> a.getId().equals(agentId))
                    .findFirst();
            
            if (agent.isPresent()) {
                Map<String, Object> capabilities = new HashMap<>();
                capabilities.put("name", agent.get().getName());
                capabilities.put("description", agent.get().getDescription());
                capabilities.put("systemInstruction", agent.get().getSystemInstruction());
                capabilities.put("skills", agent.get().getSkills());
                capabilities.put("tags", agent.get().getTags());
                capabilities.put("bio", agent.get().getBio());
                return capabilities;
            }
            
            return Map.of();
        } catch (Exception e) {
            log.error("Failed to get agent capabilities for agentId: {}", agentId, e);
            return Map.of();
        }
    }
    
    @Override
    public void toggleAgentConfig(Long id, boolean enabled) {
        Optional<MentisAgentConfigRepository.MentisAgentConfigEntity> entity = 
                agentConfigRepository.findById(id);
        if (entity.isPresent()) {
            MentisAgentConfigRepository.MentisAgentConfigEntity config = entity.get();
            config.setEnabled(enabled);
            config.setUpdatedAt(LocalDateTime.now());
            agentConfigRepository.save(config);
            
            // 通知 Mentis 重新加载配置
            mentisSyncService.notifyMentisReload();
        }
    }
    
    /**
     * 判断是否为有丰富能力的角色
     */
    private boolean isRichAgent(Map<String, Object> character) {
        // 检查是否激活
        Object isActive = character.get("isActive");
        if (isActive == null || !Boolean.TRUE.equals(isActive)) {
            return false;
        }
        
        // 检查是否有系统指令
        Object systemInstruction = character.get("systemInstruction");
        if (systemInstruction == null || systemInstruction.toString().trim().isEmpty()) {
            return false;
        }
        
        // 检查是否有技能或标签
        Object skills = character.get("skills");
        Object tags = character.get("tags");
        boolean hasSkills = skills != null && !skills.toString().trim().isEmpty();
        boolean hasTags = tags != null && !tags.toString().trim().isEmpty();
        
        return hasSkills || hasTags;
    }
    
    /**
     * 转换为 AgentRoleDTO
     */
    private AgentRoleDTO toAgentRoleDTO(Map<String, Object> character) {
        AgentRoleDTO dto = new AgentRoleDTO();
        dto.setId(getLongValue(character, "id"));
        dto.setName(getStringValue(character, "name"));
        dto.setDescription(getStringValue(character, "description"));
        dto.setAge(getIntegerValue(character, "age"));
        dto.setGender(getStringValue(character, "gender"));
        dto.setRole(getStringValue(character, "role"));
        dto.setBio(getStringValue(character, "bio"));
        dto.setAvatarUrl(getStringValue(character, "avatarUrl"));
        dto.setSystemInstruction(getStringValue(character, "systemInstruction"));
        dto.setTags(getStringValue(character, "tags"));
        dto.setSkills(getStringValue(character, "skills"));
        dto.setSystemEraId(getLongValue(character, "systemEraId"));
        dto.setIsActive(getBooleanValue(character, "isActive"));
        
        // 构建 capabilities
        Map<String, Object> capabilities = new HashMap<>();
        if (dto.getSkills() != null) {
            capabilities.put("skills", dto.getSkills());
        }
        if (dto.getTags() != null) {
            capabilities.put("tags", dto.getTags());
        }
        dto.setCapabilities(capabilities);
        
        return dto;
    }
    
    private MentisAgentConfigDTO toMentisAgentConfigDTO(MentisAgentConfigRepository.MentisAgentConfigEntity entity) {
        MentisAgentConfigDTO dto = new MentisAgentConfigDTO();
        dto.setId(entity.getId());
        dto.setAgentId(entity.getAgentId());
        dto.setAgentName(entity.getAgentName());
        dto.setConfiguration(entity.getConfiguration());
        dto.setEnabled(entity.getEnabled());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
    
    // Helper methods
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return null;
    }
    
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    private Integer getIntegerValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }
    
    private Boolean getBooleanValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return null;
    }
}
