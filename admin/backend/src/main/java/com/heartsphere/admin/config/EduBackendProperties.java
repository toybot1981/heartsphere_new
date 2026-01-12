package com.heartsphere.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 教育版后端配置属性
 */
@Configuration
@ConfigurationProperties(prefix = "edu.backend")
@Data
public class EduBackendProperties {
    /**
     * 教育版后端基础URL
     */
    private String baseUrl = "http://localhost:8084";

    /**
     * 超时配置
     */
    private Timeout timeout = new Timeout();

    /**
     * 重试配置
     */
    private Retry retry = new Retry();

    @Data
    public static class Timeout {
        /**
         * 连接超时（毫秒）
         */
        private int connect = 5000;

        /**
         * 读取超时（毫秒）
         */
        private int read = 30000;
    }

    @Data
    public static class Retry {
        /**
         * 最大重试次数
         */
        private int maxAttempts = 3;

        /**
         * 重试延迟（毫秒）
         */
        private long backoffDelay = 1000;
    }
}
