package com.heartsphere.config;

import java.util.Arrays;
import java.util.List;

/**
 * 游客模式配置
 * 定义游客可以访问的预置场景和角色
 */
public class GuestModeConfig {
    
    /**
     * 游客默认场景ID：日常生活助手
     */
    public static final Long DEFAULT_ERA_ID = 50L;
    
    /**
     * 游客可以访问的角色ID列表
     */
    public static final List<Long> ALLOWED_CHARACTER_IDS = Arrays.asList(
        315L, // 时小光 - 时间管理导师
        316L, // 康小健 - 健康生活顾问
        317L, // 学小知 - 学习成长导师
        318L, // 心小暖 - 情绪陪伴师
        319L, // 心小安 - 心理健康守护者
        320L  // 暖小阳 - 情感陪伴伙伴
    );
    
    /**
     * 检查角色ID是否在允许列表中
     */
    public static boolean isCharacterAllowed(Long characterId) {
        return ALLOWED_CHARACTER_IDS.contains(characterId);
    }
    
    /**
     * 检查场景ID是否为默认场景
     */
    public static boolean isEraAllowed(Long eraId) {
        return DEFAULT_ERA_ID.equals(eraId);
    }
}
