package com.heartsphere.security;

import com.heartsphere.admin.entity.ApiKey;
import com.heartsphere.admin.service.ApiKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * API Key认证过滤器
 * 在JWT认证过滤器之后执行，如果JWT认证失败，尝试使用API Key认证
 */
@Slf4j
@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private ApiKeyService apiKeyService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            // 如果已经有认证信息（JWT认证成功），则跳过
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            // 尝试从请求头中提取API Key
            String apiKey = parseApiKey(request);
            
            if (apiKey != null) {
                log.debug("API Key found in request: {}...", apiKey.substring(0, Math.min(10, apiKey.length())));
                
                try {
                    // 验证API Key
                    ApiKey key = apiKeyService.validateApiKey(apiKey);
                    
                    // 创建用户详情（使用API Key关联的用户ID，如果没有关联用户则使用系统用户）
                    UserDetailsImpl userDetails;
                    if (key.getUserId() != null) {
                        // 如果有关联用户，需要加载用户信息
                        // 这里简化处理，创建一个基本的用户详情
                        userDetails = createUserDetailsFromApiKey(key);
                    } else {
                        // 没有关联用户，创建一个系统用户
                        userDetails = createSystemUserDetails(key);
                    }
                    
                    // 创建认证对象
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 设置认证信息到SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("API Key authentication successful for key: {}", key.getKeyName());
                    
                    // 记录API Key使用
                    apiKeyService.recordApiKeyUsage(apiKey);
                    
                } catch (Exception e) {
                    log.warn("API Key validation failed: {}", e.getMessage());
                    // 清除可能已设置的认证信息
                    SecurityContextHolder.clearContext();
                }
            } else {
                log.debug("No API Key found in request headers");
            }
        } catch (Exception e) {
            log.error("Cannot set API Key authentication: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }
        
        // 继续处理请求
        filterChain.doFilter(request, response);
    }
    
    /**
     * 从请求头中提取API Key
     * 支持两种格式：
     * 1. Authorization: Bearer <api-key>
     * 2. X-API-Key: <api-key>
     */
    private String parseApiKey(HttpServletRequest request) {
        // 首先尝试从 Authorization 头获取
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // 如果以 hs_ 开头，则认为是API Key
            if (token.startsWith("hs_")) {
                return token;
            }
        }
        
        // 尝试从 X-API-Key 头获取
        String apiKeyHeader = request.getHeader("X-API-Key");
        if (StringUtils.hasText(apiKeyHeader)) {
            return apiKeyHeader;
        }
        
        return null;
    }
    
    /**
     * 从API Key创建用户详情（有关联用户的情况）
     */
    private UserDetailsImpl createUserDetailsFromApiKey(ApiKey apiKey) {
        // TODO: 如果需要加载关联用户的完整信息，可以在这里实现
        // 当前简化处理，使用API Key关联的用户ID
        UserDetailsImpl userDetails = new UserDetailsImpl();
        userDetails.setId(apiKey.getUserId());
        userDetails.setUsername("api_key_" + apiKey.getId());
        userDetails.setEmail(null);
        userDetails.setPassword(null);
        userDetails.setIsEnabled(true);
        return userDetails;
    }
    
    /**
     * 创建系统用户详情（无关联用户的情况）
     */
    private UserDetailsImpl createSystemUserDetails(ApiKey apiKey) {
        // 使用负数ID表示API Key调用（没有关联用户）
        UserDetailsImpl userDetails = new UserDetailsImpl();
        userDetails.setId(-apiKey.getId()); // 使用负数ID表示API Key调用
        userDetails.setUsername("api_key_" + apiKey.getId());
        userDetails.setEmail(null);
        userDetails.setPassword(null);
        userDetails.setIsEnabled(true);
        return userDetails;
    }
}

