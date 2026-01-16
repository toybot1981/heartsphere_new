package com.heartsphere.mentis.ai.service;

import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.ai.util.StreamResponseHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * AI服务实现
 * 调用原有客户端服务的AI接口，使用api-key鉴权
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@ConditionalOnMissingBean(name = "aiService")
public class AIServiceImpl implements AIService {
    
    private final RestTemplate restTemplate;
    
    @Value("${mentis.ai.api-base-url:http://localhost:8081}")
    private String aiApiBaseUrl;
    
    @Value("${mentis.ai.api-key:hs_x7rIYyIXwC6f7LJte0NhcfVeT4EybksmSEZQt5ovMaiiEUNU}")
    private String apiKey;
    
    public AIServiceImpl(RestTemplateBuilder restTemplateBuilder) {
        // 创建不使用代理的 RestTemplate
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) java.time.Duration.ofSeconds(30).toMillis());
        factory.setReadTimeout((int) java.time.Duration.ofSeconds(60).toMillis());
        // 禁用代理
        factory.setProxy(null);
        
        this.restTemplate = new RestTemplate(factory);
    }
    
    @Override
    public TextGenerationResponse generateText(Long userId, TextGenerationRequest request) {
        try {
            log.info("调用AI服务生成文本 - userId={}, provider={}, model={}", userId, request.getProvider(), request.getModel());
            
            // 构建请求URL
            String url = aiApiBaseUrl + "/api/ai/text/generate";
            
            // 构建请求头，使用 api-key 鉴权
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // 使用 X-API-Key 或 Bearer 方式传递 API Key
            // 如果 api-key 以 hs_ 开头，可以使用 Bearer 方式，否则使用 X-API-Key
            if (apiKey != null && !apiKey.isEmpty()) {
                if (apiKey.startsWith("hs_")) {
                    headers.setBearerAuth(apiKey);
                } else {
                    headers.set("X-API-Key", apiKey);
                }
            } else {
                log.warn("API Key 未配置，请求可能失败");
            }
            
            // 构建请求体，将 mentis 的请求转换为原有客户端的请求格式
            Map<String, Object> requestBody = buildRequest(request);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送请求
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("AI服务调用失败: " + response.getStatusCode());
            }
            
            // 解析响应
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
            
            TextGenerationResponse textResponse = new TextGenerationResponse();
            if (data != null) {
                textResponse.setContent((String) data.get("content"));
                textResponse.setProvider((String) data.get("provider"));
                textResponse.setModel((String) data.get("model"));
                textResponse.setFinishReason((String) data.get("finishReason"));
            }
            
            log.info("AI服务调用成功 - contentLength={}", 
                textResponse.getContent() != null ? textResponse.getContent().length() : 0);
            
            return textResponse;
            
        } catch (Exception e) {
            log.error("调用AI服务失败", e);
            throw new RuntimeException("调用AI服务失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void generateTextStream(Long userId, TextGenerationRequest request, 
                                   StreamResponseHandler<TextGenerationResponse> handler) {
        try {
            log.info("调用AI服务流式生成文本 - userId={}, provider={}, model={}", userId, request.getProvider(), request.getModel());
            
            // 构建请求URL
            String url = aiApiBaseUrl + "/api/ai/text/generate/stream";
            
            // 构建请求头，使用 api-key 鉴权
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // 使用 X-API-Key 或 Bearer 方式传递 API Key
            if (apiKey != null && apiKey.startsWith("hs_")) {
                headers.setBearerAuth(apiKey);
            } else {
                headers.set("X-API-Key", apiKey);
            }
            headers.setAccept(java.util.Arrays.asList(MediaType.TEXT_EVENT_STREAM));
            
            // 构建请求体，设置 stream=true
            Map<String, Object> requestBody = buildRequest(request);
            requestBody.put("stream", true);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送SSE请求
            ResponseEntity<org.springframework.core.io.Resource> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, org.springframework.core.io.Resource.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("AI服务流式调用失败: " + response.getStatusCode());
            }
            
            // 解析SSE流（简化实现，实际应该使用SSE客户端）
            // 这里先使用同步方式作为占位实现
            log.warn("流式生成文本功能需要完整的SSE客户端实现，当前使用同步方式作为占位");
            
            // 临时使用同步方式：先发送响应（done=false），再发送完成标记（done=true）
            TextGenerationResponse textResponse = generateText(userId, request);
            if (textResponse != null && textResponse.getContent() != null && !textResponse.getContent().isEmpty()) {
                handler.handle(textResponse, false); // 发送响应内容
            }
            handler.handle(textResponse, true); // 发送完成标记
            
        } catch (Exception e) {
            log.error("调用AI服务流式生成失败", e);
            throw new RuntimeException("调用AI服务流式生成失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建请求体，将 mentis 的请求转换为原有客户端的请求格式
     */
    private Map<String, Object> buildRequest(TextGenerationRequest request) {
        Map<String, Object> body = new HashMap<>();
        
        if (request.getPrompt() != null) {
            body.put("prompt", request.getPrompt());
        }
        if (request.getMessages() != null) {
            body.put("messages", request.getMessages());
        }
        if (request.getSystemInstruction() != null) {
            body.put("systemInstruction", request.getSystemInstruction());
        }
        if (request.getProvider() != null) {
            body.put("provider", request.getProvider());
        }
        if (request.getModel() != null) {
            body.put("model", request.getModel());
        }
        if (request.getTemperature() != null) {
            body.put("temperature", request.getTemperature());
        }
        if (request.getMaxTokens() != null) {
            body.put("maxTokens", request.getMaxTokens());
        }
        
        return body;
    }
}
