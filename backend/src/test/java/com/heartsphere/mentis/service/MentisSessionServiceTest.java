package com.heartsphere.mentis.service;

import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * MentisSessionService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class MentisSessionServiceTest {
    
    @Mock
    private MentisSessionRepository sessionRepository;
    
    @InjectMocks
    private MentisSessionServiceImpl sessionService;
    
    private Long testUserId;
    private String testSessionId;
    private MentisSession testSession;
    
    @BeforeEach
    void setUp() {
        testUserId = 1L;
        testSessionId = "mentis_test_session_123";
        
        testSession = new MentisSession();
        testSession.setId(1L);
        testSession.setSessionId(testSessionId);
        testSession.setUserId(testUserId);
        testSession.setTitle("测试会话");
        testSession.setStatus("ACTIVE");
        testSession.setVmStatus("IDLE");
        testSession.setCreatedAt(LocalDateTime.now());
        testSession.setUpdatedAt(LocalDateTime.now());
        testSession.setLastActiveAt(LocalDateTime.now());
    }
    
    @Test
    void testCreateSession() {
        // Given
        String title = "新会话";
        when(sessionRepository.save(any(MentisSession.class))).thenAnswer(invocation -> {
            MentisSession session = invocation.getArgument(0);
            session.setId(1L);
            return session;
        });
        
        // When
        MentisSession result = sessionService.createSession(testUserId, title);
        
        // Then
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());
        assertEquals(title, result.getTitle());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("IDLE", result.getVmStatus());
        assertNotNull(result.getSessionId());
        verify(sessionRepository, times(1)).save(any(MentisSession.class));
    }
    
    @Test
    void testCreateSessionWithNullTitle() {
        // Given
        when(sessionRepository.save(any(MentisSession.class))).thenAnswer(invocation -> {
            MentisSession session = invocation.getArgument(0);
            session.setId(1L);
            return session;
        });
        
        // When
        MentisSession result = sessionService.createSession(testUserId, null);
        
        // Then
        assertNotNull(result);
        assertEquals("新会话", result.getTitle());
        verify(sessionRepository, times(1)).save(any(MentisSession.class));
    }
    
    @Test
    void testGetSession() {
        // Given
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.of(testSession));
        
        // When
        MentisSession result = sessionService.getSession(testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals(testSessionId, result.getSessionId());
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    @Test
    void testGetSessionNotFound() {
        // Given
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            sessionService.getSession(testSessionId);
        });
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
    }
    
    @Test
    void testUpdateSessionStatus() {
        // Given
        String newStatus = "PAUSED";
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.of(testSession));
        when(sessionRepository.save(any(MentisSession.class))).thenAnswer(invocation -> {
            MentisSession session = invocation.getArgument(0);
            session.setStatus(newStatus);
            return session;
        });
        
        // When
        sessionService.updateSessionStatus(testSessionId, newStatus);
        
        // Then
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
        verify(sessionRepository, times(1)).save(any(MentisSession.class));
        assertEquals(newStatus, testSession.getStatus());
    }
    
    @Test
    void testGetUserSessions() {
        // Given
        MentisSession session1 = createTestSession(1L, "session1");
        MentisSession session2 = createTestSession(2L, "session2");
        List<MentisSession> sessions = Arrays.asList(session1, session2);
        
        when(sessionRepository.findByUserIdOrderByLastActiveAtDesc(testUserId)).thenReturn(sessions);
        
        // When
        List<MentisSession> result = sessionService.getUserSessions(testUserId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(sessionRepository, times(1)).findByUserIdOrderByLastActiveAtDesc(testUserId);
    }
    
    @Test
    void testDeleteSession() {
        // Given
        when(sessionRepository.findBySessionId(testSessionId)).thenReturn(Optional.of(testSession));
        doNothing().when(sessionRepository).delete(any(MentisSession.class));
        
        // When
        sessionService.deleteSession(testSessionId);
        
        // Then
        verify(sessionRepository, times(1)).findBySessionId(testSessionId);
        verify(sessionRepository, times(1)).delete(testSession);
    }
    
    private MentisSession createTestSession(Long id, String sessionId) {
        MentisSession session = new MentisSession();
        session.setId(id);
        session.setSessionId(sessionId);
        session.setUserId(testUserId);
        session.setTitle("测试会话 " + id);
        session.setStatus("ACTIVE");
        session.setVmStatus("IDLE");
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        session.setLastActiveAt(LocalDateTime.now());
        return session;
    }
}
