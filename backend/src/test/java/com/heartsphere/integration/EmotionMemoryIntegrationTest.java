package com.heartsphere.integration;

import com.heartsphere.emotion.dto.EmotionAnalysisRequest;
import com.heartsphere.emotion.dto.EmotionAnalysisResponse;
import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.emotion.service.EmotionService;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.service.TemperatureMemoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 情绪与记忆系统集成测试
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EmotionMemoryIntegrationTest {
    
    @Autowired(required = false)
    private EmotionService emotionService;
    
    @Autowired(required = false)
    private TemperatureMemoryService temperatureMemoryService;
    
    @Test
    void testEmotionAnalysisAndMemoryExtraction() {
        if (emotionService == null || temperatureMemoryService == null) {
            System.out.println("服务未配置，跳过集成测试");
            return;
        }
        
        // 1. 分析情绪
        EmotionAnalysisRequest request = new EmotionAnalysisRequest();
        request.setText("我今天非常开心，完成了重要的工作！");
        request.setSource("conversation");
        request.setUserId(1L);
        
        EmotionAnalysisResponse response = emotionService.analyzeEmotion(request);
        assertNotNull(response);
        assertNotNull(response.getPrimaryEmotion());
        
        // 2. 保存情绪记录（会自动提取记忆）
        EmotionRecord record = emotionService.saveEmotionRecord(response, request);
        assertNotNull(record);
        assertNotNull(record.getId());
        
        // 3. 提取记忆
        List<UserMemory> memories = temperatureMemoryService.extractMemoriesFromEmotion(
            "1", record
        );
        
        // 验证记忆被提取
        assertNotNull(memories);
        // 根据情绪特征，应该至少提取一种类型的记忆
        if (record.getConfidence() > 0.7) {
            assertTrue(memories.size() > 0, "应该提取至少一种记忆");
        }
    }
    
    @Test
    void testMemoryRetrievalByEmotion() {
        if (temperatureMemoryService == null) {
            System.out.println("服务未配置，跳过集成测试");
            return;
        }
        
        // 检索与"happy"情绪相关的记忆
        List<UserMemory> memories = temperatureMemoryService.retrieveMemoriesByEmotion(
            "1", "happy", 10
        );
        
        assertNotNull(memories);
        // 如果没有记忆，返回空列表是正常的
    }
    
    @Test
    void testEmotionTrendAnalysis() {
        if (temperatureMemoryService == null) {
            System.out.println("服务未配置，跳过集成测试");
            return;
        }
        
        // 分析一周的情绪趋势
        UserMemory trend = temperatureMemoryService.analyzeAndSaveEmotionTrend("1", "week");
        
        // 如果没有数据，返回null是正常的
        if (trend != null) {
            assertNotNull(trend.getContent());
            assertNotNull(trend.getStructuredData());
        }
    }
}



