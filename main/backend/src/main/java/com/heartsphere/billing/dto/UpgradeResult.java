package com.heartsphere.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 升级/降级结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpgradeResult {
    /**
     * 是否成功
     */
    private boolean success;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 原计划ID
     */
    private Long fromPlanId;
    
    /**
     * 目标计划ID
     */
    private Long toPlanId;
    
    /**
     * 操作类型：upgrade/downgrade
     */
    private String operationType;
    
    /**
     * 需要支付的金额（升级时为正数，降级时可能为负数表示退款）
     */
    private BigDecimal amount;
    
    /**
     * 原计划剩余价值
     */
    private BigDecimal remainingValue;
    
    /**
     * 目标计划价格
     */
    private BigDecimal targetPlanPrice;
    
    /**
     * 实际支付金额（扣除剩余价值后）
     */
    private BigDecimal actualPaymentAmount;
    
    /**
     * 配额转换信息（JSON格式，描述配额如何转换）
     */
    private String quotaConversionInfo;
    
    /**
     * 新的会员ID
     */
    private Long membershipId;
    
    /**
     * 新的会员状态
     */
    private String membershipStatus;
    
    /**
     * 新的到期时间
     */
    private LocalDateTime newEndDate;
    
    /**
     * 错误消息（如果失败）
     */
    private String errorMessage;
}
