package com.heartsphere.websearch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Web Search Service Application
 * 基于Tavily API的网页搜索服务
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
public class WebSearchApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebSearchApplication.class, args);
    }
}
