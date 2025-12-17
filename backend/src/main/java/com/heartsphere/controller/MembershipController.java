package com.heartsphere.controller;

import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.MembershipService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 会员管理API
 */
@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

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

