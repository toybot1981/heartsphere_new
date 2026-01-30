package com.heartsphere.ai.mcp.config;

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
import org.springframework.web.client.RestTemplate;

@Slf4j
@Configuration
public class McpRestTemplateConfig {

    @Bean(name = "mcpRestTemplate")
    public RestTemplate mcpRestTemplate() {
        try {
            Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                    .register("http", PlainConnectionSocketFactory.getSocketFactory())
                    .register("https", SSLConnectionSocketFactory.getSystemSocketFactory())
                    .build();
            PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager(registry);
            cm.setMaxTotal(100);
            cm.setDefaultMaxPerRoute(20);
            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectTimeout(Timeout.ofSeconds(30))
                    .setResponseTimeout(Timeout.ofSeconds(60))
                    .setConnectionRequestTimeout(Timeout.ofSeconds(10))
                    .build();
            CloseableHttpClient httpClient = HttpClients.custom()
                    .setConnectionManager(cm)
                    .setDefaultRequestConfig(requestConfig)
                    .evictIdleConnections(Timeout.ofSeconds(30))
                    .evictExpiredConnections()
                    .build();
            HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
            RestTemplate rt = new RestTemplate(factory);
            log.info("[ai.mcp] MCP RestTemplate configured (connect 30s, response 60s)");
            return rt;
        } catch (Exception e) {
            log.warn("[ai.mcp] MCP RestTemplate fallback to default: {}", e.getMessage());
            return new RestTemplate();
        }
    }
}
