package com.heartsphere.mentis.agentscope.multiagent;

import com.heartsphere.mentis.agentscope.config.AgentScopeConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 智能体注册和发现服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "mentis.agentscope.multi-agent", name = "enabled", havingValue = "true")
public class AgentRegistryServiceImpl implements AgentRegistryService {
    
    private final AgentScopeConfig config;
    
    // 智能体注册表：agentId -> AgentInfo
    private final Map<String, AgentInfo> agentRegistry = new ConcurrentHashMap<>();
    
    // 角色索引：role -> Set<agentId>
    private final Map<String, Set<String>> roleIndex = new ConcurrentHashMap<>();
    
    // 能力索引：capability -> Set<agentId>
    private final Map<String, Set<String>> capabilityIndex = new ConcurrentHashMap<>();
    
    @Override
    public String registerAgent(AgentInfo agentInfo) {
        if (!config.getMultiAgent().isEnabled()) {
            throw new IllegalStateException("多智能体协作功能未启用");
        }
        
        String agentId = agentInfo.getId();
        if (agentId == null || agentId.isEmpty()) {
            agentId = generateAgentId();
            agentInfo.setId(agentId);
        }
        
        if (agentRegistry.containsKey(agentId)) {
            throw new IllegalArgumentException("智能体已存在: " + agentId);
        }
        
        // 注册智能体
        agentRegistry.put(agentId, agentInfo);
        
        // 更新角色索引
        if (agentInfo.getRole() != null) {
            roleIndex.computeIfAbsent(agentInfo.getRole(), k -> new HashSet<>()).add(agentId);
        }
        
        // 更新能力索引
        if (agentInfo.getCapabilities() != null) {
            for (String capability : agentInfo.getCapabilities()) {
                capabilityIndex.computeIfAbsent(capability, k -> new HashSet<>()).add(agentId);
            }
        }
        
        log.info("智能体注册成功: id={}, name={}, role={}", agentId, agentInfo.getName(), agentInfo.getRole());
        
        return agentId;
    }
    
    @Override
    public void unregisterAgent(String agentId) {
        AgentInfo agentInfo = agentRegistry.remove(agentId);
        if (agentInfo == null) {
            log.warn("智能体不存在: {}", agentId);
            return;
        }
        
        // 从角色索引中移除
        if (agentInfo.getRole() != null) {
            Set<String> agents = roleIndex.get(agentInfo.getRole());
            if (agents != null) {
                agents.remove(agentId);
                if (agents.isEmpty()) {
                    roleIndex.remove(agentInfo.getRole());
                }
            }
        }
        
        // 从能力索引中移除
        if (agentInfo.getCapabilities() != null) {
            for (String capability : agentInfo.getCapabilities()) {
                Set<String> agents = capabilityIndex.get(capability);
                if (agents != null) {
                    agents.remove(agentId);
                    if (agents.isEmpty()) {
                        capabilityIndex.remove(capability);
                    }
                }
            }
        }
        
        log.info("智能体注销成功: id={}", agentId);
    }
    
    @Override
    public Optional<AgentInfo> findAgentById(String agentId) {
        return Optional.ofNullable(agentRegistry.get(agentId));
    }
    
    @Override
    public List<AgentInfo> findAgentsByRole(String role) {
        Set<String> agentIds = roleIndex.getOrDefault(role, Collections.emptySet());
        List<AgentInfo> agents = new ArrayList<>();
        for (String agentId : agentIds) {
            AgentInfo agent = agentRegistry.get(agentId);
            if (agent != null) {
                agents.add(agent);
            }
        }
        return agents;
    }
    
    @Override
    public List<AgentInfo> findAgentsByCapability(String capability) {
        Set<String> agentIds = capabilityIndex.getOrDefault(capability, Collections.emptySet());
        List<AgentInfo> agents = new ArrayList<>();
        for (String agentId : agentIds) {
            AgentInfo agent = agentRegistry.get(agentId);
            if (agent != null) {
                agents.add(agent);
            }
        }
        return agents;
    }
    
    @Override
    public List<AgentInfo> getAllAgents() {
        return new ArrayList<>(agentRegistry.values());
    }
    
    /**
     * 生成智能体 ID
     */
    private String generateAgentId() {
        return "agent_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
