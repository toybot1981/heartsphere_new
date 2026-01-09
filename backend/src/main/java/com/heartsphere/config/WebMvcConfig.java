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
import org.springframework.core.Ordered;
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
public class WebMvcConfig implements WebMvcConfigurer, Ordered {

    @Value("${app.image.storage.local.path:./uploads/images}")
    private String localStoragePath;

    @Value("${app.video.storage.local.path:./uploads/videos}")
    private String videoStoragePath;

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
        // 将所有图片路径统一映射到本地文件系统的 uploads/images/ 目录
        String uploadPath = Paths.get(localStoragePath).toAbsolutePath().normalize().toString();
        // 确保路径以 / 结尾
        if (!uploadPath.endsWith("/") && !uploadPath.endsWith("\\")) {
            uploadPath += "/";
        }
        
        // 统一使用 /images/** 路径格式，映射到 uploads/images/ 目录
        // 例如：/images/item/2026/01/xxx.png -> uploads/images/item/2026/01/xxx.png
        // 明确只处理图片路径，确保不会拦截 API 路由
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + uploadPath)
                .resourceChain(false); // 禁用资源链，提高性能
        
        // 兼容旧路径格式：/item/** -> /images/item/**
        // 将 /item/** 也映射到相同的 uploads/images/ 目录
        // 这样 /item/2026/01/xxx.png 会查找 uploads/images/item/2026/01/xxx.png
        registry.addResourceHandler("/item/**")
                .addResourceLocations("file:" + uploadPath + "item/")
                .resourceChain(false); // 禁用资源链，提高性能
        
        // 配置视频访问路径
        // 将所有视频路径统一映射到本地文件系统的 uploads/videos/ 目录
        String videoPath = Paths.get(videoStoragePath).toAbsolutePath().normalize().toString();
        // 确保路径以 / 结尾
        if (!videoPath.endsWith("/") && !videoPath.endsWith("\\")) {
            videoPath += "/";
        }
        
        // 使用 /videos/** 路径格式，映射到 uploads/videos/ 目录
        // 例如：/videos/general/2026/01/xxx.mp4 -> uploads/videos/general/2026/01/xxx.mp4
        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + videoPath)
                .resourceChain(false); // 禁用资源链，提高性能
    }
    
    /**
     * 设置配置类的优先级
     * 返回 LOWEST_PRECEDENCE 确保静态资源处理器在所有控制器映射之后处理
     */
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}

