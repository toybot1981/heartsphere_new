package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.McpServerConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * MCP 客户端服务
 * 用于连接和调用 MCP 服务器
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class McpClientService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 测试 MCP 服务器连接
     */
    public boolean testConnection(McpServerConfig config) {
        try {
            // 尝试列出可用工具
            listTools(config);
            return true;
        } catch (Exception e) {
            log.error("Failed to test MCP connection: {}", config.getServerUrl(), e);
            return false;
        }
    }

    /**
     * 列出 MCP 服务器提供的工具
     */
    public List<Map<String, Object>> listTools(McpServerConfig config) {
        try {
            String url = buildRequestUrl(config, "tools/list");
            Map<String, Object> request = createJsonRpcRequest("tools/list", null);
            
            HttpHeaders headers = createHeaders(config);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class);
            
            return extractToolsFromResponse(response.getBody());
        } catch (Exception e) {
            log.error("Failed to list tools from MCP server: {}", config.getServerUrl(), e);
            throw new RuntimeException("Failed to list tools: " + e.getMessage(), e);
        }
    }

    /**
     * 调用 MCP 工具
     */
    public Map<String, Object> callTool(McpServerConfig config, String toolName, Map<String, Object> arguments) {
        try {
            // 对于 Tavily，使用特殊的调用方式
            if ("tavily".equals(config.getServerType()) && toolName.contains("tavily_search")) {
                return callTavilySearch(config, arguments);
            }
            
            // 标准 JSON-RPC 调用方式
            String url = buildRequestUrl(config, "tools/call");
            Map<String, Object> params = new HashMap<>();
            params.put("name", toolName);
            params.put("arguments", arguments);
            
            Map<String, Object> request = createJsonRpcRequest("tools/call", params);
            
            HttpHeaders headers = createHeaders(config);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class);
            
            return extractResultFromResponse(response.getBody());
        } catch (Exception e) {
            log.error("Failed to call tool {} from MCP server: {}", toolName, config.getServerUrl(), e);
            throw new RuntimeException("Failed to call tool: " + e.getMessage(), e);
        }
    }
    
    /**
     * 调用 Tavily 搜索（Tavily 使用 HTTP POST 直接调用）
     */
    private Map<String, Object> callTavilySearch(McpServerConfig config, Map<String, Object> arguments) {
        try {
            // Tavily API 端点
            String apiUrl = "https://api.tavily.com/search";
            
            // 从配置中提取 API Key
            String apiKey = config.getApiKey();
            if (apiKey == null || apiKey.isEmpty()) {
                // 尝试从 URL 中提取
                String url = config.getServerUrl();
                int keyIndex = url.indexOf("tavilyApiKey=");
                if (keyIndex > 0) {
                    apiKey = url.substring(keyIndex + 13);
                }
            }
            
            if (apiKey == null || apiKey.isEmpty()) {
                throw new RuntimeException("Tavily API Key 未配置");
            }
            
            // 构建请求
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("api_key", apiKey);
            requestBody.put("query", arguments.get("query"));
            if (arguments.containsKey("max_results")) {
                requestBody.put("max_results", arguments.get("max_results"));
            } else {
                requestBody.put("max_results", 5);
            }
            requestBody.put("search_depth", "basic");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, entity, Map.class);
            
            // 转换 Tavily 响应格式为 MCP 标准格式
            Map<String, Object> mcpResult = new HashMap<>();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> tavilyResponse = response.getBody();
            
            if (tavilyResponse != null) {
                // Tavily 返回格式: { results: [...], query: "...", response_time: ... }
                List<Map<String, Object>> contentList = new ArrayList<>();
                
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> results = (List<Map<String, Object>>) tavilyResponse.get("results");
                if (results != null) {
                    for (Map<String, Object> result : results) {
                        Map<String, Object> contentItem = new HashMap<>();
                        StringBuilder text = new StringBuilder();
                        
                        text.append("标题: ").append(result.get("title")).append("\n");
                        text.append("URL: ").append(result.get("url")).append("\n");
                        if (result.get("content") != null) {
                            text.append("内容: ").append(result.get("content")).append("\n");
                        }
                        
                        contentItem.put("type", "text");
                        contentItem.put("text", text.toString());
                        contentList.add(contentItem);
                    }
                }
                
                mcpResult.put("content", contentList);
            }
            
            return mcpResult;
        } catch (Exception e) {
            log.error("调用 Tavily 搜索失败", e);
            throw new RuntimeException("调用 Tavily 搜索失败: " + e.getMessage(), e);
        }
    }

    /**
     * 构建请求 URL
     */
    private String buildRequestUrl(McpServerConfig config, String method) {
        String baseUrl = config.getServerUrl();
        // 如果 URL 已经包含查询参数，追加；否则添加
        if (baseUrl.contains("?")) {
            return baseUrl + "&method=" + method;
        } else {
            return baseUrl + "?method=" + method;
        }
    }

    /**
     * 创建 JSON-RPC 2.0 请求
     */
    private Map<String, Object> createJsonRpcRequest(String method, Map<String, Object> params) {
        Map<String, Object> request = new HashMap<>();
        request.put("jsonrpc", "2.0");
        request.put("id", UUID.randomUUID().toString());
        request.put("method", method);
        if (params != null) {
            request.put("params", params);
        }
        return request;
    }

    /**
     * 创建 HTTP 请求头
     */
    private HttpHeaders createHeaders(McpServerConfig config) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (config.getApiKey() != null && !config.getApiKey().isEmpty()) {
            // 根据服务器类型设置认证头
            if (config.getServerType().equals("tavily")) {
                // Tavily 使用 URL 参数传递 API key，不需要在 header 中设置
            } else {
                headers.set("Authorization", "Bearer " + config.getApiKey());
            }
        }
        return headers;
    }

    /**
     * 从响应中提取工具列表
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractToolsFromResponse(Map<String, Object> response) {
        if (response == null) {
            return Collections.emptyList();
        }
        
        Object result = response.get("result");
        if (result instanceof Map) {
            Object tools = ((Map<String, Object>) result).get("tools");
            if (tools instanceof List) {
                return (List<Map<String, Object>>) tools;
            }
        }
        return Collections.emptyList();
    }

    /**
     * 从响应中提取结果
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> extractResultFromResponse(Map<String, Object> response) {
        if (response == null) {
            return Collections.emptyMap();
        }
        
        Object result = response.get("result");
        if (result instanceof Map) {
            return (Map<String, Object>) result;
        }
        return Collections.emptyMap();
    }
}
