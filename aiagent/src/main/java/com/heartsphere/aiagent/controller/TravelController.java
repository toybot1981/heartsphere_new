package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.entity.TravelEntity;
import com.heartsphere.aiagent.service.TravelService;
import com.heartsphere.aiagent.tool.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 旅游出行助手控制器
 * 提供航班查询、酒店查询、预订、出行建议等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/travel")
@RequiredArgsConstructor
public class TravelController {
    
    private final FlightSearchTool flightSearchTool;
    private final HotelSearchTool hotelSearchTool;
    private final TravelAdviceTool travelAdviceTool;
    private final FlightBookingTool flightBookingTool;
    private final HotelBookingTool hotelBookingTool;
    private final TravelService travelService;
    
    // ========== 航班相关 ==========
    
    /**
     * 查询航班
     */
    @PostMapping("/flights/search")
    public ResponseEntity<Map<String, Object>> searchFlights(@RequestBody FlightSearchRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("origin", request.getOrigin());
            params.put("destination", request.getDestination());
            params.put("date", request.getDate());
            if (request.getReturnDate() != null) {
                params.put("returnDate", request.getReturnDate());
            }
            
            Object result = flightSearchTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            log.error("查询航班失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 预订机票
     */
    @PostMapping("/flights/book")
    public ResponseEntity<Map<String, Object>> bookFlight(@RequestBody FlightBookingRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("flightNumber", request.getFlightNumber());
            params.put("passengers", request.getPassengers());
            params.put("contact", request.getContact());
            
            Object result = flightBookingTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            log.error("预订机票失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // ========== 酒店相关 ==========
    
    /**
     * 查询酒店
     */
    @PostMapping("/hotels/search")
    public ResponseEntity<Map<String, Object>> searchHotels(@RequestBody HotelSearchRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("city", request.getCity());
            params.put("checkIn", request.getCheckIn());
            params.put("checkOut", request.getCheckOut());
            params.put("guests", request.getGuests() != null ? request.getGuests() : 2);
            if (request.getStars() != null) {
                params.put("stars", request.getStars());
            }
            
            Object result = hotelSearchTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            log.error("查询酒店失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 预订酒店
     */
    @PostMapping("/hotels/book")
    public ResponseEntity<Map<String, Object>> bookHotel(@RequestBody HotelBookingRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("hotelId", request.getHotelId());
            params.put("checkIn", request.getCheckIn());
            params.put("checkOut", request.getCheckOut());
            params.put("guests", request.getGuests());
            params.put("contact", request.getContact());
            
            Object result = hotelBookingTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            log.error("预订酒店失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // ========== 出行建议 ==========
    
    /**
     * 获取出行建议
     */
    @PostMapping("/advice")
    public ResponseEntity<Map<String, Object>> getTravelAdvice(@RequestBody TravelAdviceRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("destination", request.getDestination());
            params.put("duration", request.getDuration() != null ? request.getDuration() : 3);
            if (request.getInterests() != null) {
                params.put("interests", request.getInterests());
            }
            if (request.getBudget() != null) {
                params.put("budget", request.getBudget());
            }
            
            Object result = travelAdviceTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            log.error("获取出行建议失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // ========== 行程管理 ==========
    
    /**
     * 创建行程
     */
    @PostMapping("/itinerary/create")
    public ResponseEntity<Map<String, Object>> createItinerary(@RequestBody CreateItineraryRequest request) {
        try {
            TravelEntity travel = travelService.createTravel(
                request.getUserId(),
                request.getDestination(),
                request.getStartDate(),
                request.getEndDate(),
                request.getFlightNumber(),
                request.getFlightDepartureTime(),
                request.getHotelId(),
                request.getHotelName(),
                request.getItinerary(),
                request.getNotes()
            );
            
            return ResponseEntity.ok(Map.of("success", true, "travel", travel));
        } catch (Exception e) {
            log.error("创建行程失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 获取用户行程列表
     */
    @GetMapping("/itinerary/list")
    public ResponseEntity<List<TravelEntity>> getUserItineraries(@RequestParam String userId) {
        List<TravelEntity> travels = travelService.getUserTravels(userId);
        return ResponseEntity.ok(travels);
    }
    
    /**
     * 获取行程详情
     */
    @GetMapping("/itinerary/{travelId}")
    public ResponseEntity<TravelEntity> getItinerary(@PathVariable String travelId) {
        TravelEntity travel = travelService.getTravel(travelId);
        return ResponseEntity.ok(travel);
    }
    
    /**
     * 更新行程
     */
    @PutMapping("/itinerary/{travelId}")
    public ResponseEntity<Map<String, Object>> updateItinerary(
            @PathVariable String travelId,
            @RequestBody TravelEntity updates) {
        try {
            TravelEntity travel = travelService.updateTravel(travelId, updates);
            return ResponseEntity.ok(Map.of("success", true, "travel", travel));
        } catch (Exception e) {
            log.error("更新行程失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 删除行程
     */
    @DeleteMapping("/itinerary/{travelId}")
    public ResponseEntity<Map<String, Object>> deleteItinerary(@PathVariable String travelId) {
        travelService.deleteTravel(travelId);
        return ResponseEntity.ok(Map.of("success", true, "message", "行程已删除"));
    }
    
    /**
     * 获取即将起飞的航班提醒
     */
    @GetMapping("/reminders/upcoming")
    public ResponseEntity<List<TravelEntity>> getUpcomingFlights() {
        List<TravelEntity> upcomingFlights = travelService.getUpcomingFlights();
        return ResponseEntity.ok(upcomingFlights);
    }
    
    // ========== 请求类 ==========
    
    @Data
    public static class FlightSearchRequest {
        private String origin;
        private String destination;
        private String date; // YYYY-MM-DD
        private String returnDate; // YYYY-MM-DD, 可选
    }
    
    @Data
    public static class FlightBookingRequest {
        private String flightNumber;
        private List<Map<String, Object>> passengers;
        private Map<String, Object> contact;
    }
    
    @Data
    public static class HotelSearchRequest {
        private String city;
        private String checkIn; // YYYY-MM-DD
        private String checkOut; // YYYY-MM-DD
        private Integer guests;
        private Integer stars;
    }
    
    @Data
    public static class HotelBookingRequest {
        private String hotelId;
        private String checkIn;
        private String checkOut;
        private Integer guests;
        private Map<String, Object> contact;
    }
    
    @Data
    public static class TravelAdviceRequest {
        private String destination;
        private Integer duration;
        private String interests;
        private String budget;
    }
    
    @Data
    public static class CreateItineraryRequest {
        private String userId;
        private String destination;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime startDate;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime endDate;
        private String flightNumber;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime flightDepartureTime;
        private String hotelId;
        private String hotelName;
        private String itinerary;
        private String notes;
    }
}








