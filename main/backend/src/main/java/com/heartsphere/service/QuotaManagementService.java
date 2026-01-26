package com.heartsphere.service;

import com.heartsphere.billing.dto.QuotaInfo;
import com.heartsphere.billing.dto.QuotaResult;
import com.heartsphere.billing.entity.OverageCharge;
import com.heartsphere.billing.entity.QuotaUsageRecord;
import com.heartsphere.billing.enums.QuotaType;
import com.heartsphere.billing.repository.OverageChargeRepository;
import com.heartsphere.billing.repository.QuotaUsageRecordRepository;
import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.MembershipRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * 配额管理服务
 * 负责基于会员体系的配额管理：查询、检查、扣减、重置
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuotaManagementService {

    private final MembershipRepository membershipRepository;
    private final SubscriptionPlanRepository planRepository;
    private final QuotaUsageRecordRepository usageRecordRepository;
    private final OverageChargeRepository overageChargeRepository;
    private final MembershipService membershipService;

    /**
     * 获取用户配额信息
     */
    @Transactional(readOnly = true)
    public QuotaInfo getQuotaInfo(Long userId) {
        log.info("获取用户配额信息: userId={}", userId);
        
        // 获取或创建会员
        Membership membership = membershipService.getUserMembership(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
        
        // 获取订阅计划
        SubscriptionPlan plan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
        
        // 构建配额信息
        return buildQuotaInfo(membership, plan);
    }

    /**
     * 构建配额信息DTO
     */
    private QuotaInfo buildQuotaInfo(Membership membership, SubscriptionPlan plan) {
        // 文本Token配额
        Long textTokenQuota = plan.getTextTokenQuota() != null ? plan.getTextTokenQuota() : 0L;
        Long textTokenUsed = membership.getTextTokenUsed() != null ? membership.getTextTokenUsed() : 0L;
        Long textTokenAvailable = Math.max(0, textTokenQuota - textTokenUsed);
        
        // 图片生成配额
        Integer imageQuota = plan.getImageGenerationQuota() != null ? plan.getImageGenerationQuota() : 0;
        Integer imageUsed = membership.getImageGenerationUsed() != null ? membership.getImageGenerationUsed() : 0;
        Integer imageAvailable = Math.max(0, imageQuota - imageUsed);
        
        // 视频生成配额
        Integer videoQuota = plan.getVideoGenerationQuota() != null ? plan.getVideoGenerationQuota() : 0;
        Integer videoUsed = membership.getVideoGenerationUsed() != null ? membership.getVideoGenerationUsed() : 0;
        Integer videoAvailable = Math.max(0, videoQuota - videoUsed);
        
        // API调用配额（每日）
        Integer apiCallQuotaPerDay = plan.getMaxApiCallsPerDay() != null ? plan.getMaxApiCallsPerDay() : 0;
        Integer apiCallUsedToday = membership.getApiCallsUsedToday() != null ? membership.getApiCallsUsedToday() : 0;
        Integer apiCallAvailableToday = Math.max(0, apiCallQuotaPerDay - apiCallUsedToday);
        
        return QuotaInfo.builder()
                .userId(membership.getUserId())
                .membershipId(membership.getId())
                .planType(membership.getPlanType())
                .textTokenQuota(textTokenQuota)
                .textTokenUsed(textTokenUsed)
                .textTokenAvailable(textTokenAvailable)
                .imageQuota(imageQuota)
                .imageUsed(imageUsed)
                .imageAvailable(imageAvailable)
                .videoQuota(videoQuota)
                .videoUsed(videoUsed)
                .videoAvailable(videoAvailable)
                .apiCallQuotaPerDay(apiCallQuotaPerDay)
                .apiCallUsedToday(apiCallUsedToday)
                .apiCallAvailableToday(apiCallAvailableToday)
                .quotaResetDate(membership.getQuotaResetDate())
                .lastQuotaResetDate(membership.getLastQuotaResetDate())
                .apiCallResetDate(membership.getApiCallsResetDate())
                .build();
    }

    /**
     * 检查配额是否足够
     */
    @Transactional(readOnly = true)
    public boolean checkQuota(Long userId, QuotaType quotaType, Long amount) {
        log.info("检查配额: userId={}, quotaType={}, amount={}", userId, quotaType, amount);
        
        QuotaInfo quotaInfo = getQuotaInfo(userId);
        
        switch (quotaType) {
            case TEXT_TOKEN:
                return quotaInfo.getTextTokenAvailable() >= amount;
            case IMAGE:
                return quotaInfo.getImageAvailable() >= amount;
            case VIDEO:
                return quotaInfo.getVideoAvailable() >= amount;
            case API_CALL:
                return quotaInfo.getApiCallAvailableToday() >= amount;
            default:
                log.warn("未知的配额类型: {}", quotaType);
                return false;
        }
    }

    /**
     * 扣减配额
     * @param userId 用户ID
     * @param quotaType 配额类型
     * @param amount 使用量
     * @param relatedRecordId 关联记录ID（可选）
     * @param relatedRecordType 关联记录类型（可选）
     * @return 配额操作结果
     */
    @Transactional
    public QuotaResult consumeQuota(Long userId, QuotaType quotaType, Long amount, 
                                     Long relatedRecordId, String relatedRecordType) {
        log.info("扣减配额: userId={}, quotaType={}, amount={}", userId, quotaType, amount);
        
        // 获取会员（使用悲观锁，防止并发问题）
        Membership membership = membershipRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
        
        // 获取订阅计划
        SubscriptionPlan plan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
        
        // 检查配额是否足够
        boolean hasEnoughQuota = checkQuotaEnough(membership, plan, quotaType, amount);
        
        if (!hasEnoughQuota) {
            // 配额不足，尝试处理超量
            return handleOverageConsumption(membership, plan, quotaType, amount, relatedRecordId, relatedRecordType);
        }
        
        // 配额足够，正常扣减
        return doConsumeQuota(membership, plan, quotaType, amount, relatedRecordId, relatedRecordType, false);
    }

    /**
     * 检查配额是否足够
     */
    private boolean checkQuotaEnough(Membership membership, SubscriptionPlan plan, QuotaType quotaType, Long amount) {
        switch (quotaType) {
            case TEXT_TOKEN:
                Long textTokenQuota = plan.getTextTokenQuota() != null ? plan.getTextTokenQuota() : 0L;
                Long textTokenUsed = membership.getTextTokenUsed() != null ? membership.getTextTokenUsed() : 0L;
                return (textTokenQuota - textTokenUsed) >= amount;
                
            case IMAGE:
                Integer imageQuota = plan.getImageGenerationQuota() != null ? plan.getImageGenerationQuota() : 0;
                Integer imageUsed = membership.getImageGenerationUsed() != null ? membership.getImageGenerationUsed() : 0;
                return (imageQuota - imageUsed) >= amount;
                
            case VIDEO:
                Integer videoQuota = plan.getVideoGenerationQuota() != null ? plan.getVideoGenerationQuota() : 0;
                Integer videoUsed = membership.getVideoGenerationUsed() != null ? membership.getVideoGenerationUsed() : 0;
                return (videoQuota - videoUsed) >= amount;
                
            case API_CALL:
                // API调用配额需要检查重置日期
                if (membership.getApiCallsResetDate() == null || 
                    !membership.getApiCallsResetDate().equals(LocalDate.now())) {
                    // 需要重置
                    return false; // 先重置，然后再检查
                }
                Integer apiCallQuota = plan.getMaxApiCallsPerDay() != null ? plan.getMaxApiCallsPerDay() : 0;
                Integer apiCallUsed = membership.getApiCallsUsedToday() != null ? membership.getApiCallsUsedToday() : 0;
                return (apiCallQuota - apiCallUsed) >= amount;
                
            default:
                return false;
        }
    }

    /**
     * 执行配额扣减
     */
    private QuotaResult doConsumeQuota(Membership membership, SubscriptionPlan plan, QuotaType quotaType, 
                                        Long amount, Long relatedRecordId, String relatedRecordType, boolean isOverage) {
        Long quotaBefore = getCurrentUsedQuota(membership, quotaType);
        Long quotaAfter;
        
        // 扣减配额
        switch (quotaType) {
            case TEXT_TOKEN:
                Long textTokenUsed = membership.getTextTokenUsed() != null ? membership.getTextTokenUsed() : 0L;
                membership.setTextTokenUsed(textTokenUsed + amount);
                quotaAfter = membership.getTextTokenUsed();
                break;
                
            case IMAGE:
                Integer imageUsed = membership.getImageGenerationUsed() != null ? membership.getImageGenerationUsed() : 0;
                membership.setImageGenerationUsed(imageUsed + amount.intValue());
                quotaAfter = membership.getImageGenerationUsed().longValue();
                break;
                
            case VIDEO:
                Integer videoUsed = membership.getVideoGenerationUsed() != null ? membership.getVideoGenerationUsed() : 0;
                membership.setVideoGenerationUsed(videoUsed + amount.intValue());
                quotaAfter = membership.getVideoGenerationUsed().longValue();
                break;
                
            case API_CALL:
                // 检查是否需要重置
                if (membership.getApiCallsResetDate() == null || 
                    !membership.getApiCallsResetDate().equals(LocalDate.now())) {
                    membership.setApiCallsUsedToday(0);
                    membership.setApiCallsResetDate(LocalDate.now());
                }
                Integer apiCallUsed = membership.getApiCallsUsedToday() != null ? membership.getApiCallsUsedToday() : 0;
                membership.setApiCallsUsedToday(apiCallUsed + amount.intValue());
                quotaAfter = membership.getApiCallsUsedToday().longValue();
                break;
                
            default:
                throw new IllegalArgumentException("未知的配额类型: " + quotaType);
        }
        
        // 保存会员信息
        membershipRepository.save(membership);
        
        // 记录使用记录
        QuotaUsageRecord record = new QuotaUsageRecord();
        record.setUserId(membership.getUserId());
        record.setMembershipId(membership.getId());
        record.setQuotaType(quotaType.getCode());
        record.setAmountUsed(amount);
        record.setQuotaBefore(quotaBefore);
        record.setQuotaAfter(quotaAfter);
        record.setRelatedRecordId(relatedRecordId);
        record.setRelatedRecordType(relatedRecordType);
        QuotaUsageRecord savedRecord = usageRecordRepository.save(record);
        
        log.info("配额扣减成功: userId={}, quotaType={}, amount={}, before={}, after={}", 
                membership.getUserId(), quotaType, amount, quotaBefore, quotaAfter);
        
        return QuotaResult.builder()
                .success(true)
                .quotaType(quotaType.getCode())
                .amountUsed(amount)
                .quotaBefore(quotaBefore)
                .quotaAfter(quotaAfter)
                .overage(isOverage)
                .usageRecordId(savedRecord.getId())
                .build();
    }

    /**
     * 获取当前已使用的配额
     */
    private Long getCurrentUsedQuota(Membership membership, QuotaType quotaType) {
        switch (quotaType) {
            case TEXT_TOKEN:
                return membership.getTextTokenUsed() != null ? membership.getTextTokenUsed() : 0L;
            case IMAGE:
                return membership.getImageGenerationUsed() != null ? membership.getImageGenerationUsed().longValue() : 0L;
            case VIDEO:
                return membership.getVideoGenerationUsed() != null ? membership.getVideoGenerationUsed().longValue() : 0L;
            case API_CALL:
                return membership.getApiCallsUsedToday() != null ? membership.getApiCallsUsedToday().longValue() : 0L;
            default:
                return 0L;
        }
    }

    /**
     * 处理超量使用
     */
    private QuotaResult handleOverageConsumption(Membership membership, SubscriptionPlan plan, QuotaType quotaType, 
                                                  Long amount, Long relatedRecordId, String relatedRecordType) {
        log.warn("配额不足，处理超量使用: userId={}, quotaType={}, amount={}", 
                membership.getUserId(), quotaType, amount);
        
        // 计算超量部分
        Long available = getAvailableQuota(membership, plan, quotaType);
        Long overageAmount = amount - available;
        
        // 获取超量价格
        BigDecimal unitPrice = getOveragePrice(plan, quotaType);
        BigDecimal totalOverageAmount = unitPrice.multiply(BigDecimal.valueOf(overageAmount));
        
        // 创建超量付费记录
        OverageCharge overageCharge = new OverageCharge();
        overageCharge.setUserId(membership.getUserId());
        overageCharge.setMembershipId(membership.getId());
        overageCharge.setQuotaType(quotaType.getCode());
        overageCharge.setAmountUsed(overageAmount);
        overageCharge.setUnitPrice(unitPrice);
        overageCharge.setTotalAmount(totalOverageAmount);
        overageCharge.setStatus("pending");
        overageChargeRepository.save(overageCharge);
        
        // 先扣减可用配额，超量部分标记为待付费
        // 这里可以选择：1. 拒绝使用 2. 允许使用但标记为超量
        // 当前实现：允许使用，但标记为超量
        
        // 扣减全部配额（包括超量部分）
        QuotaResult result = doConsumeQuota(membership, plan, quotaType, amount, relatedRecordId, relatedRecordType, true);
        result.setOverageAmount(totalOverageAmount);
        
        log.info("超量使用记录已创建: userId={}, quotaType={}, overageAmount={}, totalAmount={}", 
                membership.getUserId(), quotaType, overageAmount, totalOverageAmount);
        
        return result;
    }

    /**
     * 获取可用配额
     */
    private Long getAvailableQuota(Membership membership, SubscriptionPlan plan, QuotaType quotaType) {
        switch (quotaType) {
            case TEXT_TOKEN:
                Long textTokenQuota = plan.getTextTokenQuota() != null ? plan.getTextTokenQuota() : 0L;
                Long textTokenUsed = membership.getTextTokenUsed() != null ? membership.getTextTokenUsed() : 0L;
                return Math.max(0, textTokenQuota - textTokenUsed);
            case IMAGE:
                Integer imageQuota = plan.getImageGenerationQuota() != null ? plan.getImageGenerationQuota() : 0;
                Integer imageUsed = membership.getImageGenerationUsed() != null ? membership.getImageGenerationUsed() : 0;
                return (long) Math.max(0, imageQuota - imageUsed);
            case VIDEO:
                Integer videoQuota = plan.getVideoGenerationQuota() != null ? plan.getVideoGenerationQuota() : 0;
                Integer videoUsed = membership.getVideoGenerationUsed() != null ? membership.getVideoGenerationUsed() : 0;
                return (long) Math.max(0, videoQuota - videoUsed);
            case API_CALL:
                Integer apiCallQuota = plan.getMaxApiCallsPerDay() != null ? plan.getMaxApiCallsPerDay() : 0;
                Integer apiCallUsed = membership.getApiCallsUsedToday() != null ? membership.getApiCallsUsedToday() : 0;
                return (long) Math.max(0, apiCallQuota - apiCallUsed);
            default:
                return 0L;
        }
    }

    /**
     * 获取超量价格
     */
    private BigDecimal getOveragePrice(SubscriptionPlan plan, QuotaType quotaType) {
        switch (quotaType) {
            case TEXT_TOKEN:
                // 价格是每1K tokens，需要转换为每token
                BigDecimal tokenPrice = plan.getOverageTokenPrice() != null ? plan.getOverageTokenPrice() : new BigDecimal("0.02");
                return tokenPrice.divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP);
            case IMAGE:
                return plan.getOverageImagePrice() != null ? plan.getOverageImagePrice() : new BigDecimal("2.00");
            case VIDEO:
                return plan.getOverageVideoPrice() != null ? plan.getOverageVideoPrice() : new BigDecimal("0.50");
            default:
                return BigDecimal.ZERO;
        }
    }

    /**
     * 重置月度配额（定时任务调用）
     */
    @Transactional
    public void resetMonthlyQuota() {
        log.info("开始重置月度配额");
        
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        
        // 查找需要重置的会员（配额重置日期为今天或之前的有效会员）
        membershipRepository.findByStatus("active").forEach(membership -> {
            if (membership.getQuotaResetDate() == null || 
                membership.getQuotaResetDate().isBefore(today) ||
                membership.getQuotaResetDate().equals(firstDayOfMonth)) {
                
                resetMemberMonthlyQuota(membership);
            }
        });
        
        log.info("月度配额重置完成");
    }

    /**
     * 重置单个会员的月度配额
     */
    private void resetMemberMonthlyQuota(Membership membership) {
        log.info("重置会员月度配额: userId={}, membershipId={}", membership.getUserId(), membership.getId());
        
        LocalDate today = LocalDate.now();
        LocalDate nextResetDate = today.plusMonths(1).withDayOfMonth(1);
        
        // 更新重置日期
        membership.setLastQuotaResetDate(membership.getQuotaResetDate());
        membership.setQuotaResetDate(nextResetDate);
        
        // 重置使用量
        membership.setTextTokenUsed(0L);
        membership.setImageGenerationUsed(0);
        membership.setVideoGenerationUsed(0);
        
        membershipRepository.save(membership);
        
        log.info("会员月度配额重置完成: userId={}, nextResetDate={}", membership.getUserId(), nextResetDate);
    }

    /**
     * 重置日度配额（API调用配额，定时任务调用）
     */
    @Transactional
    public void resetDailyQuota() {
        log.info("开始重置日度配额（API调用）");
        
        LocalDate today = LocalDate.now();
        
        // 查找需要重置的会员
        membershipRepository.findByStatus("active").forEach(membership -> {
            if (membership.getApiCallsResetDate() == null || 
                !membership.getApiCallsResetDate().equals(today)) {
                
                membership.setApiCallsUsedToday(0);
                membership.setApiCallsResetDate(today);
                membershipRepository.save(membership);
            }
        });
        
        log.info("日度配额重置完成");
    }

    /**
     * 获取超量价格（对外接口）
     */
    @Transactional(readOnly = true)
    public BigDecimal getOveragePrice(Long userId, QuotaType quotaType) {
        Membership membership = membershipService.getUserMembership(userId)
                .orElseThrow(() -> new RuntimeException("会员不存在: " + userId));
        
        SubscriptionPlan plan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
        
        return getOveragePrice(plan, quotaType);
    }
}
