package com.heartsphere.mentis.ai.dto.request;

import lombok.Data;
import java.util.List;

/**
 * 文本生成请求DTO
 * 临时实现，用于 mentis 后端编译
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class TextGenerationRequest {
    private String provider;
    private String model;
    private String prompt;
    private String systemInstruction;
    private List<Message> messages;
    private Double temperature;
    private Integer maxTokens;
    private Boolean stream;
    private String baseUrl;
    private String apiKey;
    
    @Data
    public static class Message {
        private String role;
        private String content;
    }
}
