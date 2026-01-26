package com.heartsphere.mentis.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

/**
 * 用户服务
 * 用于从主客户端获取用户信息（可选实现）
 * 如果不需要从主客户端获取用户信息，可以禁用此服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "mentis.auth.user-service.enabled", havingValue = "true", matchIfMissing = false)
public class UserService {

    private final RestTemplate restTemplate;

    @Value("${mentis.auth.user-service.base-url:http://localhost:8081}")
    private String userServiceBaseUrl;

    public UserService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(java.time.Duration.ofSeconds(5))
                .setReadTimeout(java.time.Duration.ofSeconds(5))
                .build();
    }

    /**
     * 根据用户名加载用户信息
     * 调用主客户端 API 获取用户信息（需要传递 JWT token）
     * 
     * @param username 用户名
     * @param token JWT token（可选，如果提供则使用 token 调用主客户端 API）
     * @return 用户详情
     */
    public UserDetailsImpl loadUserByUsername(String username, String token) {
        try {
            log.info("Loading user info from main client: username={}", username);
            
            // 如果有 token，调用主客户端的 /api/auth/me 端点获取当前用户信息
            if (token != null && !token.isEmpty()) {
                String url = userServiceBaseUrl + "/api/auth/me";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(token); // 传递 JWT token
                
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                
                @SuppressWarnings("unchecked")
                ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) 
                        (ResponseEntity<?>) restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> userData = (Map<String, Object>) response.getBody().get("data");
                    if (userData != null) {
                        log.info("Successfully loaded user info from main client: userId={}", userData.get("id"));
                        return UserDetailsImpl.builder()
                                .id(((Number) userData.getOrDefault("id", 1L)).longValue())
                                .username((String) userData.getOrDefault("username", username))
                                .email((String) userData.get("email"))
                                .password(null) // 不存储密码
                                .isEnabled((Boolean) userData.getOrDefault("isEnabled", true))
                                .authorities(Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")))
                                .build();
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load user info from main client: {}", e.getMessage());
        }
        
        // 如果调用主客户端失败，返回默认用户信息（使用用户名，ID 为 1）
        log.info("Using default user info for username: {}", username);
        return UserDetailsImpl.builder()
                .id(1L) // 默认用户ID，实际应该从主客户端获取
                .username(username)
                .email(null)
                .password(null)
                .isEnabled(true)
                .authorities(Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }

    /**
     * 根据用户名加载用户信息（不带 token，返回默认用户信息）
     */
    public UserDetailsImpl loadUserByUsername(String username) {
        return loadUserByUsername(username, null);
    }
}
