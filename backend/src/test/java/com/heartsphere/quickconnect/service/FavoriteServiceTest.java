package com.heartsphere.quickconnect.service;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.quickconnect.entity.UserFavorite;
import com.heartsphere.quickconnect.repository.UserFavoriteRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 收藏服务单元测试
 */
@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private UserFavoriteRepository userFavoriteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CharacterRepository characterRepository;

    @InjectMocks
    private FavoriteService favoriteService;

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
    void testAddFavorite_Success() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;
        Integer sortOrder = 0;

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(characterRepository.findById(characterId)).thenReturn(Optional.of(testCharacter));
        when(userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId))
                .thenReturn(Optional.empty());
        when(userFavoriteRepository.save(any(UserFavorite.class))).thenAnswer(invocation -> {
            UserFavorite favorite = invocation.getArgument(0);
            favorite.setId(1L);
            return favorite;
        });

        // When
        var result = favoriteService.addFavorite(userId, characterId, sortOrder);

        // Then
        assertNotNull(result);
        assertEquals(characterId, result.getCharacterId());
        verify(userFavoriteRepository, times(1)).save(any(UserFavorite.class));
    }

    @Test
    void testAddFavorite_UserNotFound() {
        // Given
        Long userId = 999L;
        Long characterId = 1L;

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            favoriteService.addFavorite(userId, characterId, 0);
        });
    }

    @Test
    void testAddFavorite_CharacterNotFound() {
        // Given
        Long userId = 1L;
        Long characterId = 999L;

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(characterRepository.findById(characterId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            favoriteService.addFavorite(userId, characterId, 0);
        });
    }

    @Test
    void testAddFavorite_AlreadyFavorite() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        UserFavorite existingFavorite = new UserFavorite();
        existingFavorite.setId(1L);
        existingFavorite.setUser(testUser);
        existingFavorite.setCharacter(testCharacter);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(characterRepository.findById(characterId)).thenReturn(Optional.of(testCharacter));
        when(userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId))
                .thenReturn(Optional.of(existingFavorite));

        // When & Then
        assertThrows(BusinessException.class, () -> {
            favoriteService.addFavorite(userId, characterId, 0);
        });
    }

    @Test
    void testRemoveFavorite_Success() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        UserFavorite favorite = new UserFavorite();
        favorite.setId(1L);
        favorite.setUser(testUser);
        favorite.setCharacter(testCharacter);

        when(userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId))
                .thenReturn(Optional.of(favorite));

        // When
        assertDoesNotThrow(() -> {
            favoriteService.removeFavorite(userId, characterId);
        });

        // Then
        verify(userFavoriteRepository, times(1)).delete(favorite);
    }

    @Test
    void testRemoveFavorite_NotFound() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        when(userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            favoriteService.removeFavorite(userId, characterId);
        });
    }

    @Test
    void testToggleFavorite_AddFavorite() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(characterRepository.findById(characterId)).thenReturn(Optional.of(testCharacter));
        when(userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId))
                .thenReturn(Optional.empty());
        when(userFavoriteRepository.save(any(UserFavorite.class))).thenAnswer(invocation -> {
            UserFavorite favorite = invocation.getArgument(0);
            favorite.setId(1L);
            return favorite;
        });

        // When
        var result = favoriteService.toggleFavorite(userId, characterId, 0);

        // Then
        assertNotNull(result);
        verify(userFavoriteRepository, times(1)).save(any(UserFavorite.class));
    }

    @Test
    void testToggleFavorite_RemoveFavorite() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        UserFavorite favorite = new UserFavorite();
        favorite.setId(1L);
        favorite.setUser(testUser);
        favorite.setCharacter(testCharacter);

        when(userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId))
                .thenReturn(Optional.of(favorite));

        // When
        var result = favoriteService.toggleFavorite(userId, characterId, 0);

        // Then
        assertNull(result);
        verify(userFavoriteRepository, times(1)).delete(favorite);
    }

    @Test
    void testIsFavorite_True() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(true);

        // When
        boolean result = favoriteService.isFavorite(userId, characterId);

        // Then
        assertTrue(result);
    }

    @Test
    void testIsFavorite_False() {
        // Given
        Long userId = 1L;
        Long characterId = 1L;

        when(userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId))
                .thenReturn(false);

        // When
        boolean result = favoriteService.isFavorite(userId, characterId);

        // Then
        assertFalse(result);
    }

    @Test
    void testGetFavoriteCount() {
        // Given
        Long userId = 1L;
        long expectedCount = 5L;

        when(userFavoriteRepository.countByUserId(userId)).thenReturn(expectedCount);

        // When
        long result = favoriteService.getFavoriteCount(userId);

        // Then
        assertEquals(expectedCount, result);
    }
}



