package com.heartsphere.shared.util;

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
                
                // 优先使用 X-Forwarded-Host（nginx代理时设置）
                String host = request.getHeader("X-Forwarded-Host");
                if (host == null || host.isEmpty()) {
                    host = request.getHeader("Host");
                }
                if (host == null || host.isEmpty()) {
                    host = request.getServerName();
                }
                
                // 如果host仍然为空，使用默认值
                if (host == null || host.isEmpty()) {
                    host = request.getServerName();
                }
                
                // 优先使用 X-Forwarded-Proto（nginx代理时设置）
                String scheme = request.getHeader("X-Forwarded-Proto");
                if (scheme == null || scheme.isEmpty()) {
                    scheme = request.getScheme(); // http 或 https
                }
                
                // 如果host是localhost，说明可能是开发环境或配置问题，尝试从环境变量获取
                if (host != null && (host.startsWith("localhost") || host.startsWith("127.0.0.1"))) {
                    String envBaseUrl = System.getenv("IMAGE_BASE_URL");
                    if (envBaseUrl != null && !envBaseUrl.trim().isEmpty()) {
                        return envBaseUrl.trim();
                    }
                }
                
                // 构建baseUrl
                StringBuilder baseUrl = new StringBuilder();
                baseUrl.append(scheme).append("://").append(host);
                
                // 如果host中没有端口，且不是标准端口，才添加端口号
                // 注意：X-Forwarded-Host 可能已经包含端口，需要检查
                if (host != null && !host.contains(":") && request.getServerPort() != 80 && request.getServerPort() != 443) {
                    // 只有在非标准端口且host中没有端口时才添加
                    int serverPort = request.getServerPort();
                    if ((scheme.equals("http") && serverPort != 80) || 
                        (scheme.equals("https") && serverPort != 443)) {
                        baseUrl.append(":").append(serverPort);
                    }
                }
                
                // 添加应用上下文路径和图片路径（改为 /images，不再使用 /api/images）
                String contextPath = request.getContextPath();
                baseUrl.append(contextPath).append("/images");
                
                return baseUrl.toString();
            }
        } catch (Exception e) {
            // 如果获取请求失败（比如在非HTTP上下文中），记录警告
            java.util.logging.Logger.getLogger(ImageUrlUtils.class.getName())
                .warning("无法从请求上下文获取baseUrl: " + e.getMessage());
        }
        
        // 如果无法获取请求上下文，尝试从环境变量获取
        String envBaseUrl = System.getenv("IMAGE_BASE_URL");
        if (envBaseUrl != null && !envBaseUrl.trim().isEmpty()) {
            return envBaseUrl.trim();
        }
        
        // 如果环境变量也没有，记录错误并返回空字符串（让调用者处理）
        java.util.logging.Logger.getLogger(ImageUrlUtils.class.getName())
            .severe("无法获取图片baseUrl：未配置IMAGE_BASE_URL环境变量，且无法从请求上下文获取。请在生产环境配置IMAGE_BASE_URL环境变量。");
        
        // 返回空字符串，让调用者知道无法生成URL
        return "";
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
        
        // 如果baseUrl为空，尝试使用默认值或从请求中获取
        if (baseUrl == null || baseUrl.isEmpty()) {
            // 尝试从当前HTTP请求中获取域名
            try {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String scheme = request.getScheme(); // http 或 https
                    String host = request.getHeader("X-Forwarded-Host");
                    if (host == null || host.isEmpty()) {
                        host = request.getHeader("Host");
                    }
                    if (host == null || host.isEmpty()) {
                        host = request.getServerName();
                        int port = request.getServerPort();
                        if ((scheme.equals("http") && port != 80) || (scheme.equals("https") && port != 443)) {
                            host = host + ":" + port;
                        }
                    }
                    
                    if (host != null && !host.isEmpty()) {
                        baseUrl = scheme + "://" + host + request.getContextPath() + "/images";
                    }
                }
            } catch (Exception e) {
                java.util.logging.Logger.getLogger(ImageUrlUtils.class.getName())
                    .warning("无法从请求上下文获取baseUrl: " + e.getMessage());
            }
        }
        
        // 如果仍然无法获取baseUrl，使用默认值（开发环境）
        if (baseUrl == null || baseUrl.isEmpty()) {
            String envBaseUrl = System.getenv("IMAGE_BASE_URL");
            if (envBaseUrl != null && !envBaseUrl.trim().isEmpty()) {
                baseUrl = envBaseUrl.trim();
            } else {
                // 使用默认值（开发环境）
                baseUrl = "http://localhost:8081/images";
                java.util.logging.Logger.getLogger(ImageUrlUtils.class.getName())
                    .warning("无法获取baseUrl，使用默认值: " + baseUrl);
            }
        }
        
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        
        // 相对路径格式：category/year/month/filename 或 userId/category/year/month/filename
        // 直接拼接，不需要添加 /files/ 前缀
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        
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
            
            // 如果是同域名，提取路径部分（去除 /images/ 前缀，兼容旧格式）
            String path = urlUri.getPath();
            if (path.startsWith("/api/images/")) {
                // 新格式：/api/images/category/year/month/filename
                path = path.substring("/api/images/".length());
            } else if (path.startsWith("/images/")) {
                path = path.substring("/images/".length());
            } else if (path.startsWith("/item/")) {
                // 兼容旧路径格式：/item/** -> 转换为 item/...（作为相对路径）
                // 这样访问时可以使用 /images/item/... 或 /item/...
                path = path.substring("/item/".length());
                path = "item/" + path; // 保持 item/ 前缀，这样文件路径正确
            } else if (path.startsWith("/api/images/files/")) {
                // 兼容旧格式
                path = path.substring("/api/images/files/".length());
            } else if (path.startsWith("/files/")) {
                // 兼容旧格式
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

