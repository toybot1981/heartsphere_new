package com.heartsphere.aiagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.agent.AgentWithTools;
import com.heartsphere.aiagent.agent.BaseAgent;
import com.heartsphere.aiagent.adapter.ModelAdapterFactory;
import com.heartsphere.aiagent.entity.AgentEntity;
import com.heartsphere.aiagent.model.AgentDefinition;
import com.heartsphere.aiagent.repository.AgentRepository;
import com.heartsphere.aiagent.tool.ToolRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Agent 服务
 * 管理 Agent 的创建、执行和生命周期，支持持久化
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentService {
    
    private final ModelAdapterFactory adapterFactory;
    private final AgentRepository agentRepository;
    private final ToolRegistry toolRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, BaseAgent> agents = new ConcurrentHashMap<>();
    
    /**
     * 注册 Agent（带持久化）
     */
    @Transactional
    public void registerAgent(AgentDefinition definition) {
        log.info("注册 Agent: {}", definition.getName());
        
        // 保存到数据库
        AgentEntity entity = convertToEntity(definition);
        agentRepository.save(entity);
        
        // 加载到内存
        BaseAgent agent = createAgent(definition);
        agents.put(definition.getId(), agent);
    }
    
    /**
     * 从数据库加载所有 Agent
     */
    public void loadAgentsFromDatabase() {
        log.info("从数据库加载 Agent...");
        for (AgentEntity entity : agentRepository.findAll()) {
            try {
                AgentDefinition definition = convertToDefinition(entity);
                BaseAgent agent = createAgent(definition);
                agents.put(definition.getId(), agent);
                log.info("加载 Agent: {}", definition.getName());
            } catch (Exception e) {
                log.error("加载 Agent 失败: {}", entity.getAgentId(), e);
            }
        }
    }
    
    /**
     * 创建 Agent 实例
     */
    private BaseAgent createAgent(AgentDefinition definition) {
        // 如果 Agent 配置了工具，创建带工具的 Agent
        if (definition.getTools() != null && !definition.getTools().isEmpty()) {
            return new AgentWithTools(definition, adapterFactory, toolRegistry);
        }
        
        // 否则创建基础 Agent
        return new BaseAgent(definition, adapterFactory) {
            @Override
            public Object execute(Object input) {
                String message = input.toString();
                return generateText(message);
            }
        };
    }
    
    /**
     * 执行 Agent
     */
    public Object executeAgent(String agentId, Object input) {
        BaseAgent agent = agents.get(agentId);
        if (agent == null) {
            // 尝试从数据库加载
            var entityOpt = agentRepository.findByAgentId(agentId);
            if (entityOpt.isPresent()) {
                try {
                    AgentDefinition definition = convertToDefinition(entityOpt.get());
                    BaseAgent newAgent = createAgent(definition);
                    agents.put(agentId, newAgent);
                    agent = newAgent;
                } catch (Exception e) {
                    log.error("从数据库加载 Agent 失败", e);
                }
            }
        }
        
        if (agent == null) {
            throw new IllegalArgumentException("Agent 不存在: " + agentId);
        }
        
        log.info("执行 Agent: {}", agentId);
        return agent.execute(input);
    }
    
    /**
     * 获取 Agent
     */
    public BaseAgent getAgent(String agentId) {
        return agents.get(agentId);
    }
    
    /**
     * 删除 Agent（带持久化）
     */
    @Transactional
    public void removeAgent(String agentId) {
        agents.remove(agentId);
        agentRepository.deleteByAgentId(agentId);
        log.info("删除 Agent: {}", agentId);
    }
    
    /**
     * 列出所有 Agent
     */
    public Map<String, BaseAgent> listAgents() {
        return Map.copyOf(agents);
    }
    
    /**
     * 转换 AgentDefinition 到 AgentEntity
     */
    private AgentEntity convertToEntity(AgentDefinition definition) {
        AgentEntity entity = new AgentEntity();
        entity.setAgentId(definition.getId());
        entity.setName(definition.getName());
        entity.setDescription(definition.getDescription());
        entity.setType(AgentEntity.AgentType.valueOf(definition.getType().name()));
        entity.setProvider(definition.getProvider());
        entity.setModel(definition.getModel());
        entity.setSystemPrompt(definition.getSystemPrompt());
        
        try {
            if (definition.getWorkflow() != null) {
                entity.setWorkflowConfig(objectMapper.writeValueAsString(definition.getWorkflow()));
            }
            if (definition.getCapabilities() != null) {
                entity.setCapabilities(objectMapper.writeValueAsString(definition.getCapabilities()));
            }
            if (definition.getTools() != null) {
                entity.setTools(objectMapper.writeValueAsString(definition.getTools()));
            }
            if (definition.getConfig() != null) {
                entity.setConfig(objectMapper.writeValueAsString(definition.getConfig()));
            }
        } catch (JsonProcessingException e) {
            log.error("转换配置到 JSON 失败", e);
        }
        
        return entity;
    }
    
    /**
     * 转换 AgentEntity 到 AgentDefinition
     */
    private AgentDefinition convertToDefinition(AgentEntity entity) throws JsonProcessingException {
        AgentDefinition definition = new AgentDefinition();
        definition.setId(entity.getAgentId());
        definition.setName(entity.getName());
        definition.setDescription(entity.getDescription());
        definition.setType(AgentDefinition.AgentType.valueOf(entity.getType().name()));
        definition.setProvider(entity.getProvider());
        definition.setModel(entity.getModel());
        definition.setSystemPrompt(entity.getSystemPrompt());
        
        if (entity.getWorkflowConfig() != null) {
            definition.setWorkflow(objectMapper.readValue(
                entity.getWorkflowConfig(), 
                AgentDefinition.WorkflowConfig.class
            ));
        }
        if (entity.getCapabilities() != null) {
            definition.setCapabilities(objectMapper.readValue(
                entity.getCapabilities(),
                AgentDefinition.Capabilities.class
            ));
        }
        if (entity.getTools() != null) {
            definition.setTools(objectMapper.readValue(
                entity.getTools(),
                new com.fasterxml.jackson.core.type.TypeReference<>() {}
            ));
        }
        if (entity.getConfig() != null) {
            definition.setConfig(objectMapper.readValue(
                entity.getConfig(),
                new com.fasterxml.jackson.core.type.TypeReference<>() {}
            ));
        }
        
        return definition;
    }
}
