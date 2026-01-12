package com.heartsphere.heartconnect.config;

import com.heartsphere.heartconnect.interceptor.SharedModeInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 共享模式配置
 * 注册共享模式拦截器
 */
@Configuration
public class SharedModeConfig implements WebMvcConfigurer {
    
    @Autowired
    private SharedModeInterceptor sharedModeInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sharedModeInterceptor)
                .addPathPatterns("/api/**") // 拦截所有API请求
                .excludePathPatterns(
                    "/api/auth/**",           // 排除认证相关
                    "/api/admin/**",          // 排除管理后台
                    "/api/wechat/**"          // 排除微信相关
                    // 注意：不排除 OPTIONS 请求，但在拦截器内部会直接放行
                    // 这样可以让 CORS 过滤器先处理 OPTIONS 请求
                )
                .order(1); // 设置较低的优先级，确保在 CORS 过滤器之后执行
    }
}


