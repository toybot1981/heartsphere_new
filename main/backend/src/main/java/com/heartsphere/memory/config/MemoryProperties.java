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
    
    /**
     * HSMem 服务配置
     */
    private HSMem hsmem = new HSMem();
    
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
    
    @Data
    public static class HSMem {
        /**
         * 模式：remote=调用外部HSMem服务，local=使用Main内置实现（默认）
         */
        private String mode = "local";

        /**
         * 本地实现配置（mode=local 时生效）
         */
        private Local local = new Local();

        /**
         * HSMem 服务基础URL，默认 http://localhost:8000（mode=remote 时使用）
         */
        private String baseUrl = "http://localhost:8000";
        
        /**
         * 请求超时时间（秒），默认30秒
         */
        private int timeout = 30;
        
        /**
         * 重试配置
         */
        private Retry retry = new Retry();
        
        /**
         * 慢请求阈值（毫秒），默认1000ms
         */
        private long slowRequestThresholdMs = 1000;

        @Data
        public static class Local {
            /**
             * 文件存储根目录，与 HSMem 目录结构一致（resources/items/categories）
             */
            private String basePath = "./memory_data";
        }
        
        @Data
        public static class Retry {
            /**
             * 是否启用重试，默认true
             */
            private boolean enabled = true;
            
            /**
             * 最大重试次数，默认3次
             */
            private int maxAttempts = 3;
            
            /**
             * 重试退避时间（秒），默认1秒
             */
            private int backoff = 1;
        }
    }
}




