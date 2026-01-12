package com.heartsphere.billing.enums;

/**
 * 配额类型枚举
 */
public enum QuotaType {
    /**
     * 文本Token配额
     */
    TEXT_TOKEN("text_token"),
    
    /**
     * 图片生成配额
     */
    IMAGE("image"),
    
    /**
     * 视频生成配额
     */
    VIDEO("video"),
    
    /**
     * API调用配额
     */
    API_CALL("api_call");
    
    private final String code;
    
    QuotaType(String code) {
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
    
    /**
     * 根据代码获取枚举
     */
    public static QuotaType fromCode(String code) {
        for (QuotaType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未知的配额类型: " + code);
    }
}
