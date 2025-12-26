package com.heartsphere.aistudio.context.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Context Engine 配置属性
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "aistudio.context")
public class ContextProperties {

    /**
     * 默认最大 token 数量
     */
    private int defaultMaxTokens = 8000;

    /**
     * 默认优化策略
     */
    private String defaultStrategy = "HYBRID";

    /**
     * ChatMemory 配置
     */
    private ChatMemoryConfig chatMemory = new ChatMemoryConfig();

    /**
     * 优化器配置
     */
    private OptimizerConfig optimizer = new OptimizerConfig();

    @Data
    public static class ChatMemoryConfig {
        /**
         * Redis 存储的最大消息数
         */
        private int maxMessages = 100;

        /**
         * 消息过期时间（天）
         */
        private int ttlDays = 7;

        /**
         * 超过限制时的压缩阈值（百分比）
         */
        private double compressionThreshold = 0.7;
    }

    @Data
    public static class OptimizerConfig {
        /**
         * 摘要生成是否启用
         */
        private boolean summarizationEnabled = true;

        /**
         * 摘要的最大 token 数
         */
        private int maxSummaryTokens = 500;
    }
}
