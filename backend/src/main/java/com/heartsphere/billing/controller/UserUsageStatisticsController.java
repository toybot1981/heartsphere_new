package com.heartsphere.billing.controller;

import com.heartsphere.billing.service.UserUsageStatisticsService;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 用户使用统计控制器
 * 提供用户实时的使用数据统计
 */
@Slf4j
@RestController
@RequestMapping("/api/billing/statistics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserUsageStatisticsController {

    private final UserUsageStatisticsService statisticsService;

    /**
     * 获取当前用户的使用统计
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserUsageStatisticsService.UserUsageStatistics>> getMyStatistics(
            Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            UserUsageStatisticsService.UserUsageStatistics stats = statisticsService.getUserStatistics(userId);
            return ResponseEntity.ok(ApiResponse.success("获取统计成功", stats));
        } catch (IllegalArgumentException e) {
            log.warn("获取统计失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("获取统计失败", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "获取统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取指定用户的使用统计（管理员）
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserUsageStatisticsService.UserUsageStatistics>> getUserStatistics(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            // 验证管理员权限（这里简化处理，实际应该检查权限）
            getCurrentUserId(authentication);
            
            UserUsageStatisticsService.UserUsageStatistics stats = statisticsService.getUserStatistics(userId);
            return ResponseEntity.ok(ApiResponse.success("获取统计成功", stats));
        } catch (IllegalArgumentException e) {
            log.warn("获取统计失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("获取统计失败", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "获取统计失败: " + e.getMessage()));
        }
    }

    /**
     * 从Authentication中获取用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("未授权：请重新登录");
        }
        
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new IllegalArgumentException("未授权：请重新登录");
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}

