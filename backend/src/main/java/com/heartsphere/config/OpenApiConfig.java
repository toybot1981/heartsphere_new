package com.heartsphere.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI配置类
 * 配置Swagger/OpenAPI文档的基本信息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        OpenAPI openAPI = new OpenAPI();
        
        // 显式设置 OpenAPI 版本
        openAPI.setOpenapi("3.0.3");
        
        // 设置 API 信息
        openAPI.setInfo(new Info()
                .title("HeartSphere API")
                .version("1.0.0")
                .description("心域（HeartSphere）统一AI服务API文档\n\n" +
                        "提供统一的AI服务接口，支持文本生成、图片生成、音频处理、视频生成等功能。\n\n" +
                        "接口格式与客户端适配器保持一致，遵循OpenAPI 3.0规范。")
                .contact(new Contact()
                        .name("HeartSphere Team")
                        .email("support@heartsphere.com"))
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
        
        // 设置服务器
        openAPI.setServers(List.of(
                new Server()
                        .url("http://localhost:8081")
                        .description("本地开发环境"),
                new Server()
                        .url("https://api.heartsphere.com")
                        .description("生产环境")
        ));
        
        return openAPI;
    }
}

