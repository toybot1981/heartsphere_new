package com.heartsphere.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.core.Ordered;

import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.List;

/**
 * Web MVC配置
 * 配置静态资源访问，用于访问上传的图片
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer, Ordered {

    @Value("${app.image.storage.local.path:./uploads/images}")
    private String localStoragePath;

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
        // 注册 Java 8 时间模块
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        // 禁用将日期写为时间戳，使用 ISO-8601 格式
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS);
        // 忽略未知属性，避免前端发送额外字段时抛出异常
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    @Override
    public void configureMessageConverters(@NonNull List<HttpMessageConverter<?>> converters) {
        // 确保字符串消息转换器使用UTF-8编码
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        converters.add(0, stringConverter);
        
        // 配置 JSON 消息转换器，不转义非 ASCII 字符
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setObjectMapper(objectMapper());
        converters.add(0, jsonConverter);
    }

    @Override
    public void configurePathMatch(@NonNull PathMatchConfigurer configurer) {
        // 确保 API 路径优先匹配控制器，而不是静态资源
        // 注意：这些方法在 Spring 6.0+ 中已废弃，但为了兼容性保留
        // 实际配置通过 application.properties 中的 spring.mvc.pathmatch.* 属性控制
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 配置图片访问路径
        // 将 /api/images/files/** 映射到本地文件系统的 uploads/images/ 目录
        // 注意：使用 /files/** 后缀以避免与 ImageController 的 /api/images/upload 等端点冲突
        String uploadPath = Paths.get(localStoragePath).toAbsolutePath().normalize().toString();
        // 确保路径以 / 结尾
        if (!uploadPath.endsWith("/") && !uploadPath.endsWith("\\")) {
            uploadPath += "/";
        }
        registry.addResourceHandler("/api/images/files/**")
                .addResourceLocations("file:" + uploadPath)
                .setCachePeriod(0) // 禁用缓存，确保API请求不被误判为静态资源
                .resourceChain(false); // 禁用资源链，避免与API路径冲突
    }

    @Override
    public int getOrder() {
        // 设置较低的优先级，确保API控制器优先处理
        return Ordered.LOWEST_PRECEDENCE;
    }
}

