package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.ChatMessageEntity;
import com.heartsphere.memory.entity.SessionEntity;
import com.heartsphere.memory.entity.WorkingMemoryEntity;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.model.Session;
import com.heartsphere.memory.model.WorkingMemory;
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
        mySQLShortMemoryService.saveMessage(message);
        
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
        
        when(chatMessageRepository.findBySessionIdOrderByTimestampAsc(testSessionId, limit))
            .thenReturn(entities);
        
        // When
        List<ChatMessage> result = mySQLShortMemoryService.getMessages(testSessionId, limit);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(chatMessageRepository, times(1))
            .findBySessionIdOrderByTimestampAsc(testSessionId, limit);
    }
    
    @Test
    void testGetMessagesByTimeRange() {
        // Given
        long startTime = System.currentTimeMillis() - 10000;
        long endTime = System.currentTimeMillis();
        List<ChatMessageEntity> entities = Arrays.asList(
            ChatMessageEntity.builder()
                .id("msg-1")
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("消息1")
                .timestamp(startTime + 1000)
                .build()
        );
        
        when(chatMessageRepository.findBySessionIdAndTimestampBetween(
            testSessionId, startTime, endTime))
            .thenReturn(entities);
        
        // When
        List<ChatMessage> result = mySQLShortMemoryService.getMessagesByTimeRange(
            testSessionId, startTime, endTime);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(chatMessageRepository, times(1))
            .findBySessionIdAndTimestampBetween(testSessionId, startTime, endTime);
    }
    
    // ========== 会话测试 ==========
    
    @Test
    void testCreateSession() {
        // Given
        Session session = Session.builder()
            .id(testSessionId)
            .userId(testUserId)
            .characterId("char-1")
            .title("测试会话")
            .createdAt(System.currentTimeMillis())
            .build();
        
        SessionEntity entity = new SessionEntity();
        entity.setId(testSessionId);
        entity.setUserId(testUserId);
        
        when(sessionRepository.save(any(SessionEntity.class))).thenReturn(entity);
        
        // When
        mySQLShortMemoryService.createSession(session);
        
        // Then
        verify(sessionRepository, times(1)).save(any(SessionEntity.class));
    }
    
    @Test
    void testGetSession() {
        // Given
        SessionEntity entity = SessionEntity.builder()
            .id(testSessionId)
            .userId(testUserId)
            .characterId("char-1")
            .title("测试会话")
            .createdAt(System.currentTimeMillis())
            .build();
        
        when(sessionRepository.findById(testSessionId)).thenReturn(Optional.of(entity));
        
        // When
        Session result = mySQLShortMemoryService.getSession(testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals(testSessionId, result.getId());
        assertEquals(testUserId, result.getUserId());
        verify(sessionRepository, times(1)).findById(testSessionId);
    }
    
    @Test
    void testGetSessionsByUser() {
        // Given
        List<SessionEntity> entities = Arrays.asList(
            SessionEntity.builder()
                .id(testSessionId)
                .userId(testUserId)
                .title("会话1")
                .createdAt(System.currentTimeMillis())
                .build()
        );
        
        when(sessionRepository.findByUserIdOrderByCreatedAtDesc(testUserId))
            .thenReturn(entities);
        
        // When
        List<Session> result = mySQLShortMemoryService.getSessionsByUser(testUserId);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(sessionRepository, times(1))
            .findByUserIdOrderByCreatedAtDesc(testUserId);
    }
    
    // ========== 工作记忆测试 ==========
    
    @Test
    void testSaveWorkingMemory() {
        // Given
        WorkingMemory workingMemory = WorkingMemory.builder()
            .id("wm-1")
            .userId(testUserId)
            .sessionId(testSessionId)
            .key("context")
            .value("工作记忆内容")
            .build();
        
        WorkingMemoryEntity entity = new WorkingMemoryEntity();
        entity.setId("wm-1");
        entity.setUserId(testUserId);
        entity.setSessionId(testSessionId);
        entity.setKey("context");
        entity.setValue("工作记忆内容");
        
        when(workingMemoryRepository.save(any(WorkingMemoryEntity.class)))
            .thenReturn(entity);
        
        // When
        mySQLShortMemoryService.saveWorkingMemory(workingMemory);
        
        // Then
        verify(workingMemoryRepository, times(1))
            .save(any(WorkingMemoryEntity.class));
    }
    
    @Test
    void testGetWorkingMemory() {
        // Given
        String key = "context";
        WorkingMemoryEntity entity = WorkingMemoryEntity.builder()
            .id("wm-1")
            .userId(testUserId)
            .sessionId(testSessionId)
            .key(key)
            .value("工作记忆内容")
            .build();
        
        when(workingMemoryRepository.findByUserIdAndSessionIdAndKey(
            testUserId, testSessionId, key))
            .thenReturn(Optional.of(entity));
        
        // When
        WorkingMemory result = mySQLShortMemoryService.getWorkingMemory(
            testUserId, testSessionId, key);
        
        // Then
        assertNotNull(result);
        assertEquals(key, result.getKey());
        verify(workingMemoryRepository, times(1))
            .findByUserIdAndSessionIdAndKey(testUserId, testSessionId, key);
    }
    
    @Test
    void testGetAllWorkingMemories() {
        // Given
        List<WorkingMemoryEntity> entities = Arrays.asList(
            WorkingMemoryEntity.builder()
                .id("wm-1")
                .userId(testUserId)
                .sessionId(testSessionId)
                .key("context")
                .value("工作记忆1")
                .build(),
            WorkingMemoryEntity.builder()
                .id("wm-2")
                .userId(testUserId)
                .sessionId(testSessionId)
                .key("summary")
                .value("工作记忆2")
                .build()
        );
        
        when(workingMemoryRepository.findByUserIdAndSessionId(testUserId, testSessionId))
            .thenReturn(entities);
        
        // When
        Map<String, WorkingMemory> result = mySQLShortMemoryService.getAllWorkingMemories(
            testUserId, testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(workingMemoryRepository, times(1))
            .findByUserIdAndSessionId(testUserId, testSessionId);
    }
    
    @Test
    void testDeleteWorkingMemory() {
        // Given
        String key = "context";
        doNothing().when(workingMemoryRepository)
            .deleteByUserIdAndSessionIdAndKey(testUserId, testSessionId, key);
        
        // When
        mySQLShortMemoryService.deleteWorkingMemory(testUserId, testSessionId, key);
        
        // Then
        verify(workingMemoryRepository, times(1))
            .deleteByUserIdAndSessionIdAndKey(testUserId, testSessionId, key);
    }
}
