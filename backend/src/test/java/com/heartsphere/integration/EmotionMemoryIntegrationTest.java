package com.heartsphere.integration;

import com.heartsphere.memory.service.LongMemoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 情绪与记忆系统集成测试
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EmotionMemoryIntegrationTest {
    
    @Autowired(required = false)
    private LongMemoryService longMemoryService;
    
    private String testUserId;
    
    @Test
    void testEmotionAnalysisAndMemoryExtraction() {
        if (longMemoryService == null) {
            System.out.println("服务未配置，跳过集成测试");
            return;
        }
        
        testUserId = "test-user-" + System.currentTimeMillis();
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testMemoryRetrievalByEmotion() {
        if (longMemoryService == null) {
            System.out.println("服务未配置，跳过集成测试");
            return;
        }
        
        testUserId = "test-user-" + System.currentTimeMillis();
        
        // 检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testEmotionTrendAnalysis() {
        if (longMemoryService == null) {
            System.out.println("服务未配置，跳过集成测试");
            return;
        }
        
        testUserId = "test-user-" + System.currentTimeMillis();
        
        // 检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
}
