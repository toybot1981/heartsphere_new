package com.heartsphere.mailbox.enums;

/**
 * 对话类型枚举
 * 
 * @author HeartSphere
 * @version 1.0
 */
public enum ConversationType {
    USER_TO_USER("user_to_user", "用户对用户"),
    USER_TO_SYSTEM("user_to_system", "用户对系统");
    
    private final String code;
    private final String description;
    
    ConversationType(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static ConversationType fromCode(String code) {
        for (ConversationType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown conversation type: " + code);
    }
}

