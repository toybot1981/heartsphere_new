package com.heartsphere.edu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI (Swagger) 配置
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI eduOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HeartSphere Education Edition API")
                        .description("HeartSphere 教育版数字人教育功能 API 文档")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("HeartSphere Team")
                                .email("support@heartsphere.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8084")
                                .description("开发环境"),
                        new Server()
                                .url("https://api-edu.heartsphere.com")
                                .description("生产环境")));
    }
}
