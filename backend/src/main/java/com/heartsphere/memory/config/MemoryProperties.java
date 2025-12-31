package com.heartsphere.memory.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 记忆系统配置属性
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Component
@ConfigurationProperties(prefix = "heartsphere.memory")
public class MemoryProperties {
    
    /**
     * 短期记忆配置
     */
    private ShortMemory shortMemory = new ShortMemory();
    
    /**
     * 长期记忆配置
     */
    private LongMemory longMemory = new LongMemory();
    
    /**
     * 记忆提取配置
     */
    private Extraction extraction = new Extraction();
    
    @Data
    public static class ShortMemory {
        /**
         * 消息TTL（秒），默认7天
         */
        private int messageTtl = 3600 * 24 * 7;
        
        /**
         * 每会话最大消息数，默认100
         */
        private int maxMessagesPerSession = 100;
        
        /**
         * 工作记忆TTL（秒），默认24小时
         */
        private int workingMemoryTtl = 3600 * 24;
    }
    
    @Data
    public static class LongMemory {
        /**
         * 记忆提取重要性阈值，默认0.7
         */
        private double extractionImportanceThreshold = 0.7;
        
        /**
         * 记忆提取置信度阈值，默认0.6
         */
        private double extractionConfidenceThreshold = 0.6;
    }
    
    @Data
    public static class Extraction {
        /**
         * 是否启用LLM提取，默认true
         */
        private boolean enableLlmExtraction = true;
        
        /**
         * 是否启用规则提取（备用），默认true
         */
        private boolean enableRuleExtraction = true;
        
        /**
         * 提取批次大小，默认10
         */
        private int batchSize = 10;
    }
}



