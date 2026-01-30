package com.heartsphere.admin.service;

import com.heartsphere.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 工具测试服务
 * 调用 mentis 后端的工具测试接口
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ToolTestService {
    
    private final RestTemplate restTemplate;
    
    @Value("${mentis.backend.base-url:http://localhost:8082}")
    private String mentisBackendBaseUrl;
    
    /**
     * 测试工具执行
     * 
     * @param toolName 工具名称
     * @param request 测试请求（包含 parameters）
     * @return 测试结果
     */
    public org.springframework.http.ResponseEntity<com.heartsphere.shared.dto.ApiResponse<Map<String, Object>>> testTool(
            String toolName, Map<String, Object> request) {
        
        try {
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            @SuppressWarnings("unchecked")
            Map<String, Object> parameters = (Map<String, Object>) request.get("parameters");
            requestBody.put("parameters", parameters != null ? parameters : new HashMap<>());
            
            // 调用 mentis 后端的工具测试接口
            String url = mentisBackendBaseUrl + "/api/mentis/tools/" + toolName + "/test";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<ApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpEntity,
                new org.springframework.core.ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {}
            );
            
            ApiResponse<Map<String, Object>> responseBody = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && responseBody != null && responseBody.getData() != null) {
                // 将响应转换为 Map
                Map<String, Object> responseData = responseBody.getData();
                
                return org.springframework.http.ResponseEntity.ok(
                    ApiResponse.success(responseData)
                );
            } else {
                log.error("工具测试失败: toolName={}, status={}", toolName, response.getStatusCode());
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("toolName", toolName);
                errorResult.put("success", false);
                errorResult.put("error", "工具测试失败: HTTP " + response.getStatusCode());
                return org.springframework.http.ResponseEntity.ok(
                    ApiResponse.success(errorResult)
                );
            }
            
        } catch (Exception e) {
            log.error("工具测试异常: toolName={}", toolName, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("toolName", toolName);
            errorResult.put("success", false);
            errorResult.put("error", "工具测试异常: " + e.getMessage());
            return org.springframework.http.ResponseEntity.ok(
                ApiResponse.success(errorResult)
            );
        }
    }
}
