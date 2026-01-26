package com.heartsphere.mentis.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * LLM 响应解析工具类
 * 用于从 LLM 的文本响应中提取和解析 JSON 数据
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class LLMResponseParser {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 匹配 JSON 代码块的模式
    private static final Pattern JSON_CODE_BLOCK_PATTERN = Pattern.compile(
        "```(?:json)?\\s*([\\s\\S]*?)\\s*```", 
        Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
    );
    
    // 匹配 JSON 对象的模式（简单匹配，用于提取 JSON 对象）
    private static final Pattern JSON_OBJECT_PATTERN = Pattern.compile(
        "\\{[\\s\\S]*\\}", 
        Pattern.MULTILINE
    );
    
    /**
     * 从 LLM 响应中提取 JSON 内容
     * 支持多种格式：
     * 1. Markdown 代码块中的 JSON
     * 2. 纯 JSON 文本
     * 3. 包含 JSON 的文本（提取第一个 JSON 对象）
     * 
     * @param responseContent LLM 响应内容
     * @return 提取的 JSON 字符串
     */
    public String extractJson(String responseContent) {
        if (responseContent == null || responseContent.trim().isEmpty()) {
            throw new IllegalArgumentException("响应内容为空");
        }
        
        // 1. 尝试从 Markdown 代码块中提取
        Matcher codeBlockMatcher = JSON_CODE_BLOCK_PATTERN.matcher(responseContent);
        if (codeBlockMatcher.find()) {
            String jsonContent = codeBlockMatcher.group(1).trim();
            log.info("从代码块中提取 JSON: {}", jsonContent.substring(0, Math.min(100, jsonContent.length())));
            return jsonContent;
        }
        
        // 2. 尝试提取 JSON 对象
        Matcher jsonObjectMatcher = JSON_OBJECT_PATTERN.matcher(responseContent);
        if (jsonObjectMatcher.find()) {
            String jsonContent = jsonObjectMatcher.group(0).trim();
            log.info("从文本中提取 JSON 对象: {}", jsonContent.substring(0, Math.min(100, jsonContent.length())));
            return jsonContent;
        }
        
        // 3. 如果都没有找到，尝试直接使用原文本（可能是纯 JSON）
        String trimmed = responseContent.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            log.info("使用原始文本作为 JSON");
            return trimmed;
        }
        
        throw new IllegalArgumentException("无法从响应中提取 JSON 内容");
    }
    
    /**
     * 解析 JSON 字符串为 JsonNode
     * 
     * @param jsonContent JSON 字符串
     * @return JsonNode 对象
     */
    public JsonNode parseJson(String jsonContent) {
        try {
            return objectMapper.readTree(jsonContent);
        } catch (Exception e) {
            log.error("解析 JSON 失败: {}", jsonContent.substring(0, Math.min(200, jsonContent.length())), e);
            throw new IllegalArgumentException("JSON 解析失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 从 LLM 响应中提取并解析 JSON
     * 
     * @param responseContent LLM 响应内容
     * @return 解析后的 JsonNode
     */
    public JsonNode extractAndParseJson(String responseContent) {
        String jsonContent = extractJson(responseContent);
        return parseJson(jsonContent);
    }
    
    /**
     * 解析 JSON 为指定类型的对象
     * 
     * @param responseContent LLM 响应内容
     * @param clazz 目标类型
     * @return 解析后的对象
     */
    public <T> T parseToObject(String responseContent, Class<T> clazz) {
        try {
            String jsonContent = extractJson(responseContent);
            return objectMapper.readValue(jsonContent, clazz);
        } catch (Exception e) {
            log.error("解析 JSON 为对象失败: {}", clazz.getSimpleName(), e);
            throw new IllegalArgumentException("解析失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 清理 JSON 字符串
     * 移除可能的 Markdown 标记、多余的空格等
     * 
     * @param jsonContent JSON 字符串
     * @return 清理后的 JSON 字符串
     */
    public String cleanJson(String jsonContent) {
        if (jsonContent == null) {
            return null;
        }
        
        // 移除 Markdown 代码块标记
        String cleaned = jsonContent.replaceAll("```json\\s*", "")
                                    .replaceAll("```\\s*", "")
                                    .trim();
        
        // 移除可能的说明文字（在 JSON 前后的文本）
        int jsonStart = cleaned.indexOf('{');
        int jsonEnd = cleaned.lastIndexOf('}');
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }
        
        return cleaned;
    }
    
    /**
     * 验证 JSON 格式是否正确
     * 
     * @param jsonContent JSON 字符串
     * @return 是否有效
     */
    public boolean isValidJson(String jsonContent) {
        try {
            parseJson(jsonContent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 安全地提取 JSON（失败时返回 null）
     * 
     * @param responseContent LLM 响应内容
     * @return 提取的 JSON 字符串，失败时返回 null
     */
    public String extractJsonSafely(String responseContent) {
        try {
            return extractJson(responseContent);
        } catch (Exception e) {
            log.warn("安全提取 JSON 失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 安全地解析 JSON（失败时返回 null）
     * 
     * @param responseContent LLM 响应内容
     * @return 解析后的 JsonNode，失败时返回 null
     */
    public JsonNode extractAndParseJsonSafely(String responseContent) {
        try {
            return extractAndParseJson(responseContent);
        } catch (Exception e) {
            log.warn("安全解析 JSON 失败: {}", e.getMessage());
            return null;
        }
    }
}
