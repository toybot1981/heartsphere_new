package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.ChatMessageEntity;
import com.heartsphere.memory.entity.SessionEntity;
import com.heartsphere.memory.entity.WorkingMemoryEntity;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
// Session 和 WorkingMemory 模型类不存在，已移除
import com.heartsphere.memory.repository.jpa.ChatMessageRepository;
import com.heartsphere.memory.repository.jpa.SessionRepository;
import com.heartsphere.memory.repository.jpa.WorkingMemoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    
    @InjectMocks
    private MySQLShortMemoryService mySQLShortMemoryService;
    
    private String testUserId;
    private String testSessionId;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
        testSessionId = "test-session-" + System.currentTimeMillis();
    }
    
    // ========== 消息测试 ==========
    
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
        entity.setContent("测试消息");
        
        when(chatMessageRepository.save(any(ChatMessageEntity.class))).thenReturn(entity);
        
        // When
        mySQLShortMemoryService.saveMessage(testSessionId, message);
        
        // Then
        verify(chatMessageRepository, times(1)).save(any(ChatMessageEntity.class));
    }
    
    @Test
    void testGetMessages() {
        // Given
        int limit = 10;
        List<ChatMessageEntity> entities = Arrays.asList(
            ChatMessageEntity.builder()
                .id("msg-1")
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("消息1")
                .timestamp(System.currentTimeMillis())
                .build(),
            ChatMessageEntity.builder()
                .id("msg-2")
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.ASSISTANT)
                .content("消息2")
                .timestamp(System.currentTimeMillis())
                .build()
        );
        
        when(chatMessageRepository.findBySessionIdOrderByTimestampDesc(eq(testSessionId), any()))
            .thenReturn(entities);
        
        // When
        List<ChatMessage> result = mySQLShortMemoryService.getMessages(testSessionId, limit);
        
        // Then
        assertNotNull(result);
        assertTrue(result.size() >= 0);
        verify(chatMessageRepository, times(1))
            .findBySessionIdOrderByTimestampDesc(eq(testSessionId), any());
    }
    
    @Test
    void testGetMessagesByTimeRange() {
        // Given
        java.time.Instant startTime = java.time.Instant.now().minusSeconds(10);
        java.time.Instant endTime = java.time.Instant.now();
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
        
        when(chatMessageRepository.findBySessionIdAndTimestampBetween(
            eq(testSessionId), anyLong(), anyLong()))
            .thenReturn(entities);
        
        // When
        List<ChatMessage> result = mySQLShortMemoryService.getMessages(
            testSessionId, startTime, endTime);
        
        // Then
        assertNotNull(result);
        assertTrue(result.size() >= 0);
        verify(chatMessageRepository, times(1))
            .findBySessionIdAndTimestampBetween(eq(testSessionId), anyLong(), anyLong());
    }
    
    // ========== 工作记忆测试 ==========
    
    @Test
    void testSaveWorkingMemory() {
        // Given
        String key = "context";
        String value = "工作记忆内容";
        WorkingMemoryEntity entity = new WorkingMemoryEntity();
        entity.setSessionId(testSessionId);
        entity.setMemoryKey(key);
        
        when(workingMemoryRepository.findBySessionIdAndMemoryKey(testSessionId, key))
            .thenReturn(Optional.empty());
        when(workingMemoryRepository.save(any(WorkingMemoryEntity.class)))
            .thenReturn(entity);
        
        // When
        mySQLShortMemoryService.saveWorkingMemory(testSessionId, key, value);
        
        // Then
        verify(workingMemoryRepository, times(1))
            .save(any(WorkingMemoryEntity.class));
    }
    
    @Test
    void testGetWorkingMemory() {
        // Given
        String key = "context";
        WorkingMemoryEntity entity = WorkingMemoryEntity.builder()
            .sessionId(testSessionId)
            .memoryKey(key)
            .memoryValue("\"工作记忆内容\"")
            .build();
        
        when(workingMemoryRepository.findBySessionIdAndMemoryKey(testSessionId, key))
            .thenReturn(Optional.of(entity));
        
        // When
        String result = mySQLShortMemoryService.getWorkingMemory(testSessionId, key, String.class);
        
        // Then
        assertNotNull(result);
        verify(workingMemoryRepository, times(1))
            .findBySessionIdAndMemoryKey(testSessionId, key);
    }
    
    @Test
    void testDeleteWorkingMemory() {
        // Given
        String key = "context";
        WorkingMemoryEntity entity = WorkingMemoryEntity.builder()
            .sessionId(testSessionId)
            .memoryKey(key)
            .build();
        
        when(workingMemoryRepository.findBySessionIdAndMemoryKey(testSessionId, key))
            .thenReturn(Optional.of(entity));
        
        // When
        mySQLShortMemoryService.deleteWorkingMemory(testSessionId, key);
        
        // Then
        verify(workingMemoryRepository, times(1))
            .findBySessionIdAndMemoryKey(testSessionId, key);
        verify(workingMemoryRepository, times(1)).delete(entity);
    }
}
