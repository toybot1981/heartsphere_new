package com.heartsphere.admin.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;
import java.util.List;

/**
 * 多智能体路由配置 DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentRoutingConfigDTO {
    
    /**
     * 关键词到能力的映射
     */
    private Map<String, List<String>> keywordToCapabilities;
    
    /**
     * 智能体优先级
     */
    private Map<String, Integer> agentPriorities;
    
    /**
     * 任务分解规则
     */
    private List<Map<String, Object>> decompositionRules;
    
    /**
     * 路由算法参数
     */
    private Map<String, Object> routingParameters;
}
