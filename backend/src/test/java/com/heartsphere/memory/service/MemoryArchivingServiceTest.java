package com.heartsphere.memory.service;

import com.heartsphere.memory.model.ArchivedMemory;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.repository.ArchivedMemoryRepository;
import com.heartsphere.memory.repository.UserMemoryRepository;
import com.heartsphere.memory.service.impl.MemoryArchivingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 记忆归档服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@ExtendWith(MockitoExtension.class)
class MemoryArchivingServiceTest {
    
    @Mock
    private UserMemoryRepository userMemoryRepository;
    
    @Mock
    private ArchivedMemoryRepository archivedMemoryRepository;
    
    @InjectMocks
    private MemoryArchivingServiceImpl archivingService;
    
    private UserMemory testMemory;
    
    @BeforeEach
    void setUp() {
        testMemory = UserMemory.builder()
            .id("memory-1")
            .userId("user-1")
            .type(MemoryType.PERSONAL_INFO)
            .content("测试内容")
            .importance(MemoryImportance.IMPORTANT)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .build();
    }
    
    @Test
    void testArchive_Success() {
        // Mock Repository
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(testMemory));
        when(archivedMemoryRepository.findByOriginalMemoryId("memory-1"))
            .thenReturn(Optional.empty());
        when(archivedMemoryRepository.save(any(ArchivedMemory.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        MemoryArchivingService.ArchiveResult result = 
            archivingService.archive("memory-1", "测试归档");
        
        // 验证结果
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("memory-1", result.getMemoryId());
        assertNotNull(result.getArchivedMemoryId());
        
        // 验证保存被调用
        verify(archivedMemoryRepository).save(any(ArchivedMemory.class));
    }
    
    @Test
    void testArchive_MemoryNotFound() {
        // Mock Repository返回空
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.empty());
        
        // 执行测试
        MemoryArchivingService.ArchiveResult result = 
            archivingService.archive("memory-1", "测试归档");
        
        // 验证结果
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
    }
    
    @Test
    void testArchive_AlreadyArchived() {
        // Mock已归档
        ArchivedMemory existingArchived = ArchivedMemory.builder()
            .id("archived-1")
            .originalMemoryId("memory-1")
            .build();
        
        when(userMemoryRepository.findById("memory-1")).thenReturn(Optional.of(testMemory));
        when(archivedMemoryRepository.findByOriginalMemoryId("memory-1"))
            .thenReturn(Optional.of(existingArchived));
        
        // 执行测试
        MemoryArchivingService.ArchiveResult result = 
            archivingService.archive("memory-1", "测试归档");
        
        // 验证结果
        assertNotNull(result);
        assertFalse(result.isSuccess());
    }
    
    @Test
    void testArchiveBatch() {
        // 准备测试数据
        List<String> memoryIds = Arrays.asList("memory-1", "memory-2");
        
        // Mock Repository
        when(userMemoryRepository.findById(anyString())).thenReturn(Optional.of(testMemory));
        when(archivedMemoryRepository.findByOriginalMemoryId(anyString()))
            .thenReturn(Optional.empty());
        when(archivedMemoryRepository.save(any(ArchivedMemory.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        List<MemoryArchivingService.ArchiveResult> results = 
            archivingService.archiveBatch(memoryIds, "批量归档");
        
        // 验证结果
        assertNotNull(results);
        assertEquals(2, results.size());
    }
    
    @Test
    void testListArchived() {
        // 准备测试数据
        ArchivedMemory archived = ArchivedMemory.builder()
            .id("archived-1")
            .originalMemoryId("memory-1")
            .userId("user-1")
            .build();
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<ArchivedMemory> page = new PageImpl<>(Arrays.asList(archived), pageable, 1);
        
        // Mock Repository
        when(archivedMemoryRepository.findByUserId("user-1", pageable)).thenReturn(page);
        
        // 执行测试
        Page<ArchivedMemory> result = archivingService.listArchived("user-1", pageable);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
    
    @Test
    void testRestore() {
        // 准备测试数据
        ArchivedMemory archived = ArchivedMemory.builder()
            .id("archived-1")
            .originalMemoryId("memory-1")
            .userId("user-1")
            .memoryType(MemoryType.PERSONAL_INFO)
            .content("测试内容")
            .build();
        
        // Mock Repository
        when(archivedMemoryRepository.findById("archived-1"))
            .thenReturn(Optional.of(archived));
        when(userMemoryRepository.save(any(UserMemory.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        archivingService.restore("archived-1");
        
        // 验证结果
        verify(userMemoryRepository).save(any(UserMemory.class));
        verify(archivedMemoryRepository).delete(archived);
    }
    
    @Test
    void testDeletePermanently() {
        // 执行测试
        archivingService.deletePermanently("archived-1");
        
        // 验证结果
        verify(archivedMemoryRepository).deleteById("archived-1");
    }
    
    @Test
    void testGetStats() {
        // 执行测试
        MemoryArchivingService.ArchiveStats stats = archivingService.getStats();
        
        // 验证结果
        assertNotNull(stats);
        assertTrue(stats.getTotalArchived() >= 0);
    }
}

