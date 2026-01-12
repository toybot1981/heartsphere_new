package com.heartsphere.websearch.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Tavily API配置
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "tavily")
public class TavilyConfig {

    /**
     * Tavily API密钥
     */
    private String apiKey;

    /**
     * API基础URL
     */
    private String baseUrl = "https://api.tavily.com";

    /**
     * 请求超时时间(毫秒)
     */
    private Integer timeout = 30000;

    /**
     * 最大重试次数
     */
    private Integer maxRetries = 3;
}
