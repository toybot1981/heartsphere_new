package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.ChatMessageEntity;
import com.heartsphere.memory.entity.SessionEntity;
import com.heartsphere.memory.entity.WorkingMemoryEntity;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.repository.jpa.ChatMessageRepository;
import com.heartsphere.memory.repository.jpa.SessionRepository;
import com.heartsphere.memory.repository.jpa.WorkingMemoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * MySQLShortMemoryService单元测试
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@ExtendWith(MockitoExtension.class)
class MySQLShortMemoryServiceTest {
    
    @Mock
    private ChatMessageRepository chatMessageRepository;
    
    @Mock
    private SessionRepository sessionRepository;
    
    @Mock
    private WorkingMemoryRepository workingMemoryRepository;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @InjectMocks
    private MySQLShortMemoryService mySQLShortMemoryService;
    
    private String testSessionId;
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testSessionId = "session-" + System.currentTimeMillis();
        testUserId = "user-" + System.currentTimeMillis();
    }
    
    @Test
    void testSaveMessage() {
        // Given
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("测试消息")
            .timestamp(System.currentTimeMillis())
            .build();
        
        ChatMessageEntity entity = new ChatMessageEntity();
        entity.setId("msg-1");
        entity.setSessionId(testSessionId);
        entity.setUserId(testUserId);
        
        when(chatMessageRepository.save(any(ChatMessageEntity.class))).thenReturn(entity);
        when(chatMessageRepository.countBySessionId(testSessionId)).thenReturn(1L);
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.empty());
        when(sessionRepository.save(any(SessionEntity.class))).thenReturn(new SessionEntity());
        
        // When
        mySQLShortMemoryService.saveMessage(testSessionId, message);
        
        // Then
        verify(chatMessageRepository, times(1)).save(any(ChatMessageEntity.class));
        verify(sessionRepository, times(1)).save(any(SessionEntity.class));
    }
    
    @Test
    void testGetMessages() {
        // Given
        int limit = 10;
        Pageable pageable = PageRequest.of(0, limit);
        
        List<ChatMessageEntity> entities = Arrays.asList(
            ChatMessageEntity.builder()
                .id("msg-1")
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("消息1")
                .timestamp(System.currentTimeMillis())
                .build()
        );
        
        when(chatMessageRepository.findBySessionIdOrderByTimestampDesc(testSessionId, pageable))
            .thenReturn(entities);
        
        // When
        List<ChatMessage> result = mySQLShortMemoryService.getMessages(testSessionId, limit);
        
        // Then
        assertNotNull(result);
        verify(chatMessageRepository, times(1))
            .findBySessionIdOrderByTimestampDesc(eq(testSessionId), any(Pageable.class));
    }
    
    @Test
    void testSaveWorkingMemory() throws Exception {
        // Given
        String key = "test-key";
        String value = "test-value";
        String valueJson = "{\"test\":\"value\"}";
        
        when(objectMapper.writeValueAsString(value)).thenReturn(valueJson);
        when(workingMemoryRepository.findBySessionIdAndMemoryKey(testSessionId, key))
            .thenReturn(Optional.empty());
        when(workingMemoryRepository.save(any(WorkingMemoryEntity.class)))
            .thenReturn(new WorkingMemoryEntity());
        
        // When
        mySQLShortMemoryService.saveWorkingMemory(testSessionId, key, value);
        
        // Then
        verify(workingMemoryRepository, times(1)).save(any(WorkingMemoryEntity.class));
    }
    
    @Test
    void testGetWorkingMemory() throws Exception {
        // Given
        String key = "test-key";
        String valueJson = "{\"test\":\"value\"}";
        WorkingMemoryEntity entity = WorkingMemoryEntity.builder()
            .sessionId(testSessionId)
            .memoryKey(key)
            .memoryValue(valueJson)
            .expiresAt(LocalDateTime.now().plusHours(1))
            .build();
        
        when(workingMemoryRepository.findBySessionIdAndMemoryKey(testSessionId, key))
            .thenReturn(Optional.of(entity));
        when(objectMapper.readValue(valueJson, Map.class)).thenReturn(new HashMap<>());
        
        // When
        Map<String, Object> result = mySQLShortMemoryService.getWorkingMemory(testSessionId, key, Map.class);
        
        // Then
        assertNotNull(result);
        verify(workingMemoryRepository, times(1)).findBySessionIdAndMemoryKey(testSessionId, key);
    }
    
    @Test
    void testSessionExists() {
        // Given
        when(chatMessageRepository.countBySessionId(testSessionId)).thenReturn(1L);
        
        // When
        boolean result = mySQLShortMemoryService.sessionExists(testSessionId);
        
        // Then
        assertTrue(result);
        verify(chatMessageRepository, times(1)).countBySessionId(testSessionId);
    }
    
    @Test
    void testGetAllSessionIds() {
        // Given
        List<String> sessionIds = Arrays.asList("session-1", "session-2");
        when(chatMessageRepository.findDistinctSessionIdsByUserId(testUserId))
            .thenReturn(sessionIds);
        
        // When
        List<String> result = mySQLShortMemoryService.getAllSessionIds(testUserId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(chatMessageRepository, times(1)).findDistinctSessionIdsByUserId(testUserId);
    }
}

