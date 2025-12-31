package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.service.IntelligentRetrievalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 智能检索服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(com.heartsphere.config.MemoryTestConfig.class)
class IntelligentRetrievalServiceImplTest {
    
    @Autowired
    private IntelligentRetrievalService intelligentRetrievalService;
    
    @Test
    void testMultiDimensionSearch() {
        // 测试多维度检索
        String query = "测试查询";
        String userId = "test-user-" + System.currentTimeMillis();
        Map<String, Object> context = new HashMap<>();
        
        List<IntelligentRetrievalService.RetrievedMemory> results = 
            intelligentRetrievalService.multiDimensionSearch(
                query, userId, null, null, context, 10);
        
        assertNotNull(results);
    }
    
    @Test
    void testIntelligentSort() {
        // 测试智能排序
        String query = "测试查询";
        Map<String, Object> context = new HashMap<>();
        
        // 创建测试数据
        List<IntelligentRetrievalService.RetrievedMemory> memories = 
            intelligentRetrievalService.multiDimensionSearch(
                query, null, null, null, context, 10);
        
        // 排序
        List<IntelligentRetrievalService.RetrievedMemory> sorted = 
            intelligentRetrievalService.intelligentSort(memories, query, context);
        
        assertNotNull(sorted);
        
        // 验证排序（分数应该递减）
        if (sorted.size() > 1) {
            for (int i = 0; i < sorted.size() - 1; i++) {
                assertTrue(sorted.get(i).getFinalScore() >= sorted.get(i + 1).getFinalScore());
            }
        }
    }
    
    @Test
    void testRecommendRelatedMemories() {
        // 测试推荐相关记忆
        String memoryId = "test-memory-" + System.currentTimeMillis();
        
        List<IntelligentRetrievalService.RetrievedMemory> recommendations = 
            intelligentRetrievalService.recommendRelatedMemories(memoryId, 10);
        
        assertNotNull(recommendations);
    }
    
    @Test
    void testHybridSearch() {
        // 测试混合检索
        String query = "测试查询";
        String userId = "test-user-" + System.currentTimeMillis();
        
        List<IntelligentRetrievalService.RetrievedMemory> results = 
            intelligentRetrievalService.hybridSearch(
                query, userId, 0.4, 0.3, 0.3, 10);
        
        assertNotNull(results);
    }
    
    @Test
    void testHybridSearchWithDifferentWeights() {
        // 测试不同权重的混合检索
        String query = "测试查询";
        String userId = "test-user-" + System.currentTimeMillis();
        
        // 语义权重高
        List<IntelligentRetrievalService.RetrievedMemory> semanticResults = 
            intelligentRetrievalService.hybridSearch(
                query, userId, 0.7, 0.2, 0.1, 10);
        
        // 关键词权重高
        List<IntelligentRetrievalService.RetrievedMemory> keywordResults = 
            intelligentRetrievalService.hybridSearch(
                query, userId, 0.2, 0.7, 0.1, 10);
        
        assertNotNull(semanticResults);
        assertNotNull(keywordResults);
    }
}

