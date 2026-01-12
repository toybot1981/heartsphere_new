package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.DashboardStatisticsDTO;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.repository.SystemScriptRepository;
import com.heartsphere.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard统计服务
 */
@Service
public class DashboardStatisticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemEraRepository eraRepository;

    @Autowired
    private SystemScriptRepository scriptRepository;

    @Autowired
    private SystemCharacterRepository characterRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    /**
     * 获取总体统计数据
     */
    @Transactional(readOnly = true)
    public DashboardStatisticsDTO getStatistics(String period) {
        DashboardStatisticsDTO dto = new DashboardStatisticsDTO();

        // 总体统计（只统计活跃的记录）
        dto.setTotalUsers(userRepository.count());
        dto.setTotalScenes(eraRepository.findAll().stream()
                .filter(era -> era.getIsActive() != null && era.getIsActive())
                .count());
        dto.setTotalScripts(scriptRepository.findAll().stream()
                .filter(script -> script.getIsActive() != null && script.getIsActive())
                .count());
        dto.setTotalCharacters(characterRepository.findAll().stream()
                .filter(character -> character.getIsActive() != null && character.getIsActive())
                .count());

        // 趋势数据
        dto.setTrends(getTrendData(period));

        return dto;
    }

    /**
     * 获取趋势数据
     * @param period 时间段：day, month, year
     */
    private List<DashboardStatisticsDTO.TrendData> getTrendData(String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        // 根据period确定时间范围
        switch (period != null ? period.toLowerCase() : "day") {
            case "year":
                startDate = endDate.minusYears(1);
                return getYearlyTrends(startDate, endDate);
            case "month":
                startDate = endDate.minusMonths(12);
                return getMonthlyTrends(startDate, endDate);
            case "day":
            default:
                startDate = endDate.minusDays(30);
                return getDailyTrends(startDate, endDate);
        }
    }

    /**
     * 获取每日趋势数据
     */
    private List<DashboardStatisticsDTO.TrendData> getDailyTrends(LocalDate startDate, LocalDate endDate) {
        List<DashboardStatisticsDTO.TrendData> trends = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            final LocalDate date = currentDate; // 创建 final 变量供 lambda 使用
            String dateStr = date.format(DATE_FORMATTER);
            
            // 统计该日期注册的用户数
            long users = userRepository.findAll().stream()
                    .filter(user -> user.getCreatedAt() != null 
                            && user.getCreatedAt().toLocalDate().equals(date))
                    .count();
            
            // 统计该日期创建的场景数（活跃的）
            long scenes = eraRepository.findAll().stream()
                    .filter(era -> era.getIsActive() != null && era.getIsActive()
                            && era.getCreatedAt() != null
                            && era.getCreatedAt().toLocalDate().equals(date))
                    .count();
            
            // 统计该日期创建的剧本数（活跃的）
            long scripts = scriptRepository.findAll().stream()
                    .filter(script -> script.getIsActive() != null && script.getIsActive()
                            && script.getCreatedAt() != null
                            && script.getCreatedAt().toLocalDate().equals(date))
                    .count();
            
            // 统计该日期创建的角色数（活跃的）
            long characters = characterRepository.findAll().stream()
                    .filter(character -> character.getIsActive() != null && character.getIsActive()
                            && character.getCreatedAt() != null
                            && character.getCreatedAt().toLocalDate().equals(date))
                    .count();
            
            trends.add(new DashboardStatisticsDTO.TrendData(dateStr, users, scenes, scripts, characters));
            currentDate = currentDate.plusDays(1);
        }
        
        return trends;
    }

    /**
     * 获取每月趋势数据
     */
    private List<DashboardStatisticsDTO.TrendData> getMonthlyTrends(LocalDate startDate, LocalDate endDate) {
        List<DashboardStatisticsDTO.TrendData> trends = new ArrayList<>();
        LocalDate currentDate = startDate.withDayOfMonth(1); // 从月初开始
        
        while (!currentDate.isAfter(endDate)) {
            final LocalDate date = currentDate; // 创建 final 变量供 lambda 使用
            final int year = date.getYear();
            final int month = date.getMonthValue();
            String dateStr = date.format(MONTH_FORMATTER);
            
            // 统计该月注册的用户数
            long users = userRepository.findAll().stream()
                    .filter(user -> user.getCreatedAt() != null 
                            && user.getCreatedAt().toLocalDate().getYear() == year
                            && user.getCreatedAt().toLocalDate().getMonthValue() == month)
                    .count();
            
            // 统计该月创建的场景数（活跃的）
            long scenes = eraRepository.findAll().stream()
                    .filter(era -> era.getIsActive() != null && era.getIsActive()
                            && era.getCreatedAt() != null
                            && era.getCreatedAt().toLocalDate().getYear() == year
                            && era.getCreatedAt().toLocalDate().getMonthValue() == month)
                    .count();
            
            // 统计该月创建的剧本数（活跃的）
            long scripts = scriptRepository.findAll().stream()
                    .filter(script -> script.getIsActive() != null && script.getIsActive()
                            && script.getCreatedAt() != null
                            && script.getCreatedAt().toLocalDate().getYear() == year
                            && script.getCreatedAt().toLocalDate().getMonthValue() == month)
                    .count();
            
            // 统计该月创建的角色数（活跃的）
            long characters = characterRepository.findAll().stream()
                    .filter(character -> character.getIsActive() != null && character.getIsActive()
                            && character.getCreatedAt() != null
                            && character.getCreatedAt().toLocalDate().getYear() == year
                            && character.getCreatedAt().toLocalDate().getMonthValue() == month)
                    .count();
            
            trends.add(new DashboardStatisticsDTO.TrendData(dateStr, users, scenes, scripts, characters));
            currentDate = currentDate.plusMonths(1);
        }
        
        return trends;
    }

    /**
     * 获取每年趋势数据
     */
    private List<DashboardStatisticsDTO.TrendData> getYearlyTrends(LocalDate startDate, LocalDate endDate) {
        List<DashboardStatisticsDTO.TrendData> trends = new ArrayList<>();
        LocalDate currentDate = startDate.withDayOfYear(1); // 从年初开始
        
        while (!currentDate.isAfter(endDate)) {
            final int year = currentDate.getYear(); // 创建 final 变量供 lambda 使用
            String dateStr = String.valueOf(year);
            
            // 统计该年注册的用户数
            long users = userRepository.findAll().stream()
                    .filter(user -> user.getCreatedAt() != null 
                            && user.getCreatedAt().toLocalDate().getYear() == year)
                    .count();
            
            // 统计该年创建的场景数（活跃的）
            long scenes = eraRepository.findAll().stream()
                    .filter(era -> era.getIsActive() != null && era.getIsActive()
                            && era.getCreatedAt() != null
                            && era.getCreatedAt().toLocalDate().getYear() == year)
                    .count();
            
            // 统计该年创建的剧本数（活跃的）
            long scripts = scriptRepository.findAll().stream()
                    .filter(script -> script.getIsActive() != null && script.getIsActive()
                            && script.getCreatedAt() != null
                            && script.getCreatedAt().toLocalDate().getYear() == year)
                    .count();
            
            // 统计该年创建的角色数（活跃的）
            long characters = characterRepository.findAll().stream()
                    .filter(character -> character.getIsActive() != null && character.getIsActive()
                            && character.getCreatedAt() != null
                            && character.getCreatedAt().toLocalDate().getYear() == year)
                    .count();
            
            trends.add(new DashboardStatisticsDTO.TrendData(dateStr, users, scenes, scripts, characters));
            currentDate = currentDate.plusYears(1);
        }
        
        return trends;
    }
}

