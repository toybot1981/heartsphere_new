package com.heartsphere.edu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 配置
 * 允许 API 端点在不认证的情况下访问（用于开发测试）
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)  // 禁用 CSRF（API 通常不需要）
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/edu/**").permitAll()  // 允许所有 edu API 访问
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()  // 允许 Swagger 访问
                .anyRequest().authenticated()  // 其他请求需要认证
            );

        return http.build();
    }
}
