package com.heartsphere.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 配额信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaInfo {
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 会员ID
     */
    private Long membershipId;
    
    /**
     * 计划类型
     */
    private String planType;
    
    // 文本Token配额
    private Long textTokenQuota;
    private Long textTokenUsed;
    private Long textTokenAvailable;
    
    // 图片生成配额
    private Integer imageQuota;
    private Integer imageUsed;
    private Integer imageAvailable;
    
    // 视频生成配额（秒）
    private Integer videoQuota;
    private Integer videoUsed;
    private Integer videoAvailable;
    
    // API调用配额
    private Integer apiCallQuotaPerDay;
    private Integer apiCallUsedToday;
    private Integer apiCallAvailableToday;
    
    // 配额重置日期
    private LocalDate quotaResetDate;
    private LocalDate lastQuotaResetDate;
    
    // API调用重置日期
    private LocalDate apiCallResetDate;
}
