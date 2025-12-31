package com.heartsphere.mailbox.enums;

/**
 * 消息类型枚举
 * 
 * @author HeartSphere
 * @version 1.0
 */
public enum MessageType {
    // E-SOUL来信类型
    ESOUL_GREETING("esoul_greeting", "日常问候"),
    ESOUL_CARE("esoul_care", "主动关怀"),
    ESOUL_SHARE("esoul_share", "分享内容"),
    ESOUL_REMINDER("esoul_reminder", "提醒通知"),
    
    // 共鸣消息类型
    RESONANCE_LIKE("resonance_like", "点赞消息"),
    RESONANCE_COMMENT("resonance_comment", "评论消息"),
    RESONANCE_MESSAGE("resonance_message", "留言消息"),
    RESONANCE_SHARE("resonance_share", "分享消息"),
    RESONANCE_CONNECTION_REQUEST("resonance_connection_request", "连接请求消息"),
    
    // 系统消息类型
    SYSTEM_NOTIFICATION("system_notification", "系统通知"),
    SYSTEM_FEEDBACK("system_feedback", "系统反馈"),
    SYSTEM_DIALOGUE("system_dialogue", "系统对话"),
    
    // 用户消息类型
    USER_PRIVATE_MESSAGE("user_private_message", "私信消息"),
    USER_REPLY("user_reply", "回复消息"),
    USER_INTERACTION("user_interaction", "互动消息");
    
    private final String code;
    private final String description;
    
    MessageType(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static MessageType fromCode(String code) {
        for (MessageType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown message type: " + code);
    }
}

