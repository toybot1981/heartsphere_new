package com.heartsphere.emotion.service;

import com.heartsphere.emotion.dto.EmotionAnalysisRequest;
import com.heartsphere.emotion.dto.EmotionAnalysisResponse;
import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.emotion.repository.EmotionRecordRepository;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 情绪服务测试
 */
@ExtendWith(MockitoExtension.class)
class EmotionServiceTest {
    
    @Mock
    private EmotionRecordRepository emotionRecordRepository;
    
    @Mock
    private AIService aiService;
    
    @InjectMocks
    private EmotionService emotionService;
    
    private EmotionAnalysisRequest request;
    
    @BeforeEach
    void setUp() {
        request = new EmotionAnalysisRequest();
        request.setText("我今天非常开心！");
        request.setSource("conversation");
        request.setUserId(1L);
        request.setTimeOfDay(14);
        request.setDayOfWeek(5);
    }
    
    @Test
    void testAnalyzeEmotion_WithAI() {
        // Mock AI响应
        TextGenerationResponse aiResponse = new TextGenerationResponse();
        aiResponse.setContent("""
            {
              "primaryEmotion": "happy",
              "intensity": "moderate",
              "confidence": 0.85,
              "emotionTags": ["快乐", "积极"],
              "keyPhrases": ["非常开心"],
              "reasoning": "文本明确表达了开心的情绪"
            }
            """);
        
        when(aiService.generateText(anyLong(), any(TextGenerationRequest.class)))
            .thenReturn(aiResponse);
        
        // 执行分析
        EmotionAnalysisResponse response = emotionService.analyzeEmotion(request);
        
        // 验证结果
        assertNotNull(response);
        assertEquals("happy", response.getPrimaryEmotion());
        assertEquals("moderate", response.getIntensity());
        assertTrue(response.getConfidence() > 0.8);
        assertNotNull(response.getEmotionTags());
        assertNotNull(response.getKeyPhrases());
        
        // 验证AI服务被调用
        verify(aiService, times(1)).generateText(anyLong(), any(TextGenerationRequest.class));
    }
    
    @Test
    void testAnalyzeEmotion_FallbackToBasic() {
        // Mock AI失败
        when(aiService.generateText(anyLong(), any(TextGenerationRequest.class)))
            .thenThrow(new RuntimeException("AI服务不可用"));
        
        // 执行分析（应该降级到基础分析）
        EmotionAnalysisResponse response = emotionService.analyzeEmotion(request);
        
        // 验证结果（基础分析应该也能识别"开心"）
        assertNotNull(response);
        assertNotNull(response.getPrimaryEmotion());
        assertNotNull(response.getIntensity());
        assertTrue(response.getConfidence() > 0);
    }
    
    @Test
    void testSaveEmotionRecord() {
        // 准备数据
        EmotionAnalysisResponse analysis = new EmotionAnalysisResponse();
        analysis.setPrimaryEmotion("happy");
        analysis.setIntensity("moderate");
        analysis.setConfidence(0.85);
        analysis.setEmotionTags(List.of("快乐", "积极"));
        analysis.setKeyPhrases(List.of("非常开心"));
        
        EmotionRecord savedRecord = new EmotionRecord();
        savedRecord.setId(1L);
        savedRecord.setUserId(1L);
        savedRecord.setEmotionType("happy");
        
        when(emotionRecordRepository.save(any(EmotionRecord.class)))
            .thenReturn(savedRecord);
        
        // 执行保存
        EmotionRecord result = emotionService.saveEmotionRecord(analysis, request);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(emotionRecordRepository, times(1)).save(any(EmotionRecord.class));
    }
    
    @Test
    void testGetEmotionHistory() {
        // Mock数据
        EmotionRecord record1 = new EmotionRecord();
        record1.setId(1L);
        record1.setEmotionType("happy");
        record1.setTimestamp(LocalDateTime.now().minusDays(1));
        
        EmotionRecord record2 = new EmotionRecord();
        record2.setId(2L);
        record2.setEmotionType("sad");
        record2.setTimestamp(LocalDateTime.now());
        
        when(emotionRecordRepository.findByUserIdAndTimeRange(anyLong(), any(), any()))
            .thenReturn(List.of(record2, record1));
        
        // 执行查询
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();
        List<EmotionRecord> history = emotionService.getEmotionHistory(1L, startDate, endDate);
        
        // 验证结果
        assertNotNull(history);
        assertEquals(2, history.size());
        verify(emotionRecordRepository, times(1))
            .findByUserIdAndTimeRange(1L, startDate, endDate);
    }
    
    @Test
    void testGetCurrentEmotion() {
        // Mock数据
        EmotionRecord current = new EmotionRecord();
        current.setId(1L);
        current.setEmotionType("happy");
        current.setTimestamp(LocalDateTime.now());
        
        when(emotionRecordRepository.findFirstByUserIdOrderByTimestampDesc(anyLong()))
            .thenReturn(current);
        
        // 执行查询
        EmotionRecord result = emotionService.getCurrentEmotion(1L);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("happy", result.getEmotionType());
        verify(emotionRecordRepository, times(1))
            .findFirstByUserIdOrderByTimestampDesc(1L);
    }
    
    @Test
    void testGetEmotionStatistics() {
        // Mock数据
        Object[] stat1 = new Object[]{"happy", 5L};
        Object[] stat2 = new Object[]{"sad", 2L};
        
        when(emotionRecordRepository.countByEmotionType(anyLong(), any()))
            .thenReturn(List.of(stat1, stat2));
        
        // 执行查询
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        List<Object[]> statistics = emotionService.getEmotionStatistics(1L, startDate);
        
        // 验证结果
        assertNotNull(statistics);
        assertEquals(2, statistics.size());
        verify(emotionRecordRepository, times(1))
            .countByEmotionType(1L, startDate);
    }
}

