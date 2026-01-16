package com.heartsphere.mentis.config;

import com.heartsphere.mentis.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Mentis 后端安全配置
 * 支持 JWT 认证，与主客户端实现单点登录（SSO）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 禁用 CSRF（使用 JWT，无状态）
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(request -> {
                // 配置 CORS，允许前端访问 SSE 端点
                org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
                config.setAllowedOriginPatterns(java.util.Arrays.asList("*"));
                config.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(java.util.Arrays.asList("*"));
                config.setAllowCredentials(true);
                config.setExposedHeaders(java.util.Arrays.asList("Content-Type", "Cache-Control", "X-Requested-With"));
                return config;
            }))
            .authorizeHttpRequests(auth -> auth
                // 允许 Swagger 和 Actuator 匿名访问
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                // Mentis API 端点需要认证（如果没有 token，则允许匿名访问，使用默认用户）
                .requestMatchers("/api/mentis/**").permitAll() // 临时允许匿名访问，后续可以改为 .authenticated()
                .anyRequest().authenticated()
            )
            // 添加 JWT 认证过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
