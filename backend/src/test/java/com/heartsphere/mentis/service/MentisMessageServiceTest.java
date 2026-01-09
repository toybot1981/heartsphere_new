package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisMessage;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.repository.MentisMessageRepository;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * MentisMessageService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class MentisMessageServiceTest {
    
    @Mock
    private MentisMessageRepository messageRepository;
    
    @Mock
    private MentisSessionRepository sessionRepository;
    
    @InjectMocks
    private MentisMessageServiceImpl messageService;
    
    private String testSessionId;
    private MentisSession testSession;
    private MentisMessage testMessage;
    
    @BeforeEach
    void setUp() {
        testSessionId = "mentis_test_session_123";
        
        testSession = new MentisSession();
        testSession.setId(1L);
        testSession.setSessionId(testSessionId);
        testSession.setUserId(1L);
        
        testMessage = new MentisMessage();
        testMessage.setId(1L);
        testMessage.setMessageId("msg_test_123");
        testMessage.setSession(testSession);
        testMessage.setRole("USER");
        testMessage.setContent("测试消息");
        testMessage.setMessageType("TEXT");
        testMessage.setCreatedAt(LocalDateTime.now());
        
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.of(testSession));
    }
    
    @Test
    void testSaveMessage() {
        // Given
        String role = "USER";
        String content = "测试消息";
        String messageType = "TEXT";
        
        when(messageRepository.save(any(MentisMessage.class))).thenAnswer(invocation -> {
            MentisMessage message = invocation.getArgument(0);
            message.setId(1L);
            return message;
        });
        
        // When
        MentisMessage result = messageService.saveMessage(testSessionId, role, content, messageType);
        
        // Then
        assertNotNull(result);
        assertEquals(role, result.getRole());
        assertEquals(content, result.getContent());
        assertEquals(messageType, result.getMessageType());
        assertNotNull(result.getMessageId());
        verify(messageRepository, times(1)).save(any(MentisMessage.class));
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    @Test
    void testSaveMessageWithTaskId() {
        // Given
        String taskId = "task_123";
        MentisMessage message = createTestMessage("msg1");
        message.setTaskId(taskId);
        
        when(messageRepository.save(any(MentisMessage.class))).thenAnswer(invocation -> {
            MentisMessage msg = invocation.getArgument(0);
            msg.setId(1L);
            return msg;
        });
        
        // When
        MentisMessage result = messageService.saveMessage(message);
        
        // Then
        assertNotNull(result);
        assertEquals(taskId, result.getTaskId());
        verify(messageRepository, times(1)).save(message);
    }
    
    @Test
    void testGetMessagesBySessionId() {
        // Given
        MentisMessage msg1 = createTestMessage("msg1");
        MentisMessage msg2 = createTestMessage("msg2");
        List<MentisMessage> messages = Arrays.asList(msg1, msg2);
        
        when(messageRepository.findBySession_IdOrderByCreatedAtAsc(testSession.getId()))
                .thenReturn(messages);
        
        // When
        List<MentisMessage> result = messageService.getSessionMessages(testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(messageRepository, times(1)).findBySession_IdOrderByCreatedAtAsc(testSession.getId());
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    @Test
    void testGetRecentMessagesBySessionId() {
        // Given
        int limit = 5;
        MentisMessage msg1 = createTestMessage("msg1");
        MentisMessage msg2 = createTestMessage("msg2");
        List<MentisMessage> messages = Arrays.asList(msg1, msg2);
        Pageable pageable = PageRequest.of(0, limit);
        
        when(messageRepository.findRecentMessagesBySessionId(testSession.getId(), pageable))
                .thenReturn(messages);
        
        // When
        List<MentisMessage> result = messageService.getRecentMessages(testSessionId, limit);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(messageRepository, times(1))
                .findRecentMessagesBySessionId(testSession.getId(), pageable);
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    private MentisMessage createTestMessage(String messageId) {
        MentisMessage message = new MentisMessage();
        message.setMessageId(messageId);
        message.setSession(testSession);
        message.setRole("USER");
        message.setContent("测试消息");
        message.setMessageType("TEXT");
        message.setCreatedAt(LocalDateTime.now());
        return message;
    }
}
