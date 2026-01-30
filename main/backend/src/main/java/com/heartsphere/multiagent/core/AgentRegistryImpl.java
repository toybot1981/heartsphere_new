package com.heartsphere.multiagent.core;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 智能体注册表实现
 * 
 * <p>提供智能体的注册、注销、查找和管理功能。使用能力索引（capabilityIndex）
 * 来加速按能力查找智能体的操作。</p>
 * 
 * <p>线程安全：使用 ConcurrentHashMap 保证并发安全。</p>
 * 
 * <p>性能优化：
 * <ul>
 *   <li>使用能力索引，查找时间复杂度从 O(n) 降低到 O(1)</li>
 *   <li>注册和注销时自动维护索引</li>
 * </ul>
 * </p>
 * 
 * @author HeartSphere
 * @version 1.0
 * @see AgentRegistry
 * @see Agent
 */
@Slf4j
@Service
public class AgentRegistryImpl implements AgentRegistry {
    
    /**
     * 智能体存储映射：智能体 ID -> 智能体实例
     */
    private final Map<String, Agent> agents = new ConcurrentHashMap<>();
    
    /**
     * 能力索引：能力描述 -> 具备该能力的智能体 ID 集合
     * 用于快速查找具备特定能力的智能体
     */
    private final Map<String, Set<String>> capabilityIndex = new ConcurrentHashMap<>();
    
    /**
     * 注册智能体
     * 
     * <p>将智能体添加到注册表，并更新能力索引。如果智能体 ID 已存在，
     * 将覆盖原有的智能体。</p>
     * 
     * @param agent 要注册的智能体实例，不能为 null
     * @throws IllegalArgumentException 如果 agent 或 agent.getId() 为 null
     */
    @Override
    public void register(Agent agent) {
        if (agent == null || agent.getId() == null) {
            throw new IllegalArgumentException("Agent and agent ID cannot be null");
        }
        
        // 如果已存在，先注销以清理旧的能力索引
        if (agents.containsKey(agent.getId())) {
            unregister(agent.getId());
        }
        
        agents.put(agent.getId(), agent);
        
        // 更新能力索引：为每个能力添加智能体 ID
        for (String capability : agent.getCapabilities()) {
            capabilityIndex.computeIfAbsent(capability, k -> ConcurrentHashMap.newKeySet())
                .add(agent.getId());
        }
        
        log.info("Agent registered: id={}, name={}, capabilities={}", 
            agent.getId(), agent.getName(), agent.getCapabilities());
    }
    
    /**
     * 注销智能体
     * 
     * <p>从注册表中移除智能体，并清理能力索引。如果智能体不存在，则不执行任何操作。</p>
     * 
     * @param agentId 要注销的智能体 ID
     */
    @Override
    public void unregister(String agentId) {
        Agent agent = agents.remove(agentId);
        if (agent != null) {
            // 从能力索引中移除该智能体的所有能力记录
            for (String capability : agent.getCapabilities()) {
                Set<String> agentIds = capabilityIndex.get(capability);
                if (agentIds != null) {
                    agentIds.remove(agentId);
                    // 如果该能力下没有智能体了，移除该能力的索引条目
                    if (agentIds.isEmpty()) {
                        capabilityIndex.remove(capability);
                    }
                }
            }
            log.info("Agent unregistered: id={}", agentId);
        }
    }
    
    @Override
    public Optional<Agent> getAgent(String agentId) {
        return Optional.ofNullable(agents.get(agentId));
    }
    
    @Override
    public List<Agent> getAllAgents() {
        return new ArrayList<>(agents.values());
    }
    
    /**
     * 根据能力查找智能体
     * 
     * <p>使用能力索引快速查找具备指定能力的智能体。时间复杂度 O(n)，
     * 其中 n 是具备该能力的智能体数量。</p>
     * 
     * @param capability 能力描述
     * @return 具备该能力的智能体列表，如果没有找到则返回空列表
     */
    @Override
    public List<Agent> findAgentsByCapability(String capability) {
        Set<String> agentIds = capabilityIndex.get(capability);
        if (agentIds == null || agentIds.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 从智能体映射中获取智能体实例，过滤掉可能已被注销的智能体
        return agentIds.stream()
            .map(agents::get)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    /**
     * 根据多个能力查找智能体
     * 
     * <p>查找同时具备所有指定能力的智能体（交集操作）。如果 capabilities 为空，
     * 则返回所有智能体。</p>
     * 
     * <p>算法：对每个能力，取具备该能力的智能体集合，然后求交集。</p>
     * 
     * @param capabilities 能力集合，如果为 null 或空，则返回所有智能体
     * @return 同时具备所有指定能力的智能体列表，如果没有找到则返回空列表
     */
    @Override
    public List<Agent> findAgentsByCapabilities(Set<String> capabilities) {
        if (capabilities == null || capabilities.isEmpty()) {
            return getAllAgents();
        }
        
        // 找到具备所有能力的智能体（求交集）
        Set<String> candidateIds = null;
        for (String capability : capabilities) {
            Set<String> agentIds = capabilityIndex.get(capability);
            if (agentIds == null || agentIds.isEmpty()) {
                // 如果某个能力没有智能体，则交集为空
                return Collections.emptyList();
            }
            
            if (candidateIds == null) {
                // 第一个能力，直接使用
                candidateIds = new HashSet<>(agentIds);
            } else {
                // 后续能力，求交集
                candidateIds.retainAll(agentIds);
                if (candidateIds.isEmpty()) {
                    // 交集为空，提前返回
                    return Collections.emptyList();
                }
            }
        }
        
        return candidateIds.stream()
            .map(agents::get)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    @Override
    public boolean exists(String agentId) {
        return agents.containsKey(agentId);
    }
    
    @Override
    public int size() {
        return agents.size();
    }
}
