package com.heartsphere.aistudio.controller;

import com.heartsphere.aistudio.mcp.AmapService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 高德地图 API 控制器
 * 提供高德地图相关功能的 REST API
 */
@Slf4j
@RestController
@RequestMapping("/api/amap")
@RequiredArgsConstructor
public class AmapController {
    
    private final AmapService amapService;
    
    /**
     * 地理编码
     */
    @PostMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocode(@RequestBody GeocodeRequest request) {
        Map<String, Object> result = amapService.geocode(request.getAddress(), request.getCity());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 逆地理编码
     */
    @PostMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(@RequestBody ReverseGeocodeRequest request) {
        Map<String, Object> result = amapService.reverseGeocode(request.getLongitude(), request.getLatitude());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 路径规划
     */
    @PostMapping("/route")
    public ResponseEntity<Map<String, Object>> routePlanning(@RequestBody RouteRequest request) {
        Map<String, Object> result = amapService.routePlanning(
            request.getOrigin(), 
            request.getDestination(), 
            request.getStrategy()
        );
        return ResponseEntity.ok(result);
    }
    
    /**
     * POI 搜索
     */
    @PostMapping("/poi/search")
    public ResponseEntity<Map<String, Object>> searchPOI(@RequestBody POISearchRequest request) {
        Map<String, Object> result = amapService.searchPOI(
            request.getKeywords(),
            request.getCity(),
            request.getTypes(),
            request.getPage() != null ? request.getPage() : 1,
            request.getOffset() != null ? request.getOffset() : 20
        );
        return ResponseEntity.ok(result);
    }
    
    /**
     * 天气查询
     */
    @PostMapping("/weather")
    public ResponseEntity<Map<String, Object>> getWeather(@RequestBody WeatherRequest request) {
        Map<String, Object> result = amapService.getWeather(request.getCity());
        return ResponseEntity.ok(result);
    }
    
    @Data
    public static class GeocodeRequest {
        private String address;
        private String city;
    }
    
    @Data
    public static class ReverseGeocodeRequest {
        private String longitude;
        private String latitude;
    }
    
    @Data
    public static class RouteRequest {
        private String origin;
        private String destination;
        private String strategy;
    }
    
    @Data
    public static class POISearchRequest {
        private String keywords;
        private String city;
        private String types;
        private Integer page;
        private Integer offset;
    }
    
    @Data
    public static class WeatherRequest {
        private String city;
    }
}

