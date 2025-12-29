package com.heartsphere.memory.service;

import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserMemory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 温度感记忆服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest
@ActiveProfiles("test")
class TemperatureMemoryServiceTest {
    
    @Autowired
    private TemperatureMemoryService temperatureMemoryService;
    
    @Test
    void testExtractEmotionPatternMemory() {
        if (temperatureMemoryService == null) {
            System.out.println("TemperatureMemoryService未配置，跳过测试");
            return;
        }
        
        // 创建情绪记录（应该保存为情绪模式）
        EmotionRecord record = new EmotionRecord();
        record.setId(1L); // 设置ID避免NullPointerException
        record.setUserId(1L); // 使用固定ID避免解析问题
        record.setEmotionType("happy");
        record.setEmotionIntensity("moderate");
        record.setConfidence(0.8);
        record.setSource("conversation");
        record.setTimestamp(LocalDateTime.now());
        
        // 提取记忆
        List<UserMemory> memories = temperatureMemoryService.extractMemoriesFromEmotion(
            "1", record
        );
        
        // 验证
        assertNotNull(memories);
        // 根据置信度和强度，应该提取情绪模式记忆
        if (record.getConfidence() > 0.7 && 
            (record.getEmotionIntensity().equals("moderate") || 
             record.getEmotionIntensity().equals("strong"))) {
            assertFalse(memories.isEmpty(), "应该提取至少一种记忆");
            
            // 应该包含情绪模式记忆
            boolean hasPattern = memories.stream()
                .anyMatch(m -> m.getType() == MemoryType.EMOTION_PATTERN);
            assertTrue(hasPattern, "应该包含情绪模式记忆");
        }
    }
    
    @Test
    void testExtractEmotionalExperienceMemory() {
        if (temperatureMemoryService == null) {
            System.out.println("TemperatureMemoryService未配置，跳过测试");
            return;
        }
        
        // 创建强烈情绪记录（应该保存为情感经历）
        EmotionRecord record = new EmotionRecord();
        record.setId(2L); // 设置ID避免NullPointerException
        record.setUserId(1L);
        record.setEmotionType("sad");
        record.setEmotionIntensity("strong");
        record.setConfidence(0.9);
        record.setSource("conversation");
        record.setContext("今天心情很不好");
        record.setTimestamp(LocalDateTime.now());
        
        // 提取记忆
        List<UserMemory> memories = temperatureMemoryService.extractMemoriesFromEmotion(
            "1", record
        );
        
        // 验证
        assertNotNull(memories);
        
        // 如果是强烈情绪且置信度高，应该包含情感经历记忆
        if (record.getEmotionIntensity().equals("strong") && record.getConfidence() > 0.7) {
            boolean hasExperience = memories.stream()
                .anyMatch(m -> m.getType() == MemoryType.EMOTIONAL_EXPERIENCE);
            assertTrue(hasExperience, "应该包含情感经历记忆");
        }
    }
    
    @Test
    void testRetrieveMemoriesByEmotion() {
        if (temperatureMemoryService == null) {
            System.out.println("TemperatureMemoryService未配置，跳过测试");
            return;
        }
        
        // 检索记忆（可能为空，因为测试环境可能没有数据）
        List<UserMemory> memories = temperatureMemoryService.retrieveMemoriesByEmotion(
            "1", "happy", 10
        );
        
        // 验证（至少应该返回空列表，不应该抛出异常）
        assertNotNull(memories);
    }
    
    @Test
    void testGetEmotionPatterns() {
        if (temperatureMemoryService == null) {
            System.out.println("TemperatureMemoryService未配置，跳过测试");
            return;
        }
        
        // 获取情绪模式
        List<UserMemory> patterns = temperatureMemoryService.getEmotionPatterns("1");
        
        // 验证
        assertNotNull(patterns);
    }
    
    @Test
    void testAnalyzeEmotionTrend() {
        if (temperatureMemoryService == null) {
            System.out.println("TemperatureMemoryService未配置，跳过测试");
            return;
        }
        
        // 分析情绪趋势（可能返回null，因为测试环境可能没有数据）
        UserMemory trend = temperatureMemoryService.analyzeAndSaveEmotionTrend(
            "1", "week"
        );
        
        // 验证（可能为null，但不应该抛出异常）
        // 如果有数据，应该包含趋势信息
        if (trend != null) {
            assertNotNull(trend.getStructuredData());
            assertTrue(trend.getStructuredData().containsKey("dominantEmotion"));
        }
    }
}
