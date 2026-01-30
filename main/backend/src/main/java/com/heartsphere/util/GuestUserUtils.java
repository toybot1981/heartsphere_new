package com.heartsphere.util;

/**
 * 临时游客用户工具类
 * 用于识别和处理临时用户（用户名格式：guest_&lt;timestamp&gt;_&lt;random&gt;）
 */
public final class GuestUserUtils {

    private GuestUserUtils() {
    }

    /**
     * 临时用户名前缀
     */
    public static final String GUEST_USERNAME_PREFIX = "guest_";

    /**
     * 判断用户名是否为临时游客用户
     * 临时用户使用格式：guest_&lt;timestamp&gt;_&lt;random&gt;
     *
     * @param username 用户名，可为 null
     * @return true 如果是临时用户，false 否则
     */
    public static boolean isTemporaryUser(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }
        return username.startsWith(GUEST_USERNAME_PREFIX);
    }
}
