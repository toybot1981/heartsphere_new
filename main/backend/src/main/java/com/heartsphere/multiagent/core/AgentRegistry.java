package com.heartsphere.multiagent.core;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * 智能体注册表接口
 * 
 * 负责智能体的注册、发现和管理
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AgentRegistry {
    
    /**
     * 注册智能体
     * 
     * @param agent 智能体实例
     */
    void register(Agent agent);
    
    /**
     * 注销智能体
     * 
     * @param agentId 智能体 ID
     */
    void unregister(String agentId);
    
    /**
     * 根据 ID 获取智能体
     * 
     * @param agentId 智能体 ID
     * @return 智能体实例
     */
    Optional<Agent> getAgent(String agentId);
    
    /**
     * 获取所有已注册的智能体
     * 
     * @return 智能体列表
     */
    List<Agent> getAllAgents();
    
    /**
     * 根据能力查找智能体
     * 
     * @param capability 能力描述
     * @return 具备该能力的智能体列表
     */
    List<Agent> findAgentsByCapability(String capability);
    
    /**
     * 根据多个能力查找智能体
     * 
     * @param capabilities 能力集合
     * @return 具备这些能力的智能体列表
     */
    List<Agent> findAgentsByCapabilities(Set<String> capabilities);
    
    /**
     * 检查智能体是否存在
     * 
     * @param agentId 智能体 ID
     * @return 是否存在
     */
    boolean exists(String agentId);
    
    /**
     * 获取已注册智能体数量
     * 
     * @return 智能体数量
     */
    int size();
}
