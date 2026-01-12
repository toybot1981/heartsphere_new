package com.heartsphere.admin.graph.core.node;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
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
            case "start":
                return createStartNode(config);
            case "end":
                return createEndNode(config);
            case "dialogue":
                return createDialogueNode(config);
            case "choice":
                return createChoiceNode(config);
            case "condition":
                return createConditionNode(config);
            case "skill_check":
                return createSkillCheckNode(config);
            case "state_change":
                return createStateChangeNode(config);
            case "wait":
                return createWaitNode(config);
            case "era":
            case "scene":
                return createEraNode(config);
            case "character":
                return createCharacterNode(config);
            case "event":
                return createEventNode(config);
            case "item":
                return createItemNode(config);
            case "entity_relation":
            case "relation":
                return createEntityRelationNode(config);
            case "parallel":
                return createParallelNode(config);
            case "loop":
                return createLoopNode(config);
            default:
                throw new IllegalArgumentException("未知的节点类型: " + nodeType);
        }
    }
    
    /**
     * 创建开始节点
     */
    private GraphEngine.GraphNode createStartNode(Map<String, Object> config) {
        StartNodeConfig nodeConfig = objectMapper.convertValue(config, StartNodeConfig.class);
        return nodeConfig.toStartNode();
    }
    
    /**
     * 创建结束节点
     */
    private GraphEngine.GraphNode createEndNode(Map<String, Object> config) {
        EndNodeConfig nodeConfig = objectMapper.convertValue(config, EndNodeConfig.class);
        return nodeConfig.toEndNode();
    }
    
    /**
     * 创建对话节点
     */
    private GraphEngine.GraphNode createDialogueNode(Map<String, Object> config) {
        DialogueNodeConfig nodeConfig = objectMapper.convertValue(config, DialogueNodeConfig.class);
        return nodeConfig.toDialogueNode();
    }
    
    /**
     * 创建选择节点
     */
    private GraphEngine.GraphNode createChoiceNode(Map<String, Object> config) {
        ChoiceNodeConfig nodeConfig = objectMapper.convertValue(config, ChoiceNodeConfig.class);
        return nodeConfig.toChoiceNode();
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
    
    /**
     * 创建条件节点
     */
    private GraphEngine.GraphNode createConditionNode(Map<String, Object> config) {
        ConditionNodeConfig nodeConfig = objectMapper.convertValue(config, ConditionNodeConfig.class);
        return nodeConfig.toConditionNode();
    }
    
    /**
     * 从JSON字符串创建选择节点
     */
    public ChoiceNode createChoiceNodeFromJson(String json) {
        try {
            ChoiceNodeConfig config = objectMapper.readValue(json, ChoiceNodeConfig.class);
            return config.toChoiceNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建选择节点失败", e);
            throw new RuntimeException("从JSON创建选择节点失败", e);
        }
    }
    
    /**
     * 创建技能检查节点
     */
    private GraphEngine.GraphNode createSkillCheckNode(Map<String, Object> config) {
        SkillCheckNodeConfig nodeConfig = objectMapper.convertValue(config, SkillCheckNodeConfig.class);
        return nodeConfig.toSkillCheckNode();
    }
    
    /**
     * 从JSON字符串创建条件节点
     */
    public ConditionNode createConditionNodeFromJson(String json) {
        try {
            ConditionNodeConfig config = objectMapper.readValue(json, ConditionNodeConfig.class);
            return config.toConditionNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建条件节点失败", e);
            throw new RuntimeException("从JSON创建条件节点失败", e);
        }
    }
    
    /**
     * 创建状态变更节点
     */
    @SuppressWarnings("unchecked")
    private GraphEngine.GraphNode createStateChangeNode(Map<String, Object> config) {
        try {
            // 确保config不为null
            if (config == null) {
                config = new java.util.HashMap<>();
            }
            
            // 获取id
            String nodeId = (String) config.get("id");
            if (nodeId == null || nodeId.isEmpty()) {
                log.warn("[NodeFactory] StateChangeNode配置缺少id字段，使用默认值");
                nodeId = "state_change_" + System.currentTimeMillis();
            }
            
            // 获取changes列表
            List<StateChangeNode.StateChange> changes = new java.util.ArrayList<>();
            Object changesObj = config.get("changes");
            if (changesObj != null) {
                if (changesObj instanceof List) {
                    List<Map<String, Object>> changesList = (List<Map<String, Object>>) changesObj;
                    for (Map<String, Object> changeMap : changesList) {
                        try {
                            StateChangeNode.StateChange change = convertToStateChange(changeMap);
                            if (change != null) {
                                changes.add(change);
                            }
                        } catch (Exception e) {
                            log.warn("[NodeFactory] 转换StateChange失败: {}", changeMap, e);
                        }
                    }
                }
            }
            
            // 直接构建StateChangeNode
            return StateChangeNode.builder()
                    .id(nodeId)
                    .changes(changes)
                    .build();
        } catch (Exception e) {
            log.error("[NodeFactory] 创建状态变更节点失败，配置: {}", config, e);
            log.error("[NodeFactory] 异常堆栈: ", e);
            throw new RuntimeException("创建状态变更节点失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 将Map转换为StateChange
     */
    @SuppressWarnings("unchecked")
    private StateChangeNode.StateChange convertToStateChange(Map<String, Object> changeMap) {
        if (changeMap == null) {
            return null;
        }
        
        // 转换type枚举
        StateChangeNode.StateChange.ChangeType changeType = null;
        Object typeObj = changeMap.get("type");
        if (typeObj != null) {
            if (typeObj instanceof StateChangeNode.StateChange.ChangeType) {
                changeType = (StateChangeNode.StateChange.ChangeType) typeObj;
            } else if (typeObj instanceof String) {
                try {
                    changeType = StateChangeNode.StateChange.ChangeType.valueOf(((String) typeObj).toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("[NodeFactory] 未知的ChangeType: {}", typeObj);
                }
            }
        }
        
        // 转换operation枚举
        StateChangeNode.StateChange.OperationType operationType = null;
        Object operationObj = changeMap.get("operation");
        if (operationObj != null) {
            if (operationObj instanceof StateChangeNode.StateChange.OperationType) {
                operationType = (StateChangeNode.StateChange.OperationType) operationObj;
            } else if (operationObj instanceof String) {
                try {
                    operationType = StateChangeNode.StateChange.OperationType.valueOf(((String) operationObj).toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("[NodeFactory] 未知的OperationType: {}", operationObj);
                }
            }
        }
        
        // 获取target和value
        String target = changeMap.get("target") != null ? changeMap.get("target").toString() : null;
        Object value = changeMap.get("value");
        
        // 构建StateChange
        return StateChangeNode.StateChange.builder()
                .type(changeType)
                .target(target)
                .operation(operationType)
                .value(value)
                .build();
    }
    
    /**
     * 从JSON字符串创建技能检查节点
     */
    public SkillCheckNode createSkillCheckNodeFromJson(String json) {
        try {
            SkillCheckNodeConfig config = objectMapper.readValue(json, SkillCheckNodeConfig.class);
            return config.toSkillCheckNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建技能检查节点失败", e);
            throw new RuntimeException("从JSON创建技能检查节点失败", e);
        }
    }
    
    /**
     * 从JSON字符串创建状态变更节点
     */
    public StateChangeNode createStateChangeNodeFromJson(String json) {
        try {
            StateChangeNodeConfig config = objectMapper.readValue(json, StateChangeNodeConfig.class);
            return config.toStateChangeNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建状态变更节点失败", e);
            throw new RuntimeException("从JSON创建状态变更节点失败", e);
        }
    }
    
    /**
     * 从JSON字符串创建开始节点
     */
    public StartNode createStartNodeFromJson(String json) {
        try {
            StartNodeConfig config = objectMapper.readValue(json, StartNodeConfig.class);
            return config.toStartNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建开始节点失败", e);
            throw new RuntimeException("从JSON创建开始节点失败", e);
        }
    }
    
    /**
     * 从JSON字符串创建结束节点
     */
    public EndNode createEndNodeFromJson(String json) {
        try {
            EndNodeConfig config = objectMapper.readValue(json, EndNodeConfig.class);
            return config.toEndNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建结束节点失败", e);
            throw new RuntimeException("从JSON创建结束节点失败", e);
        }
    }
    
    /**
     * 创建等待节点
     */
    private GraphEngine.GraphNode createWaitNode(Map<String, Object> config) {
        WaitNodeConfig nodeConfig = objectMapper.convertValue(config, WaitNodeConfig.class);
        return nodeConfig.toWaitNode();
    }
    
    /**
     * 从JSON字符串创建等待节点
     */
    public WaitNode createWaitNodeFromJson(String json) {
        try {
            WaitNodeConfig config = objectMapper.readValue(json, WaitNodeConfig.class);
            return config.toWaitNode();
        } catch (Exception e) {
            log.error("[NodeFactory] 从JSON创建等待节点失败", e);
            throw new RuntimeException("从JSON创建等待节点失败", e);
        }
    }
    
    /**
     * 创建并行节点
     */
    private GraphEngine.GraphNode createParallelNode(Map<String, Object> config) {
        ParallelNodeConfig nodeConfig = objectMapper.convertValue(config, ParallelNodeConfig.class);
        return nodeConfig.toParallelNode();
    }
    
    /**
     * 创建循环节点
     */
    @SuppressWarnings("unchecked")
    private GraphEngine.GraphNode createLoopNode(Map<String, Object> config) {
        // 处理condition的Map到LoopCondition的转换
        if (config.containsKey("condition") && config.get("condition") instanceof Map) {
            Map<String, Object> conditionMap = (Map<String, Object>) config.get("condition");
            LoopNode.LoopCondition condition = LoopNodeConfig.conditionFromMap(conditionMap);
            config.put("condition", condition);
        }
        
        LoopNodeConfig nodeConfig = objectMapper.convertValue(config, LoopNodeConfig.class);
        return nodeConfig.toLoopNode();
    }
    
    /**
     * 创建场景节点（Era Node）
     */
    private GraphEngine.GraphNode createEraNode(Map<String, Object> config) {
        // 确保config包含id
        if (!config.containsKey("id") && config.containsKey("nodeId")) {
            config.put("id", config.get("nodeId"));
        }
        
        EraNode.EraAction action = EraNode.EraAction.SET_CURRENT;
        if (config.containsKey("action")) {
            try {
                action = EraNode.EraAction.valueOf(((String) config.get("action")).toUpperCase());
            } catch (Exception e) {
                log.warn("[NodeFactory] 无效的EraAction: {}, 使用默认值", config.get("action"));
            }
        }
        
        return EraNode.builder()
            .id((String) config.get("id"))
            .eraId(config.get("eraId") != null ? ((Number) config.get("eraId")).longValue() : null)
            .eraName((String) config.get("eraName"))
            .action(action)
            .eventId((String) config.get("eventId"))
            .stateUpdates((Map<String, Object>) config.get("stateUpdates"))
            .build();
    }
    
    /**
     * 创建角色节点（Character Node）
     */
    private GraphEngine.GraphNode createCharacterNode(Map<String, Object> config) {
        // 确保config包含id
        if (!config.containsKey("id") && config.containsKey("nodeId")) {
            config.put("id", config.get("nodeId"));
        }
        
        CharacterNode.CharacterAction action = CharacterNode.CharacterAction.SET_CURRENT;
        if (config.containsKey("action")) {
            try {
                action = CharacterNode.CharacterAction.valueOf(((String) config.get("action")).toUpperCase());
            } catch (Exception e) {
                log.warn("[NodeFactory] 无效的CharacterAction: {}, 使用默认值", config.get("action"));
            }
        }
        
        return CharacterNode.builder()
            .id((String) config.get("id"))
            .characterId(config.get("characterId") != null ? ((Number) config.get("characterId")).longValue() : null)
            .characterName((String) config.get("characterName"))
            .action(action)
            .favorabilityChange((Map<String, Integer>) config.get("favorabilityChange"))
            .skillChange((Map<String, Integer>) config.get("skillChange"))
            .attributeUpdates((Map<String, Object>) config.get("attributeUpdates"))
            .eventId((String) config.get("eventId"))
            .relationUpdates((Map<String, String>) config.get("relationUpdates"))
            .build();
    }
    
    /**
     * 创建事件节点（Event Node）
     */
    private GraphEngine.GraphNode createEventNode(Map<String, Object> config) {
        // 确保config包含id
        if (!config.containsKey("id") && config.containsKey("nodeId")) {
            config.put("id", config.get("nodeId"));
        }
        
        EventNode.EventAction action = EventNode.EventAction.TRIGGER;
        if (config.containsKey("action")) {
            try {
                action = EventNode.EventAction.valueOf(((String) config.get("action")).toUpperCase());
            } catch (Exception e) {
                log.warn("[NodeFactory] 无效的EventAction: {}, 使用默认值", config.get("action"));
            }
        }
        
        return EventNode.builder()
            .id((String) config.get("id"))
            .eventId((String) config.get("eventId"))
            .eventName((String) config.get("eventName"))
            .action(action)
            .condition((Map<String, Object>) config.get("condition"))
            .stateUpdates((Map<String, Object>) config.get("stateUpdates"))
            .build();
    }
    
    /**
     * 创建物品节点（Item Node）
     */
    private GraphEngine.GraphNode createItemNode(Map<String, Object> config) {
        // 确保config包含id
        if (!config.containsKey("id") && config.containsKey("nodeId")) {
            config.put("id", config.get("nodeId"));
        }
        
        ItemNode.ItemAction action = ItemNode.ItemAction.ADD;
        if (config.containsKey("action")) {
            try {
                action = ItemNode.ItemAction.valueOf(((String) config.get("action")).toUpperCase());
            } catch (Exception e) {
                log.warn("[NodeFactory] 无效的ItemAction: {}, 使用默认值", config.get("action"));
            }
        }
        
        Integer quantity = 1;
        if (config.containsKey("quantity")) {
            quantity = ((Number) config.get("quantity")).intValue();
        }
        
        return ItemNode.builder()
            .id((String) config.get("id"))
            .itemId((String) config.get("itemId"))
            .itemName((String) config.get("itemName"))
            .action(action)
            .quantity(quantity)
            .effect((Map<String, Object>) config.get("effect"))
            .build();
    }
    
    /**
     * 创建实体关联节点（Entity Relation Node）
     */
    private GraphEngine.GraphNode createEntityRelationNode(Map<String, Object> config) {
        // 确保config包含id
        if (!config.containsKey("id") && config.containsKey("nodeId")) {
            config.put("id", config.get("nodeId"));
        }
        
        EntityRelationNode.RelationType relationType = EntityRelationNode.RelationType.FRIEND;
        if (config.containsKey("relationType")) {
            try {
                relationType = EntityRelationNode.RelationType.valueOf(((String) config.get("relationType")).toUpperCase());
            } catch (Exception e) {
                log.warn("[NodeFactory] 无效的RelationType: {}, 使用默认值", config.get("relationType"));
            }
        }
        
        EntityRelationNode.RelationAction action = EntityRelationNode.RelationAction.CREATE;
        if (config.containsKey("action")) {
            try {
                action = EntityRelationNode.RelationAction.valueOf(((String) config.get("action")).toUpperCase());
            } catch (Exception e) {
                log.warn("[NodeFactory] 无效的RelationAction: {}, 使用默认值", config.get("action"));
            }
        }
        
        Integer strength = 50;
        if (config.containsKey("strength")) {
            strength = ((Number) config.get("strength")).intValue();
        }
        
        return EntityRelationNode.builder()
            .id((String) config.get("id"))
            .sourceEntityType((String) config.get("sourceEntityType"))
            .sourceEntityId((String) config.get("sourceEntityId"))
            .targetEntityType((String) config.get("targetEntityType"))
            .targetEntityId((String) config.get("targetEntityId"))
            .relationType(relationType)
            .action(action)
            .strength(strength)
            .condition((Map<String, Object>) config.get("condition"))
            .build();
    }
}
