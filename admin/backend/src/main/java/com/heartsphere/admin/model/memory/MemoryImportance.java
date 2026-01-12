package com.heartsphere.admin.model.memory;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 记忆重要性枚举
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public enum MemoryImportance {
    /**
     * 核心记忆（永久保留）
     */
    CORE,
    
    /**
     * 重要记忆（长期保留）
     */
    IMPORTANT,
    
    /**
     * 普通记忆（定期衰减）
     */
    NORMAL,
    
    /**
     * 临时记忆（短期保留）
     */
    TEMPORARY;
    
    /**
     * 从字符串值创建枚举（支持大小写不敏感）
     * 前端可能发送小写格式（如 "core"），需要转换为枚举值
     */
    @JsonCreator
    public static MemoryImportance fromString(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        // 先尝试直接匹配（大写格式）
        try {
            return MemoryImportance.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "无法解析记忆重要性: " + value + 
                ". 支持的值: " + java.util.Arrays.toString(MemoryImportance.values())
            );
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
