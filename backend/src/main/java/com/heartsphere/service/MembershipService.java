package com.heartsphere.service;

import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.entity.PointTransaction;
import com.heartsphere.repository.MembershipRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
import com.heartsphere.repository.PointTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 会员服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final SubscriptionPlanRepository planRepository;
    private final PointTransactionRepository pointTransactionRepository;

    /**
     * 获取用户的会员信息
     */
    public Optional<Membership> getUserMembership(Long userId) {
        return membershipRepository.findByUserId(userId);
    }

    /**
     * 获取或创建免费会员
     */
    @Transactional
    public Membership getOrCreateFreeMembership(Long userId) {
        Optional<Membership> existing = membershipRepository.findByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        // 获取免费计划
        SubscriptionPlan freePlan = planRepository.findByTypeAndIsActiveTrueOrderBySortOrderAsc("free")
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("免费计划不存在"));

        // 创建免费会员
        Membership membership = new Membership();
        membership.setUserId(userId);
        membership.setPlanId(freePlan.getId());
        membership.setPlanType("free");
        membership.setBillingCycle("monthly");
        membership.setStatus("active");
        membership.setStartDate(LocalDateTime.now());
        membership.setAutoRenew(false);
        membership.setCurrentPoints(0);
        membership.setTotalPointsEarned(0);
        membership.setTotalPointsUsed(0);

        return membershipRepository.save(membership);
    }

    /**
     * 激活会员（支付成功后调用）
     */
    @Transactional
    public Membership activateMembership(Long userId, Long planId, String billingCycle) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("订阅计划不存在"));

        // 获取或创建会员记录
        Membership membership = membershipRepository.findByUserId(userId)
                .orElse(new Membership());

        // 计算结束时间
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = null;
        LocalDateTime nextRenewalDate = null;

        if (billingCycle.equals("monthly")) {
            endDate = startDate.plusMonths(1);
        } else if (billingCycle.equals("yearly")) {
            endDate = startDate.plusYears(1);
        } else if (billingCycle.equals("continuous_monthly")) {
            nextRenewalDate = startDate.plusMonths(1);
            membership.setAutoRenew(true);
        } else if (billingCycle.equals("continuous_yearly")) {
            nextRenewalDate = startDate.plusYears(1);
            membership.setAutoRenew(true);
        }

        // 更新会员信息
        membership.setUserId(userId);
        membership.setPlanId(planId);
        membership.setPlanType(plan.getType());
        membership.setBillingCycle(billingCycle);
        membership.setStatus("active");
        membership.setStartDate(startDate);
        membership.setEndDate(endDate);
        membership.setNextRenewalDate(nextRenewalDate);
        membership.setRenewalPrice(plan.getPrice());

        // 如果是新会员，初始化积分
        if (membership.getId() == null) {
            membership.setCurrentPoints(0);
            membership.setTotalPointsEarned(0);
            membership.setTotalPointsUsed(0);
        }

        Membership saved = membershipRepository.save(membership);

        // 添加每月积分
        if (plan.getPointsPerMonth() > 0) {
            addPoints(userId, saved.getId(), plan.getPointsPerMonth(), "会员激活赠送", null);
        }

        log.info("会员激活成功: userId={}, planId={}, billingCycle={}", userId, planId, billingCycle);
        return saved;
    }

    /**
     * 添加积分
     */
    @Transactional
    public void addPoints(Long userId, Long membershipId, Integer points, String description, Long orderId) {
        Membership membership = membershipRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("会员不存在"));

        Integer newBalance = membership.getCurrentPoints() + points;
        membership.setCurrentPoints(newBalance);
        membership.setTotalPointsEarned(membership.getTotalPointsEarned() + points);
        membershipRepository.save(membership);

        // 记录积分交易
        PointTransaction transaction = new PointTransaction();
        transaction.setUserId(userId);
        transaction.setMembershipId(membershipId);
        transaction.setType("earn");
        transaction.setAmount(points);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription(description);
        transaction.setRelatedOrderId(orderId);
        pointTransactionRepository.save(transaction);

        log.info("积分添加成功: userId={}, points={}, balance={}", userId, points, newBalance);
    }

    /**
     * 使用积分
     */
    @Transactional
    public boolean usePoints(Long userId, Integer points, String description) {
        Membership membership = membershipRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("会员不存在"));

        if (membership.getCurrentPoints() < points) {
            return false;
        }

        Integer newBalance = membership.getCurrentPoints() - points;
        membership.setCurrentPoints(newBalance);
        membership.setTotalPointsUsed(membership.getTotalPointsUsed() + points);
        membershipRepository.save(membership);

        // 记录积分交易
        PointTransaction transaction = new PointTransaction();
        transaction.setUserId(userId);
        transaction.setMembershipId(membership.getId());
        transaction.setType("use");
        transaction.setAmount(-points);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription(description);
        pointTransactionRepository.save(transaction);

        log.info("积分使用成功: userId={}, points={}, balance={}", userId, points, newBalance);
        return true;
    }

    /**
     * 获取所有订阅计划
     */
    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    /**
     * 根据计费周期获取计划
     */
    public List<SubscriptionPlan> getPlansByBillingCycle(String billingCycle) {
        return planRepository.findByBillingCycleAndIsActiveTrueOrderBySortOrderAsc(billingCycle);
    }
}

