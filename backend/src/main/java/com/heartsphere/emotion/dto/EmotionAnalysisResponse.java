package com.heartsphere.emotion.dto;

import lombok.Data;
import java.util.List;

/**
 * 情绪分析响应DTO
 */
@Data
public class EmotionAnalysisResponse {
    
    private String primaryEmotion;
    private List<String> secondaryEmotions;
    private String intensity; // mild, moderate, strong
    private Double confidence; // 0-1
    private List<String> emotionTags;
    private List<String> keyPhrases;
    private String reasoning;
}



