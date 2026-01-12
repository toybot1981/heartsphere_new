package com.heartsphere.mentis.security;

import com.heartsphere.shared.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT 认证过滤器
 * 从请求头中提取 JWT token，验证后设置到 SecurityContext
 * 与主客户端使用相同的 JWT secret，实现单点登录
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired(required = false)
    private UserService userService; // 用于根据用户名加载用户信息（可选）

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            // 如果已经有认证信息（例如通过其他方式认证），则跳过
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            // 1. 从请求头中提取 JWT token
            String jwt = parseJwt(request);
            
            if (jwt != null) {
                log.debug("JWT token found in request: {}...", jwt.substring(0, Math.min(20, jwt.length())));
                
                // 2. 验证 token
                if (jwtUtils.validateJwtToken(jwt)) {
                    log.debug("JWT token is valid");
                    
                    try {
                        // 3. 从 token 中获取用户名（subject）
                        String username = jwtUtils.getUserNameFromJwtToken(jwt);
                        log.debug("Extracted username from token: {}", username);
                        
                        // 4. 创建用户详情
                        // 如果有 userService，可以从主客户端 API 加载完整用户信息（传递 token）
                        // 否则使用简化实现：使用用户名作为基础信息
                        UserDetailsImpl userDetails;
                        if (userService != null) {
                            // 调用主客户端 API 获取用户信息，传递 JWT token
                            userDetails = userService.loadUserByUsername(username, jwt);
                        } else {
                            // 简化实现：使用默认用户ID 1
                            // 注意：在实际生产环境中，应该从 token 中提取用户ID（如果 token 中包含）
                            // 或者调用主客户端 API 获取用户信息
                            userDetails = UserDetailsImpl.builder()
                                    .id(1L) // 临时默认值，实际应该从主客户端获取
                                    .username(username)
                                    .email(null)
                                    .password(null)
                                    .isEnabled(true)
                                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                                    .build();
                        }
                        
                        // 5. 创建认证对象
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // 6. 将认证对象设置到 SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Authentication set in SecurityContext for user: {}", username);
                    } catch (Exception e) {
                        log.warn("Failed to load user details for token: {}", e.getMessage());
                        SecurityContextHolder.clearContext();
                    }
                } else {
                    log.debug("JWT token validation failed");
                    SecurityContextHolder.clearContext();
                }
            } else {
                log.debug("No JWT token found in request headers");
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }
        
        // 继续处理请求（无论认证成功与否）
        filterChain.doFilter(request, response);
    }
    
    /**
     * 从请求头中提取 JWT token
     * 支持格式：Authorization: Bearer <token>
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}
