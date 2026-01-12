package com.heartsphere.admin.controller.edu;

import com.heartsphere.admin.controller.BaseAdminController;
import com.heartsphere.admin.service.edu.AdminEduAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 教育版数据分析控制器
 * 用于在统一管理后台中查看教育版的数据分析报表
 */
@RestController
@RequestMapping("/api/admin/edu/analytics")
public class AdminEduAnalyticsController extends BaseAdminController {

    @Autowired
    private AdminEduAnalyticsService adminEduAnalyticsService;

    /**
     * 获取教育版总体统计
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview(
            @RequestHeader("Authorization") String authHeader
    ) {
        validateAdmin(authHeader);
        Map<String, Object> overview = adminEduAnalyticsService.getOverview();
        return ResponseEntity.ok(overview);
    }

    /**
     * 获取用户增长趋势
     */
    @GetMapping("/user-growth")
    public ResponseEntity<Map<String, Object>> getUserGrowth(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        validateAdmin(authHeader);
        Map<String, Object> growth = adminEduAnalyticsService.getUserGrowth(startDate, endDate);
        return ResponseEntity.ok(growth);
    }

    /**
     * 获取学习活动统计
     */
    @GetMapping("/learning-activities")
    public ResponseEntity<Map<String, Object>> getLearningActivities(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        validateAdmin(authHeader);
        Map<String, Object> activities = adminEduAnalyticsService.getLearningActivities(startDate, endDate);
        return ResponseEntity.ok(activities);
    }

    /**
     * 获取作业完成情况统计
     */
    @GetMapping("/homework-completion")
    public ResponseEntity<Map<String, Object>> getHomeworkCompletion(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        validateAdmin(authHeader);
        Map<String, Object> completion = adminEduAnalyticsService.getHomeworkCompletion(startDate, endDate);
        return ResponseEntity.ok(completion);
    }
}
