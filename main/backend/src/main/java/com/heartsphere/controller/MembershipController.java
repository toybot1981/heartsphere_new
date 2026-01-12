package com.heartsphere.controller;

import com.heartsphere.billing.dto.PermissionInfo;
import com.heartsphere.billing.dto.UpgradeResult;
import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.MembershipService;
import com.heartsphere.service.MembershipPermissionService;
import com.heartsphere.service.MembershipUpgradeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 会员管理API
 */
@Slf4j
@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;
    private final MembershipPermissionService permissionService;
    private final MembershipUpgradeService upgradeService;

    /**
     * 获取当前用户的会员信息
     */
    @GetMapping("/current")
    public ResponseEntity<MembershipResponse> getCurrentMembership(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        Membership membership = membershipService.getUserMembership(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));

        MembershipResponse response = new MembershipResponse();
        response.setId(membership.getId());
        response.setPlanType(membership.getPlanType());
        response.setBillingCycle(membership.getBillingCycle());
        response.setStatus(membership.getStatus());
        response.setStartDate(membership.getStartDate());
        response.setEndDate(membership.getEndDate());
        response.setAutoRenew(membership.getAutoRenew());
        response.setNextRenewalDate(membership.getNextRenewalDate());
        response.setCurrentPoints(membership.getCurrentPoints());
        response.setTotalPointsEarned(membership.getTotalPointsEarned());
        response.setTotalPointsUsed(membership.getTotalPointsUsed());

        return ResponseEntity.ok(response);
    }

    /**
     * 获取所有订阅计划
     */
    @GetMapping(value = "/plans", produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SubscriptionPlanResponse>> getAllPlans(
            @RequestParam(required = false) String billingCycle) {
        List<SubscriptionPlan> plans;
        if (billingCycle != null && !billingCycle.isEmpty()) {
            plans = membershipService.getPlansByBillingCycle(billingCycle);
        } else {
            plans = membershipService.getAllPlans();
        }

        List<SubscriptionPlanResponse> responses = plans.stream()
                .map(plan -> {
                    SubscriptionPlanResponse resp = new SubscriptionPlanResponse();
                    resp.setId(plan.getId());
                    resp.setName(plan.getName());
                    resp.setType(plan.getType());
                    resp.setBillingCycle(plan.getBillingCycle());
                    resp.setPrice(plan.getPrice());
                    resp.setOriginalPrice(plan.getOriginalPrice());
                    resp.setDiscountPercent(plan.getDiscountPercent());
                    resp.setPointsPerMonth(plan.getPointsPerMonth());
                    resp.setMaxImagesPerMonth(plan.getMaxImagesPerMonth());
                    resp.setMaxVideosPerMonth(plan.getMaxVideosPerMonth());
                    resp.setFeatures(plan.getFeatures());
                    return resp;
                })
                .toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * 获取权限信息
     */
    @GetMapping("/permissions")
    public ResponseEntity<PermissionInfo> getPermissions(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        PermissionInfo permissions = permissionService.getPermissionInfo(userId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 获取升级价格
     */
    @GetMapping("/upgrade/price")
    public ResponseEntity<UpgradePriceResponse> getUpgradePrice(
            @RequestParam Long targetPlanId,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            BigDecimal price = upgradeService.calculateUpgradePrice(userId, targetPlanId);
            
            // 获取目标计划信息
            SubscriptionPlan targetPlan = membershipService.getAllPlans().stream()
                    .filter(p -> p.getId().equals(targetPlanId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("目标计划不存在"));

            // 获取当前会员信息来计算剩余价值
            Membership membership = membershipService.getUserMembership(userId)
                    .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
            SubscriptionPlan currentPlan = membershipService.getAllPlans().stream()
                    .filter(p -> p.getId().equals(membership.getPlanId()))
                    .findFirst()
                    .orElse(null);
            
            // 计算剩余价值（简化处理，实际应该调用upgradeService的内部方法）
            BigDecimal remainingValue = BigDecimal.ZERO;
            if (currentPlan != null && !"free".equals(currentPlan.getType())) {
                // 这里简化处理，实际应该调用calculateRemainingValue方法
                // 为了保持简单，暂时设为0
                remainingValue = BigDecimal.ZERO;
            }

            UpgradePriceResponse response = new UpgradePriceResponse();
            response.setTargetPlanId(targetPlanId);
            response.setTargetPlanName(targetPlan.getName());
            response.setPrice(targetPlan.getPrice().doubleValue());
            response.setProRatedAmount(remainingValue.doubleValue());
            response.setTotalPrice(price.doubleValue());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取升级价格失败: userId={}, targetPlanId={}", userId, targetPlanId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 升级会员
     */
    @PostMapping("/upgrade")
    public ResponseEntity<UpgradeResult> upgradeMembership(
            @RequestBody UpgradeRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            UpgradeResult result = upgradeService.upgradeMembership(userId, request.getTargetPlanId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("升级会员失败: userId={}, targetPlanId={}", userId, request.getTargetPlanId(), e);
            UpgradeResult errorResult = new UpgradeResult();
            errorResult.setSuccess(false);
            errorResult.setErrorMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }

    /**
     * 降级会员
     */
    @PostMapping("/downgrade")
    public ResponseEntity<UpgradeResult> downgradeMembership(
            @RequestBody UpgradeRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            UpgradeResult result = upgradeService.downgradeMembership(userId, request.getTargetPlanId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("降级会员失败: userId={}, targetPlanId={}", userId, request.getTargetPlanId(), e);
            UpgradeResult errorResult = new UpgradeResult();
            errorResult.setSuccess(false);
            errorResult.setErrorMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }

    @Data
    public static class UpgradeRequest {
        private Long targetPlanId;
    }

    @Data
    public static class UpgradePriceResponse {
        private Long targetPlanId;
        private String targetPlanName;
        private Double price;
        private Double proRatedAmount;
        private Double totalPrice;
    }

    @Data
    public static class MembershipResponse {
        private Long id;
        private String planType;
        private String billingCycle;
        private String status;
        private java.time.LocalDateTime startDate;
        private java.time.LocalDateTime endDate;
        private Boolean autoRenew;
        private java.time.LocalDateTime nextRenewalDate;
        private Integer currentPoints;
        private Integer totalPointsEarned;
        private Integer totalPointsUsed;
    }

    @Data
    public static class SubscriptionPlanResponse {
        private Long id;
        private String name;
        private String type;
        private String billingCycle;
        private java.math.BigDecimal price;
        private java.math.BigDecimal originalPrice;
        private Integer discountPercent;
        private Integer pointsPerMonth;
        private Integer maxImagesPerMonth;
        private Integer maxVideosPerMonth;
        private String features;
    }
}

