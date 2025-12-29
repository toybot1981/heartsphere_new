package com.heartsphere.heartconnect.util;

import java.util.Random;

/**
 * 共享码生成器
 * 生成格式：HS-XXXXXX（6位字母数字组合）
 */
public class ShareCodeGenerator {
    
    private static final String PREFIX = "HS-";
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除易混淆字符：0, O, I, 1
    private static final int CODE_LENGTH = 6;
    private static final Random random = new Random();
    
    /**
     * 生成共享码
     */
    public static String generate() {
        StringBuilder code = new StringBuilder(PREFIX);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return code.toString();
    }
    
    /**
     * 验证共享码格式
     */
    public static boolean isValid(String shareCode) {
        if (shareCode == null || shareCode.length() != PREFIX.length() + CODE_LENGTH) {
            return false;
        }
        if (!shareCode.startsWith(PREFIX)) {
            return false;
        }
        String codePart = shareCode.substring(PREFIX.length());
        for (char c : codePart.toCharArray()) {
            if (CHARS.indexOf(c) == -1) {
                return false;
            }
        }
        return true;
    }
}

