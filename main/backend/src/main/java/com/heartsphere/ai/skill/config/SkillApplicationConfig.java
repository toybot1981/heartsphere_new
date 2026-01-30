package com.heartsphere.ai.skill.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 技能应用配置
 * 支持特性开关和参数配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "skill.application")
public class SkillApplicationConfig {
    
    /**
     * 是否启用技能应用引擎
     * 默认：false（确保向后兼容）
     */
    private boolean enabled = false;
    
    /**
     * 评分配置
     */
    private ScoringConfig scoring = new ScoringConfig();
    
    /**
     * 执行配置
     */
    private ExecutionConfig execution = new ExecutionConfig();
    
    @Data
    public static class ScoringConfig {
        /**
         * 关键词权重
         */
        private double keywordWeight = 0.3;
        
        /**
         * 语义相似度权重
         */
        private double semanticWeight = 0.4;
        
        /**
         * 上下文匹配权重
         */
        private double contextWeight = 0.35;
        
        /**
         * 内存触发权重
         */
        private double memoryWeight = 0.25;
        
        /**
         * 评分阈值（0-100）
         */
        private int threshold = 60;
        
        /**
         * 最多同时应用的技能数
         */
        private int maxConcurrentSkills = 5;
    }
    
    @Data
    public static class ExecutionConfig {
        /**
         * 是否异步记录执行记录
         */
        private boolean asyncRecord = true;
        
        /**
         * 记录保留天数
         */
        private int recordRetentionDays = 90;
        
        /**
         * 归档批次大小
         */
        private int archiveBatchSize = 1000;
    }
}
