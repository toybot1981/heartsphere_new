package com.heartsphere.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 配额操作结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaResult {
    /**
     * 是否成功
     */
    private boolean success;
    
    /**
     * 配额类型
     */
    private String quotaType;
    
    /**
     * 使用量
     */
    private Long amountUsed;
    
    /**
     * 使用前配额
     */
    private Long quotaBefore;
    
    /**
     * 使用后配额
     */
    private Long quotaAfter;
    
    /**
     * 是否超量
     */
    private boolean overage;
    
    /**
     * 超量金额（如果超量）
     */
    private java.math.BigDecimal overageAmount;
    
    /**
     * 错误消息（如果失败）
     */
    private String errorMessage;
    
    /**
     * 使用记录ID
     */
    private Long usageRecordId;
}
