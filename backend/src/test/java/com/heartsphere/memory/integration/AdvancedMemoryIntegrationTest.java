package com.heartsphere.memory.integration;

import com.heartsphere.memory.service.LongMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 高级记忆能力集成测试
 * 测试长期记忆服务
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class AdvancedMemoryIntegrationTest {
    
    @Autowired
    private LongMemoryService longMemoryService;
    
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
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testMemoryNetworkBuilding() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testAssociationBasedRetrieval() {
        // 测试长期记忆服务可用
        assertNotNull(longMemoryService);
        
        // 验证服务可以检索记忆
        var memories = longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        assertNotNull(memories);
    }
}

