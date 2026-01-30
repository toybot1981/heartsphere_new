package com.heartsphere.ai.skill.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 技能缓存配置
 * 配置技能相关数据的缓存
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Configuration
@EnableCaching
public class SkillCacheConfig {
    
    /**
     * 创建缓存管理器
     * 使用内存缓存（生产环境可以替换为 Redis）
     */
    @Bean
    public CacheManager skillCacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(java.util.Arrays.asList(
            "skillLevel1",  // Level 1（元数据）缓存
            "skillLevel2",  // Level 2（指令）缓存
            "skillLevel3",  // Level 3（资源）缓存
            "llmSkillSelection"  // LLM 选择结果缓存
        ));
        cacheManager.setAllowNullValues(false);  // 不允许 null 值
        return cacheManager;
    }
}
