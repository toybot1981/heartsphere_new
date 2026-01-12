package com.heartsphere.skill.service.executor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API 技能执行器
 * 
 * 执行 API 调用类型的技能
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class ApiSkillExecutor implements SkillExecutor.SkillExecutionHandler {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 1. 解析执行配置
            Map<String, Object> config = parseExecutionConfig(skill.getExecutionConfig());
            
            // 2. 构建请求 URL
            String apiUrl = buildApiUrl(config, parameters);
            
            // 3. 构建请求头
            HttpHeaders headers = buildHeaders(config, parameters);
            
            // 4. 构建请求体
            HttpEntity<?> requestEntity = buildRequestEntity(config, parameters, headers);
            
            // 5. 执行 HTTP 请求
            String method = (String) config.getOrDefault("method", "GET");
            ResponseEntity<String> response = executeRequest(apiUrl, method, requestEntity);
            
            // 6. 解析响应
            Object result = parseResponse(response, config);
            
            return result;
            
        } catch (Exception e) {
            log.error("API 技能执行失败: skillId={}", skill.getSkillId(), e);
            throw new RuntimeException("API 调用失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建 API URL
     */
    private String buildApiUrl(Map<String, Object> config, Map<String, Object> parameters) {
        String baseUrl = (String) config.get("apiUrl");
        
        if (baseUrl == null) {
            throw new IllegalArgumentException("API URL 未配置");
        }
        
        // 处理 URL 参数替换
        if (config.containsKey("queryParams")) {
            @SuppressWarnings("unchecked")
            Map<String, String> queryParams = (Map<String, String>) config.get("queryParams");
            StringBuilder url = new StringBuilder(baseUrl);
            url.append("?");
            
            queryParams.forEach((key, value) -> {
                // 支持参数占位符 ${paramName}
                String paramValue = replacePlaceholders(value, parameters);
                url.append(key).append("=").append(paramValue).append("&");
            });
            
            // 移除最后的 &
            if (url.length() > 0 && url.charAt(url.length() - 1) == '&') {
                url.setLength(url.length() - 1);
            }
            
            return url.toString();
        }
        
        return baseUrl;
    }
    
    /**
     * 构建请求头
     */
    private HttpHeaders buildHeaders(Map<String, Object> config, Map<String, Object> parameters) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        if (config.containsKey("headers")) {
            @SuppressWarnings("unchecked")
            Map<String, String> headerConfig = (Map<String, String>) config.get("headers");
            
            headerConfig.forEach((key, value) -> {
                // 支持环境变量和参数占位符
                String headerValue = replacePlaceholders(value, parameters);
                headers.set(key, headerValue);
            });
        }
        
        return headers;
    }
    
    /**
     * 构建请求体
     */
    private HttpEntity<?> buildRequestEntity(
        Map<String, Object> config,
        Map<String, Object> parameters,
        HttpHeaders headers
    ) {
        if (config.containsKey("body")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> bodyTemplate = (Map<String, Object>) config.get("body");
            
            // 替换占位符
            Map<String, Object> body = replacePlaceholdersInMap(bodyTemplate, parameters);
            
            return new HttpEntity<>(body, headers);
        }
        
        return new HttpEntity<>(headers);
    }
    
    /**
     * 执行 HTTP 请求
     */
    private ResponseEntity<String> executeRequest(
        String url,
        String method,
        HttpEntity<?> requestEntity
    ) {
        HttpMethod httpMethod = HttpMethod.valueOf(method.toUpperCase());
        
        return restTemplate.exchange(
            url,
            httpMethod,
            requestEntity,
            String.class
        );
    }
    
    /**
     * 解析响应
     */
    private Object parseResponse(ResponseEntity<String> response, Map<String, Object> config) {
        try {
            String body = response.getBody();
            
            // 如果配置了响应映射，进行字段提取
            if (config.containsKey("responseMapping")) {
                @SuppressWarnings("unchecked")
                Map<String, String> mapping = (Map<String, String>) config.get("responseMapping");
                
                Map<String, Object> jsonBody = objectMapper.readValue(body, Map.class);
                Map<String, Object> result = new HashMap<>();
                
                mapping.forEach((key, path) -> {
                    // 使用 JSONPath 提取字段（简化实现）
                    Object value = extractByPath(jsonBody, path);
                    result.put(key, value);
                });
                
                return result;
            }
            
            // 直接返回 JSON
            return objectMapper.readValue(body, Map.class);
            
        } catch (Exception e) {
            log.error("解析响应失败", e);
            return response.getBody();
        }
    }
    
    /**
     * 替换占位符
     */
    private String replacePlaceholders(String template, Map<String, Object> parameters) {
        String result = template;
        
        // 替换参数占位符 ${paramName}
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            result = result.replace("${" + entry.getKey() + "}", String.valueOf(entry.getValue()));
        }
        
        // 替换环境变量 ${ENV_VAR}
        // TODO: 实现环境变量替换
        
        return result;
    }
    
    /**
     * 在 Map 中替换占位符
     */
    private Map<String, Object> replacePlaceholdersInMap(
        Map<String, Object> template,
        Map<String, Object> parameters
    ) {
        Map<String, Object> result = new HashMap<>();
        
        template.forEach((key, value) -> {
            if (value instanceof String) {
                result.put(key, replacePlaceholders((String) value, parameters));
            } else if (value instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> nested = (Map<String, Object>) value;
                result.put(key, replacePlaceholdersInMap(nested, parameters));
            } else {
                result.put(key, value);
            }
        });
        
        return result;
    }
    
    /**
     * 从 JSON 对象中提取路径值（简化实现）
     */
    private Object extractByPath(Map<String, Object> json, String path) {
        // 简化实现，实际应该使用 JSONPath 库
        String[] parts = path.replace("$.", "").split("\\.");
        Object current = json;
        
        for (String part : parts) {
            if (current instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) current;
                current = map.get(part);
            } else {
                return null;
            }
        }
        
        return current;
    }
    
    /**
     * 解析执行配置
     */
    private Map<String, Object> parseExecutionConfig(String configJson) {
        try {
            return objectMapper.readValue(configJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("解析执行配置失败", e);
            throw new IllegalArgumentException("无效的执行配置: " + e.getMessage());
        }
    }
}
