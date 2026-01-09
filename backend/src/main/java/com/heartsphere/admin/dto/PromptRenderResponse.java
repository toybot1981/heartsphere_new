package com.heartsphere.admin.dto;

import lombok.Data;

import java.util.Map;

/**
 * 模板渲染响应
 */
@Data
public class PromptRenderResponse {
    private String systemPrompt; // 渲染后的系统提示词
    private String userPrompt; // 渲染后的用户提示词
    private Map<String, Object> usedVariables; // 使用的变量
}
