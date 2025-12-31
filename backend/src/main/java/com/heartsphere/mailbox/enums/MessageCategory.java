package com.heartsphere.mailbox.enums;

/**
 * 消息分类枚举
 * 
 * @author HeartSphere
 * @version 1.0
 */
public enum MessageCategory {
    ESOUL_LETTER("esoul_letter", "E-SOUL来信"),
    RESONANCE("resonance", "共鸣消息"),
    SYSTEM("system", "系统消息"),
    USER_MESSAGE("user_message", "用户消息");
    
    private final String code;
    private final String description;
    
    MessageCategory(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static MessageCategory fromCode(String code) {
        for (MessageCategory category : values()) {
            if (category.code.equals(code)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown message category: " + code);
    }
}

