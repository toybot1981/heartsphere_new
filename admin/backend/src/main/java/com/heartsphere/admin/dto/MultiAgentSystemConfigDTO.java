package com.heartsphere.admin.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 多智能体系统配置 DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentSystemConfigDTO {
    
    /**
     * 协作超时时间（秒）
     */
    private Integer collaborationTimeoutSeconds;
    
    /**
     * 最大重试次数
     */
    private Integer maxRetryCount;
    
    /**
     * 最大并发协作数
     */
    private Integer maxConcurrentCollaborations;
    
    /**
     * 日志级别
     */
    private String logLevel; // DEBUG, INFO, WARN, ERROR
    
    /**
     * AgentScope 配置
     */
    private AgentScopeConfigDTO agentScopeConfig;
    
    /**
     * AgentScope 配置内部类
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentScopeConfigDTO {
        private Boolean enabled;
        private String modelName;
        private Integer maxIters;
        private Boolean stream;
    }
}
