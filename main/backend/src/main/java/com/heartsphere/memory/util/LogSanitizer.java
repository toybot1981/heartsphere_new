package com.heartsphere.memory.util;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * 日志敏感信息脱敏工具类
 * 用于在记录日志前对敏感信息进行脱敏处理
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
public class LogSanitizer {
    
    private static final int MAX_PREVIEW_LENGTH = 100;
    private static final Pattern API_KEY_PATTERN = Pattern.compile("(sk-|Bearer |Token:)([a-zA-Z0-9_-]{4})([a-zA-Z0-9_-]*)([a-zA-Z0-9_-]{4})");
    
    /**
     * API密钥脱敏
     * 格式：只显示前4位和后4位，中间用 *** 代替
     * 
     * @param apiKey API密钥
     * @return 脱敏后的密钥
     */
    public static String sanitizeApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 8) {
            return "***";
        }
        
        int length = apiKey.length();
        if (length <= 8) {
            return "***";
        }
        
        String prefix = apiKey.substring(0, 4);
        String suffix = apiKey.substring(length - 4);
        return prefix + "***" + suffix;
    }
    
    /**
     * Token脱敏
     * 格式：只显示前4位和后4位，中间用 *** 代替
     * 
     * @param token Token
     * @return 脱敏后的Token
     */
    public static String sanitizeToken(String token) {
        return sanitizeApiKey(token);
    }
    
    /**
     * 长文本截断和摘要
     * 只记录文本长度和前N个字符的摘要
     * 
     * @param text 文本内容
     * @return 摘要信息（如：textLength=1024, preview="前100字符..."）
     */
    public static String sanitizeText(String text) {
        if (text == null) {
            return "null";
        }
        
        int length = text.length();
        if (length <= MAX_PREVIEW_LENGTH) {
            return String.format("textLength=%d, preview=\"%s\"", length, text);
        }
        
        String preview = text.substring(0, MAX_PREVIEW_LENGTH);
        return String.format("textLength=%d, preview=\"%s...\"", length, preview);
    }
    
    /**
     * 请求参数脱敏
     * 对于大型请求体，只记录关键字段摘要
     * 
     * @param request 请求对象
     * @return 脱敏后的摘要
     */
    public static String sanitizeRequest(Object request) {
        if (request == null) {
            return "null";
        }
        
        // 如果是 Map，提取关键字段
        if (request instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) request;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) {
                    sb.append(", ");
                }
                String key = String.valueOf(entry.getKey());
                Object value = entry.getValue();
                
                // 根据key决定如何处理value
                if ("messages".equals(key) && value instanceof java.util.List) {
                    int size = ((java.util.List<?>) value).size();
                    sb.append(key).append(": [count=").append(size).append("]");
                } else if ("content".equals(key) || "text".equals(key)) {
                    sb.append(key).append(": ").append(sanitizeText(String.valueOf(value)));
                } else if (value != null && value.toString().length() > 50) {
                    sb.append(key).append(": ").append(sanitizeText(value.toString()));
                } else {
                    sb.append(key).append(": ").append(value);
                }
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        
        // 对于其他类型，转为字符串并截断
        String str = request.toString();
        if (str.length() <= MAX_PREVIEW_LENGTH) {
            return str;
        }
        return sanitizeText(str);
    }
    
    /**
     * 响应体脱敏
     * 只记录关键字段（resourceId、itemsCount、categories等）
     * 
     * @param response 响应对象
     * @return 脱敏后的摘要
     */
    public static String sanitizeResponse(Object response) {
        if (response == null) {
            return "null";
        }
        
        // 如果是 Map，提取关键字段
        if (response instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) response;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            
            // 提取常见的关键字段
            String[] keyFields = {"resource_id", "resourceId", "items_count", "itemsCount", 
                                 "categories", "total", "method", "success"};
            
            for (String keyField : keyFields) {
                if (map.containsKey(keyField)) {
                    if (!first) {
                        sb.append(", ");
                    }
                    sb.append(keyField).append(": ").append(map.get(keyField));
                    first = false;
                }
            }
            
            // 如果还有其他字段，记录字段数量
            if (map.size() > keyFields.length) {
                if (!first) {
                    sb.append(", ");
                }
                sb.append("... (totalFields: ").append(map.size()).append(")");
            }
            
            sb.append("}");
            return sb.toString();
        }
        
        // 对于其他类型，转为字符串并截断
        String str = response.toString();
        if (str.length() <= MAX_PREVIEW_LENGTH) {
            return str;
        }
        return sanitizeText(str);
    }
    
    /**
     * 通用脱敏方法
     * 根据值的类型和长度自动选择脱敏策略
     * 
     * @param value 需要脱敏的值
     * @return 脱敏后的值
     */
    public static String sanitize(Object value) {
        if (value == null) {
            return "null";
        }
        
        String str = value.toString();
        
        // 如果包含可能的关键词，进行脱敏
        if (str.toLowerCase().contains("api") && str.toLowerCase().contains("key")) {
            return sanitizeApiKey(str);
        }
        
        if (str.toLowerCase().contains("token") || str.toLowerCase().contains("bearer")) {
            return sanitizeToken(str);
        }
        
        if (str.length() > MAX_PREVIEW_LENGTH) {
            return sanitizeText(str);
        }
        
        return str;
    }
}
