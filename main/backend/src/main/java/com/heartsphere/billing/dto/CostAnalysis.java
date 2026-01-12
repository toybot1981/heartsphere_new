package com.heartsphere.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 成本分析DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostAnalysis {
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 分析周期开始日期
     */
    private LocalDate periodStart;
    
    /**
     * 分析周期结束日期
     */
    private LocalDate periodEnd;
    
    /**
     * 订阅费用
     */
    private BigDecimal subscriptionCost;
    
    /**
     * 超量付费
     */
    private BigDecimal overageCost;
    
    /**
     * 总成本
     */
    private BigDecimal totalCost;
    
    /**
     * 平均每日成本
     */
    private BigDecimal averageDailyCost;
    
    /**
     * 按配额类型分解的成本
     */
    private List<QuotaCostBreakdown> costBreakdown;
    
    /**
     * 配额成本分解
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotaCostBreakdown {
        /**
         * 配额类型
         */
        private String quotaType;
        
        /**
         * 使用量
         */
        private Long usage;
        
        /**
         * 超量使用量
         */
        private Long overageUsage;
        
        /**
         * 超量成本
         */
        private BigDecimal overageCost;
        
        /**
         * 单价
         */
        private BigDecimal unitPrice;
    }
}
