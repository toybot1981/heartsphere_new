package com.heartsphere.mentis.agentscope.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AgentScope 配置类
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "mentis.agentscope")
public class AgentScopeConfig {
    
    /**
     * 是否启用 AgentScope 增强功能
     */
    private boolean enabled = true;
    
    /**
     * 多智能体协作配置
     */
    private MultiAgentConfig multiAgent = new MultiAgentConfig();
    
    /**
     * 长期记忆管理配置
     */
    private MemoryConfig memory = new MemoryConfig();
    
    /**
     * 任务规划配置
     */
    private PlanningConfig planning = new PlanningConfig();
    
    /**
     * 工具调用优化配置
     */
    private ToolOptimizationConfig toolOptimization = new ToolOptimizationConfig();
    
    /**
     * 结构化输出配置
     */
    private StructuredOutputConfig structuredOutput = new StructuredOutputConfig();
    
    /**
     * 钩子函数系统配置
     */
    private HooksConfig hooks = new HooksConfig();
    
    /**
     * 会话状态管理配置
     */
    private SessionConfig session = new SessionConfig();
    
    @Data
    public static class MultiAgentConfig {
        private boolean enabled = false;
    }
    
    @Data
    public static class MemoryConfig {
        private boolean enabled = false;
    }
    
    @Data
    public static class PlanningConfig {
        private boolean enabled = false;
    }
    
    @Data
    public static class ToolOptimizationConfig {
        private boolean enabled = false;
        private boolean parallelCalls = false;
        private boolean streamingResponses = false;
    }
    
    @Data
    public static class StructuredOutputConfig {
        private boolean enabled = false;
    }
    
    @Data
    public static class HooksConfig {
        private boolean enabled = false;
    }
    
    @Data
    public static class SessionConfig {
        private boolean enabled = false;
    }
}
