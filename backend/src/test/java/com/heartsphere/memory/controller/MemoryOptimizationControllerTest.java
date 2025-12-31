package com.heartsphere.memory.controller;

import com.heartsphere.memory.model.ArchivedMemory;
import com.heartsphere.memory.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 记忆系统优化Controller测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@WebMvcTest(MemoryOptimizationController.class)
class MemoryOptimizationControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private MemoryDecayService memoryDecayService;
    
    @MockBean
    private MemoryCacheService memoryCacheService;
    
    @MockBean
    private MemoryCompressionService memoryCompressionService;
    
    @MockBean
    private MemoryArchivingService memoryArchivingService;
    
    @MockBean
    private MemoryMonitoringService memoryMonitoringService;
    
    @Test
    @WithMockUser
    void testUpdateDecay() throws Exception {
        // Mock服务
        when(memoryDecayService.batchUpdateDecay(anyString(), any(), any())).thenReturn(10);
        
        // 执行测试
        mockMvc.perform(post("/api/memory/v5/decay/update")
                .param("userId", "user-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.updatedCount").value(10));
    }
    
    @Test
    @WithMockUser
    void testWarmupCache() throws Exception {
        // 执行测试
        mockMvc.perform(post("/api/memory/v5/cache/warmup")
                .param("memoryIds", "memory-1", "memory-2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
        
        // 验证服务被调用
        verify(memoryCacheService).warmup(anyList());
    }
    
    @Test
    @WithMockUser
    void testClearCache() throws Exception {
        // 执行测试
        mockMvc.perform(delete("/api/memory/v5/cache/clear")
                .param("cacheType", "memory"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
        
        // 验证服务被调用
        verify(memoryCacheService).clear("memory");
    }
    
    @Test
    @WithMockUser
    void testGetCacheStats() throws Exception {
        // Mock服务
        MemoryCacheService.CacheStats stats = mock(MemoryCacheService.CacheStats.class);
        when(memoryCacheService.getStats()).thenReturn(stats);
        
        // 执行测试
        mockMvc.perform(get("/api/memory/v5/cache/stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
    
    @Test
    @WithMockUser
    void testCompressMemory() throws Exception {
        // Mock服务
        MemoryCompressionService.CompressionResult result = 
            mock(MemoryCompressionService.CompressionResult.class);
        when(result.isSuccess()).thenReturn(true);
        when(memoryCompressionService.compressBatch(anyList()))
            .thenReturn(Arrays.asList(result));
        
        // 执行测试
        mockMvc.perform(post("/api/memory/v5/compression/compress")
                .param("memoryIds", "memory-1", "memory-2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
    
    @Test
    @WithMockUser
    void testArchiveMemory() throws Exception {
        // Mock服务
        MemoryArchivingService.ArchiveResult result = 
            mock(MemoryArchivingService.ArchiveResult.class);
        when(result.isSuccess()).thenReturn(true);
        when(memoryArchivingService.archiveBatch(anyList(), anyString()))
            .thenReturn(Arrays.asList(result));
        
        // 执行测试
        mockMvc.perform(post("/api/memory/v5/archiving/archive")
                .param("memoryIds", "memory-1", "memory-2")
                .param("reason", "测试归档"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
    
    @Test
    @WithMockUser
    void testListArchived() throws Exception {
        // Mock服务
        ArchivedMemory archived = ArchivedMemory.builder()
            .id("archived-1")
            .originalMemoryId("memory-1")
            .build();
        Page<ArchivedMemory> page = new PageImpl<>(
            Arrays.asList(archived), 
            PageRequest.of(0, 20), 
            1
        );
        when(memoryArchivingService.listArchived(anyString(), any()))
            .thenReturn(page);
        
        // 执行测试
        mockMvc.perform(get("/api/memory/v5/archiving/list")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.total").value(1));
    }
    
    @Test
    @WithMockUser
    void testRestoreArchived() throws Exception {
        // 执行测试
        mockMvc.perform(post("/api/memory/v5/archiving/restore")
                .param("archivedMemoryId", "archived-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
        
        // 验证服务被调用
        verify(memoryArchivingService).restore("archived-1");
    }
    
    @Test
    @WithMockUser
    void testGetPerformanceMetrics() throws Exception {
        // Mock服务
        MemoryMonitoringService.PerformanceMetrics metrics = 
            mock(MemoryMonitoringService.PerformanceMetrics.class);
        when(memoryMonitoringService.getPerformanceMetrics(any(), any()))
            .thenReturn(metrics);
        
        // 执行测试
        mockMvc.perform(get("/api/memory/v5/monitoring/metrics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
    
    @Test
    @WithMockUser
    void testHealthCheck() throws Exception {
        // Mock服务
        MemoryMonitoringService.HealthStatus health = 
            mock(MemoryMonitoringService.HealthStatus.class);
        when(health.getStatus()).thenReturn("HEALTHY");
        when(memoryMonitoringService.healthCheck()).thenReturn(health);
        
        // 执行测试
        mockMvc.perform(get("/api/memory/v5/monitoring/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.status").value("HEALTHY"));
    }
    
    @Test
    @WithMockUser
    void testGetDiagnostics() throws Exception {
        // Mock服务
        MemoryMonitoringService.DiagnosticsInfo diagnostics = 
            mock(MemoryMonitoringService.DiagnosticsInfo.class);
        when(memoryMonitoringService.diagnose()).thenReturn(diagnostics);
        
        // 执行测试
        mockMvc.perform(get("/api/memory/v5/monitoring/diagnostics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
}


