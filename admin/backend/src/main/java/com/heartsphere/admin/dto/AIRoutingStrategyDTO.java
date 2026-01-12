package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI路由策略DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIRoutingStrategyDTO {
    private Long id;
    private String capability; // 能力类型：text, image, audio, video
    private String strategyType; // 策略类型：single, fallback, economy
    private Map<String, Object> config; // 策略配置
    private Boolean isActive; // 是否启用
    private String description; // 描述
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 策略配置的详细字段（用于前端展示）
    private String defaultProvider; // 单一模式：默认提供商
    private String defaultModel; // 单一模式：默认模型
    private List<FallbackConfig> fallbackChain; // 容错模式：降级链
    private EconomyConfig economyConfig; // 经济模式：配置
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FallbackConfig {
        private String provider;
        private String model;
        private Integer priority;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EconomyConfig {
        private Boolean enabled;
        private String preferredProvider; // 优先使用的提供商
        private Double maxCostPerToken; // 最大成本限制
    }
}


