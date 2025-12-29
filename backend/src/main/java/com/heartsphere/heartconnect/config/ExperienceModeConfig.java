package com.heartsphere.heartconnect.config;

import com.heartsphere.heartconnect.interceptor.ExperienceModeInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 体验模式配置
 * 注册体验模式拦截器
 */
@Configuration
public class ExperienceModeConfig implements WebMvcConfigurer {
    
    @Autowired
    private ExperienceModeInterceptor experienceModeInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(experienceModeInterceptor)
                .addPathPatterns("/api/**") // 拦截所有API请求
                .excludePathPatterns(
                    "/api/auth/**",           // 排除认证相关
                    "/api/admin/**",          // 排除管理后台
                    "/api/wechat/**",         // 排除微信相关
                    "/swagger-ui/**",         // 排除Swagger
                    "/v3/api-docs/**"        // 排除API文档
                );
    }
}

