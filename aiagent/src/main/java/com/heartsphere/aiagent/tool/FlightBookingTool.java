package com.heartsphere.aiagent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 机票预订工具
 * 支持预订航班（未来通过 MCP 提供真实预订功能）
 */
@Slf4j
@Component
public class FlightBookingTool implements Tool {
    
    @Override
    public String getName() {
        return "book_flight";
    }
    
    @Override
    public String getDescription() {
        return "预订机票。参数：flightNumber(航班号), passengers(乘客信息,数组), contact(联系方式)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String flightNumber = parameters.getOrDefault("flightNumber", "").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> passengers = (List<Map<String, Object>>) parameters.getOrDefault("passengers", new ArrayList<>());
            Map<String, Object> contact = parameters.containsKey("contact")
                ? (Map<String, Object>) parameters.get("contact")
                : new HashMap<>();
            
            log.info("预订机票: 航班号={}, 乘客数={}", flightNumber, passengers.size());
            
            // 模拟预订流程（未来通过 MCP 调用真实预订 API）
            String bookingId = "FL" + System.currentTimeMillis();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("bookingId", bookingId);
            result.put("flightNumber", flightNumber);
            result.put("status", "已确认");
            result.put("passengers", passengers);
            result.put("totalPrice", calculateTotalPrice(passengers));
            result.put("paymentStatus", "待支付");
            result.put("message", "预订成功，请在30分钟内完成支付");
            
            return result;
        } catch (Exception e) {
            log.error("机票预订失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private int calculateTotalPrice(List<Map<String, Object>> passengers) {
        // 简化计算，每人1000元
        return passengers.size() * 1000;
    }
}





