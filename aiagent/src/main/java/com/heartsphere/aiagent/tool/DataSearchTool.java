package com.heartsphere.aiagent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * 数据搜索工具
 * 用于获取民航旅客等统计数据
 */
@Slf4j
@Component
public class DataSearchTool implements Tool {
    
    @Override
    public String getName() {
        return "data_search";
    }
    
    @Override
    public String getDescription() {
        return "搜索和获取统计数据，支持民航旅客、交通流量等数据查询。参数：query(查询内容), location(地点), timeRange(时间范围)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        String query = parameters.getOrDefault("query", "").toString();
        String location = parameters.getOrDefault("location", "").toString();
        String timeRange = parameters.getOrDefault("timeRange", "近一年").toString();
        
        log.info("数据搜索: query={}, location={}, timeRange={}", query, location, timeRange);
        
        // 模拟获取近一年来北京的民航旅客数据
        if (query.contains("民航") || query.contains("旅客") || query.contains("航空")) {
            if (location.contains("北京") || location.isEmpty()) {
                return generateAviationData();
            }
        }
        
        // 默认返回模拟数据
        return generateDefaultData(query, location, timeRange);
    }
    
    /**
     * 生成民航旅客数据
     */
    private Map<String, Object> generateAviationData() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> monthlyData = new HashMap<>();
        
        // 生成近12个月的数据（模拟数据）
        String[] months = {"2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
                          "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"};
        
        Random random = new Random();
        int baseValue = 5000000; // 基础值：500万
        
        for (String month : months) {
            // 模拟季节性波动：夏季和节假日较高
            int multiplier = 1;
            if (month.contains("07") || month.contains("08")) {
                multiplier = 130; // 夏季高峰
            } else if (month.contains("01") || month.contains("02")) {
                multiplier = 120; // 春节
            } else if (month.contains("10")) {
                multiplier = 125; // 国庆
            } else {
                multiplier = 100;
            }
            
            int passengers = baseValue * multiplier / 100 + random.nextInt(200000);
            monthlyData.put(month, passengers);
        }
        
        data.put("location", "北京");
        data.put("timeRange", "近一年（2024年1月-12月）");
        data.put("dataType", "民航旅客吞吐量");
        data.put("unit", "人次");
        data.put("monthlyData", monthlyData);
        data.put("summary", Map.of(
            "total", monthlyData.values().stream().mapToInt(v -> (Integer) v).sum(),
            "average", monthlyData.values().stream().mapToInt(v -> (Integer) v).sum() / 12,
            "max", monthlyData.values().stream().mapToInt(v -> (Integer) v).max().orElse(0),
            "min", monthlyData.values().stream().mapToInt(v -> (Integer) v).min().orElse(0),
            "trend", "上升趋势，夏季和节假日为高峰期"
        ));
        
        return data;
    }
    
    /**
     * 生成默认数据
     */
    private Map<String, Object> generateDefaultData(String query, String location, String timeRange) {
        Map<String, Object> data = new HashMap<>();
        data.put("query", query);
        data.put("location", location);
        data.put("timeRange", timeRange);
        data.put("message", "数据搜索功能：请提供更具体的查询条件");
        return data;
    }
}

