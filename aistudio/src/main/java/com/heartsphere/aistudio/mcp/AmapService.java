package com.heartsphere.aistudio.mcp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 高德地图服务
 * 提供地理编码、逆地理编码、路径规划、POI 搜索等功能
 */
@Slf4j
@Service
public class AmapService {
    
    @Value("${amap.api-key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://restapi.amap.com/v3";
    
    /**
     * 地理编码 - 将地址转换为经纬度
     */
    public Map<String, Object> geocode(String address, String city) {
        try {
            String url = BASE_URL + "/geocode/geo";
            Map<String, String> params = new HashMap<>();
            params.put("key", apiKey);
            params.put("address", address);
            // 高德地图 API 要求 city 参数
            if (city != null && !city.isEmpty()) {
                params.put("city", city);
            }
            // 注意：city 参数是可选的，如果地址足够详细可以不加
            
            String queryString = buildQueryString(params);
            ResponseEntity<Map> response = restTemplate.getForEntity(url + "?" + queryString, Map.class);
            
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                result.put("success", "1".equals(body.get("status")));
                result.put("data", body);
            } else {
                result.put("success", false);
                result.put("error", "响应为空");
            }
            
            return result;
        } catch (Exception e) {
            log.error("地理编码失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", e.getMessage());
            return result;
        }
    }
    
    /**
     * 逆地理编码 - 将经纬度转换为地址
     */
    public Map<String, Object> reverseGeocode(String longitude, String latitude) {
        try {
            String url = BASE_URL + "/geocode/regeo";
            Map<String, String> params = new HashMap<>();
            params.put("key", apiKey);
            params.put("location", longitude + "," + latitude);
            params.put("radius", "1000");
            params.put("extensions", "all");
            
            String queryString = buildQueryString(params);
            ResponseEntity<Map> response = restTemplate.getForEntity(url + "?" + queryString, Map.class);
            
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                result.put("success", "1".equals(body.get("status")));
                result.put("data", body);
            } else {
                result.put("success", false);
                result.put("error", "响应为空");
            }
            
            return result;
        } catch (Exception e) {
            log.error("逆地理编码失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", e.getMessage());
            return result;
        }
    }
    
    /**
     * 路径规划 - 计算两点之间的路径
     */
    public Map<String, Object> routePlanning(String origin, String destination, String strategy) {
        try {
            String url = BASE_URL + "/direction/driving";
            Map<String, String> params = new HashMap<>();
            params.put("key", apiKey);
            params.put("origin", origin);
            params.put("destination", destination);
            params.put("strategy", strategy != null ? strategy : "0"); // 0:速度优先, 1:费用优先, 2:距离优先
            params.put("extensions", "all"); // 返回详细信息
            
            String queryString = buildQueryString(params);
            log.debug("路径规划请求 URL: {}?{}", url, queryString);
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url + "?" + queryString, Map.class);
            
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String status = body.get("status") != null ? body.get("status").toString() : "0";
                boolean success = "1".equals(status);
                result.put("success", success);
                result.put("data", body);
                
                if (!success) {
                    log.warn("路径规划失败: status={}, info={}", status, body.get("info"));
                }
            } else {
                result.put("success", false);
                result.put("error", "响应为空");
            }
            
            return result;
        } catch (Exception e) {
            log.error("路径规划失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", e.getMessage());
            return result;
        }
    }
    
    /**
     * POI 搜索 - 搜索兴趣点
     */
    public Map<String, Object> searchPOI(String keywords, String city, String types, int page, int offset) {
        try {
            String url = BASE_URL + "/place/text";
            Map<String, String> params = new HashMap<>();
            params.put("key", apiKey);
            params.put("keywords", keywords);
            if (city != null && !city.isEmpty()) {
                params.put("city", city);
            }
            if (types != null && !types.isEmpty()) {
                params.put("types", types);
            }
            params.put("page", String.valueOf(page));
            params.put("offset", String.valueOf(offset));
            params.put("extensions", "all");
            
            String queryString = buildQueryString(params);
            ResponseEntity<Map> response = restTemplate.getForEntity(url + "?" + queryString, Map.class);
            
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                result.put("success", "1".equals(body.get("status")));
                result.put("data", body);
            } else {
                result.put("success", false);
                result.put("error", "响应为空");
            }
            
            return result;
        } catch (Exception e) {
            log.error("POI 搜索失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", e.getMessage());
            return result;
        }
    }
    
    /**
     * 天气查询 - 根据城市查询天气
     */
    public Map<String, Object> getWeather(String city) {
        try {
            String url = BASE_URL + "/weather/weatherInfo";
            Map<String, String> params = new HashMap<>();
            params.put("key", apiKey);
            params.put("city", city);
            params.put("extensions", "all");
            
            String queryString = buildQueryString(params);
            ResponseEntity<Map> response = restTemplate.getForEntity(url + "?" + queryString, Map.class);
            
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                result.put("success", "1".equals(body.get("status")));
                result.put("data", body);
            } else {
                result.put("success", false);
                result.put("error", "响应为空");
            }
            
            return result;
        } catch (Exception e) {
            log.error("天气查询失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", e.getMessage());
            return result;
        }
    }
    
    /**
     * 构建查询字符串
     */
    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=").append(java.net.URLEncoder.encode(entry.getValue(), java.nio.charset.StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}

