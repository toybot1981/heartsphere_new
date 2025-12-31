package com.heartsphere.memory.integration;

import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.service.MemoryAssociationService;
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
 * 高级记忆能力集成测试
 * 测试向量搜索和记忆关联的完整集成
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class AdvancedMemoryIntegrationTest {
    
    @Autowired
    private VectorSearchService vectorSearchService;
    
    @Autowired
    private MemoryAssociationService memoryAssociationService;
    
    private String testUserId;
    private String testMemoryId1;
    private String testMemoryId2;
    private String testMemoryId3;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
        testMemoryId1 = "test-memory-1-" + System.currentTimeMillis();
        testMemoryId2 = "test-memory-2-" + System.currentTimeMillis();
        testMemoryId3 = "test-memory-3-" + System.currentTimeMillis();
    }
    
    @Test
    void testVectorSearchAndAssociationIntegration() {
        // 1. 保存记忆向量
        float[] vector1 = vectorSearchService.generateEmbedding("用户喜欢编程和Java");
        float[] vector2 = vectorSearchService.generateEmbedding("用户热爱编程和Python");
        float[] vector3 = vectorSearchService.generateEmbedding("用户喜欢音乐和钢琴");
        
        vectorSearchService.saveMemoryVector(
            testMemoryId1, MemoryType.PERSONAL_INFO, testUserId, null, null, vector1);
        vectorSearchService.saveMemoryVector(
            testMemoryId2, MemoryType.PERSONAL_INFO, testUserId, null, null, vector2);
        vectorSearchService.saveMemoryVector(
            testMemoryId3, MemoryType.PERSONAL_INFO, testUserId, null, null, vector3);
        
        // 2. 语义搜索
        List<VectorSearchService.SimilarMemory> searchResults = 
            vectorSearchService.searchSimilarMemories("编程", testUserId, null, null, 10, 0.0);
        
        // 验证
        assertNotNull(searchResults);
        
        // 3. 发现关联
        List<MemoryAssociationService.MemoryAssociation> associations = 
            memoryAssociationService.discoverAssociations(testMemoryId1, 10);
        
        // 验证
        assertNotNull(associations);
    }
    
    @Test
    void testMemoryNetworkBuilding() {
        // 1. 保存记忆向量
        float[] vector1 = vectorSearchService.generateEmbedding("用户喜欢编程");
        float[] vector2 = vectorSearchService.generateEmbedding("用户热爱编程");
        float[] vector3 = vectorSearchService.generateEmbedding("用户喜欢音乐");
        
        vectorSearchService.saveMemoryVector(
            testMemoryId1, MemoryType.PERSONAL_INFO, testUserId, null, null, vector1);
        vectorSearchService.saveMemoryVector(
            testMemoryId2, MemoryType.PERSONAL_INFO, testUserId, null, null, vector2);
        vectorSearchService.saveMemoryVector(
            testMemoryId3, MemoryType.PERSONAL_INFO, testUserId, null, null, vector3);
        
        // 2. 创建关联
        MemoryAssociationService.MemoryAssociation assoc1 = 
            createAssociation(testMemoryId1, testMemoryId2, 0.8);
        MemoryAssociationService.MemoryAssociation assoc2 = 
            createAssociation(testMemoryId2, testMemoryId3, 0.6);
        
        memoryAssociationService.saveAssociation(assoc1);
        memoryAssociationService.saveAssociation(assoc2);
        
        // 3. 构建记忆网络
        MemoryAssociationService.MemoryNetwork network = 
            memoryAssociationService.buildMemoryNetwork(testMemoryId1, 2);
        
        // 验证
        assertNotNull(network);
        assertEquals(testMemoryId1, network.getCenterMemoryId());
        assertNotNull(network.getNodes());
        assertNotNull(network.getEdges());
    }
    
    @Test
    void testAssociationBasedRetrieval() {
        // 1. 创建关联
        MemoryAssociationService.MemoryAssociation assoc1 = 
            createAssociation(testMemoryId1, testMemoryId2, 0.8);
        MemoryAssociationService.MemoryAssociation assoc2 = 
            createAssociation(testMemoryId1, testMemoryId3, 0.7);
        
        memoryAssociationService.saveAssociation(assoc1);
        memoryAssociationService.saveAssociation(assoc2);
        
        // 2. 基于关联检索
        List<MemoryAssociationService.MemoryAssociation> retrieved = 
            memoryAssociationService.retrieveByAssociation(testMemoryId1, 10);
        
        // 验证
        assertNotNull(retrieved);
        assertTrue(retrieved.size() >= 2);
    }
    
    /**
     * 创建测试关联
     */
    private MemoryAssociationService.MemoryAssociation createAssociation(
            String memoryId1, String memoryId2, double strength) {
        return new MemoryAssociationService.MemoryAssociation() {
            @Override
            public String getId() { return null; }
            
            @Override
            public String getMemoryId1() { return memoryId1; }
            
            @Override
            public String getMemoryId2() { return memoryId2; }
            
            @Override
            public MemoryType getMemoryType1() { return MemoryType.PERSONAL_INFO; }
            
            @Override
            public MemoryType getMemoryType2() { return MemoryType.PERSONAL_INFO; }
            
            @Override
            public MemoryAssociationService.AssociationType getAssociationType() {
                return MemoryAssociationService.AssociationType.SEMANTIC;
            }
            
            @Override
            public double getStrength() { return strength; }
            
            @Override
            public String getDescription() { return "测试关联"; }
        };
    }
}

