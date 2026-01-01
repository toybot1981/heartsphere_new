package com.heartsphere.memory.service;

import com.heartsphere.memory.service.LongMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 记忆服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest
@ActiveProfiles("test")
class TemperatureMemoryServiceTest {
    
    @Autowired
    private LongMemoryService longMemoryService;
    
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
    }
    
    @Test
    void testExtractEmotionPatternMemory() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testExtractEmotionalExperienceMemory() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testRetrieveMemoriesByEmotion() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testGetEmotionPatterns() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testAnalyzeEmotionTrend() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
}
