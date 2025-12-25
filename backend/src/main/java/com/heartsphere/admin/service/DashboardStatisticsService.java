package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.DashboardStatisticsDTO;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.repository.UserRepository;
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
    private EraRepository eraRepository;

    @Autowired
    private ScriptRepository scriptRepository;

    @Autowired
    private CharacterRepository characterRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    /**
     * 获取总体统计数据
     */
    @Transactional(readOnly = true)
    public DashboardStatisticsDTO getStatistics(String period) {
        DashboardStatisticsDTO dto = new DashboardStatisticsDTO();

        // 总体统计
        dto.setTotalUsers(userRepository.count());
        dto.setTotalScenes(eraRepository.count());
        dto.setTotalScripts(scriptRepository.count());
        dto.setTotalCharacters(characterRepository.count());

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
        Map<String, DashboardStatisticsDTO.TrendData> trendMap = new HashMap<>();
        
        // 初始化所有日期
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            String dateKey = current.format(DATE_FORMATTER);
            DashboardStatisticsDTO.TrendData trend = new DashboardStatisticsDTO.TrendData();
            trend.setDate(dateKey);
            trend.setUsers(0L);
            trend.setScenes(0L);
            trend.setScripts(0L);
            trend.setCharacters(0L);
            trendMap.put(dateKey, trend);
            current = current.plusDays(1);
        }

        // 统计用户注册数（按创建日期）
        userRepository.findAll().forEach(user -> {
            if (user.getCreatedAt() != null) {
                LocalDate createdDate = user.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String dateKey = createdDate.format(DATE_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(dateKey);
                    if (trend != null) {
                        trend.setUsers(trend.getUsers() + 1);
                    }
                }
            }
        });

        // 统计场景创建数
        eraRepository.findAll().forEach(era -> {
            if (era.getCreatedAt() != null) {
                LocalDate createdDate = era.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String dateKey = createdDate.format(DATE_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(dateKey);
                    if (trend != null) {
                        trend.setScenes(trend.getScenes() + 1);
                    }
                }
            }
        });

        // 统计剧本创建数
        scriptRepository.findAll().forEach(script -> {
            if (script.getCreatedAt() != null) {
                LocalDate createdDate = script.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String dateKey = createdDate.format(DATE_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(dateKey);
                    if (trend != null) {
                        trend.setScripts(trend.getScripts() + 1);
                    }
                }
            }
        });

        // 统计角色创建数
        characterRepository.findAll().forEach(character -> {
            if (character.getCreatedAt() != null) {
                LocalDate createdDate = character.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String dateKey = createdDate.format(DATE_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(dateKey);
                    if (trend != null) {
                        trend.setCharacters(trend.getCharacters() + 1);
                    }
                }
            }
        });

        return new ArrayList<>(trendMap.values());
    }

    /**
     * 获取每月趋势数据
     */
    private List<DashboardStatisticsDTO.TrendData> getMonthlyTrends(LocalDate startDate, LocalDate endDate) {
        Map<String, DashboardStatisticsDTO.TrendData> trendMap = new HashMap<>();
        
        // 初始化所有月份
        LocalDate current = startDate.withDayOfMonth(1);
        while (!current.isAfter(endDate)) {
            String monthKey = current.format(MONTH_FORMATTER);
            DashboardStatisticsDTO.TrendData trend = new DashboardStatisticsDTO.TrendData();
            trend.setDate(monthKey);
            trend.setUsers(0L);
            trend.setScenes(0L);
            trend.setScripts(0L);
            trend.setCharacters(0L);
            trendMap.put(monthKey, trend);
            current = current.plusMonths(1);
        }

        // 统计用户注册数
        userRepository.findAll().forEach(user -> {
            if (user.getCreatedAt() != null) {
                LocalDate createdDate = user.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String monthKey = createdDate.format(MONTH_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(monthKey);
                    if (trend != null) {
                        trend.setUsers(trend.getUsers() + 1);
                    }
                }
            }
        });

        // 统计场景创建数
        eraRepository.findAll().forEach(era -> {
            if (era.getCreatedAt() != null) {
                LocalDate createdDate = era.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String monthKey = createdDate.format(MONTH_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(monthKey);
                    if (trend != null) {
                        trend.setScenes(trend.getScenes() + 1);
                    }
                }
            }
        });

        // 统计剧本创建数
        scriptRepository.findAll().forEach(script -> {
            if (script.getCreatedAt() != null) {
                LocalDate createdDate = script.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String monthKey = createdDate.format(MONTH_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(monthKey);
                    if (trend != null) {
                        trend.setScripts(trend.getScripts() + 1);
                    }
                }
            }
        });

        // 统计角色创建数
        characterRepository.findAll().forEach(character -> {
            if (character.getCreatedAt() != null) {
                LocalDate createdDate = character.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
                    String monthKey = createdDate.format(MONTH_FORMATTER);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(monthKey);
                    if (trend != null) {
                        trend.setCharacters(trend.getCharacters() + 1);
                    }
                }
            }
        });

        return new ArrayList<>(trendMap.values());
    }

    /**
     * 获取每年趋势数据
     */
    private List<DashboardStatisticsDTO.TrendData> getYearlyTrends(LocalDate startDate, LocalDate endDate) {
        Map<String, DashboardStatisticsDTO.TrendData> trendMap = new HashMap<>();
        
        // 初始化所有年份
        int startYear = startDate.getYear();
        int endYear = endDate.getYear();
        for (int year = startYear; year <= endYear; year++) {
            String yearKey = String.valueOf(year);
            DashboardStatisticsDTO.TrendData trend = new DashboardStatisticsDTO.TrendData();
            trend.setDate(yearKey);
            trend.setUsers(0L);
            trend.setScenes(0L);
            trend.setScripts(0L);
            trend.setCharacters(0L);
            trendMap.put(yearKey, trend);
        }

        // 统计用户注册数
        userRepository.findAll().forEach(user -> {
            if (user.getCreatedAt() != null) {
                int year = user.getCreatedAt().getYear();
                if (year >= startYear && year <= endYear) {
                    String yearKey = String.valueOf(year);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(yearKey);
                    if (trend != null) {
                        trend.setUsers(trend.getUsers() + 1);
                    }
                }
            }
        });

        // 统计场景创建数
        eraRepository.findAll().forEach(era -> {
            if (era.getCreatedAt() != null) {
                int year = era.getCreatedAt().getYear();
                if (year >= startYear && year <= endYear) {
                    String yearKey = String.valueOf(year);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(yearKey);
                    if (trend != null) {
                        trend.setScenes(trend.getScenes() + 1);
                    }
                }
            }
        });

        // 统计剧本创建数
        scriptRepository.findAll().forEach(script -> {
            if (script.getCreatedAt() != null) {
                int year = script.getCreatedAt().getYear();
                if (year >= startYear && year <= endYear) {
                    String yearKey = String.valueOf(year);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(yearKey);
                    if (trend != null) {
                        trend.setScripts(trend.getScripts() + 1);
                    }
                }
            }
        });

        // 统计角色创建数
        characterRepository.findAll().forEach(character -> {
            if (character.getCreatedAt() != null) {
                int year = character.getCreatedAt().getYear();
                if (year >= startYear && year <= endYear) {
                    String yearKey = String.valueOf(year);
                    DashboardStatisticsDTO.TrendData trend = trendMap.get(yearKey);
                    if (trend != null) {
                        trend.setCharacters(trend.getCharacters() + 1);
                    }
                }
            }
        });

        return new ArrayList<>(trendMap.values());
    }
}

