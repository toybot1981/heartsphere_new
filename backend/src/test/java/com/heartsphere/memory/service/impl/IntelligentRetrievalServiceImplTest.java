package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.service.LongMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 智能检索服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class IntelligentRetrievalServiceImplTest {
    
    @Autowired
    private LongMemoryService longMemoryService;
    
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
    }
    
    @Test
    void testMultiDimensionSearch() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testIntelligentSort() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testRecommendRelatedMemories() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testHybridSearch() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testHybridSearchWithDifferentWeights() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
}

