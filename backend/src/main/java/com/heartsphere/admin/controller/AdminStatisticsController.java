package com.heartsphere.admin.controller;

import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsController extends BaseAdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JournalEntryRepository journalEntryRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired
    private EraRepository eraRepository;

    /**
     * 获取总体统计数据
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(
            @RequestHeader("Authorization") String authHeader
    ) {
        validateAdmin(authHeader);
        
        Map<String, Object> stats = new HashMap<>();
        
        // 总用户数
        stats.put("totalUsers", userRepository.count());
        
        // 启用用户数
        stats.put("enabledUsers", userRepository.count());
        
        // 总日记数
        stats.put("totalJournals", journalEntryRepository.count());
        
        // 总角色数
        stats.put("totalCharacters", characterRepository.count());
        
        // 总场景数
        stats.put("totalEras", eraRepository.count());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取每日统计数据（支持指定日期范围，默认最近7天）
     */
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyStatistics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "7") int days
    ) {
        validateAdmin(authHeader);
        
        // 如果没有指定日期范围，默认使用最近N天
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(days - 1);
        }
        
        List<Map<String, Object>> dailyStats = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime startDateTime = currentDate.atStartOfDay();
            LocalDateTime endDateTime = currentDate.atTime(LocalTime.MAX);
            
            Map<String, Object> dayStats = new HashMap<>();
            dayStats.put("date", currentDate.toString());
            
            // 当日注册用户数
            Long userCount = userRepository.countByCreatedAtBetween(startDateTime, endDateTime.plusDays(1));
            dayStats.put("newUsers", userCount);
            
            // 当日新增日记数
            Long journalCount = journalEntryRepository.countByCreatedAtBetween(startDateTime, endDateTime.plusDays(1));
            dayStats.put("newJournals", journalCount);
            
            // 当日新增角色数
            Long characterCount = characterRepository.countByCreatedAtBetween(startDateTime, endDateTime.plusDays(1));
            dayStats.put("newCharacters", characterCount);
            
            // 当日新增场景数
            Long eraCount = eraRepository.countByCreatedAtBetween(startDateTime, endDateTime.plusDays(1));
            dayStats.put("newEras", eraCount);
            
            dailyStats.add(dayStats);
            currentDate = currentDate.plusDays(1);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("startDate", startDate.toString());
        response.put("endDate", endDate.toString());
        response.put("dailyStats", dailyStats);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取趋势数据（按周统计）
     */
    @GetMapping("/trends")
    public ResponseEntity<?> getTrends(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "7") int weeks
    ) {
        validateAdmin(authHeader);
        
        List<Map<String, Object>> weeklyStats = new ArrayList<>();
        
        LocalDate endDate = LocalDate.now();
        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = endDate.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);
            
            LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
            LocalDateTime weekEndDateTime = weekEnd.atTime(LocalTime.MAX);
            
            Map<String, Object> weekStats = new HashMap<>();
            weekStats.put("weekStart", weekStart.toString());
            weekStats.put("weekEnd", weekEnd.toString());
            weekStats.put("weekLabel", weekStart + " ~ " + weekEnd);
            
            // 本周注册用户数
            Long userCount = userRepository.countByCreatedAtBetween(weekStartDateTime, weekEndDateTime.plusDays(1));
            weekStats.put("newUsers", userCount);
            
            // 本周新增日记数
            Long journalCount = journalEntryRepository.countByCreatedAtBetween(weekStartDateTime, weekEndDateTime.plusDays(1));
            weekStats.put("newJournals", journalCount);
            
            // 本周新增角色数
            Long characterCount = characterRepository.countByCreatedAtBetween(weekStartDateTime, weekEndDateTime.plusDays(1));
            weekStats.put("newCharacters", characterCount);
            
            // 本周新增场景数
            Long eraCount = eraRepository.countByCreatedAtBetween(weekStartDateTime, weekEndDateTime.plusDays(1));
            weekStats.put("newEras", eraCount);
            
            weeklyStats.add(weekStats);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("weeks", weeks);
        response.put("weeklyStats", weeklyStats);
        
        return ResponseEntity.ok(response);
    }
}

