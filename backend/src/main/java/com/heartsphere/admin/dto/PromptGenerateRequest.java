package com.heartsphere.admin.dto;

import lombok.Data;

import java.util.Map;

/**
 * AI生成提示词请求
 */
@Data
public class PromptGenerateRequest {
    private Long templateId;
    private Map<String, Object> variables; // 变量值
    private String context; // 上下文信息（可选）
}
