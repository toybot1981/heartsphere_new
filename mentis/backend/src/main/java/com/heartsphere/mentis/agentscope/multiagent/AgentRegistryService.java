package com.heartsphere.mentis.agentscope.multiagent;

import java.util.List;
import java.util.Optional;

/**
 * 智能体注册和发现服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AgentRegistryService {
    
    /**
     * 注册智能体
     * 
     * @param agentInfo 智能体信息
     * @return 智能体 ID
     */
    String registerAgent(AgentInfo agentInfo);
    
    /**
     * 注销智能体
     * 
     * @param agentId 智能体 ID
     */
    void unregisterAgent(String agentId);
    
    /**
     * 根据 ID 查找智能体
     * 
     * @param agentId 智能体 ID
     * @return 智能体信息
     */
    Optional<AgentInfo> findAgentById(String agentId);
    
    /**
     * 根据角色查找智能体
     * 
     * @param role 角色
     * @return 智能体列表
     */
    List<AgentInfo> findAgentsByRole(String role);
    
    /**
     * 根据能力查找智能体
     * 
     * @param capability 能力
     * @return 智能体列表
     */
    List<AgentInfo> findAgentsByCapability(String capability);
    
    /**
     * 获取所有已注册的智能体
     * 
     * @return 智能体列表
     */
    List<AgentInfo> getAllAgents();
    
    /**
     * 智能体信息
     */
    class AgentInfo {
        private String id;
        private String name;
        private String role;
        private List<String> capabilities;
        private String status; // ACTIVE, INACTIVE, BUSY
        private Object agentInstance; // AgentScope Agent 实例
        
        // Getters and Setters
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
        
        public List<String> getCapabilities() {
            return capabilities;
        }
        
        public void setCapabilities(List<String> capabilities) {
            this.capabilities = capabilities;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public Object getAgentInstance() {
            return agentInstance;
        }
        
        public void setAgentInstance(Object agentInstance) {
            this.agentInstance = agentInstance;
        }
    }
}
