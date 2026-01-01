package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 节点工厂
 * 
 * 用于根据配置创建不同类型的节点
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class NodeFactory {
    
    private final ObjectMapper objectMapper;
    
    public NodeFactory() {
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 根据节点类型和配置创建节点
     * 
     * @param nodeType 节点类型（dialogue, choice, condition等）
     * @param config 节点配置（Map或JSON字符串）
     * @return GraphNode实例
     */
    @SuppressWarnings("unchecked")
    public GraphEngine.GraphNode createNode(String nodeType, Object config) {
        log.debug("[NodeFactory] 创建节点，类型: {}", nodeType);
        
        try {
            Map<String, Object> configMap;
            if (config instanceof String) {
                configMap = objectMapper.readValue((String) config, Map.class);
            } else if (config instanceof Map) {
                configMap = (Map<String, Object>) config;
            } else {
                throw new IllegalArgumentException("不支持的配置类型: " + config.getClass());
            }
            
            return createNode(nodeType, configMap);
        } catch (Exception e) {
            log.error("[NodeFactory] 创建节点失败，类型: {}", nodeType, e);
            throw new RuntimeException("创建节点失败: " + nodeType, e);
        }
    }
    
    /**
     * 根据节点类型和配置Map创建节点
     */
    public GraphEngine.GraphNode createNode(String nodeType, Map<String, Object> config) {
        log.debug("[NodeFactory] 创建节点，类型: {}, 配置: {}", nodeType, config);
        
        switch (nodeType.toLowerCase()) {
            case "dialogue":
                return createDialogueNode(config);
            case "choice":
                // TODO: 实现ChoiceNode
                throw new UnsupportedOperationException("ChoiceNode尚未实现");
            case "condition":
                // TODO: 实现ConditionNode
                throw new UnsupportedOperationException("ConditionNode尚未实现");
            case "skill_check":
                // TODO: 实现SkillCheckNode
                throw new UnsupportedOperationException("SkillCheckNode尚未实现");
            case "state_change":
                // TODO: 实现StateChangeNode
                throw new UnsupportedOperationException("StateChangeNode尚未实现");
            default:
                throw new IllegalArgumentException("未知的节点类型: " + nodeType);
        }
    }
    
    /**
     * 创建对话节点
     */
    private GraphEngine.GraphNode createDialogueNode(Map<String, Object> config) {
        DialogueNodeConfig nodeConfig = objectMapper.convertValue(config, DialogueNodeConfig.class);
        return nodeConfig.toDialogueNode();
    }
    
    /**
     * 从JSON字符串创建对话节点
     */
    public DialogueNode createDialogueNodeFromJson(String json) {
        try {
            DialogueNodeConfig config = objectMapper.readValue(json, DialogueNodeConfig.class);
            return config.toDialogueNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建对话节点失败", e);
            throw new RuntimeException("从JSON创建对话节点失败", e);
        }
    }
}
