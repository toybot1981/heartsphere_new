package com.heartsphere.admin.service.skill;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 技能 AI 生成服务
 * 根据用户描述使用 AI 生成完整的技能定义
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillAIGeneratorService {
    
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    
    @Value("${app.ai-service.base-url:http://localhost:8081}")
    private String aiServiceBaseUrl;
    
    @Value("${app.ai-service.api-key:}")
    private String aiServiceApiKey;
    
    /**
     * 根据描述生成技能定义
     * 
     * @param description 用户描述
     * @param sessionId 会话ID（可选）
     * @param authToken 认证Token（可选，用于调用AI服务）
     * @return 生成的技能定义（Map格式）
     */
    public Map<String, Object> generateSkillFromDescription(String description, String sessionId, String authToken) {
        try {
            log.info("[技能创建] 开始AI生成技能: sessionId={}, descriptionLength={}, description={}",
                    sessionId, description != null ? description.length() : 0, description);
            
            // 构建提示词
            String prompt = buildPrompt(description);
            log.info("[技能创建] 已构建AI提示词: promptLength={}", prompt != null ? prompt.length() : 0);
            
            // 调用 AI 服务
            Map<String, Object> aiResponse = callAIService(prompt, authToken);
            
            // 解析 AI 响应
            Map<String, Object> skillDefinition = parseAIResponse(aiResponse);
            log.info("[技能创建] 已解析AI响应: skillId={}, name={}, keys={}",
                    skillDefinition.get("skillId"), skillDefinition.get("name"), skillDefinition.keySet());
            
            // 验证和规范化
            normalizeSkillDefinition(skillDefinition);
            log.info("[技能创建] 已规范化技能定义: skillId={}, name={}", skillDefinition.get("skillId"), skillDefinition.get("name"));
            
            log.info("[技能创建] AI生成技能成功: sessionId={}, skillId={}", sessionId, skillDefinition.get("skillId"));
            
            return skillDefinition;
            
        } catch (Exception e) {
            log.error("[技能创建] AI生成技能失败: sessionId={}", sessionId, e);
            throw new RuntimeException("AI生成技能失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建 AI 提示词
     */
    private String buildPrompt(String userDescription) {
        return String.format("""
            你是一个技能创建助手。根据用户的描述，生成一个完整的技能定义（JSON格式）。
            
            技能定义应包含以下字段：
            - skillId: 技能唯一标识（小写字母、数字、连字符，1-64字符，例如：weather-query）
            - name: 技能名称（中文或英文，例如：天气查询）
            - description: 技能描述（1-1024字符，详细说明技能的功能和用途）
            - category: 技能分类（UTILITY/HEALTHCARE/EDUCATION/SOCIAL/CREATIVE/LIFE等）
            - skillType: 技能类型（ACTIVE/PASSIVE/AUTOMATIC）
            - instruction: 详细的技能指令（Markdown格式，说明如何使用这个技能）
            - mcpToolConfig: MCP工具配置（JSON字符串，如果需要工具调用，格式：{"mcpConfigId": 1, "tools": [{"name": "tool1"}]}，如果不需要工具调用则为null）
            - executionType: 执行类型（API/SCRIPT/GRAPH/PROMPT_DRIVEN）
            - executionConfig: 执行配置（JSON字符串，根据executionType设置）
            - license: 许可证信息（例如：MIT, Apache-2.0）
            - version: 版本号（例如：1.0.0）
            - author: 作者（可选）
            
            要求：
            1. skillId 必须符合格式要求（小写字母、数字、连字符）
            2. description 应该详细且包含关键词，便于AI理解和使用
            3. instruction 应该清晰说明技能的使用场景、输入输出格式等
            4. 如果技能需要调用外部工具（如搜索、文件操作等），应设置 mcpToolConfig
            5. 如果技能只是通过提示词驱动，不需要工具调用，则 mcpToolConfig 为 null
            
            用户描述：%s
            
            请生成完整的技能定义JSON，只返回JSON，不要包含其他文字说明。
            """, userDescription);
    }
    
    /**
     * 清理JSON内容，移除markdown代码块标记（如 ```json ... ```）
     * 兼容 BOM、大小写变体、空格与换行；若仍含非JSON前缀则从首尾 { } 截取
     */
    private String cleanJsonContent(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }
        content = content.trim();
        if (content.startsWith("\uFEFF")) {
            content = content.substring(1).trim();
        }
        // 移除开头的 ```json / ``` 等
        content = content.replaceFirst("(?i)^\\s*```\\s*json\\s*[\\r\\n]*", "");
        content = content.replaceFirst("^\\s*```\\s*[\\r\\n]*", "");
        content = content.replaceAll("[\\r\\n]*\\s*```\\s*$", "");
        content = content.trim();
        // 若仍以非 JSON 字符开头，则从第一个 { 到最后一个 } 截取
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            content = content.substring(start, end + 1);
        }
        return content.trim();
    }
    
    /**
     * 调用 AI 服务
     */
    private Map<String, Object> callAIService(String prompt, String authToken) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/text/generate";
            
            // 构建请求
            Map<String, Object> request = new HashMap<>();
            request.put("prompt", prompt);
            request.put("provider", "qwen");  // 默认使用 qwen
            request.put("model", "qwen-max");
            request.put("temperature", 0.7);
            request.put("maxTokens", 2000);
            request.put("stream", false);
            
            log.info("[技能创建] 请求AIService: url={}, provider=qwen, model=qwen-max, promptLength={}",
                    url, prompt != null ? prompt.length() : 0);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // 添加认证信息
            if (aiServiceApiKey != null && !aiServiceApiKey.isEmpty()) {
                headers.set("X-API-Key", aiServiceApiKey);
                log.info("[技能创建] AIService认证方式: X-API-Key");
            } else if (authToken != null && !authToken.isEmpty()) {
                headers.set("Authorization", "Bearer " + authToken);
                log.info("[技能创建] AIService认证方式: Bearer Token");
            } else {
                log.warn("[技能创建] AIService认证信息未配置，请求可能失败");
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );
            
            log.info("[技能创建] AIService应答: status={}, hasBody={}",
                    response.getStatusCode(), response.getBody() != null);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("AI服务调用失败: " + response.getStatusCode());
            }
            
            Map<String, Object> responseBody = response.getBody();
            
            // 提取 data.content
            if (responseBody.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                if (data != null && data.containsKey("content")) {
                    String content = (String) data.get("content");
                    int contentLen = content != null ? content.length() : 0;
                    log.info("[技能创建] AIService返回content: length={}, preview={}",
                            contentLen, content != null && content.length() > 200 ? content.substring(0, 200) + "..." : content);
                    
                    // 清理markdown代码块标记（如果AI返回了```json ... ```格式）
                    content = cleanJsonContent(content);
                    
                    // 解析 JSON
                    JsonNode jsonNode = objectMapper.readTree(content);
                    Map<String, Object> result = objectMapper.convertValue(jsonNode, Map.class);
                    log.info("[技能创建] AIService content解析为技能定义: keys={}", result.keySet());
                    return result;
                }
            }
            
            log.error("[技能创建] AIService响应格式错误: 缺少 data.content, responseKeys={}", responseBody.keySet());
            throw new RuntimeException("AI服务响应格式错误");
            
        } catch (Exception e) {
            log.error("[技能创建] 调用AIService失败", e);
            throw new RuntimeException("调用AI服务失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解析 AI 响应
     */
    private Map<String, Object> parseAIResponse(Map<String, Object> aiResponse) {
        // AI 响应应该已经是 Map 格式的技能定义
        // 如果 AI 返回的是字符串，需要先解析
        if (aiResponse.containsKey("content")) {
            try {
                String content = (String) aiResponse.get("content");
                // 清理markdown代码块标记
                content = cleanJsonContent(content);
                JsonNode jsonNode = objectMapper.readTree(content);
                return objectMapper.convertValue(jsonNode, Map.class);
            } catch (Exception e) {
                log.warn("解析AI响应内容失败，尝试直接使用响应", e);
            }
        }
        
        return aiResponse;
    }
    
    /**
     * 规范化技能定义
     */
    private void normalizeSkillDefinition(Map<String, Object> skillDefinition) {
        // 确保必需字段存在
        if (!skillDefinition.containsKey("skillId") || skillDefinition.get("skillId") == null) {
            // 从 name 生成 skillId
            String name = (String) skillDefinition.get("name");
            if (name != null) {
                String skillId = name.toLowerCase()
                    .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("^-|-$", "");
                skillDefinition.put("skillId", skillId);
            }
        }
        
        // 设置默认值
        if (!skillDefinition.containsKey("skillType")) {
            skillDefinition.put("skillType", "ACTIVE");
        }
        
        if (!skillDefinition.containsKey("executionType")) {
            skillDefinition.put("executionType", "PROMPT_DRIVEN");
        }
        
        if (!skillDefinition.containsKey("version")) {
            skillDefinition.put("version", "1.0.0");
        }
        
        if (!skillDefinition.containsKey("license")) {
            skillDefinition.put("license", "MIT");
        }
        
        // 确保 mcpToolConfig 是字符串格式（如果是对象，转换为JSON字符串）
        if (skillDefinition.containsKey("mcpToolConfig") && skillDefinition.get("mcpToolConfig") != null) {
            Object mcpConfig = skillDefinition.get("mcpToolConfig");
            if (!(mcpConfig instanceof String)) {
                try {
                    skillDefinition.put("mcpToolConfig", objectMapper.writeValueAsString(mcpConfig));
                } catch (Exception e) {
                    log.warn("转换 mcpToolConfig 为JSON字符串失败", e);
                    skillDefinition.put("mcpToolConfig", null);
                }
            }
        }
        
        // 确保 executionConfig 是字符串格式
        if (skillDefinition.containsKey("executionConfig") && skillDefinition.get("executionConfig") != null) {
            Object execConfig = skillDefinition.get("executionConfig");
            if (!(execConfig instanceof String)) {
                try {
                    skillDefinition.put("executionConfig", objectMapper.writeValueAsString(execConfig));
                } catch (Exception e) {
                    log.warn("转换 executionConfig 为JSON字符串失败", e);
                    skillDefinition.put("executionConfig", null);
                }
            }
        }
    }
}
