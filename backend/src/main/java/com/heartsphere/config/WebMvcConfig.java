package com.heartsphere.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Web MVC配置
 * 配置静态资源访问，用于访问上传的图片
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.image.storage.local.path:./uploads/images}")
    private String localStoragePath;

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

