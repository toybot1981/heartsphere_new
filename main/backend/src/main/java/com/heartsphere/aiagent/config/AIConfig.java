package com.heartsphere.aiagent.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.socket.ConnectionSocketFactory;
import org.apache.hc.client5.http.socket.PlainConnectionSocketFactory;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.apache.hc.core5.http.config.Registry;
import org.apache.hc.core5.http.config.RegistryBuilder;
import org.apache.hc.core5.util.Timeout;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.lang.NonNull;
import org.springframework.web.client.RestTemplate;

/**
 * AI服务配置类
 * 配置HTTP客户端连接池、超时和重试机制
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Configuration
public class AIConfig {
    
    /**
     * 配置RestTemplate，支持连接池、超时和自动重连
     */
    @Bean
    public RestTemplate restTemplate() {
        // 创建连接池管理器
        Registry<ConnectionSocketFactory> socketFactoryRegistry = RegistryBuilder
           .<ConnectionSocketFactory>create()
            .register("http", PlainConnectionSocketFactory.getSocketFactory())
            .register("https", SSLConnectionSocketFactory.getSystemSocketFactory())
            .build();
        
        PoolingHttpClientConnectionManager connectionManager = 
            new PoolingHttpClientConnectionManager(socketFactoryRegistry);
        // 设置最大连接数
        connectionManager.setMaxTotal(200);
        // 设置每个路由的最大连接数（每个目标主机）
        connectionManager.setDefaultMaxPerRoute(50);
        
        // 配置请求超时（使用新的API）
        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(Timeout.ofSeconds(30)) // 连接超时30秒
            .setResponseTimeout(Timeout.ofSeconds(60)) // 响应超时60秒
            .setConnectionRequestTimeout(Timeout.ofSeconds(10)) // 从连接池获取连接超时10秒
            .build();
        
        // 创建HttpClient，配置连接保活和重试
        CloseableHttpClient httpClient = HttpClients.custom()
            .setConnectionManager(connectionManager)
            .setDefaultRequestConfig(requestConfig)
            .evictIdleConnections(Timeout.ofSeconds(30)) // 空闲连接30秒后关闭
            .evictExpiredConnections() // 自动清理过期连接
            .build();
        
        // 创建请求工厂
        @SuppressWarnings("null")
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory(httpClient);
        
        RestTemplate restTemplate = new RestTemplate(factory);
        
        // 添加重试拦截器
        restTemplate.getInterceptors().add(new RetryHttpRequestInterceptor());
        
        log.info("[AIConfig] RestTemplate配置完成 - 最大连接数: 200, 每个路由最大连接数: 50, 连接超时: 30s, 响应超时: 60s");
        
        return restTemplate;
    }
}


