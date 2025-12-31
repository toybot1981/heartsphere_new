package com.heartsphere.mailbox.enums;

/**
 * E-SOUL来信类型枚举
 * 
 * @author HeartSphere
 * @version 1.0
 */
public enum ESoulLetterType {
    GREETING("esoul_greeting", "日常问候"),
    CARE("esoul_care", "主动关怀"),
    SHARE("esoul_share", "分享内容"),
    REMINDER("esoul_reminder", "提醒通知");
    
    private final String code;
    private final String description;
    
    ESoulLetterType(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
}

