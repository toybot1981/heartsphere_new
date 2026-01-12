package com.heartsphere.websearch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Web搜索配置
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Configuration
public class WebSearchConfig {

    /**
     * RestTemplate Bean
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
