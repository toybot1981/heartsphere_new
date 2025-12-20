package com.heartsphere.aiagent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 酒店预订工具
 * 支持预订酒店（未来通过 MCP 提供真实预订功能）
 */
@Slf4j
@Component
public class HotelBookingTool implements Tool {
    
    @Override
    public String getName() {
        return "book_hotel";
    }
    
    @Override
    public String getDescription() {
        return "预订酒店。参数：hotelId(酒店ID), checkIn(入住日期), checkOut(退房日期), guests(入住人数), contact(联系方式)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String hotelId = parameters.getOrDefault("hotelId", "").toString();
            String checkIn = parameters.getOrDefault("checkIn", "").toString();
            String checkOut = parameters.getOrDefault("checkOut", "").toString();
            int guests = parameters.containsKey("guests")
                ? Integer.parseInt(parameters.get("guests").toString())
                : 2;
            Map<String, Object> contact = parameters.containsKey("contact")
                ? (Map<String, Object>) parameters.get("contact")
                : new HashMap<>();
            
            log.info("预订酒店: 酒店ID={}, 入住={}, 退房={}, 人数={}", 
                hotelId, checkIn, checkOut, guests);
            
            // 模拟预订流程（未来通过 MCP 调用真实预订 API）
            String bookingId = "HT" + System.currentTimeMillis();
            int nights = calculateNights(checkIn, checkOut);
            int totalPrice = 500 * nights; // 简化计算
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("bookingId", bookingId);
            result.put("hotelId", hotelId);
            result.put("checkIn", checkIn);
            result.put("checkOut", checkOut);
            result.put("nights", nights);
            result.put("guests", guests);
            result.put("totalPrice", totalPrice);
            result.put("status", "已确认");
            result.put("paymentStatus", "待支付");
            result.put("message", "预订成功，请在24小时内完成支付");
            
            return result;
        } catch (Exception e) {
            log.error("酒店预订失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private int calculateNights(String checkIn, String checkOut) {
        // 简化计算，假设都是1-3晚
        return 1 + new Random().nextInt(3);
    }
}








