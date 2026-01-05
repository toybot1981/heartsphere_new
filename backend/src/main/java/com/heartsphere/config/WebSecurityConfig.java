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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    /**
     * CORS配置源
     * 统一配置所有控制器的CORS策略
     * 注意：当使用 setAllowCredentials(true) 时，不能使用 addAllowedHeader("*")，必须明确列出所有请求头
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许所有来源（使用模式匹配，支持凭证）
        config.addAllowedOriginPattern("*");
        
        // 允许所有HTTP方法
        config.addAllowedMethod("*");
        
        // 当使用 setAllowCredentials(true) 时，不能使用通配符，必须明确列出所有请求头
        // 标准请求头
        config.addAllowedHeader("Origin");
        config.addAllowedHeader("Content-Type");
        config.addAllowedHeader("Accept");
        config.addAllowedHeader("Authorization");
        config.addAllowedHeader("X-Requested-With");
        config.addAllowedHeader("Cache-Control");
        config.addAllowedHeader("Pragma");
        
        // 允许携带凭证
        config.setAllowCredentials(true);
        
        // 预检请求的缓存时间（秒）
        config.setMaxAge(3600L);
        
        // 应用到所有路径
        source.registerCorsConfiguration("/**", config);
        
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 使用统一的CORS配置源
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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