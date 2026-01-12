package com.heartsphere.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 视频URL工具类
 * 用于处理视频相对路径和绝对URL的转换
 * 如果未配置 base-url，则使用当前请求的域名
 */
@Component
public class VideoUrlUtils {
    
    @Value("${app.video.storage.base-url:}")
    private String configuredBaseUrl;
    
    /**
     * 获取有效的baseUrl
     */
    private String getBaseUrl() {
        // 如果配置了 base-url，优先使用配置的值
        if (configuredBaseUrl != null && !configuredBaseUrl.trim().isEmpty()) {
            return configuredBaseUrl.trim();
        }
        
        // 尝试从当前HTTP请求中获取域名
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                String host = request.getHeader("X-Forwarded-Host");
                if (host == null || host.isEmpty()) {
                    host = request.getHeader("Host");
                }
                if (host == null || host.isEmpty()) {
                    host = request.getServerName();
                }
                
                String scheme = request.getHeader("X-Forwarded-Proto");
                if (scheme == null || scheme.isEmpty()) {
                    scheme = request.getScheme();
                }
                
                if (host != null && (host.startsWith("localhost") || host.startsWith("127.0.0.1"))) {
                    String envBaseUrl = System.getenv("VIDEO_BASE_URL");
                    if (envBaseUrl != null && !envBaseUrl.trim().isEmpty()) {
                        return envBaseUrl.trim();
                    }
                }
                
                StringBuilder baseUrl = new StringBuilder();
                baseUrl.append(scheme).append("://").append(host);
                
                if (host != null && !host.contains(":") && request.getServerPort() != 80 && request.getServerPort() != 443) {
                    int serverPort = request.getServerPort();
                    if ((scheme.equals("http") && serverPort != 80) || 
                        (scheme.equals("https") && serverPort != 443)) {
                        baseUrl.append(":").append(serverPort);
                    }
                }
                
                String contextPath = request.getContextPath();
                baseUrl.append(contextPath).append("/videos");
                
                return baseUrl.toString();
            }
        } catch (Exception e) {
            java.util.logging.Logger.getLogger(VideoUrlUtils.class.getName())
                .warning("无法从请求上下文获取baseUrl: " + e.getMessage());
        }
        
        String envBaseUrl = System.getenv("VIDEO_BASE_URL");
        if (envBaseUrl != null && !envBaseUrl.trim().isEmpty()) {
            return envBaseUrl.trim();
        }
        
        return "";
    }
    
    /**
     * 将相对路径转换为完整的URL
     */
    public String toFullUrl(String path) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        
        String baseUrl = getBaseUrl();
        if (baseUrl == null || baseUrl.isEmpty()) {
            return path;
        }
        
        // 确保路径以 / 开头
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        
        // 移除 /videos 前缀（如果存在），避免重复
        if (path.startsWith("/videos/")) {
            path = path.substring("/videos/".length());
        }
        
        return baseUrl + "/" + path;
    }
    
    /**
     * 将完整URL转换为相对路径
     */
    public String toRelativePath(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            // 已经是相对路径
            String path = url;
            if (path.startsWith("/videos/")) {
                path = path.substring("/videos/".length());
            }
            return path;
        }
        
        // 提取路径部分
        try {
            java.net.URI uri = new java.net.URI(url);
            String path = uri.getPath();
            
            // 移除 /videos 前缀
            if (path.startsWith("/videos/")) {
                path = path.substring("/videos/".length());
            }
            
            return path;
        } catch (Exception e) {
            java.util.logging.Logger.getLogger(VideoUrlUtils.class.getName())
                .warning("解析视频URL失败: " + url);
            return null;
        }
    }
}
