package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.DashboardStatisticsDTO;
import com.heartsphere.admin.service.DashboardStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Dashboard统计控制器
 */
@RestController
@RequestMapping("/api/admin/dashboard/statistics")
public class DashboardStatisticsController extends BaseAdminController {

    @Autowired
    private DashboardStatisticsService statisticsService;

    /**
     * 获取Dashboard统计数据
     * @param period 时间段：day（默认，最近30天）, month（最近12个月）, year（最近1年）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "day") String period
    ) {
        validateAdmin(authHeader);
        
        DashboardStatisticsDTO statistics = statisticsService.getStatistics(period);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", statistics.getTotalUsers());
        response.put("totalScenes", statistics.getTotalScenes());
        response.put("totalScripts", statistics.getTotalScripts());
        response.put("totalCharacters", statistics.getTotalCharacters());
        response.put("trends", statistics.getTrends());
        
        return ResponseEntity.ok(response);
    }
}


