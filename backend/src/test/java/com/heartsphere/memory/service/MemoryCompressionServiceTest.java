package com.heartsphere.memory.service;

import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.repository.UserMemoryRepository;
import com.heartsphere.memory.service.impl.MemoryCompressionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * 记忆压缩服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@ExtendWith(MockitoExtension.class)
class MemoryCompressionServiceTest {
    
    @Mock
    private UserMemoryRepository userMemoryRepository;
    
    @InjectMocks
    private MemoryCompressionServiceImpl compressionService;
    
    private UserMemory testMemory;
    
    @BeforeEach
    void setUp() {
        testMemory = UserMemory.builder()
            .id("memory-1")
            .userId("user-1")
            .type(MemoryType.PERSONAL_INFO)
            .content("这是一段测试内容，用于测试记忆压缩功能。内容应该足够长以便进行压缩测试。")
            .createdAt(Instant.now())
            .build();
    }
    
    @Test
    void testCompress_Success() {
        // Mock Repository
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(testMemory));
        
        // 执行测试
        MemoryCompressionService.CompressionResult result = compressionService.compress("memory-1");
        
        // 验证结果
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("memory-1", result.getMemoryId());
        assertTrue(result.getOriginalSize() > 0);
        assertTrue(result.getCompressedSize() > 0);
        assertTrue(result.getCompressionRatio() > 0 && result.getCompressionRatio() <= 1);
    }
    
    @Test
    void testCompress_MemoryNotFound() {
        // Mock Repository返回空
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.empty());
        
        // 执行测试
        MemoryCompressionService.CompressionResult result = compressionService.compress("memory-1");
        
        // 验证结果
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
    }
    
    @Test
    void testCompress_EmptyContent() {
        // 准备测试数据
        UserMemory emptyMemory = UserMemory.builder()
            .id("memory-1")
            .content("")
            .build();
        
        // Mock Repository
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(emptyMemory));
        
        // 执行测试
        MemoryCompressionService.CompressionResult result = compressionService.compress("memory-1");
        
        // 验证结果
        assertNotNull(result);
        assertFalse(result.isSuccess());
    }
    
    @Test
    void testCompressBatch() {
        // 准备测试数据
        List<String> memoryIds = Arrays.asList("memory-1", "memory-2");
        
        // Mock Repository
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(testMemory));
        when(userMemoryRepository.findById("memory-2")).thenReturn(Optional.of(testMemory));
        
        // 执行测试
        List<MemoryCompressionService.CompressionResult> results = 
            compressionService.compressBatch(memoryIds);
        
        // 验证结果
        assertNotNull(results);
        assertEquals(2, results.size());
    }
    
    @Test
    void testDecompress() {
        // Mock Repository
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(testMemory));
        
        // 执行测试
        String result = compressionService.decompress("memory-1");
        
        // 验证结果
        assertNotNull(result);
        assertEquals(testMemory.getContent(), result);
    }
    
    @Test
    void testGetStats() {
        // 先执行一些压缩操作
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(testMemory));
        compressionService.compress("memory-1");
        
        // 执行测试
        MemoryCompressionService.CompressionStats stats = compressionService.getStats();
        
        // 验证结果
        assertNotNull(stats);
        assertTrue(stats.getTotalCompressed() > 0);
    }
}

