package com.heartsphere.skill.service.executor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Graph 技能执行器
 * 
 * 执行 Graph 流程类型的技能
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class GraphSkillExecutor implements SkillExecutor.SkillExecutionHandler {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // TODO: 注入 GraphExecutionService（如果需要）
    // private final GraphExecutionService graphExecutionService;
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 从 execution_config 中获取 Graph 配置
            Map<String, Object> config = parseExecutionConfig(skill.getExecutionConfig());
            
            Long graphId = getGraphId(config);
            String entryNodeId = (String) config.getOrDefault("entryNodeId", "start");
            
            // TODO: 调用 GraphExecutionService 执行 Graph
            // GraphExecutionRequest request = new GraphExecutionRequest();
            // request.setInitialData(parameters);
            // GraphExecutionResult result = graphExecutionService.executeGraph(graphId, request);
            
            // 临时方案：返回模拟结果
            log.warn("Graph 技能执行暂未实现，返回模拟结果: skillId={}", skill.getSkillId());
            
            Map<String, Object> result = new HashMap<>();
            result.put("skillId", skill.getSkillId());
            result.put("graphId", graphId);
            result.put("entryNodeId", entryNodeId);
            result.put("parameters", parameters);
            result.put("message", "Graph 执行成功（模拟）");
            result.put("note", "需要集成 GraphExecutionService");
            
            return result;
            
        } catch (Exception e) {
            log.error("执行 Graph 技能失败: skillId={}", skill.getSkillId(), e);
            throw new RuntimeException("Graph 执行失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取 Graph ID
     */
    private Long getGraphId(Map<String, Object> config) {
        Object graphIdObj = config.get("graphId");
        if (graphIdObj instanceof Number) {
            return ((Number) graphIdObj).longValue();
        } else if (graphIdObj instanceof String) {
            return Long.parseLong((String) graphIdObj);
        }
        throw new IllegalArgumentException("Graph ID 未配置或格式错误");
    }
    
    /**
     * 解析执行配置
     */
    private Map<String, Object> parseExecutionConfig(String configJson) {
        try {
            return objectMapper.readValue(configJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("解析执行配置失败", e);
            throw new IllegalArgumentException("无效的执行配置: " + e.getMessage());
        }
    }
}
