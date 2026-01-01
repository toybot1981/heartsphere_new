package com.heartsphere.mailbox.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 发送者类型枚举
 * 
 * @author HeartSphere
 * @version 1.0
 */
public enum SenderType {
    ESOUL("esoul", "E-SOUL角色"),
    HEARTSPHERE("heartsphere", "心域"),
    SYSTEM("system", "系统"),
    USER("user", "用户");
    
    private final String code;
    private final String description;
    
    SenderType(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    @JsonValue
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    @JsonCreator
    public static SenderType fromCode(String code) {
        if (code == null) {
            return null;
        }
        // 支持枚举名称（大写）和code（小写）
        for (SenderType type : values()) {
            if (type.code.equalsIgnoreCase(code) || type.name().equalsIgnoreCase(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown sender type: " + code);
    }
}

