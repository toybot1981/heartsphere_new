package com.heartsphere.admin.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.config.DataSource;
import com.heartsphere.admin.dto.agentmind.AgentIdentityDTO;
import com.heartsphere.admin.dto.agentmind.AgentStateHistoryDTO;
import com.heartsphere.admin.dto.agentmind.AgentStateStatisticsDTO;
import com.heartsphere.admin.entity.Character;
import com.heartsphere.admin.entity.agentmind.AgentIdentity;
import com.heartsphere.admin.entity.agentmind.AgentStateHistory;
import com.heartsphere.admin.repository.CharacterRepository;
import com.heartsphere.admin.repository.agentmind.AgentIdentityRepository;
import com.heartsphere.admin.repository.agentmind.AgentStateHistoryRepository;
import com.heartsphere.admin.service.AgentMindManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Agent Mind 管理服务实现
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgentMindManagementServiceImpl implements AgentMindManagementService {
    
    private final AgentIdentityRepository agentIdentityRepository;
    private final AgentStateHistoryRepository agentStateHistoryRepository;
    private final CharacterRepository characterRepository;
    private final ObjectMapper objectMapper;
    
    // ========== 身份认知管理 ==========
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public Page<AgentIdentityDTO> getAgentIdentities(Pageable pageable, String searchKeyword) {
        List<AgentIdentity> identities;
        
        if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
            // 简单实现：获取所有记录，然后在内存中过滤
            // 实际项目中可以使用更复杂的查询
            identities = agentIdentityRepository.findAll();
            identities = identities.stream()
                    .filter(identity -> {
                        Character character = characterRepository.findById(identity.getCharacterId()).orElse(null);
                        if (character != null) {
                            String name = character.getName() != null ? character.getName().toLowerCase() : "";
                            String role = character.getRole() != null ? character.getRole().toLowerCase() : "";
                            String keyword = searchKeyword.toLowerCase();
                            return name.contains(keyword) || role.contains(keyword);
                        }
                        return false;
                    })
                    .collect(Collectors.toList());
        } else {
            identities = agentIdentityRepository.findAll();
        }
        
        // 手动分页
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), identities.size());
        List<AgentIdentity> pagedIdentities = start < identities.size() 
                ? identities.subList(start, end) 
                : Collections.emptyList();
        
        List<AgentIdentityDTO> dtos = pagedIdentities.stream()
                .map(this::toIdentityDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, pageable, identities.size());
    }
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public AgentIdentityDTO getAgentIdentity(Long characterId) {
        AgentIdentity identity = agentIdentityRepository.findByCharacterId(characterId)
                .orElse(null);
        
        if (identity == null) {
            // 如果不存在，尝试初始化
            return initializeAgentIdentity(characterId);
        }
        
        return toIdentityDTO(identity);
    }
    
    @Override
    @Transactional
    @DataSource("agent-mind")
    public AgentIdentityDTO updateAgentIdentity(Long characterId, AgentIdentityDTO dto) {
        AgentIdentity identity = agentIdentityRepository.findByCharacterId(characterId)
                .orElseGet(() -> {
                    AgentIdentity newIdentity = new AgentIdentity();
                    newIdentity.setCharacterId(characterId);
                    newIdentity.setSelfAwarenessLevel(0);
                    return newIdentity;
                });
        
        // 更新字段
        if (dto.getIdentityData() != null) {
            identity.setIdentityData(convertToJson(dto.getIdentityData()));
        }
        if (dto.getCapabilities() != null) {
            identity.setCapabilities(convertToJson(dto.getCapabilities()));
        }
        if (dto.getLimitations() != null) {
            identity.setLimitations(convertToJson(dto.getLimitations()));
        }
        if (dto.getSelfAwarenessLevel() != null) {
            identity.setSelfAwarenessLevel(dto.getSelfAwarenessLevel());
        }
        
        AgentIdentity saved = agentIdentityRepository.save(identity);
        return toIdentityDTO(saved);
    }
    
    @Override
    @Transactional
    @DataSource("agent-mind")
    public AgentIdentityDTO initializeAgentIdentity(Long characterId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new RuntimeException("Character not found: " + characterId));
        
        AgentIdentity identity = new AgentIdentity();
        identity.setCharacterId(characterId);
        
        // 构建身份认知数据
        Map<String, Object> identityData = new HashMap<>();
        identityData.put("name", character.getName());
        identityData.put("role", character.getRole());
        identityData.put("bio", character.getBio());
        identityData.put("description", character.getDescription());
        identity.setIdentityData(convertToJson(identityData));
        
        // 初始化能力列表（空列表，后续可以从技能系统获取）
        identity.setCapabilities(convertToJson(Collections.emptyList()));
        
        // 初始化能力边界（空列表）
        identity.setLimitations(convertToJson(Collections.emptyList()));
        
        // 初始化自我认知水平
        identity.setSelfAwarenessLevel(0);
        
        AgentIdentity saved = agentIdentityRepository.save(identity);
        return toIdentityDTO(saved);
    }
    
    // ========== 状态监控 ==========
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public AgentStateHistoryDTO getCurrentState(Long characterId) {
        List<AgentStateHistory> states = agentStateHistoryRepository.findLatestByCharacterId(
                characterId, 
                org.springframework.data.domain.PageRequest.of(0, 1)
        );
        
        if (states.isEmpty()) {
            // 返回默认状态
            AgentStateHistoryDTO dto = new AgentStateHistoryDTO();
            dto.setCharacterId(characterId);
            dto.setStateType("IDLE");
            dto.setStateDescription("空闲状态");
            Character character = characterRepository.findById(characterId).orElse(null);
            if (character != null) {
                dto.setCharacterName(character.getName());
            }
            return dto;
        }
        
        return toStateHistoryDTO(states.get(0));
    }
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public Page<AgentStateHistoryDTO> getStateHistory(Long characterId, Pageable pageable) {
        Page<AgentStateHistory> page = agentStateHistoryRepository.findByCharacterIdOrderByCreatedAtDesc(
                characterId, pageable);
        
        List<AgentStateHistoryDTO> dtos = page.getContent().stream()
                .map(this::toStateHistoryDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public List<AgentStateHistoryDTO> getStateHistoryByTimeRange(Long characterId, LocalDateTime startTime, LocalDateTime endTime) {
        List<AgentStateHistory> histories = agentStateHistoryRepository.findByCharacterIdAndTimeRange(
                characterId, startTime, endTime);
        
        return histories.stream()
                .map(this::toStateHistoryDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public AgentStateStatisticsDTO getStateStatistics(Long characterId) {
        List<AgentStateHistory> allHistories = agentStateHistoryRepository.findByCharacterIdOrderByCreatedAtDesc(characterId);
        
        AgentStateStatisticsDTO stats = new AgentStateStatisticsDTO();
        stats.setCharacterId(characterId);
        
        Character character = characterRepository.findById(characterId).orElse(null);
        if (character != null) {
            stats.setCharacterName(character.getName());
        }
        
        stats.setTotalRecords((long) allHistories.size());
        
        if (allHistories.isEmpty()) {
            stats.setStateTypeCounts(Collections.emptyList());
            stats.setStateTypeAvgDurations(Collections.emptyList());
            return stats;
        }
        
        // 统计各状态类型的出现次数
        Map<String, Long> stateTypeCounts = allHistories.stream()
                .collect(Collectors.groupingBy(
                        AgentStateHistory::getStateType,
                        Collectors.counting()
                ));
        
        List<Map<String, Object>> stateTypeCountsList = stateTypeCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("stateType", entry.getKey());
                    map.put("count", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());
        stats.setStateTypeCounts(stateTypeCountsList);
        
        // 统计各状态类型的平均持续时间
        Map<String, Double> stateTypeAvgDurations = allHistories.stream()
                .filter(h -> h.getDurationMs() != null)
                .collect(Collectors.groupingBy(
                        AgentStateHistory::getStateType,
                        Collectors.averagingLong(AgentStateHistory::getDurationMs)
                ));
        
        List<Map<String, Object>> stateTypeAvgDurationsList = stateTypeAvgDurations.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("stateType", entry.getKey());
                    map.put("avgDurationMs", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());
        stats.setStateTypeAvgDurations(stateTypeAvgDurationsList);
        
        // 最早和最新的状态记录时间
        stats.setEarliestStateTime(allHistories.get(allHistories.size() - 1).getCreatedAt());
        stats.setLatestStateTime(allHistories.get(0).getCreatedAt());
        
        return stats;
    }
    
    // ========== 能力管理 ==========
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public List<Map<String, Object>> getCapabilities(Long characterId) {
        AgentIdentity identity = agentIdentityRepository.findByCharacterId(characterId)
                .orElse(null);
        
        if (identity == null || identity.getCapabilities() == null) {
            return Collections.emptyList();
        }
        
        return parseJson(identity.getCapabilities(), new TypeReference<List<Map<String, Object>>>() {});
    }
    
    @Override
    @Transactional
    @DataSource("agent-mind")
    public AgentIdentityDTO updateCapabilities(Long characterId, List<Map<String, Object>> capabilities) {
        AgentIdentity identity = agentIdentityRepository.findByCharacterId(characterId)
                .orElseGet(() -> {
                    AgentIdentity newIdentity = new AgentIdentity();
                    newIdentity.setCharacterId(characterId);
                    newIdentity.setSelfAwarenessLevel(0);
                    return newIdentity;
                });
        
        identity.setCapabilities(convertToJson(capabilities));
        AgentIdentity saved = agentIdentityRepository.save(identity);
        return toIdentityDTO(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    @DataSource("agent-mind")
    public List<Map<String, Object>> getLimitations(Long characterId) {
        AgentIdentity identity = agentIdentityRepository.findByCharacterId(characterId)
                .orElse(null);
        
        if (identity == null || identity.getLimitations() == null) {
            return Collections.emptyList();
        }
        
        return parseJson(identity.getLimitations(), new TypeReference<List<Map<String, Object>>>() {});
    }
    
    @Override
    @Transactional
    @DataSource("agent-mind")
    public AgentIdentityDTO updateLimitations(Long characterId, List<Map<String, Object>> limitations) {
        AgentIdentity identity = agentIdentityRepository.findByCharacterId(characterId)
                .orElseGet(() -> {
                    AgentIdentity newIdentity = new AgentIdentity();
                    newIdentity.setCharacterId(characterId);
                    newIdentity.setSelfAwarenessLevel(0);
                    return newIdentity;
                });
        
        identity.setLimitations(convertToJson(limitations));
        AgentIdentity saved = agentIdentityRepository.save(identity);
        return toIdentityDTO(saved);
    }
    
    // ========== 辅助方法 ==========
    
    private AgentIdentityDTO toIdentityDTO(AgentIdentity identity) {
        AgentIdentityDTO dto = new AgentIdentityDTO();
        dto.setId(identity.getId());
        dto.setCharacterId(identity.getCharacterId());
        
        // 从Character表获取基本信息
        Character character = characterRepository.findById(identity.getCharacterId()).orElse(null);
        if (character != null) {
            dto.setCharacterName(character.getName());
            dto.setCharacterRole(character.getRole());
            dto.setCharacterBio(character.getBio());
        }
        
        // 解析JSON字段
        dto.setIdentityData(parseJson(identity.getIdentityData(), new TypeReference<Map<String, Object>>() {}));
        dto.setCapabilities(parseJson(identity.getCapabilities(), new TypeReference<List<Map<String, Object>>>() {}));
        dto.setLimitations(parseJson(identity.getLimitations(), new TypeReference<List<Map<String, Object>>>() {}));
        
        dto.setSelfAwarenessLevel(identity.getSelfAwarenessLevel());
        dto.setCreatedAt(identity.getCreatedAt());
        dto.setUpdatedAt(identity.getUpdatedAt());
        
        return dto;
    }
    
    private AgentStateHistoryDTO toStateHistoryDTO(AgentStateHistory history) {
        AgentStateHistoryDTO dto = new AgentStateHistoryDTO();
        dto.setId(history.getId());
        dto.setCharacterId(history.getCharacterId());
        
        // 从Character表获取角色名称
        Character character = characterRepository.findById(history.getCharacterId()).orElse(null);
        if (character != null) {
            dto.setCharacterName(character.getName());
        }
        
        dto.setStateType(history.getStateType());
        dto.setStateDescription(history.getStateDescription());
        dto.setDurationMs(history.getDurationMs());
        dto.setTransitionReason(history.getTransitionReason());
        dto.setRelatedSessionId(history.getRelatedSessionId());
        dto.setCreatedAt(history.getCreatedAt());
        
        return dto;
    }
    
    private String convertToJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("JSON转换失败", e);
            return null;
        }
    }
    
    private <T> T parseJson(String json, TypeReference<T> typeRef) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            log.error("JSON解析失败: {}", json, e);
            return null;
        }
    }
}
