package com.heartsphere.aiagent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 航班查询工具
 * 支持查询航班信息（未来通过 MCP 提供真实数据）
 */
@Slf4j
@Component
public class FlightSearchTool implements Tool {
    
    @Override
    public String getName() {
        return "search_flights";
    }
    
    @Override
    public String getDescription() {
        return "查询航班信息。参数：origin(出发城市), destination(目的地城市), date(日期 YYYY-MM-DD), returnDate(返程日期,可选)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String origin = parameters.getOrDefault("origin", "").toString();
            String destination = parameters.getOrDefault("destination", "").toString();
            String date = parameters.getOrDefault("date", "").toString();
            String returnDate = parameters.containsKey("returnDate") 
                ? parameters.get("returnDate").toString() 
                : null;
            
            log.info("查询航班: {} -> {}, 日期: {}, 返程: {}", origin, destination, date, returnDate);
            
            // 模拟航班数据（未来通过 MCP 获取真实数据）
            List<Map<String, Object>> flights = generateMockFlights(origin, destination, date);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("origin", origin);
            result.put("destination", destination);
            result.put("date", date);
            result.put("flights", flights);
            result.put("count", flights.size());
            
            if (returnDate != null) {
                List<Map<String, Object>> returnFlights = generateMockFlights(destination, origin, returnDate);
                result.put("returnFlights", returnFlights);
                result.put("returnDate", returnDate);
            }
            
            return result;
        } catch (Exception e) {
            log.error("航班查询失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private List<Map<String, Object>> generateMockFlights(String origin, String destination, String date) {
        List<Map<String, Object>> flights = new ArrayList<>();
        Random random = new Random();
        
        // 生成 3-5 个航班选项
        int count = 3 + random.nextInt(3);
        String[] airlines = {"中国国航", "东方航空", "南方航空", "海南航空", "厦门航空"};
        String[] aircraftTypes = {"波音737", "空客A320", "波音787", "空客A330"};
        
        for (int i = 0; i < count; i++) {
            Map<String, Object> flight = new HashMap<>();
            flight.put("flightNumber", String.format("%s%d%02d", 
                airlines[i % airlines.length].substring(0, 1), 
                1000 + random.nextInt(9000), 
                random.nextInt(100)));
            flight.put("airline", airlines[i % airlines.length]);
            flight.put("aircraftType", aircraftTypes[random.nextInt(aircraftTypes.length)]);
            flight.put("departureTime", String.format("%02d:00", 6 + i * 3));
            flight.put("arrivalTime", String.format("%02d:00", 9 + i * 3));
            flight.put("duration", String.format("%d小时%d分钟", 2 + random.nextInt(2), random.nextInt(60)));
            flight.put("price", 500 + random.nextInt(2000));
            flight.put("seatsAvailable", 10 + random.nextInt(50));
            flight.put("cabinClass", i == 0 ? "经济舱" : (i == 1 ? "商务舱" : "经济舱"));
            flights.add(flight);
        }
        
        // 按价格排序
        flights.sort(Comparator.comparingInt(f -> (Integer) f.get("price")));
        
        return flights;
    }
}








