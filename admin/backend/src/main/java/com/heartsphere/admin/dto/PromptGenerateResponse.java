package com.heartsphere.admin.dto;

import lombok.Data;

import java.util.Map;

/**
 * AI生成提示词响应
 */
@Data
public class PromptGenerateResponse {
    private String generatedSystemPrompt; // AI生成的系统提示词
    private String generatedUserPrompt; // AI生成的用户提示词
    private String originalSystemPrompt; // 原始系统提示词模板
    private String originalUserPrompt; // 原始用户提示词模板
    private Map<String, Object> suggestedVariables; // AI建议的变量值
}
