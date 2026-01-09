package com.heartsphere.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供应用健康状态检查端点
 * 
 * @author HeartSphere
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * 健康检查端点
     * GET /api/health
     * 
     * @return 健康状态信息
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "HeartSphere Backend");
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }
}
