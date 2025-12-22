package com.heartsphere.aiagent.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * AI服务配置类
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Configuration
public class AIConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}


