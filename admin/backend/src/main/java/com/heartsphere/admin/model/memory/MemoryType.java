package com.heartsphere.admin.model.memory;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 记忆类型枚举
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public enum MemoryType {
    // 个人信息
    PERSONAL_INFO,
    PREFERENCE,
    HABIT,
    PERSONALITY,
    
    // 情感记忆
    IMPORTANT_MOMENT,
    EMOTIONAL_EXPERIENCE,
    EMOTION_PATTERN,
    EMOTIONAL_PREFERENCE,
    
    // 交互记忆
    INTERACTION_HISTORY,
    CONVERSATION_TOPIC,
    INTERACTION_PREFERENCE,
    CONVERSATION_STYLE,
    
    // 关系记忆
    RELATIONSHIP_INFO,
    RELATIONSHIP_EVENT,
    RELATIONSHIP_STATUS,
    
    // 内容记忆
    CREATED_CONTENT,
    FOCUSED_CONTENT,
    FAVORITED_CONTENT,
    
    // 成长记忆
    GROWTH_TRAJECTORY,
    MILESTONE,
    ACHIEVEMENT,
    REFLECTION;
    
    /**
     * 从字符串值创建枚举（支持大小写不敏感和下划线格式）
     * 前端可能发送小写下划线格式（如 "important_moment"），需要转换为枚举值
     */
    @JsonCreator
    public static MemoryType fromString(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        // 先尝试直接匹配（大写格式）
        try {
            return MemoryType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            // 如果直接匹配失败，尝试匹配小写格式
            String upperValue = value.toUpperCase();
            for (MemoryType type : MemoryType.values()) {
                if (type.name().equals(upperValue)) {
                    return type;
                }
            }
            
            // 如果还是找不到，尝试将下划线格式转换为枚举名
            // 例如 "important_moment" -> "IMPORTANT_MOMENT"
            String normalized = value.toUpperCase().replace("-", "_");
            try {
                return MemoryType.valueOf(normalized);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException(
                    "无法解析记忆类型: " + value + 
                    ". 支持的值: " + java.util.Arrays.toString(MemoryType.values())
                );
            }
        }
    }
    
    /**
     * 序列化为字符串（返回枚举名）
     */
    @JsonValue
    public String toValue() {
        return this.name();
    }
}
