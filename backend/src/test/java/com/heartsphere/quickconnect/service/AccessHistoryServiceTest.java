package com.heartsphere.quickconnect.service;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.quickconnect.entity.AccessHistory;
import com.heartsphere.quickconnect.repository.AccessHistoryRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
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
 * 访问历史服务单元测试
 */
@ExtendWith(MockitoExtension.class)
class AccessHistoryServiceTest {

    @Mock
    private AccessHistoryRepository accessHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CharacterRepository characterRepository;

    @InjectMocks
    private AccessHistoryService accessHistoryService;

    private User testUser;
    private Character testCharacter;

    @BeforeEach
    void setUp() {
        // 创建测试用户
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setIsEnabled(true);

        // 创建测试角色
        testCharacter = new Character();
        testCharacter.setId(1L);
        testCharacter.setName("Test Character");
        testCharacter.setUser(testUser);
    }

    @Test
    void testRecordAccess_Success() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;
        Integer accessDuration = 3600;
        Integer conversationRounds = 10;
        String sessionId = "session_123";

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(characterRepository.findById(characterId)).thenReturn(Optional.of(testCharacter));
        when(accessHistoryRepository.save(any(AccessHistory.class))).thenAnswer(invocation -> {
            AccessHistory history = invocation.getArgument(0);
            history.setId(1L);
            history.setAccessTime(LocalDateTime.now());
            return history;
        });

        // When
        var result = accessHistoryService.recordAccess(userId, characterId, accessDuration, conversationRounds, sessionId);

        // Then
        assertNotNull(result);
        assertEquals(characterId, result.getCharacterId());
        verify(accessHistoryRepository, times(1)).save(any(AccessHistory.class));
    }

    @Test
    void testRecordAccess_UserNotFound() {
        // Given
        Long userId = 999L;
        Long characterId = 1L;

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            accessHistoryService.recordAccess(userId, characterId, 0, 0, null);
        });
    }

    @Test
    void testGetAccessHistory_WithCharacterId() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;
        Integer limit = 10;

        AccessHistory history1 = new AccessHistory();
        history1.setId(1L);
        history1.setUser(testUser);
        history1.setCharacter(testCharacter);
        history1.setAccessTime(LocalDateTime.now().minusHours(1));

        AccessHistory history2 = new AccessHistory();
        history2.setId(2L);
        history2.setUser(testUser);
        history2.setCharacter(testCharacter);
        history2.setAccessTime(LocalDateTime.now());

        List<AccessHistory> histories = Arrays.asList(history2, history1);

        when(accessHistoryRepository.findByUserIdAndCharacterIdOrderByAccessTimeDesc(userId, characterId))
                .thenReturn(histories);

        // When
        var result = accessHistoryService.getAccessHistory(userId, characterId, limit);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void testGetAccessHistory_WithoutCharacterId() {
        // Given
        Long userId = 1L;
        Integer limit = 10;

        AccessHistory history = new AccessHistory();
        history.setId(1L);
        history.setUser(testUser);
        history.setCharacter(testCharacter);
        history.setAccessTime(LocalDateTime.now());

        List<AccessHistory> histories = Arrays.asList(history);

        when(accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId))
                .thenReturn(histories);

        // When
        var result = accessHistoryService.getAccessHistory(userId, null, limit);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetAccessStatistics() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        when(accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId))
                .thenReturn(5L);
        when(accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId))
                .thenReturn(LocalDateTime.now().minusHours(1));
        when(accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId))
                .thenReturn(18000L);
        when(accessHistoryRepository.sumConversationRoundsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(50L);

        // When
        var result = accessHistoryService.getAccessStatistics(userId, characterId);

        // Then
        assertNotNull(result);
        assertEquals(5L, result.getAccessCount());
        assertNotNull(result.getLastAccessTime());
        assertEquals(18000, result.getTotalDuration());
        assertEquals(50, result.getTotalConversationRounds());
    }

    @Test
    void testGetRecentCharacterIds() {
        // Given
        Long userId = 1L;
        Integer limit = 5;

        Character char1 = new Character();
        char1.setId(1L);
        Character char2 = new Character();
        char2.setId(2L);

        AccessHistory history1 = new AccessHistory();
        history1.setCharacter(char1);
        AccessHistory history2 = new AccessHistory();
        history2.setCharacter(char2);
        AccessHistory history3 = new AccessHistory();
        history3.setCharacter(char1); // 重复

        List<AccessHistory> histories = Arrays.asList(history1, history2, history3);

        when(accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId))
                .thenReturn(histories);

        // When
        var result = accessHistoryService.getRecentCharacterIds(userId, limit);

        // Then
        assertNotNull(result);
        assertTrue(result.size() <= limit);
        assertTrue(result.contains(1L));
        assertTrue(result.contains(2L));
    }
}

