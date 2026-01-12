package com.heartsphere.service.video;

/**
 * 动画格式枚举
 */
public enum AnimationFormat {
    /**
     * GIF动画格式
     */
    GIF("gif", "GIF Animation"),
    
    /**
     * Lottie JSON动画格式
     */
    LOTTIE("lottie", "Lottie JSON Animation"),
    
    /**
     * PAG (Portable Animated Graphics) 格式
     */
    PAG("pag", "PAG Animation");

    private final String code;
    private final String displayName;

    AnimationFormat(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * 根据代码获取格式枚举
     */
    public static AnimationFormat fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (AnimationFormat format : values()) {
            if (format.code.equalsIgnoreCase(code)) {
                return format;
            }
        }
        return null;
    }

    /**
     * 检查是否为有效的格式代码
     */
    public static boolean isValidFormat(String code) {
        return fromCode(code) != null;
    }
}
