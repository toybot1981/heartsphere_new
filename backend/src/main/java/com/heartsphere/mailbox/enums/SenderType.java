package com.heartsphere.mailbox.enums;

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
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static SenderType fromCode(String code) {
        for (SenderType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown sender type: " + code);
    }
}

