package com.heartsphere.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.billing.dto.UpgradeResult;
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
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

/**
 * 会员升级/降级服务
 * 负责处理会员计划的升级、降级、价格计算和配额转换
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipUpgradeService {

    private final MembershipRepository membershipRepository;
    private final SubscriptionPlanRepository planRepository;
    private final MembershipService membershipService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 升级会员
     * @param userId 用户ID
     * @param targetPlanId 目标计划ID
     * @return 升级结果
     */
    @Transactional
    public UpgradeResult upgradeMembership(Long userId, Long targetPlanId) {
        log.info("开始升级会员: userId={}, targetPlanId={}", userId, targetPlanId);
        
        // 获取当前会员信息
        Membership currentMembership = membershipService.getUserMembership(userId)
                .orElseThrow(() -> new RuntimeException("会员不存在: " + userId));
        
        // 获取当前计划和目标计划
        SubscriptionPlan currentPlan = planRepository.findById(currentMembership.getPlanId())
                .orElseThrow(() -> new RuntimeException("当前订阅计划不存在: " + currentMembership.getPlanId()));
        
        SubscriptionPlan targetPlan = planRepository.findById(targetPlanId)
                .orElseThrow(() -> new RuntimeException("目标订阅计划不存在: " + targetPlanId));
        
        // 验证是否可以升级
        if (!canUpgrade(currentPlan, targetPlan)) {
            return UpgradeResult.builder()
                    .success(false)
                    .userId(userId)
                    .fromPlanId(currentPlan.getId())
                    .toPlanId(targetPlanId)
                    .operationType("upgrade")
                    .errorMessage("不能从当前计划升级到目标计划")
                    .build();
        }
        
        // 计算升级价格
        BigDecimal upgradePrice = calculateUpgradePrice(currentMembership, currentPlan, targetPlan);
        
        // 转换配额
        convertQuota(currentMembership, currentPlan, targetPlan);
        
        // 更新会员信息
        updateMembershipForUpgrade(currentMembership, targetPlan);
        
        Membership savedMembership = membershipRepository.save(currentMembership);
        
        log.info("会员升级成功: userId={}, fromPlanId={}, toPlanId={}, price={}", 
                userId, currentPlan.getId(), targetPlanId, upgradePrice);
        
        // 构建配额转换信息
        String quotaConversionInfo = buildQuotaConversionInfo(currentMembership, currentPlan, targetPlan);
        
        return UpgradeResult.builder()
                .success(true)
                .userId(userId)
                .fromPlanId(currentPlan.getId())
                .toPlanId(targetPlanId)
                .operationType("upgrade")
                .amount(upgradePrice)
                .targetPlanPrice(targetPlan.getPrice())
                .actualPaymentAmount(upgradePrice)
                .quotaConversionInfo(quotaConversionInfo)
                .membershipId(savedMembership.getId())
                .membershipStatus(savedMembership.getStatus())
                .newEndDate(savedMembership.getEndDate())
                .build();
    }

    /**
     * 降级会员
     * @param userId 用户ID
     * @param targetPlanId 目标计划ID
     * @return 降级结果
     */
    @Transactional
    public UpgradeResult downgradeMembership(Long userId, Long targetPlanId) {
        log.info("开始降级会员: userId={}, targetPlanId={}", userId, targetPlanId);
        
        // 获取当前会员信息
        Membership currentMembership = membershipService.getUserMembership(userId)
                .orElseThrow(() -> new RuntimeException("会员不存在: " + userId));
        
        // 获取当前计划和目标计划
        SubscriptionPlan currentPlan = planRepository.findById(currentMembership.getPlanId())
                .orElseThrow(() -> new RuntimeException("当前订阅计划不存在: " + currentMembership.getPlanId()));
        
        SubscriptionPlan targetPlan = planRepository.findById(targetPlanId)
                .orElseThrow(() -> new RuntimeException("目标订阅计划不存在: " + targetPlanId));
        
        // 验证是否可以降级
        if (!canDowngrade(currentPlan, targetPlan)) {
            return UpgradeResult.builder()
                    .success(false)
                    .userId(userId)
                    .fromPlanId(currentPlan.getId())
                    .toPlanId(targetPlanId)
                    .operationType("downgrade")
                    .errorMessage("不能从当前计划降级到目标计划")
                    .build();
        }
        
        // 处理降级配额（需要调整到目标计划的配额限制内）
        adjustQuotaForDowngrade(currentMembership, currentPlan, targetPlan);
        
        // 更新会员信息（降级通常在下个周期生效，或者立即生效但保留当前周期）
        updateMembershipForDowngrade(currentMembership, targetPlan);
        
        Membership savedMembership = membershipRepository.save(currentMembership);
        
        log.info("会员降级成功: userId={}, fromPlanId={}, toPlanId={}", 
                userId, currentPlan.getId(), targetPlanId);
        
        // 构建配额转换信息
        String quotaConversionInfo = buildQuotaConversionInfo(currentMembership, currentPlan, targetPlan);
        
        return UpgradeResult.builder()
                .success(true)
                .userId(userId)
                .fromPlanId(currentPlan.getId())
                .toPlanId(targetPlanId)
                .operationType("downgrade")
                .amount(BigDecimal.ZERO) // 降级通常不退款，下个周期生效
                .targetPlanPrice(targetPlan.getPrice())
                .actualPaymentAmount(BigDecimal.ZERO)
                .quotaConversionInfo(quotaConversionInfo)
                .membershipId(savedMembership.getId())
                .membershipStatus(savedMembership.getStatus())
                .newEndDate(savedMembership.getEndDate())
                .build();
    }

    /**
     * 计算升级价格
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateUpgradePrice(Long userId, Long targetPlanId) {
        Membership membership = membershipService.getUserMembership(userId)
                .orElseThrow(() -> new RuntimeException("会员不存在: " + userId));
        
        SubscriptionPlan currentPlan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("当前订阅计划不存在: " + membership.getPlanId()));
        
        SubscriptionPlan targetPlan = planRepository.findById(targetPlanId)
                .orElseThrow(() -> new RuntimeException("目标订阅计划不存在: " + targetPlanId));
        
        return calculateUpgradePrice(membership, currentPlan, targetPlan);
    }

    /**
     * 计算升级价格（内部方法）
     * 按比例计算：剩余时间价值 + 目标计划价格 - 当前计划剩余价值
     */
    private BigDecimal calculateUpgradePrice(Membership membership, SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        // 如果当前计划是免费计划，直接返回目标计划价格
        if ("free".equals(currentPlan.getType())) {
            return targetPlan.getPrice();
        }
        
        // 计算剩余时间价值
        BigDecimal remainingValue = calculateRemainingValue(membership, currentPlan);
        
        // 目标计划价格
        BigDecimal targetPrice = targetPlan.getPrice();
        
        // 升级价格 = 目标计划价格 - 剩余价值
        BigDecimal upgradePrice = targetPrice.subtract(remainingValue);
        
        // 确保价格不为负数
        if (upgradePrice.compareTo(BigDecimal.ZERO) < 0) {
            upgradePrice = BigDecimal.ZERO;
        }
        
        log.info("计算升级价格: currentPlan={}, targetPlan={}, remainingValue={}, upgradePrice={}", 
                currentPlan.getType(), targetPlan.getType(), remainingValue, upgradePrice);
        
        return upgradePrice.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 计算剩余时间价值
     */
    private BigDecimal calculateRemainingValue(Membership membership, SubscriptionPlan plan) {
        LocalDateTime now = LocalDateTime.now();
        
        // 对于连续包月/包年，使用nextRenewalDate
        LocalDateTime endDate = membership.getEndDate();
        if (endDate == null && membership.getNextRenewalDate() != null) {
            endDate = membership.getNextRenewalDate();
        }
        
        if (endDate == null || endDate.isBefore(now) || endDate.isEqual(now)) {
            return BigDecimal.ZERO;
        }
        
        // 计算剩余天数
        long totalDays = ChronoUnit.DAYS.between(membership.getStartDate(), endDate);
        long remainingDays = ChronoUnit.DAYS.between(now, endDate);
        
        if (totalDays <= 0 || remainingDays <= 0) {
            return BigDecimal.ZERO;
        }
        
        // 按比例计算剩余价值
        BigDecimal planPrice = plan.getPrice();
        BigDecimal remainingValue = planPrice
                .multiply(BigDecimal.valueOf(remainingDays))
                .divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
        
        return remainingValue.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 转换配额（升级时按比例转换）
     */
    private void convertQuota(Membership membership, SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        // 计算转换比例（基于配额比例）
        double conversionRatio = calculateQuotaConversionRatio(currentPlan, targetPlan);
        
        // 转换文本Token配额使用量
        if (membership.getTextTokenUsed() != null && membership.getTextTokenUsed() > 0) {
            Long currentQuota = currentPlan.getTextTokenQuota() != null ? currentPlan.getTextTokenQuota() : 0L;
            Long targetQuota = targetPlan.getTextTokenQuota() != null ? targetPlan.getTextTokenQuota() : 0L;
            
            if (currentQuota > 0 && targetQuota > 0) {
                // 按比例转换使用量
                Long convertedUsed = Math.round(membership.getTextTokenUsed() * (targetQuota.doubleValue() / currentQuota.doubleValue()));
                // 但不超过目标配额
                membership.setTextTokenUsed(Math.min(convertedUsed, targetQuota));
            } else {
                // 如果目标配额为0，重置使用量
                membership.setTextTokenUsed(0L);
            }
        }
        
        // 转换图片配额使用量
        if (membership.getImageGenerationUsed() != null && membership.getImageGenerationUsed() > 0) {
            Integer currentQuota = currentPlan.getImageGenerationQuota() != null ? currentPlan.getImageGenerationQuota() : 0;
            Integer targetQuota = targetPlan.getImageGenerationQuota() != null ? targetPlan.getImageGenerationQuota() : 0;
            
            if (currentQuota > 0 && targetQuota > 0) {
                Integer convertedUsed = (int) Math.round(membership.getImageGenerationUsed() * (targetQuota.doubleValue() / currentQuota.doubleValue()));
                membership.setImageGenerationUsed(Math.min(convertedUsed, targetQuota));
            } else {
                membership.setImageGenerationUsed(0);
            }
        }
        
        // 转换视频配额使用量
        if (membership.getVideoGenerationUsed() != null && membership.getVideoGenerationUsed() > 0) {
            Integer currentQuota = currentPlan.getVideoGenerationQuota() != null ? currentPlan.getVideoGenerationQuota() : 0;
            Integer targetQuota = targetPlan.getVideoGenerationQuota() != null ? targetPlan.getVideoGenerationQuota() : 0;
            
            if (currentQuota > 0 && targetQuota > 0) {
                Integer convertedUsed = (int) Math.round(membership.getVideoGenerationUsed() * (targetQuota.doubleValue() / currentQuota.doubleValue()));
                membership.setVideoGenerationUsed(Math.min(convertedUsed, targetQuota));
            } else {
                membership.setVideoGenerationUsed(0);
            }
        }
        
        log.info("配额转换完成: userId={}, conversionRatio={}", membership.getUserId(), conversionRatio);
    }

    /**
     * 计算配额转换比例
     */
    private double calculateQuotaConversionRatio(SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        Long currentQuota = currentPlan.getTextTokenQuota() != null ? currentPlan.getTextTokenQuota() : 0L;
        Long targetQuota = targetPlan.getTextTokenQuota() != null ? targetPlan.getTextTokenQuota() : 0L;
        
        if (currentQuota == 0 || targetQuota == 0) {
            return 1.0;
        }
        
        return targetQuota.doubleValue() / currentQuota.doubleValue();
    }

    /**
     * 调整降级配额（确保不超过目标计划的配额限制）
     */
    private void adjustQuotaForDowngrade(Membership membership, SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        // 文本Token：如果使用量超过目标配额，调整为目标配额
        Long targetTokenQuota = targetPlan.getTextTokenQuota() != null ? targetPlan.getTextTokenQuota() : 0L;
        if (membership.getTextTokenUsed() != null && targetTokenQuota > 0) {
            membership.setTextTokenUsed(Math.min(membership.getTextTokenUsed(), targetTokenQuota));
        }
        
        // 图片配额
        Integer targetImageQuota = targetPlan.getImageGenerationQuota() != null ? targetPlan.getImageGenerationQuota() : 0;
        if (membership.getImageGenerationUsed() != null && targetImageQuota > 0) {
            membership.setImageGenerationUsed(Math.min(membership.getImageGenerationUsed(), targetImageQuota));
        }
        
        // 视频配额
        Integer targetVideoQuota = targetPlan.getVideoGenerationQuota() != null ? targetPlan.getVideoGenerationQuota() : 0;
        if (membership.getVideoGenerationUsed() != null && targetVideoQuota > 0) {
            membership.setVideoGenerationUsed(Math.min(membership.getVideoGenerationUsed(), targetVideoQuota));
        }
        
        log.info("降级配额调整完成: userId={}", membership.getUserId());
    }

    /**
     * 更新会员信息（升级）
     */
    private void updateMembershipForUpgrade(Membership membership, SubscriptionPlan targetPlan) {
        // 保存升级前的计划ID（在更新之前）
        Long oldPlanId = membership.getPlanId();
        
        membership.setPlanId(targetPlan.getId());
        membership.setPlanType(targetPlan.getType());
        membership.setRenewalPrice(targetPlan.getPrice());
        membership.setUpgradeFromPlanId(oldPlanId); // 保存升级前的计划ID
        
        // 如果是连续包月/包年，更新nextRenewalDate
        if (membership.getNextRenewalDate() != null) {
            // 保持原有的续费日期
            // 可以根据业务需求调整
        }
    }

    /**
     * 更新会员信息（降级）
     */
    private void updateMembershipForDowngrade(Membership membership, SubscriptionPlan targetPlan) {
        // 降级通常在下个周期生效
        // 当前实现：立即生效，但保留当前周期结束时间
        membership.setPlanId(targetPlan.getId());
        membership.setPlanType(targetPlan.getType());
        membership.setRenewalPrice(targetPlan.getPrice());
        
        // 可以添加降级标记，在下个周期生效
        // 当前实现：立即生效
    }

    /**
     * 检查是否可以升级
     */
    private boolean canUpgrade(SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        // 简单的层级判断：free < basic < standard < premium
        int currentLevel = getPlanLevel(currentPlan.getType());
        int targetLevel = getPlanLevel(targetPlan.getType());
        
        return targetLevel > currentLevel;
    }

    /**
     * 检查是否可以降级
     */
    private boolean canDowngrade(SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        // 简单的层级判断
        int currentLevel = getPlanLevel(currentPlan.getType());
        int targetLevel = getPlanLevel(targetPlan.getType());
        
        return targetLevel < currentLevel;
    }

    /**
     * 获取计划层级
     */
    private int getPlanLevel(String planType) {
        switch (planType) {
            case "free":
                return 0;
            case "basic":
                return 1;
            case "standard":
                return 2;
            case "premium":
                return 3;
            default:
                return 0;
        }
    }

    /**
     * 构建配额转换信息（JSON格式）
     */
    private String buildQuotaConversionInfo(Membership membership, SubscriptionPlan currentPlan, SubscriptionPlan targetPlan) {
        try {
            Map<String, Object> conversionInfo = new HashMap<>();
            conversionInfo.put("textToken", Map.of(
                    "fromQuota", currentPlan.getTextTokenQuota() != null ? currentPlan.getTextTokenQuota() : 0L,
                    "toQuota", targetPlan.getTextTokenQuota() != null ? targetPlan.getTextTokenQuota() : 0L,
                    "used", membership.getTextTokenUsed() != null ? membership.getTextTokenUsed() : 0L
            ));
            conversionInfo.put("image", Map.of(
                    "fromQuota", currentPlan.getImageGenerationQuota() != null ? currentPlan.getImageGenerationQuota() : 0,
                    "toQuota", targetPlan.getImageGenerationQuota() != null ? targetPlan.getImageGenerationQuota() : 0,
                    "used", membership.getImageGenerationUsed() != null ? membership.getImageGenerationUsed() : 0
            ));
            conversionInfo.put("video", Map.of(
                    "fromQuota", currentPlan.getVideoGenerationQuota() != null ? currentPlan.getVideoGenerationQuota() : 0,
                    "toQuota", targetPlan.getVideoGenerationQuota() != null ? targetPlan.getVideoGenerationQuota() : 0,
                    "used", membership.getVideoGenerationUsed() != null ? membership.getVideoGenerationUsed() : 0
            ));
            
            return objectMapper.writeValueAsString(conversionInfo);
        } catch (Exception e) {
            log.error("构建配额转换信息失败", e);
            return "{}";
        }
    }
}
