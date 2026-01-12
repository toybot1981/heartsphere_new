package com.heartsphere.admin.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate 配置类
 */
@Configuration
public class RestTemplateConfig {

    /**
     * 创建默认的 RestTemplate Bean
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder, EduBackendProperties eduBackendProperties) {
        ClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        SimpleClientHttpRequestFactory simpleFactory = (SimpleClientHttpRequestFactory) factory;
        simpleFactory.setConnectTimeout(eduBackendProperties.getTimeout().getConnect());
        simpleFactory.setReadTimeout(eduBackendProperties.getTimeout().getRead());

        return builder
                .requestFactory(() -> factory)
                .build();
    }
}
