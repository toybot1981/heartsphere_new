package com.heartsphere.admin.dto;

import lombok.Data;

import java.util.Map;

/**
 * 模板渲染请求
 */
@Data
public class PromptRenderRequest {
    private Long templateId;
    private Map<String, Object> variables; // 变量值
}
