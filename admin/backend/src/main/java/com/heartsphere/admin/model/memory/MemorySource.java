package com.heartsphere.admin.model.memory;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 记忆来源枚举
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public enum MemorySource {
    /**
     * 对话
     */
    CONVERSATION,
    
    /**
     * 日记
     */
    JOURNAL,
    
    /**
     * 用户输入
     */
    USER_INPUT,
    
    /**
     * 系统检测
     */
    SYSTEM_DETECTED,
    
    /**
     * 手动创建
     */
    MANUAL_CREATE,
    
    /**
     * 外部同步
     */
    EXTERNAL_SYNC;
    
    /**
     * 从字符串值创建枚举（支持大小写不敏感和下划线格式）
     * 前端可能发送小写格式（如 "conversation", "journal"），需要转换为枚举值
     */
    @JsonCreator
    public static MemorySource fromString(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        // 先尝试直接匹配（大写格式）
        try {
            return MemorySource.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            // 如果直接匹配失败，尝试匹配小写格式
            String upperValue = value.toUpperCase().replace("-", "_");
            try {
                return MemorySource.valueOf(upperValue);
            } catch (IllegalArgumentException ex) {
                // 处理前端可能发送的简化格式
                // 例如 "manual" -> "MANUAL_CREATE", "system" -> "SYSTEM_DETECTED"
                switch (upperValue) {
                    case "MANUAL":
                        return MANUAL_CREATE;
                    case "SYSTEM":
                        return SYSTEM_DETECTED;
                    case "BEHAVIOR":
                        return USER_INPUT;
                    default:
                        throw new IllegalArgumentException(
                            "无法解析记忆来源: " + value + 
                            ". 支持的值: " + java.util.Arrays.toString(MemorySource.values())
                        );
                }
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
