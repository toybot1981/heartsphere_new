package com.heartsphere.aiagent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 酒店查询工具
 * 支持查询酒店信息（未来通过 MCP 提供真实数据）
 */
@Slf4j
@Component
public class HotelSearchTool implements Tool {
    
    @Override
    public String getName() {
        return "search_hotels";
    }
    
    @Override
    public String getDescription() {
        return "查询酒店信息。参数：city(城市), checkIn(入住日期 YYYY-MM-DD), checkOut(退房日期 YYYY-MM-DD), guests(入住人数,默认2), stars(星级,可选)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String city = parameters.getOrDefault("city", "").toString();
            String checkIn = parameters.getOrDefault("checkIn", "").toString();
            String checkOut = parameters.getOrDefault("checkOut", "").toString();
            int guests = parameters.containsKey("guests") 
                ? Integer.parseInt(parameters.get("guests").toString())
                : 2;
            Integer stars = parameters.containsKey("stars")
                ? Integer.parseInt(parameters.get("stars").toString())
                : null;
            
            log.info("查询酒店: 城市={}, 入住={}, 退房={}, 人数={}, 星级={}", 
                city, checkIn, checkOut, guests, stars);
            
            // 模拟酒店数据（未来通过 MCP 获取真实数据）
            List<Map<String, Object>> hotels = generateMockHotels(city, checkIn, checkOut, guests, stars);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("city", city);
            result.put("checkIn", checkIn);
            result.put("checkOut", checkOut);
            result.put("guests", guests);
            result.put("hotels", hotels);
            result.put("count", hotels.size());
            
            return result;
        } catch (Exception e) {
            log.error("酒店查询失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private List<Map<String, Object>> generateMockHotels(String city, String checkIn, String checkOut, int guests, Integer stars) {
        List<Map<String, Object>> hotels = new ArrayList<>();
        Random random = new Random();
        
        String[] hotelNames = {
            "希尔顿酒店", "万豪酒店", "洲际酒店", "喜来登酒店", 
            "香格里拉酒店", "凯悦酒店", "丽思卡尔顿", "四季酒店"
        };
        
        String[] locations = {"市中心", "机场附近", "商业区", "景区附近", "火车站附近"};
        
        // 生成 5-8 个酒店选项
        int count = 5 + random.nextInt(4);
        
        for (int i = 0; i < count; i++) {
            int hotelStars = stars != null ? stars : (3 + random.nextInt(3)); // 3-5 星
            
            Map<String, Object> hotel = new HashMap<>();
            hotel.put("hotelId", "H" + (1000 + i));
            hotel.put("name", hotelNames[i % hotelNames.length] + " " + city + "店");
            hotel.put("stars", hotelStars);
            hotel.put("location", locations[random.nextInt(locations.length)]);
            hotel.put("address", city + locations[random.nextInt(locations.length)] + "XX路" + (100 + i) + "号");
            hotel.put("pricePerNight", 200 + hotelStars * 100 + random.nextInt(300));
            hotel.put("totalPrice", (200 + hotelStars * 100 + random.nextInt(300)) * calculateNights(checkIn, checkOut));
            hotel.put("rating", 4.0 + random.nextDouble());
            hotel.put("reviews", 100 + random.nextInt(900));
            hotel.put("amenities", Arrays.asList("WiFi", "早餐", "停车场", "健身房", "游泳池"));
            hotel.put("available", random.nextBoolean() || i < 3); // 至少前3个有房
            hotels.add(hotel);
        }
        
        // 按价格排序
        hotels.sort(Comparator.comparingInt(h -> (Integer) h.get("pricePerNight")));
        
        return hotels;
    }
    
    private int calculateNights(String checkIn, String checkOut) {
        // 简化计算，假设都是1-3晚
        return 1 + new Random().nextInt(3);
    }
}








