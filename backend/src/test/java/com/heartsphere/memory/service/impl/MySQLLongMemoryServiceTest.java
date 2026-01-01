package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.UserFactEntity;
import com.heartsphere.memory.entity.UserMemoryEntity;
import com.heartsphere.memory.entity.UserPreferenceEntity;
import com.heartsphere.memory.model.*;
import com.heartsphere.memory.repository.jpa.UserFactRepository;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.memory.repository.jpa.UserPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * MySQLLongMemoryService单元测试
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@ExtendWith(MockitoExtension.class)
class MySQLLongMemoryServiceTest {
    
    @Mock
    private UserFactRepository userFactRepository;
    
    @Mock
    private UserPreferenceRepository userPreferenceRepository;
    
    @Mock
    private UserMemoryRepository userMemoryRepository;
    
    @InjectMocks
    private MySQLLongMemoryService mySQLLongMemoryService;
    
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
    }
    
    // ========== 用户事实测试 ==========
    
    @Test
    void testSaveFact() {
        // Given
        UserFact fact = UserFact.builder()
            .id("fact-1")
            .userId(testUserId)
            .fact("用户喜欢看电影")
            .category(FactCategory.PERSONAL)
            .importance(0.8)
            .confidence(0.9)
            .build();
        
        UserFactEntity entity = new UserFactEntity();
        entity.setId("fact-1");
        entity.setUserId(testUserId);
        entity.setFact("用户喜欢看电影");
        
        when(userFactRepository.save(any(UserFactEntity.class))).thenReturn(entity);
        
        // When
        mySQLLongMemoryService.saveFact(fact);
        
        // Then
        verify(userFactRepository, times(1)).save(any(UserFactEntity.class));
    }
    
    @Test
    void testGetFact() {
        // Given
        String factId = "fact-1";
        UserFactEntity entity = UserFactEntity.builder()
            .id(factId)
            .userId(testUserId)
            .fact("用户喜欢看电影")
            .category(FactCategory.PERSONAL)
            .importance(0.8)
            .confidence(0.9)
            .accessCount(0)
            .build();
        
        when(userFactRepository.findById(factId)).thenReturn(Optional.of(entity));
        when(userFactRepository.save(any(UserFactEntity.class))).thenReturn(entity);
        
        // When
        UserFact result = mySQLLongMemoryService.getFact(factId);
        
        // Then
        assertNotNull(result);
        assertEquals(factId, result.getId());
        assertEquals(testUserId, result.getUserId());
        verify(userFactRepository, times(1)).findById(factId);
    }
    
    @Test
    void testGetAllFacts() {
        // Given
        List<UserFactEntity> entities = Arrays.asList(
            UserFactEntity.builder()
                .id("fact-1")
                .userId(testUserId)
                .fact("事实1")
                .category(FactCategory.PERSONAL)
                .build(),
            UserFactEntity.builder()
                .id("fact-2")
                .userId(testUserId)
                .fact("事实2")
                .category(FactCategory.PREFERENCE)
                .build()
        );
        
        when(userFactRepository.findByUserIdOrderByCreatedAtDesc(testUserId)).thenReturn(entities);
        
        // When
        List<UserFact> result = mySQLLongMemoryService.getAllFacts(testUserId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(userFactRepository, times(1)).findByUserIdOrderByCreatedAtDesc(testUserId);
    }
    
    @Test
    void testSearchFacts() {
        // Given
        String query = "电影";
        List<UserFactEntity> entities = Arrays.asList(
            UserFactEntity.builder()
                .id("fact-1")
                .userId(testUserId)
                .fact("用户喜欢看电影")
                .category(FactCategory.PERSONAL)
                .build()
        );
        
        when(userFactRepository.searchFacts(testUserId, query)).thenReturn(entities);
        
        // When
        List<UserFact> result = mySQLLongMemoryService.searchFacts(testUserId, query);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userFactRepository, times(1)).searchFacts(testUserId, query);
    }
    
    // ========== 用户偏好测试 ==========
    
    @Test
    void testSavePreference() {
        // Given
        UserPreference preference = UserPreference.builder()
            .id("pref-1")
            .userId(testUserId)
            .key("favorite_color")
            .value("蓝色")
            .type(PreferenceType.STRING)
            .build();
        
        when(userPreferenceRepository.findByUserIdAndKey(testUserId, "favorite_color"))
            .thenReturn(Optional.empty());
        when(userPreferenceRepository.save(any(UserPreferenceEntity.class)))
            .thenReturn(new UserPreferenceEntity());
        
        // When
        mySQLLongMemoryService.savePreference(preference);
        
        // Then
        verify(userPreferenceRepository, times(1)).save(any(UserPreferenceEntity.class));
    }
    
    @Test
    void testGetPreference() {
        // Given
        String key = "favorite_color";
        UserPreferenceEntity entity = UserPreferenceEntity.builder()
            .id("pref-1")
            .userId(testUserId)
            .key(key)
            .value("蓝色")
            .type(PreferenceType.STRING)
            .build();
        
        when(userPreferenceRepository.findByUserIdAndKey(testUserId, key))
            .thenReturn(Optional.of(entity));
        when(userPreferenceRepository.save(any(UserPreferenceEntity.class)))
            .thenReturn(entity);
        
        // When
        UserPreference result = mySQLLongMemoryService.getPreference(testUserId, key);
        
        // Then
        assertNotNull(result);
        assertEquals(key, result.getKey());
        verify(userPreferenceRepository, times(1)).findByUserIdAndKey(testUserId, key);
    }
    
    // ========== 记忆检索测试 ==========
    
    @Test
    void testRetrieveRelevantMemories() {
        // Given
        String query = "电影";
        int limit = 10;
        Pageable pageable = PageRequest.of(0, limit);
        
        List<UserMemoryEntity> entities = Arrays.asList(
            UserMemoryEntity.builder()
                .id("memory-1")
                .userId(testUserId)
                .type(MemoryType.PREFERENCE)
                .importance(MemoryImportance.IMPORTANT)
                .content("用户喜欢看电影")
                .source(MemorySource.CONVERSATION)
                .accessCount(0)
                .build()
        );
        
        when(userMemoryRepository.searchByContent(testUserId, query, pageable))
            .thenReturn(entities);
        
        // When
        List<UserMemory> result = mySQLLongMemoryService.retrieveRelevantMemories(testUserId, query, limit);
        
        // Then
        assertNotNull(result);
        assertTrue(result.size() <= limit);
        verify(userMemoryRepository, times(1)).searchByContent(eq(testUserId), eq(query), any(Pageable.class));
    }
    
    @Test
    void testRetrieveMemoriesByContext_WithType() {
        // Given
        Map<String, Object> context = new HashMap<>();
        context.put("type", "PREFERENCE");
        int limit = 10;
        Pageable pageable = PageRequest.of(0, limit);
        
        List<UserMemoryEntity> entities = Arrays.asList(
            UserMemoryEntity.builder()
                .id("memory-1")
                .userId(testUserId)
                .type(MemoryType.PREFERENCE)
                .importance(MemoryImportance.IMPORTANT)
                .content("偏好内容")
                .source(MemorySource.CONVERSATION)
                .build()
        );
        
        when(userMemoryRepository.findByUserIdAndTypeOrderByCreatedAtDesc(
            eq(testUserId), eq(MemoryType.PREFERENCE), any(Pageable.class)))
            .thenReturn(entities);
        
        // When
        List<UserMemory> result = mySQLLongMemoryService.retrieveMemoriesByContext(testUserId, context, limit);
        
        // Then
        assertNotNull(result);
        verify(userMemoryRepository, times(1)).findByUserIdAndTypeOrderByCreatedAtDesc(
            eq(testUserId), eq(MemoryType.PREFERENCE), any(Pageable.class));
    }
    
    // ========== 扩展方法测试 ==========
    
    @Test
    void testSaveMemory() {
        // Given
        UserMemory memory = UserMemory.builder()
            .id("memory-1")
            .userId(testUserId)
            .type(MemoryType.PREFERENCE)
            .importance(MemoryImportance.IMPORTANT)
            .content("记忆内容")
            .source(MemorySource.JOURNAL)
            .sourceId("journal-1")
            .confidence(0.8)
            .build();
        
        when(userMemoryRepository.save(any(UserMemoryEntity.class)))
            .thenReturn(new UserMemoryEntity());
        
        // When
        mySQLLongMemoryService.saveMemory(memory);
        
        // Then
        verify(userMemoryRepository, times(1)).save(any(UserMemoryEntity.class));
    }
    
    @Test
    void testSaveMemories() {
        // Given
        List<UserMemory> memories = Arrays.asList(
            UserMemory.builder()
                .id("memory-1")
                .userId(testUserId)
                .type(MemoryType.PREFERENCE)
                .importance(MemoryImportance.IMPORTANT)
                .content("记忆1")
                .source(MemorySource.JOURNAL)
                .build(),
            UserMemory.builder()
                .id("memory-2")
                .userId(testUserId)
                .type(MemoryType.HABIT)
                .importance(MemoryImportance.NORMAL)
                .content("记忆2")
                .source(MemorySource.JOURNAL)
                .build()
        );
        
        when(userMemoryRepository.saveAll(anyList()))
            .thenReturn(Collections.emptyList());
        
        // When
        mySQLLongMemoryService.saveMemories(memories);
        
        // Then
        verify(userMemoryRepository, times(1)).saveAll(anyList());
    }
    
    @Test
    void testGetMemoryById() {
        // Given
        String memoryId = "memory-1";
        UserMemoryEntity entity = UserMemoryEntity.builder()
            .id(memoryId)
            .userId(testUserId)
            .type(MemoryType.PREFERENCE)
            .importance(MemoryImportance.IMPORTANT)
            .content("记忆内容")
            .source(MemorySource.JOURNAL)
            .accessCount(0)
            .build();
        
        when(userMemoryRepository.findById(memoryId)).thenReturn(Optional.of(entity));
        doNothing().when(userMemoryRepository).updateAccessInfo(anyString(), any());
        
        // When
        UserMemory result = mySQLLongMemoryService.getMemoryById(memoryId);
        
        // Then
        assertNotNull(result);
        assertEquals(memoryId, result.getId());
        verify(userMemoryRepository, times(1)).findById(memoryId);
    }
    
    @Test
    void testDeleteMemory() {
        // Given
        String memoryId = "memory-1";
        doNothing().when(userMemoryRepository).deleteById(memoryId);
        
        // When
        mySQLLongMemoryService.deleteMemory(memoryId);
        
        // Then
        verify(userMemoryRepository, times(1)).deleteById(memoryId);
    }
}


