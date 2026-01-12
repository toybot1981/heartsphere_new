package com.heartsphere.heartconnect.portal.util;

import java.util.Random;

/**
 * 传送门ID生成器
 * 生成格式：PT-XXXXXX（6位字母数字组合）
 * 参考ShareCodeGenerator的设计模式
 */
public class PortalCodeGenerator {
    
    private static final String PREFIX = "PT-";
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除易混淆字符：0, O, I, 1
    private static final int CODE_LENGTH = 6;
    private static final Random random = new Random();
    
    /**
     * 生成传送门ID
     */
    public static String generate() {
        StringBuilder code = new StringBuilder(PREFIX);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return code.toString();
    }
    
    /**
     * 验证传送门ID格式
     */
    public static boolean isValid(String portalCode) {
        if (portalCode == null || portalCode.length() != PREFIX.length() + CODE_LENGTH) {
            return false;
        }
        if (!portalCode.startsWith(PREFIX)) {
            return false;
        }
        String codePart = portalCode.substring(PREFIX.length());
        for (char c : codePart.toCharArray()) {
            if (CHARS.indexOf(c) == -1) {
                return false;
            }
        }
        return true;
    }
}
