package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.service.MemoryDecayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 记忆衰减服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(com.heartsphere.config.MemoryTestConfig.class)
class MemoryDecayServiceImplTest {
    
    @Autowired
    private MemoryDecayService memoryDecayService;
    
    @Test
    void testCalculateTimeDecay() {
        // 测试最近访问的记忆（无衰减）
        Instant recent = Instant.now().minus(1, ChronoUnit.DAYS);
        double decay = memoryDecayService.calculateTimeDecay(recent);
        assertTrue(decay >= 0.0 && decay <= 1.0);
        assertTrue(decay < 0.1); // 1天应该衰减很少
        
        // 测试长期未访问的记忆（高衰减）
        Instant old = Instant.now().minus(60, ChronoUnit.DAYS);
        double oldDecay = memoryDecayService.calculateTimeDecay(old);
        assertTrue(oldDecay > decay); // 60天应该比1天衰减更多
    }
    
    @Test
    void testCalculateAccessDecay() {
        // 测试高频访问（低衰减）
        double highFreqDecay = memoryDecayService.calculateAccessDecay(100, Instant.now().minus(10, ChronoUnit.DAYS));
        assertTrue(highFreqDecay >= 0.0 && highFreqDecay <= 1.0);
        
        // 测试低频访问（高衰减）
        double lowFreqDecay = memoryDecayService.calculateAccessDecay(1, Instant.now().minus(10, ChronoUnit.DAYS));
        assertTrue(lowFreqDecay >= 0.0 && lowFreqDecay <= 1.0);
        assertTrue(lowFreqDecay >= highFreqDecay); // 低频应该衰减更多
        
        // 测试未访问（默认衰减）
        double noAccessDecay = memoryDecayService.calculateAccessDecay(0, null);
        assertEquals(0.1, noAccessDecay, 0.01);
    }
    
    @Test
    void testCalculateDecayedImportance() {
        // 测试计算衰减后的重要性
        String memoryId = "test-memory-" + System.currentTimeMillis();
        double importance = memoryDecayService.calculateDecayedImportance(memoryId, "PERSONAL_INFO");
        
        // 验证返回值在合理范围内
        assertTrue(importance >= 0.0 && importance <= 1.0);
    }
    
    @Test
    void testBatchUpdateDecay() {
        // 测试批量更新衰减
        int count = memoryDecayService.batchUpdateDecay(null, null, null);
        assertTrue(count >= 0);
    }
    
    @Test
    void testCleanupLowImportanceMemories() {
        // 测试清理低重要性记忆
        int cleaned = memoryDecayService.cleanupLowImportanceMemories(0.1);
        assertTrue(cleaned >= 0);
    }
    
    @Test
    void testGetDecayableMemories() {
        // 测试获取需要衰减的记忆
        List<MemoryDecayService.DecayableMemory> memories = 
            memoryDecayService.getDecayableMemories(null, 10);
        assertNotNull(memories);
    }
}

