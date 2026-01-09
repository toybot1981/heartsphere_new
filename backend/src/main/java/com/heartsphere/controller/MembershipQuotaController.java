package com.heartsphere.controller;

import com.heartsphere.billing.dto.QuotaInfo;
import com.heartsphere.billing.dto.UsageStats;
import com.heartsphere.service.QuotaManagementService;
import com.heartsphere.service.UsageStatisticsService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 会员配额管理API
 */
@Slf4j
@RestController
@RequestMapping("/api/membership/quota")
@RequiredArgsConstructor
public class MembershipQuotaController {

    private final QuotaManagementService quotaManagementService;
    private final UsageStatisticsService usageStatisticsService;

    /**
     * 获取当前配额信息
     */
    @GetMapping
    public ResponseEntity<QuotaInfo> getQuotaInfo(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        QuotaInfo quotaInfo = quotaManagementService.getQuotaInfo(userId);
        return ResponseEntity.ok(quotaInfo);
    }

    /**
     * 获取当前周期使用统计
     */
    @GetMapping("/usage")
    public ResponseEntity<UsageStats> getUsageStats(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        UsageStats stats = usageStatisticsService.getCurrentPeriodStats(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取历史使用统计（每日）
     */
    @GetMapping("/usage/history")
    public ResponseEntity<List<UsageStats.DailyUsage>> getDailyUsage(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<UsageStats.DailyUsage> dailyUsage = usageStatisticsService.getDailyUsage(
                userId, startDate, endDate);
        return ResponseEntity.ok(dailyUsage);
    }
}
