package com.heartsphere.emotion.controller;

import com.heartsphere.emotion.dto.EmotionAnalysisRequest;
import com.heartsphere.emotion.dto.EmotionAnalysisResponse;
import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.emotion.service.EmotionService;
import com.heartsphere.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 情绪感知系统API控制器
 */
@RestController
@RequestMapping("/api/emotions")
public class EmotionController {
    
    @Autowired
    private EmotionService emotionService;
    
    /**
     * 分析情绪
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<EmotionAnalysisResponse>> analyzeEmotion(
        @RequestBody EmotionAnalysisRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 从认证信息获取用户ID
        Long userId = Long.parseLong(userDetails.getUsername());
        request.setUserId(userId);
        
        EmotionAnalysisResponse response = emotionService.analyzeEmotion(request);
        
        // 保存记录
        emotionService.saveEmotionRecord(response, request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 获取当前情绪
     */
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<EmotionRecord>> getCurrentEmotion(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = Long.parseLong(userDetails.getUsername());
        EmotionRecord current = emotionService.getCurrentEmotion(userId);
        
        return ResponseEntity.ok(ApiResponse.success(current));
    }
    
    /**
     * 获取情绪历史
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<EmotionRecord>>> getEmotionHistory(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        Long userId = Long.parseLong(userDetails.getUsername());
        List<EmotionRecord> history = emotionService.getEmotionHistory(userId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(history));
    }
    
    /**
     * 获取情绪趋势
     * 返回详细的趋势数据，包括分布、统计等，用于温度感系统分析
     */
    @GetMapping("/trend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmotionTrend(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "week") String period
    ) {
        Long userId = Long.parseLong(userDetails.getUsername());
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(period.equals("day") ? 1 : period.equals("week") ? 7 : 30);
        
        Map<String, Object> trend = emotionService.getEmotionTrend(userId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(trend));
    }
    
    /**
     * 获取情绪统计
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<List<Object[]>>> getEmotionStatistics(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "week") String period
    ) {
        Long userId = Long.parseLong(userDetails.getUsername());
        LocalDateTime startDate = LocalDateTime.now().minusDays(period.equals("day") ? 1 : period.equals("week") ? 7 : 30);
        
        List<Object[]> statistics = emotionService.getEmotionStatistics(userId, startDate);
        
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}

