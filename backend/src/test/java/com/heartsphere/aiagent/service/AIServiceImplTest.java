package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.adapter.ModelAdapter;
import com.heartsphere.aiagent.adapter.ModelAdapterManager;
import com.heartsphere.aiagent.dto.request.ImageGenerationRequest;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.ImageGenerationResponse;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.entity.UserAIConfig;
import com.heartsphere.aiagent.exception.AIServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * AIServiceImpl单元测试
 */
@ExtendWith(MockitoExtension.class)
class AIServiceImplTest {

    @Mock
    private ModelAdapterManager adapterManager;

    @Mock
    private AIConfigService configService;

    @Mock
    private ModelAdapter modelAdapter;

    @InjectMocks
    private AIServiceImpl aiService;

    private Long userId = 1L;

    @BeforeEach
    void setUp() {
        when(adapterManager.getAdapter("dashscope")).thenReturn(modelAdapter);
        when(configService.getUserTextProvider(userId)).thenReturn("dashscope");
        when(configService.getUserTextModel(userId)).thenReturn("qwen-max");
        when(configService.getUserImageProvider(userId)).thenReturn("dashscope");
        when(configService.getUserImageModel(userId)).thenReturn("wanx-v1");
    }

    @Test
    void testGenerateText_Success() {
        // Given
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("你好");

        TextGenerationResponse mockResponse = new TextGenerationResponse();
        mockResponse.setContent("你好！");
        mockResponse.setProvider("dashscope");
        mockResponse.setModel("qwen-max");

        when(modelAdapter.generateText(any(TextGenerationRequest.class))).thenReturn(mockResponse);

        // When
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then
        assertNotNull(response);
        assertEquals("你好！", response.getContent());
        verify(configService, times(1)).getUserTextProvider(userId);
        verify(modelAdapter, times(1)).generateText(any(TextGenerationRequest.class));
    }

    @Test
    void testGenerateText_WithProviderInRequest() {
        // Given
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("你好");
        request.setProvider("dashscope");

        TextGenerationResponse mockResponse = new TextGenerationResponse();
        mockResponse.setContent("你好！");

        when(modelAdapter.generateText(any(TextGenerationRequest.class))).thenReturn(mockResponse);

        // When
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then
        assertNotNull(response);
        verify(configService, never()).getUserTextProvider(userId);
        verify(modelAdapter, times(1)).generateText(any(TextGenerationRequest.class));
    }

    @Test
    void testGenerateImage_Success() {
        // Given
        ImageGenerationRequest request = new ImageGenerationRequest();
        request.setPrompt("一只猫");

        ImageGenerationResponse mockResponse = new ImageGenerationResponse();
        mockResponse.setProvider("dashscope");

        when(modelAdapter.generateImage(any(ImageGenerationRequest.class))).thenReturn(mockResponse);

        // When
        ImageGenerationResponse response = aiService.generateImage(userId, request);

        // Then
        assertNotNull(response);
        verify(configService, times(1)).getUserImageProvider(userId);
        verify(modelAdapter, times(1)).generateImage(any(ImageGenerationRequest.class));
    }

    @Test
    void testGenerateText_Exception() {
        // Given
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("测试");

        when(modelAdapter.generateText(any(TextGenerationRequest.class)))
            .thenThrow(new RuntimeException("API调用失败"));

        // When & Then
        assertThrows(AIServiceException.class, () -> {
            aiService.generateText(userId, request);
        });
    }

    @Test
    void testGetUserConfig() {
        // Given
        UserAIConfig mockConfig = new UserAIConfig();
        mockConfig.setUserId(userId);
        when(configService.getUserConfig(userId)).thenReturn(mockConfig);

        // When
        UserAIConfig config = aiService.getUserConfig(userId);

        // Then
        assertNotNull(config);
        assertEquals(userId, config.getUserId());
        verify(configService, times(1)).getUserConfig(userId);
    }

    @Test
    void testUpdateUserConfig() {
        // Given
        UserAIConfig requestConfig = new UserAIConfig();
        requestConfig.setTextProvider("dashscope");
        requestConfig.setTextModel("qwen-plus");

        UserAIConfig updatedConfig = new UserAIConfig();
        updatedConfig.setUserId(userId);
        updatedConfig.setTextProvider("dashscope");
        updatedConfig.setTextModel("qwen-plus");

        when(configService.updateUserConfig(eq(userId), any(UserAIConfig.class)))
            .thenReturn(updatedConfig);

        // When
        UserAIConfig result = aiService.updateUserConfig(userId, requestConfig);

        // Then
        assertNotNull(result);
        verify(configService, times(1)).updateUserConfig(eq(userId), any(UserAIConfig.class));
    }
}


