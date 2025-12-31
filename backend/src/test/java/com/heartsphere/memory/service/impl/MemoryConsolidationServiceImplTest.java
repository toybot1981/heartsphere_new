package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.service.MemoryConsolidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 记忆巩固服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(com.heartsphere.config.MemoryTestConfig.class)
class MemoryConsolidationServiceImplTest {
    
    @Autowired
    private MemoryConsolidationService memoryConsolidationService;
    
    @Test
    void testEvaluateImportance() {
        // 测试评估记忆重要性
        String memoryId = "test-memory-" + System.currentTimeMillis();
        double importance = memoryConsolidationService.evaluateImportance(memoryId, MemoryType.PERSONAL_INFO);
        
        // 验证返回值在合理范围内
        assertTrue(importance >= 0.0 && importance <= 1.0);
    }
    
    @Test
    void testUpdateMemoryImportance() {
        // 测试更新记忆重要性
        String memoryId = "test-memory-" + System.currentTimeMillis();
        assertDoesNotThrow(() -> {
            memoryConsolidationService.updateMemoryImportance(memoryId, MemoryType.PERSONAL_INFO);
        });
    }
    
    @Test
    void testBatchUpdateImportance() {
        // 测试批量更新重要性
        int count = memoryConsolidationService.batchUpdateImportance(null);
        assertTrue(count >= 0);
    }
    
    @Test
    void testConsolidateMemory() {
        // 测试巩固记忆
        String memoryId = "test-memory-" + System.currentTimeMillis();
        assertDoesNotThrow(() -> {
            memoryConsolidationService.consolidateMemory(memoryId, MemoryType.PERSONAL_INFO);
        });
    }
    
    @Test
    void testConsolidateMemories() {
        // 测试批量巩固记忆
        String userId = "test-user-" + System.currentTimeMillis();
        List<String> memoryIds = List.of("memory-1", "memory-2");
        
        assertDoesNotThrow(() -> {
            memoryConsolidationService.consolidateMemories(userId, memoryIds);
        });
    }
    
    @Test
    void testConsolidateSessionMemories() {
        // 测试巩固会话记忆
        String userId = "test-user-" + System.currentTimeMillis();
        String sessionId = "test-session-" + System.currentTimeMillis();
        
        assertDoesNotThrow(() -> {
            memoryConsolidationService.consolidateSessionMemories(userId, sessionId);
        });
    }
    
    @Test
    void testFindDuplicateMemories() {
        // 测试查找重复记忆
        String userId = "test-user-" + System.currentTimeMillis();
        String content = "测试记忆内容";
        
        List<MemoryConsolidationService.DuplicateMemory> duplicates = 
            memoryConsolidationService.findDuplicateMemories(userId, content, MemoryType.PERSONAL_INFO);
        
        assertNotNull(duplicates);
    }
    
    @Test
    void testMergeMemories() {
        // 测试合并记忆
        String targetMemoryId = "target-memory-" + System.currentTimeMillis();
        List<String> sourceMemoryIds = List.of("source-1", "source-2");
        
        assertDoesNotThrow(() -> {
            memoryConsolidationService.mergeMemories(targetMemoryId, sourceMemoryIds);
        });
    }
}

