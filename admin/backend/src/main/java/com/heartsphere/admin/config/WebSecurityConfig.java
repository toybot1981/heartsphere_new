package com.heartsphere.admin.config;

import com.heartsphere.admin.security.JwtAuthenticationFilter;
import com.heartsphere.admin.security.ApiKeyAuthenticationFilter;
import com.heartsphere.admin.security.UserDetailsServiceImpl;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    ApiKeyAuthenticationFilter apiKeyAuthenticationFilter;
    
    /**
     * CORS允许的来源（生产环境）
     * 从环境变量或application.yml读取，格式：逗号分隔的URL列表
     * 例如：https://yourdomain.com,https://www.yourdomain.com
     * 如果未配置，开发环境默认允许所有来源
     */
    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;
    
    /**
     * 当前环境（dev/test/staging/prod）
     */
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

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
     * 
     * 规范要求：
     * 1. 所有CORS配置统一在此处管理
     * 2. Controller层禁止使用@CrossOrigin注解
     * 3. 开发环境允许所有来源，生产环境明确指定允许的来源
     * 
     * 注意：当使用 setAllowCredentials(true) 时，不能使用 addAllowedHeader("*")，必须明确列出所有请求头
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 环境配置：开发环境允许所有来源，生产环境明确指定
        boolean isDevelopment = "dev".equals(activeProfile) || "test".equals(activeProfile);
        
        if (isDevelopment || !StringUtils.hasText(allowedOrigins)) {
            // 开发环境：允许所有来源（使用模式匹配，支持凭证）
            config.addAllowedOriginPattern("*");
        } else {
            // 生产环境：明确指定允许的来源
            String[] origins = allowedOrigins.split(",");
            for (String origin : origins) {
                String trimmedOrigin = origin.trim();
                if (StringUtils.hasText(trimmedOrigin)) {
                    config.addAllowedOrigin(trimmedOrigin);
                }
            }
        }
        
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
        
        // 自定义请求头（根据项目需要添加）
        // 例如：心域连接功能可能使用的自定义请求头
        // config.addAllowedHeader("X-Share-Config-Id");
        // config.addAllowedHeader("X-Shared-Mode");
        
        // 允许携带凭证（Cookie、Authorization等）
        config.setAllowCredentials(true);
        
        // 预检请求的缓存时间（秒）
        config.setMaxAge(3600L);
        
        // 暴露的响应头（如果前端需要访问自定义响应头，在此添加）
        // config.addExposedHeader("X-Custom-Header");
        // config.addExposedHeader("X-Total-Count");
        
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
                                "/api/company/contact",  // 公司官网联系表单（公开）
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