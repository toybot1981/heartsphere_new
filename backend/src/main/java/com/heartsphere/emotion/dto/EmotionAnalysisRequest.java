package com.heartsphere.emotion.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 情绪分析请求DTO
 */
@Data
public class EmotionAnalysisRequest {
    
    private String text;
    private String source; // conversation, journal, behavior, manual
    
    private Map<String, Object> context;
    private List<String> conversationHistory;
    private Long userId;
    private Integer timeOfDay;
    private Integer dayOfWeek;
}

