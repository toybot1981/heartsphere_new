package com.heartsphere.ai.mcp.util;

import lombok.extern.slf4j.Slf4j;

/**
 * MCP URL 验证工具类
 */
@Slf4j
public class McpUrlValidator {
    
    /**
     * 验证 serverUrl 是否为有效的 HTTP/HTTPS URL
     * 
     * @param serverUrl 服务器 URL
     * @return true 如果 URL 有效，false 否则
     */
    public static boolean isValidUrl(String serverUrl) {
        if (serverUrl == null || serverUrl.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = serverUrl.trim();
        return trimmed.startsWith("http://") || trimmed.startsWith("https://");
    }
    
    /**
     * 验证 serverUrl 并抛出异常（如果无效）
     * 
     * @param serverUrl 服务器 URL
     * @param configId 配置 ID（用于错误信息）
     * @param configName 配置名称（用于错误信息）
     * @param serverType 服务器类型（用于错误信息）
     * @throws IllegalArgumentException 如果 URL 无效
     */
    public static void validateUrl(String serverUrl, Long configId, String configName, String serverType) {
        if (serverUrl == null || serverUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("MCP server URL 不能为空: configName=" + configName);
        }
        
        if (!isValidUrl(serverUrl)) {
            throw new IllegalArgumentException(
                String.format("MCP server URL 格式无效（必须是 http:// 或 https:// 开头的完整 URL）: " +
                    "configId=%d, configName='%s', serverUrl='%s', serverType='%s'。当前仅支持 HTTP/HTTPS 类型的 MCP 服务器。" +
                    "如果是本地命令（如 'uvx mcp-server-fetch'），请使用 stdio 类型的 MCP 客户端或配置为 HTTP 代理。",
                    configId != null ? configId : -1, configName, serverUrl, serverType));
        }
    }
    
    /**
     * 获取 URL 验证错误信息
     * 
     * @param serverUrl 服务器 URL
     * @return 错误信息，如果 URL 有效则返回 null
     */
    public static String getValidationError(String serverUrl) {
        if (serverUrl == null || serverUrl.trim().isEmpty()) {
            return "MCP server URL 不能为空";
        }
        
        if (!isValidUrl(serverUrl)) {
            return String.format("URL 格式无效（必须是 http:// 或 https:// 开头）: '%s'", serverUrl);
        }
        
        return null;
    }
}
