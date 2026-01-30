package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 提示词模板控制器
 * 提供公共API接口，允许前端获取提示词模板
 */
@RestController
@RequestMapping("/api/prompts")
public class PromptTemplateController {

    @Autowired
    private PromptTemplateIntegrationService templateService;

    /**
     * 根据分类代码获取并渲染提示词模板
     * 
     * @param categoryCode 分类代码（如：scenario）
     * @param variables 变量值（可选，JSON格式）
     * @param defaultSystemPrompt 默认系统提示词（模板不存在时使用）
     * @param defaultUserPrompt 默认用户提示词（模板不存在时使用）
     * @return 渲染后的提示词
     */
    @PostMapping("/render")
    public ResponseEntity<ApiResponse<PromptRenderResponse>> renderTemplate(
            @RequestParam String categoryCode,
            @RequestBody(required = false) Map<String, Object> variables,
            @RequestParam(required = false) String defaultSystemPrompt,
            @RequestParam(required = false) String defaultUserPrompt) {
        
        try {
            Map<String, Object> vars = variables != null ? variables : new HashMap<>();
            
            PromptRenderResponse response;
            if (defaultSystemPrompt != null || defaultUserPrompt != null) {
                // 使用默认值作为fallback
                response = templateService.renderTemplateWithFallback(
                    categoryCode,
                    vars,
                    defaultSystemPrompt != null ? defaultSystemPrompt : "",
                    defaultUserPrompt != null ? defaultUserPrompt : ""
                );
            } else {
                // 不使用默认值，如果模板不存在返回null
                response = templateService.renderTemplate(categoryCode, vars);
                if (response == null) {
                    return ResponseEntity.ok(ApiResponse.error("未找到启用的提示词模板，分类: " + categoryCode));
                }
            }
            
            return ResponseEntity.ok(ApiResponse.success("获取提示词成功", response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("获取提示词失败: " + e.getMessage()));
        }
    }
}
