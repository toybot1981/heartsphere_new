package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.AICostDaily;
import com.heartsphere.billing.repository.AICostDailyRepository;
import com.heartsphere.billing.service.CostStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 成本统计控制器
 */
@RestController
@RequestMapping("/api/admin/billing/cost")
public class AdminBillingCostController extends BaseAdminController {

    @Autowired
    private AICostDailyRepository costDailyRepository;

    @Autowired
    private CostStatisticsService costStatisticsService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    /**
     * 获取每日成本统计
     */
    @GetMapping("/daily")
    public ResponseEntity<List<AICostDaily>> getDailyCostStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Long modelId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Specification<AICostDaily> spec = (root, query, cb) -> {
            java.util.List<Predicate> predicates = new java.util.ArrayList<>();
            
            if (startDate != null && !startDate.isEmpty()) {
                try {
                    LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("statDate"), start));
                } catch (Exception e) {
                    // 忽略无效日期
                }
            }
            if (endDate != null && !endDate.isEmpty()) {
                try {
                    LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
                    predicates.add(cb.lessThanOrEqualTo(root.get("statDate"), end));
                } catch (Exception e) {
                    // 忽略无效日期
                }
            }
            if (providerId != null) {
                predicates.add(cb.equal(root.get("providerId"), providerId));
            }
            if (modelId != null) {
                predicates.add(cb.equal(root.get("modelId"), modelId));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        List<AICostDaily> stats = costDailyRepository.findAll(spec);
        return ResponseEntity.ok(stats);
    }

    /**
     * 手动触发成本统计汇总
     * @param date 要汇总的日期（格式：yyyy-MM-dd），如果不提供则汇总昨天
     * @param days 要汇总最近N天的数据（如果提供了date则忽略此参数）
     */
    @PostMapping("/aggregate")
    public ResponseEntity<Map<String, Object>> aggregateCostStats(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Integer days,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (date != null && !date.isEmpty()) {
                // 汇总指定日期
                LocalDate targetDate = LocalDate.parse(date, DATE_FORMATTER);
                costStatisticsService.aggregateCostForDate(targetDate);
                result.put("success", true);
                result.put("message", "已成功汇总日期: " + date);
                result.put("date", date);
            } else if (days != null && days > 0) {
                // 汇总最近N天
                costStatisticsService.aggregateRecentDays(days);
                result.put("success", true);
                result.put("message", "已成功汇总最近 " + days + " 天的数据");
                result.put("days", days);
            } else {
                // 默认汇总昨天
                LocalDate yesterday = LocalDate.now().minusDays(1);
                costStatisticsService.aggregateCostForDate(yesterday);
                result.put("success", true);
                result.put("message", "已成功汇总昨天(" + yesterday + ")的数据");
                result.put("date", yesterday.toString());
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "汇总失败: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * 汇总指定日期范围的数据
     */
    @PostMapping("/aggregate/range")
    public ResponseEntity<Map<String, Object>> aggregateCostStatsRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
            
            if (start.isAfter(end)) {
                result.put("success", false);
                result.put("message", "开始日期不能晚于结束日期");
                return ResponseEntity.badRequest().body(result);
            }
            
            costStatisticsService.aggregateDateRange(start, end);
            result.put("success", true);
            result.put("message", "已成功汇总日期范围: " + startDate + " 到 " + endDate);
            result.put("startDate", startDate);
            result.put("endDate", endDate);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "汇总失败: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
}
