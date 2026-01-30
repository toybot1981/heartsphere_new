package com.heartsphere.ai.mcp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.mcp.entity.McpServerConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class McpClientService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public McpClientService(@Qualifier("mcpRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean testConnection(McpServerConfig config) {
        try {
            listTools(config);
            return true;
        } catch (Exception e) {
            log.error("MCP test connection failed: {}", config.getServerUrl(), e);
            return false;
        }
    }

    public List<Map<String, Object>> listTools(McpServerConfig config) {
        try {
            String url = buildRequestUrl(config, "tools/list");
            Map<String, Object> request = createJsonRpcRequest("tools/list", null);
            HttpHeaders headers = createHeaders(config, true);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            Map<String, Object> responseBody = parseResponse(response);
            return extractToolsFromResponse(responseBody);
        } catch (Exception e) {
            log.error("MCP list tools failed: {}", config.getServerUrl(), e);
            throw new RuntimeException("Failed to list tools: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> callTool(McpServerConfig config, String toolName, Map<String, Object> arguments) {
        try {
            if ("tavily".equals(config.getServerType()) && toolName != null && toolName.contains("tavily_search")) {
                return callTavilySearch(config, arguments);
            }
            String url = buildRequestUrl(config, "tools/call");
            Map<String, Object> params = new HashMap<>();
            params.put("name", toolName);
            params.put("arguments", arguments != null ? arguments : Map.of());
            Map<String, Object> request = createJsonRpcRequest("tools/call", params);
            HttpHeaders headers = createHeaders(config, true);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            Map<String, Object> responseBody = parseResponse(response);
            return extractResultFromResponse(responseBody);
        } catch (Exception e) {
            log.error("MCP call tool {} failed: {}", toolName, config.getServerUrl(), e);
            throw new RuntimeException("Failed to call tool: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callTavilySearch(McpServerConfig config, Map<String, Object> arguments) {
        String apiKey = config.getApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            String url = config.getServerUrl();
            int i = url != null ? url.indexOf("tavilyApiKey=") : -1;
            if (i > 0) apiKey = url.substring(i + 13);
        }
        if (apiKey == null || apiKey.isEmpty()) throw new RuntimeException("Tavily API Key 未配置");
        Map<String, Object> body = new HashMap<>();
        body.put("api_key", apiKey);
        body.put("query", arguments != null ? arguments.get("query") : null);
        body.put("max_results", arguments != null && arguments.containsKey("max_results") ? arguments.get("max_results") : 5);
        body.put("search_depth", "basic");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.exchange("https://api.tavily.com/search", HttpMethod.POST, entity, Map.class);
        Map<String, Object> mcpResult = new HashMap<>();
        Map<String, Object> tr = res.getBody();
        if (tr != null) {
            List<Map<String, Object>> contentList = new ArrayList<>();
            Object r = tr.get("results");
            if (r instanceof List) {
                for (Object o : (List<?>) r) {
                    if (!(o instanceof Map)) continue;
                    Map<String, Object> item = (Map<String, Object>) o;
                    StringBuilder sb = new StringBuilder();
                    sb.append("标题: ").append(item.get("title")).append("\n");
                    sb.append("URL: ").append(item.get("url")).append("\n");
                    if (item.get("content") != null) sb.append("内容: ").append(item.get("content")).append("\n");
                    contentList.add(Map.of("type", "text", "text", sb.toString()));
                }
            }
            mcpResult.put("content", contentList);
        }
        return mcpResult;
    }

    private String buildRequestUrl(McpServerConfig config, String method) {
        String base = config.getServerUrl();
        if (base == null || base.trim().isEmpty()) {
            throw new IllegalArgumentException("MCP server URL 不能为空: configId=" + config.getId());
        }
        
        // 验证是否为有效的 HTTP/HTTPS URL
        String trimmedBase = base.trim();
        if (!trimmedBase.startsWith("http://") && !trimmedBase.startsWith("https://")) {
            throw new IllegalArgumentException(
                String.format("MCP server URL 格式无效（必须是 http:// 或 https:// 开头的完整 URL）: configId=%d, serverUrl='%s', serverType='%s'。如果是本地命令（如 'uvx mcp-server-fetch'），当前仅支持 HTTP/HTTPS 类型的 MCP 服务器。",
                    config.getId(), base, config.getServerType()));
        }
        
        return (trimmedBase.contains("?")) ? trimmedBase + "&method=" + method : trimmedBase + "?method=" + method;
    }

    private Map<String, Object> createJsonRpcRequest(String method, Map<String, Object> params) {
        Map<String, Object> r = new HashMap<>();
        r.put("jsonrpc", "2.0");
        r.put("id", UUID.randomUUID().toString());
        r.put("method", method);
        if (params != null) r.put("params", params);
        return r;
    }

    private HttpHeaders createHeaders(McpServerConfig config, boolean acceptEventStream) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("Accept", "application/json, text/event-stream");
        if (config.getApiKey() != null && !config.getApiKey().isEmpty()
                && !"tavily".equals(config.getServerType())) {
            h.set("Authorization", "Bearer " + config.getApiKey());
        }
        return h;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseResponse(ResponseEntity<String> response) {
        String body = response.getBody();
        if (body == null || body.trim().isEmpty()) return Collections.emptyMap();
        MediaType ct = response.getHeaders().getContentType();
        if (ct != null && ct.isCompatibleWith(MediaType.TEXT_EVENT_STREAM)) return parseSseResponse(body);
        try {
            return objectMapper.readValue(body, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Parse response failed: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseSseResponse(String sseBody) {
        StringBuilder sb = new StringBuilder();
        for (String line : sseBody.split("\n")) {
            line = line.trim();
            if (line.startsWith("data:")) {
                String j = line.substring(5).trim();
                if (!j.isEmpty()) sb.append(j);
            } else if (line.startsWith("{") && !line.startsWith("data:")) sb.append(line);
        }
        String js = sb.toString();
        if (js.isEmpty()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(js, Map.class);
        } catch (Exception e) {
            try {
                return objectMapper.readValue(sseBody, Map.class);
            } catch (Exception e2) {
                throw new RuntimeException("Parse SSE failed: " + e.getMessage(), e);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractToolsFromResponse(Map<String, Object> response) {
        if (response == null) return Collections.emptyList();
        Object r = response.get("result");
        if (!(r instanceof Map)) return Collections.emptyList();
        Object t = ((Map<String, Object>) r).get("tools");
        return t instanceof List ? (List<Map<String, Object>>) t : Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractResultFromResponse(Map<String, Object> response) {
        if (response == null) return Collections.emptyMap();
        Object r = response.get("result");
        return r instanceof Map ? (Map<String, Object>) r : Collections.emptyMap();
    }
}
