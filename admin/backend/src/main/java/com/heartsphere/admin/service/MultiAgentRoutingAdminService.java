package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.MultiAgentRoutingConfigDTO;
import com.heartsphere.admin.entity.SystemConfig;
import com.heartsphere.admin.repository.SystemConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 多智能体路由管理服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MultiAgentRoutingAdminService {
    
    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper;
    
    private static final String ROUTING_CONFIG_KEY = "multi_agent_routing_config";
    
    /**
     * 获取路由配置
     */
    public MultiAgentRoutingConfigDTO getRoutingConfig() {
        SystemConfig config = systemConfigRepository.findByConfigKey(ROUTING_CONFIG_KEY)
            .orElse(null);
        
        if (config == null || config.getConfigValue() == null) {
            // 返回默认配置
            return getDefaultRoutingConfig();
        }
        
        try {
            return objectMapper.readValue(config.getConfigValue(), MultiAgentRoutingConfigDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse routing config", e);
            return getDefaultRoutingConfig();
        }
    }
    
    /**
     * 更新路由配置
     */
    @Transactional
    public void updateRoutingConfig(MultiAgentRoutingConfigDTO configDTO) {
        try {
            String configValue = objectMapper.writeValueAsString(configDTO);
            
            SystemConfig config = systemConfigRepository.findByConfigKey(ROUTING_CONFIG_KEY)
                .orElse(new SystemConfig());
            
            config.setConfigKey(ROUTING_CONFIG_KEY);
            config.setConfigValue(configValue);
            config.setDescription("多智能体路由配置");
            
            systemConfigRepository.save(config);
            
            log.info("Routing config updated");
        } catch (Exception e) {
            log.error("Failed to update routing config", e);
            throw new RuntimeException("Failed to update routing config", e);
        }
    }
    
    /**
     * 测试路由策略
     */
    public Map<String, Object> testRoutingStrategy(String testRequest) {
        // 这里应该调用实际的路由服务进行测试
        // 由于需要访问 main 模块的服务，这里返回模拟结果
        Map<String, Object> result = new HashMap<>();
        result.put("testRequest", testRequest);
        result.put("selectedAgents", Arrays.asList("shixiaoguang", "kangxiaojian"));
        result.put("decomposedTasks", Map.of(
            "task1", "shixiaoguang",
            "task2", "kangxiaojian"
        ));
        result.put("message", "Routing test completed (mock result)");
        return result;
    }
    
    /**
     * 获取默认路由配置
     */
    private MultiAgentRoutingConfigDTO getDefaultRoutingConfig() {
        Map<String, List<String>> keywordToCapabilities = Map.of(
            "时间", Arrays.asList("time-management"),
            "健康", Arrays.asList("health"),
            "学习", Arrays.asList("learning"),
            "情绪", Arrays.asList("emotion"),
            "心理", Arrays.asList("mental-health"),
            "情感", Arrays.asList("companionship")
        );
        
        Map<String, Integer> agentPriorities = Map.of(
            "shixiaoguang", 1,
            "kangxiaojian", 2,
            "xuexiaozhi", 3,
            "xinxiaonuan", 4,
            "xinxiaoan", 5,
            "nuanxiaoyang", 6
        );
        
        return MultiAgentRoutingConfigDTO.builder()
            .keywordToCapabilities(keywordToCapabilities)
            .agentPriorities(agentPriorities)
            .decompositionRules(Collections.emptyList())
            .routingParameters(Collections.emptyMap())
            .build();
    }
}
