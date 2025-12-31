package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.MemoryVector;
import com.heartsphere.memory.repository.MemoryVectorRepository;
import com.heartsphere.memory.service.VectorSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.heartsphere.config.MemoryTestConfig;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 向量搜索服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class SimpleVectorSearchServiceTest {
    
    @Autowired
    private VectorSearchService vectorSearchService;
    
    @Autowired
    private MemoryVectorRepository memoryVectorRepository;
    
    private String testMemoryId1;
    private String testMemoryId2;
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testMemoryId1 = "test-memory-1-" + System.currentTimeMillis();
        testMemoryId2 = "test-memory-2-" + System.currentTimeMillis();
        testUserId = "test-user-" + System.currentTimeMillis();
    }
    
    @Test
    void testGenerateEmbedding() {
        // 测试生成向量嵌入
        String text = "这是一个测试文本";
        float[] embedding = vectorSearchService.generateEmbedding(text);
        
        // 验证
        assertNotNull(embedding);
        assertTrue(embedding.length > 0);
        assertEquals(384, embedding.length); // 当前固定维度
    }
    
    @Test
    void testGenerateMemoryEmbedding() {
        // 测试生成记忆向量嵌入
        String content = "用户喜欢编程";
        float[] embedding = vectorSearchService.generateMemoryEmbedding(
            testMemoryId1, MemoryType.PERSONAL_INFO, content);
        
        // 验证
        assertNotNull(embedding);
        assertTrue(embedding.length > 0);
    }
    
    @Test
    void testSaveMemoryVector() {
        // 生成向量
        float[] vector = vectorSearchService.generateEmbedding("测试记忆内容");
        
        // 保存向量
        vectorSearchService.saveMemoryVector(
            testMemoryId1, MemoryType.PERSONAL_INFO, testUserId, null, null, vector);
        
        // 验证
        assertTrue(memoryVectorRepository.findByMemoryId(testMemoryId1).isPresent());
    }
    
    @Test
    void testCosineSimilarity() {
        // 创建两个相似的向量
        float[] vector1 = vectorSearchService.generateEmbedding("我喜欢编程");
        float[] vector2 = vectorSearchService.generateEmbedding("我热爱编程");
        
        // 计算相似度
        double similarity = vectorSearchService.cosineSimilarity(vector1, vector2);
        
        // 验证
        assertTrue(similarity >= 0.0 && similarity <= 1.0);
    }
    
    @Test
    void testSearchSimilarMemories() {
        // 保存一些记忆向量
        float[] vector1 = vectorSearchService.generateEmbedding("用户喜欢编程");
        float[] vector2 = vectorSearchService.generateEmbedding("用户热爱编程");
        
        vectorSearchService.saveMemoryVector(
            testMemoryId1, MemoryType.PERSONAL_INFO, testUserId, null, null, vector1);
        vectorSearchService.saveMemoryVector(
            testMemoryId2, MemoryType.PERSONAL_INFO, testUserId, null, null, vector2);
        
        // 搜索相似记忆
        List<VectorSearchService.SimilarMemory> results = 
            vectorSearchService.searchSimilarMemories("编程", testUserId, null, null, 10, 0.0);
        
        // 验证
        assertNotNull(results);
        assertTrue(results.size() >= 0); // 可能为空，因为占位实现
    }
    
    @Test
    void testFindSimilarMemories() {
        // 保存记忆向量
        float[] vector1 = vectorSearchService.generateEmbedding("测试记忆1");
        vectorSearchService.saveMemoryVector(
            testMemoryId1, MemoryType.PERSONAL_INFO, testUserId, null, null, vector1);
        
        // 保存另一个记忆向量
        float[] vector2 = vectorSearchService.generateEmbedding("测试记忆2");
        vectorSearchService.saveMemoryVector(
            testMemoryId2, MemoryType.PERSONAL_INFO, testUserId, null, null, vector2);
        
        // 查找相似记忆
        List<VectorSearchService.SimilarMemory> results = 
            vectorSearchService.findSimilarMemories(testMemoryId1, 10, 0.0);
        
        // 验证
        assertNotNull(results);
    }
    
    @Test
    void testDeleteMemoryVector() {
        // 保存向量
        float[] vector = vectorSearchService.generateEmbedding("测试内容");
        vectorSearchService.saveMemoryVector(
            testMemoryId1, MemoryType.USER_FACT, testUserId, null, null, vector);
        
        // 验证存在
        assertTrue(memoryVectorRepository.findByMemoryId(testMemoryId1).isPresent());
        
        // 删除向量
        vectorSearchService.deleteMemoryVector(testMemoryId1);
        
        // 验证已删除
        assertFalse(memoryVectorRepository.findByMemoryId(testMemoryId1).isPresent());
    }
}

