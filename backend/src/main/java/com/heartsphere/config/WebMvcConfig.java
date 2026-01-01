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
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import io.netty.channel.ChannelOption;

import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;

/**
 * Web MVC配置
 * 配置静态资源访问，用于访问上传的图片
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

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
        
        // 处理Hibernate懒加载代理对象
        try {
            // 尝试注册Hibernate 6模块（如果可用）
            Class<?> hibernateModuleClass = Class.forName("com.fasterxml.jackson.databind.module.SimpleModule");
            com.fasterxml.jackson.databind.module.SimpleModule hibernateModule = 
                new com.fasterxml.jackson.databind.module.SimpleModule("HibernateModule");
            // 配置忽略Hibernate代理相关属性
            mapper.registerModule(hibernateModule);
        } catch (ClassNotFoundException e) {
            // Hibernate模块不可用，使用其他方式处理
        }
        
        // 配置Jackson忽略Hibernate代理属性
        mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        return mapper;
    }

    @Bean
    public WebClient webClient() {
        // 配置连接池，增加连接保活时间，减少连接被关闭的可能性
        ConnectionProvider connectionProvider = ConnectionProvider.builder("webclient-pool")
            .maxConnections(500)
            .maxIdleTime(Duration.ofSeconds(30)) // 增加空闲时间到30秒
            .maxLifeTime(Duration.ofSeconds(120)) // 增加连接生命周期到120秒
            .pendingAcquireTimeout(Duration.ofSeconds(60))
            .evictInBackground(Duration.ofSeconds(120))
            .fifo() // FIFO模式，确保连接被正确复用
            .build();
        
        // 配置 HttpClient，优化 DNS 解析和连接管理
        // 注意：DNS 配置通过 JVM 参数设置：
        // -Dio.netty.resolver.dns.queryTimeoutMillis=30000 (DNS 查询超时 30 秒)
        // -Djava.net.preferIPv4Stack=true (优先使用 IPv4)
        HttpClient httpClient = HttpClient.create(connectionProvider)
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000) // 连接超时 30 秒
            .option(ChannelOption.SO_KEEPALIVE, true) // 启用TCP Keep-Alive
            .option(ChannelOption.TCP_NODELAY, true) // 禁用Nagle算法，减少延迟
            .resolver(spec -> {
                // 配置 DNS 解析器超时时间（30秒）
                // DNS 服务器使用系统配置或 JVM 参数指定的配置
                spec.queryTimeout(Duration.ofSeconds(30)); // DNS 查询超时 30 秒
            })
            .responseTimeout(Duration.ofSeconds(60)) // 响应超时 60 秒
            .doOnConnected(conn -> {
                // 连接建立时的回调，可以记录日志
                // log.debug("[WebClient] 连接已建立");
            })
            .doOnDisconnected(conn -> {
                // 连接断开时的回调
                // log.debug("[WebClient] 连接已断开");
            });
        
        return WebClient.builder()
            .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB
            .build();
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
                .addResourceLocations("file:" + uploadPath);
    }
}

