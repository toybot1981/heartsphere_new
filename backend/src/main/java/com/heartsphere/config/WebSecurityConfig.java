package com.heartsphere.config;

import com.heartsphere.security.JwtAuthenticationFilter;
import com.heartsphere.security.ApiKeyAuthenticationFilter;
import com.heartsphere.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    ApiKeyAuthenticationFilter apiKeyAuthenticationFilter;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 启用默认的CORS配置，使用application.yml中的配置
                .cors(cors -> cors.configurationSource(request -> {
                    // 创建默认的CORS配置
                    CorsConfiguration config = new CorsConfiguration();
                    // 允许所有来源（使用模式匹配，支持凭证）
                    config.addAllowedOriginPattern("*");
                    // 允许所有HTTP方法
                    config.addAllowedMethod("*");
                    // 明确添加所有允许的请求头（当使用credentials时不能使用*）
                    // 标准请求头
                    config.addAllowedHeader("Origin");
                    config.addAllowedHeader("Content-Type");
                    config.addAllowedHeader("Accept");
                    config.addAllowedHeader("Authorization");
                    // 共享模式相关的自定义请求头
                    config.addAllowedHeader("X-Shared-Mode");
                    config.addAllowedHeader("X-Share-Config-Id");
                    config.addAllowedHeader("X-Visitor-Id");
                    config.addAllowedHeader("x-shared-mode");
                    config.addAllowedHeader("x-share-config-id");
                    config.addAllowedHeader("x-visitor-id");
                    // 暴露响应头（这些是服务器返回的响应头）
                    config.addExposedHeader("X-Shared-Mode");
                    config.addExposedHeader("X-Share-Config-Id");
                    config.addExposedHeader("X-Visitor-Id");
                    // 允许携带凭证
                    config.setAllowCredentials(true);
                    // 预检请求的缓存时间
                    config.setMaxAge(3600L);
                    return config;
                }))
                // 禁用CSRF
                .csrf(csrf -> csrf.disable())
                // 设置会话管理为无状态
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 配置授权规则
                .authorizeHttpRequests(auth -> auth
                        // 允许公开访问的端点
                        .requestMatchers("/api/auth/**", "/api/admin/auth/**", "/api/wechat/**", 
                                "/api/notes/evernote/callback", 
                                "/api/notes/notion/callback",  // Notion OAuth 回调端点
                                "/api/notes/sync-button-enabled",  // 笔记同步按钮显示状态（公开）
                                "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // 允许所有OPTIONS请求
                        .requestMatchers(request -> "OPTIONS".equals(request.getMethod())).permitAll()
                        // 允许所有请求，方便开发测试
                        .anyRequest().permitAll());

        // 配置认证提供者
        http.authenticationProvider(authenticationProvider());

        // 添加JWT过滤器 - 必须在AnonymousAuthenticationFilter之前执行
        // 这样可以确保JWT token在匿名认证之前被处理
        // 使用addFilterBefore确保JWT过滤器在匿名认证过滤器之前执行
        http.addFilterBefore(jwtAuthenticationFilter(), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        
        // 添加API Key认证过滤器 - 在JWT过滤器之后执行
        // 如果JWT认证失败，尝试使用API Key认证
        http.addFilterAfter(apiKeyAuthenticationFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}