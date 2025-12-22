package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.entity.SystemAIConfig;
import com.heartsphere.aiagent.entity.UserAIConfig;
import com.heartsphere.aiagent.repository.SystemAIConfigRepository;
import com.heartsphere.aiagent.repository.UserAIConfigRepository;
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
 * AIConfigService单元测试
 */
@ExtendWith(MockitoExtension.class)
class AIConfigServiceTest {

    @Mock
    private UserAIConfigRepository userAIConfigRepository;

    @Mock
    private SystemAIConfigRepository systemAIConfigRepository;

    @InjectMocks
    private AIConfigService configService;

    private Long userId = 1L;

    @BeforeEach
    void setUp() {
        // 设置系统配置的默认行为
        when(systemAIConfigRepository.findByConfigKeyAndIsActiveTrue(anyString()))
            .thenReturn(Optional.empty());
    }

    @Test
    void testGetUserConfig_Existing() {
        // Given
        UserAIConfig existingConfig = new UserAIConfig();
        existingConfig.setId(1L);
        existingConfig.setUserId(userId);
        existingConfig.setTextProvider("dashscope");
        existingConfig.setTextModel("qwen-max");

        when(userAIConfigRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingConfig));

        // When
        UserAIConfig config = configService.getUserConfig(userId);

        // Then
        assertNotNull(config);
        assertEquals(userId, config.getUserId());
        assertEquals("dashscope", config.getTextProvider());
        verify(userAIConfigRepository, times(1)).findByUserId(userId);
        verify(userAIConfigRepository, never()).save(any(UserAIConfig.class));
    }

    @Test
    void testGetUserConfig_NotExisting_CreatesDefault() {
        // Given
        when(userAIConfigRepository.findByUserId(userId))
            .thenReturn(Optional.empty());

        UserAIConfig savedConfig = new UserAIConfig();
        savedConfig.setId(1L);
        savedConfig.setUserId(userId);
        when(userAIConfigRepository.save(any(UserAIConfig.class))).thenReturn(savedConfig);

        // When
        UserAIConfig config = configService.getUserConfig(userId);

        // Then
        assertNotNull(config);
        verify(userAIConfigRepository, times(1)).findByUserId(userId);
        verify(userAIConfigRepository, times(1)).save(any(UserAIConfig.class));
    }

    @Test
    void testUpdateUserConfig() {
        // Given
        UserAIConfig existingConfig = new UserAIConfig();
        existingConfig.setId(1L);
        existingConfig.setUserId(userId);
        existingConfig.setTextProvider("dashscope");

        when(userAIConfigRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingConfig));

        UserAIConfig updateRequest = new UserAIConfig();
        updateRequest.setTextProvider("gemini");
        updateRequest.setTextModel("gemini-pro");

        when(userAIConfigRepository.save(any(UserAIConfig.class))).thenReturn(existingConfig);

        // When
        UserAIConfig updated = configService.updateUserConfig(userId, updateRequest);

        // Then
        assertNotNull(updated);
        verify(userAIConfigRepository, times(1)).findByUserId(userId);
        verify(userAIConfigRepository, times(1)).save(any(UserAIConfig.class));
    }

    @Test
    void testGetUserTextProvider() {
        // Given
        UserAIConfig config = new UserAIConfig();
        config.setUserId(userId);
        config.setTextProvider("dashscope");

        when(userAIConfigRepository.findByUserId(userId))
            .thenReturn(Optional.of(config));

        // When
        String provider = configService.getUserTextProvider(userId);

        // Then
        assertEquals("dashscope", provider);
    }

    @Test
    void testGetUserTextProvider_Default() {
        // Given
        when(userAIConfigRepository.findByUserId(userId))
            .thenReturn(Optional.empty());
        when(userAIConfigRepository.save(any(UserAIConfig.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        String provider = configService.getUserTextProvider(userId);

        // Then
        assertEquals("dashscope", provider); // 默认值
    }
}


