package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.McpServerConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * MCP 客户端服务
 * 用于连接和调用 MCP 服务器
 */
@Service
@Slf4j
public class McpClientService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 构造函数，注入配置好的 MCP RestTemplate（支持 SSL）
     */
    public McpClientService(@Qualifier("mcpRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

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
            
            // MCP 服务器要求客户端必须同时接受 application/json 和 text/event-stream
            HttpHeaders headers = createHeaders(config, true);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // 使用 String 接收响应，以便处理 text/event-stream 格式
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);
            
            // 解析响应（可能是 JSON 或 SSE 格式）
            Map<String, Object> responseBody = parseResponse(response);
            
            return extractToolsFromResponse(responseBody);
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
            
            // MCP 服务器要求客户端必须同时接受 application/json 和 text/event-stream
            HttpHeaders headers = createHeaders(config, true);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // 使用 String 接收响应，以便处理 text/event-stream 格式
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);
            
            // 解析响应（可能是 JSON 或 SSE 格式）
            Map<String, Object> responseBody = parseResponse(response);
            
            return extractResultFromResponse(responseBody);
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
     * @param config MCP 服务器配置
     * @param acceptEventStream 是否接受 text/event-stream（用于流式响应）
     */
    private HttpHeaders createHeaders(McpServerConfig config, boolean acceptEventStream) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // MCP 服务器要求客户端必须同时接受 application/json 和 text/event-stream
        // 即使对于非流式请求也是如此
        // 直接设置 Accept 头字符串，确保格式完全符合服务器要求
        // 格式：application/json, text/event-stream（注意：逗号后面有空格）
        headers.set("Accept", "application/json, text/event-stream");
        
        if (config.getApiKey() != null && !config.getApiKey().isEmpty()) {
            // 根据服务器类型设置认证头
            if (config.getServerType() != null && config.getServerType().equals("tavily")) {
                // Tavily 使用 URL 参数传递 API key，不需要在 header 中设置
            } else {
                headers.set("Authorization", "Bearer " + config.getApiKey());
            }
        }
        
        log.debug("Created headers for MCP request: Accept={}, Content-Type={}, ServerType={}", 
            headers.getFirst("Accept"), headers.getContentType(), 
            config.getServerType() != null ? config.getServerType() : "unknown");
        
        return headers;
    }
    
    /**
     * 创建 HTTP 请求头（默认只接受 application/json）
     */
    private HttpHeaders createHeaders(McpServerConfig config) {
        return createHeaders(config, false);
    }

    /**
     * 解析响应（支持 JSON 和 SSE 格式）
     * @param response HTTP 响应
     * @return 解析后的 Map 对象
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseResponse(ResponseEntity<String> response) {
        try {
            String body = response.getBody();
            if (body == null || body.trim().isEmpty()) {
                return Collections.emptyMap();
            }
            
            MediaType contentType = response.getHeaders().getContentType();
            
            // 如果是 text/event-stream，需要解析 SSE 格式
            if (contentType != null && contentType.isCompatibleWith(MediaType.TEXT_EVENT_STREAM)) {
                return parseSseResponse(body);
            }
            
            // 否则直接解析为 JSON
            return objectMapper.readValue(body, Map.class);
        } catch (Exception e) {
            log.error("解析 MCP 响应失败", e);
            throw new RuntimeException("Failed to parse response: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解析 Server-Sent Events (SSE) 格式的响应
     * SSE 格式示例：
     *   data: {"jsonrpc":"2.0","id":"...","result":{...}}
     * 
     * @param sseBody SSE 格式的响应体
     * @return 解析后的 JSON-RPC 响应 Map
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseSseResponse(String sseBody) {
        try {
            // 解析 SSE 格式，提取 data 行中的 JSON
            String[] lines = sseBody.split("\n");
            StringBuilder jsonBuilder = new StringBuilder();
            
            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("data:")) {
                    // 提取 data: 后面的 JSON 内容
                    String jsonData = line.substring(5).trim();
                    if (!jsonData.isEmpty()) {
                        jsonBuilder.append(jsonData);
                    }
                } else if (line.startsWith("{") && !line.startsWith("data:")) {
                    // 如果行直接以 { 开头（可能是纯 JSON），也添加
                    jsonBuilder.append(line);
                }
            }
            
            String jsonString = jsonBuilder.toString();
            if (jsonString.isEmpty()) {
                log.warn("SSE 响应中没有找到 JSON 数据");
                return Collections.emptyMap();
            }
            
            // 解析 JSON
            return objectMapper.readValue(jsonString, Map.class);
        } catch (Exception e) {
            log.error("解析 SSE 响应失败: {}", sseBody, e);
            // 如果解析失败，尝试直接解析整个响应体（可能是纯 JSON）
            try {
                return objectMapper.readValue(sseBody, Map.class);
            } catch (Exception e2) {
                log.error("直接解析响应体也失败", e2);
                throw new RuntimeException("Failed to parse SSE response: " + e.getMessage(), e);
            }
        }
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
