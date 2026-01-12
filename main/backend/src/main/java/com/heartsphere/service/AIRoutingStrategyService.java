package com.heartsphere.service;

import com.heartsphere.dto.AIRoutingStrategyDTO;
import com.heartsphere.entity.AIRoutingStrategy;
import com.heartsphere.repository.AIRoutingStrategyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI路由策略服务
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIRoutingStrategyService {
    
    private final AIRoutingStrategyRepository strategyRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取所有路由策略
     */
    public List<AIRoutingStrategyDTO> getAllStrategies() {
        return strategyRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据能力类型获取路由策略
     */
    public AIRoutingStrategyDTO getStrategyByCapability(String capability) {
        return strategyRepository.findByCapabilityAndIsActiveTrue(capability)
                .map(this::toDTO)
                .orElseGet(() -> {
                    // 返回默认策略（单一模式）
                    AIRoutingStrategyDTO defaultStrategy = new AIRoutingStrategyDTO();
                    defaultStrategy.setCapability(capability);
                    defaultStrategy.setStrategyType("single");
                    defaultStrategy.setIsActive(true);
                    defaultStrategy.setConfig(new HashMap<>());
                    return defaultStrategy;
                });
    }
    
    /**
     * 转换为DTO
     */
    private AIRoutingStrategyDTO toDTO(AIRoutingStrategy strategy) {
        AIRoutingStrategyDTO dto = new AIRoutingStrategyDTO();
        dto.setId(strategy.getId());
        dto.setCapability(strategy.getCapability());
        dto.setStrategyType(strategy.getStrategyType());
        dto.setIsActive(strategy.getIsActive());
        dto.setDescription(strategy.getDescription());
        dto.setCreatedAt(strategy.getCreatedAt());
        dto.setUpdatedAt(strategy.getUpdatedAt());
        
        // 解析JSON配置
        try {
            if (strategy.getConfigJson() != null && !strategy.getConfigJson().isEmpty()) {
                Map<String, Object> config = objectMapper.readValue(
                        strategy.getConfigJson(), 
                        new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {}
                );
                dto.setConfig(config);
                
                // 提取详细字段
                if (config.containsKey("defaultProvider")) {
                    dto.setDefaultProvider((String) config.get("defaultProvider"));
                }
                if (config.containsKey("defaultModel")) {
                    dto.setDefaultModel((String) config.get("defaultModel"));
                }
                if (config.containsKey("fallbackChain")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> fallbackList = (List<Map<String, Object>>) config.get("fallbackChain");
                    List<AIRoutingStrategyDTO.FallbackConfig> fallbackChain = fallbackList.stream()
                            .map(map -> new AIRoutingStrategyDTO.FallbackConfig(
                                    (String) map.get("provider"),
                                    (String) map.get("model"),
                                    map.get("priority") != null ? ((Number) map.get("priority")).intValue() : 0
                            ))
                            .collect(Collectors.toList());
                    dto.setFallbackChain(fallbackChain);
                }
                if (config.containsKey("economyConfig")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> economyMap = (Map<String, Object>) config.get("economyConfig");
                    dto.setEconomyConfig(new AIRoutingStrategyDTO.EconomyConfig(
                            economyMap.get("enabled") != null ? (Boolean) economyMap.get("enabled") : false,
                            (String) economyMap.get("preferredProvider"),
                            economyMap.get("maxCostPerToken") != null ? 
                                    ((Number) economyMap.get("maxCostPerToken")).doubleValue() : null
                    ));
                }
            }
        } catch (Exception e) {
            log.error("解析路由策略配置失败", e);
            dto.setConfig(new HashMap<>());
        }
        
        return dto;
    }
}
