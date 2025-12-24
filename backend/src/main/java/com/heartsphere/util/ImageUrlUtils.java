package com.heartsphere.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * 图片URL工具类
 * 用于处理相对路径和绝对URL的转换
 * 如果未配置 base-url，则使用当前请求的域名
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Component
public class ImageUrlUtils {
    
    @Value("${app.image.storage.base-url:}")
    private String configuredBaseUrl;
    
    /**
     * 获取有效的baseUrl
     * 如果配置了 base-url，使用配置的值
     * 否则从当前HTTP请求中获取域名
     * 
     * @return baseUrl
     */
    private String getBaseUrl() {
        // 如果配置了base-url，优先使用配置的值
        if (configuredBaseUrl != null && !configuredBaseUrl.trim().isEmpty()) {
            return configuredBaseUrl.trim();
        }
        
        // 尝试从当前HTTP请求中获取域名
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String scheme = request.getScheme(); // http 或 https
                String serverName = request.getServerName(); // 域名
                int serverPort = request.getServerPort(); // 端口
                String contextPath = request.getContextPath(); // 应用上下文路径
                
                // 构建baseUrl
                StringBuilder baseUrl = new StringBuilder();
                baseUrl.append(scheme).append("://").append(serverName);
                
                // 如果是非标准端口（不是80或443），添加端口号
                if ((scheme.equals("http") && serverPort != 80) || 
                    (scheme.equals("https") && serverPort != 443)) {
                    baseUrl.append(":").append(serverPort);
                }
                
                // 添加应用上下文路径和图片API路径
                baseUrl.append(contextPath).append("/api/images");
                
                return baseUrl.toString();
            }
        } catch (Exception e) {
            // 如果获取请求失败（比如在非HTTP上下文中），使用默认值
        }
        
        // 如果无法获取请求上下文，使用默认值
        return "http://localhost:8081/api/images";
    }
    
    /**
     * 将相对路径转换为完整的URL
     * 如果已经是绝对URL（http://或https://开头），直接返回
     * 如果是相对路径，拼接baseUrl
     * 
     * @param path 相对路径或绝对URL
     * @return 完整的URL
     */
    public String toFullUrl(String path) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        
        // 如果已经是绝对URL（http://或https://开头），直接返回
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        
        // 如果是相对路径，拼接baseUrl
        String baseUrl = getBaseUrl();
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        
        // 相对路径格式：category/year/month/filename，需要添加 /files/ 前缀
        String normalizedPath = path.startsWith("/files/") ? path : (path.startsWith("/") ? "/files" + path : "/files/" + path);
        
        return normalizedBaseUrl + normalizedPath;
    }
    
    /**
     * 将绝对URL转换为相对路径
     * 如果URL是baseUrl的前缀，则提取相对路径
     * 如果是外部URL，保持原样
     * 
     * @param url 绝对URL
     * @return 相对路径或原始URL（如果是外部URL）
     */
    public String toRelativePath(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        // 如果已经是相对路径（不以http://或https://开头），直接返回
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return url;
        }
        
        // 尝试提取baseUrl的域名部分
        try {
            String baseUrl = getBaseUrl();
            URI baseUri = new URI(baseUrl);
            URI urlUri = new URI(url);
            
            // 如果是外部URL（不同域名），保持原样
            if (!baseUri.getHost().equals(urlUri.getHost())) {
                return url;
            }
            
            // 如果是同域名，提取路径部分（去除 /api/images/files/ 或 /files/ 前缀）
            String path = urlUri.getPath();
            if (path.startsWith("/api/images/files/")) {
                path = path.substring("/api/images/files/".length());
            } else if (path.startsWith("/files/")) {
                path = path.substring("/files/".length());
            }
            
            String query = urlUri.getQuery();
            if (query != null && !query.isEmpty()) {
                path += "?" + query;
            }
            return path;
        } catch (URISyntaxException e) {
            // URI解析失败，返回原始URL
            return url;
        }
    }
    
    /**
     * 判断是否是外部URL（不是当前baseUrl的域名）
     * 
     * @param url URL字符串
     * @return true表示是外部URL，false表示是内部URL或相对路径
     */
    public boolean isExternalUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        // 如果不是http://或https://开头，认为是相对路径
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return false;
        }
        
        try {
            String baseUrl = getBaseUrl();
            URI baseUri = new URI(baseUrl);
            URI urlUri = new URI(url);
            
            // 如果域名不同，认为是外部URL
            return !baseUri.getHost().equals(urlUri.getHost());
        } catch (URISyntaxException e) {
            // URI解析失败，保守处理，认为是外部URL
            return true;
        }
    }
}

