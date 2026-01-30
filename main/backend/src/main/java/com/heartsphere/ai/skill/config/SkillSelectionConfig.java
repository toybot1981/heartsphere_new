package com.heartsphere.ai.skill.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 技能选择配置
 * 纯 LLM 驱动配置（已移除规则驱动）
 * 
 * @author HeartSphere
 * @version 2.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "skill.selection")
public class SkillSelectionConfig {
    
    /**
     * LLM 驱动配置
     */
    private LLMDrivenConfig llmDriven = new LLMDrivenConfig();
    
    /**
     * 缓存配置
     */
    private CacheConfig cache = new CacheConfig();
    
    @Data
    public static class LLMDrivenConfig {
        /**
         * 是否启用 LLM 驱动
         * 默认：true（启用 LLM 驱动的技能选择）
         */
        private boolean enabled = true;
        
        /**
         * Level 1 筛选的候选数量
         */
        private int level1Candidates = 10;
        
        /**
         * Level 2 评估的候选数量
         */
        private int level2Candidates = 5;
        
        /**
         * Level 3 最终决策的候选数量
         */
        private int level3Candidates = 3;
        
        /**
         * 是否启用 Level 3
         * 默认：true（启用 Level 3 最终决策）
         */
        private boolean enableLevel3 = true;
        
        /**
         * LLM 模型配置
         */
        private String model = "gpt-4";
        
        /**
         * 温度参数
         */
        private double temperature = 0.3;
        
        /**
         * 最大 Token 数
         */
        private int maxTokens = 1000;
    }
    
    @Data
    public static class CacheConfig {
        /**
         * Level 1 缓存 TTL（秒）
         */
        private int level1Ttl = 3600;  // 1小时
        
        /**
         * Level 2 缓存 TTL（秒）
         */
        private int level2Ttl = 1800;  // 30分钟
        
        /**
         * Level 3 缓存 TTL（秒）
         */
        private int level3Ttl = 600;   // 10分钟
        
        /**
         * LLM 结果缓存 TTL（秒）
         */
        private int llmResultTtl = 300;  // 5分钟
    }
}
