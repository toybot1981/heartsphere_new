package com.heartsphere.aiagent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 出行建议工具
 * 根据目的地提供旅游建议
 */
@Slf4j
@Component
public class TravelAdviceTool implements Tool {
    
    @Override
    public String getName() {
        return "get_travel_advice";
    }
    
    @Override
    public String getDescription() {
        return "获取出行建议。参数：destination(目的地), duration(行程天数), interests(兴趣点,可选: 美食/购物/景点/文化/自然), budget(预算,可选)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String destination = parameters.getOrDefault("destination", "").toString();
            Integer duration = parameters.containsKey("duration")
                ? Integer.parseInt(parameters.get("duration").toString())
                : 3;
            String interests = parameters.containsKey("interests")
                ? parameters.get("interests").toString()
                : "景点";
            String budget = parameters.containsKey("budget")
                ? parameters.get("budget").toString()
                : "中等";
            
            log.info("获取出行建议: 目的地={}, 天数={}, 兴趣={}, 预算={}", 
                destination, duration, interests, budget);
            
            Map<String, Object> advice = generateTravelAdvice(destination, duration, interests, budget);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("destination", destination);
            result.put("advice", advice);
            
            return result;
        } catch (Exception e) {
            log.error("获取出行建议失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private Map<String, Object> generateTravelAdvice(String destination, int duration, String interests, String budget) {
        Map<String, Object> advice = new HashMap<>();
        
        // 景点推荐
        List<String> attractions = getAttractionsByCity(destination);
        advice.put("attractions", attractions);
        
        // 美食推荐
        List<String> restaurants = Arrays.asList(
            destination + "特色餐厅", destination + "老字号", destination + "网红店"
        );
        advice.put("restaurants", restaurants);
        
        // 行程安排
        List<Map<String, Object>> itinerary = generateItinerary(destination, duration);
        advice.put("itinerary", itinerary);
        
        // 交通建议
        Map<String, String> transportation = new HashMap<>();
        transportation.put("airport", destination + "机场距离市中心约30公里");
        transportation.put("metro", "建议购买" + destination + "地铁一日票");
        transportation.put("taxi", "起步价约10元");
        advice.put("transportation", transportation);
        
        // 天气建议
        Map<String, String> weather = new HashMap<>();
        weather.put("current", "晴天，20-25°C");
        weather.put("suggestion", "建议携带轻便外套，注意防晒");
        advice.put("weather", weather);
        
        // 预算建议
        Map<String, Object> budgetAdvice = new HashMap<>();
        budgetAdvice.put("dailyBudget", calculateDailyBudget(budget));
        budgetAdvice.put("totalBudget", calculateDailyBudget(budget) * duration);
        budgetAdvice.put("breakdown", Map.of(
            "住宿", "30%",
            "餐饮", "25%",
            "交通", "20%",
            "景点", "15%",
            "购物", "10%"
        ));
        advice.put("budgetAdvice", budgetAdvice);
        
        // 注意事项
        List<String> tips = Arrays.asList(
            "建议提前预订热门景点门票",
            "注意当地风俗习惯",
            "保管好个人证件",
            "购买旅游保险"
        );
        advice.put("tips", tips);
        
        return advice;
    }
    
    private List<String> getAttractionsByCity(String city) {
        Map<String, List<String>> cityAttractions = Map.of(
            "北京", Arrays.asList("故宫", "天安门", "长城", "颐和园", "天坛"),
            "上海", Arrays.asList("外滩", "东方明珠", "豫园", "田子坊", "迪士尼"),
            "杭州", Arrays.asList("西湖", "灵隐寺", "雷峰塔", "千岛湖", "宋城"),
            "成都", Arrays.asList("宽窄巷子", "大熊猫基地", "锦里", "武侯祠", "都江堰"),
            "西安", Arrays.asList("兵马俑", "大雁塔", "古城墙", "华清宫", "回民街")
        );
        
        return cityAttractions.getOrDefault(city, Arrays.asList(
            city + "著名景点1", city + "著名景点2", city + "著名景点3"
        ));
    }
    
    private List<Map<String, Object>> generateItinerary(String destination, int duration) {
        List<Map<String, Object>> itinerary = new ArrayList<>();
        String[] activities = {"景点游览", "美食体验", "购物", "文化体验", "休闲娱乐"};
        
        for (int day = 1; day <= duration; day++) {
            Map<String, Object> dayPlan = new HashMap<>();
            dayPlan.put("day", day);
            dayPlan.put("morning", destination + " - " + activities[day % activities.length]);
            dayPlan.put("afternoon", destination + " - " + activities[(day + 1) % activities.length]);
            dayPlan.put("evening", destination + " - 晚餐 + 夜游");
            itinerary.add(dayPlan);
        }
        
        return itinerary;
    }
    
    private int calculateDailyBudget(String budget) {
        return switch (budget.toLowerCase()) {
            case "经济" -> 200;
            case "中等" -> 500;
            case "豪华" -> 1000;
            default -> 500;
        };
    }
}








