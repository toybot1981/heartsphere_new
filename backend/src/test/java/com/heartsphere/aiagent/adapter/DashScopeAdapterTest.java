package com.heartsphere.aiagent.adapter;

import com.heartsphere.aiagent.dto.request.ImageGenerationRequest;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.ImageGenerationResponse;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.exception.AIServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * DashScopeAdapter单元测试
 */
@ExtendWith(MockitoExtension.class)
class DashScopeAdapterTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private WebClient webClient;

    @Mock
    private MultimodalService multimodalService;

    private DashScopeAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new DashScopeAdapter(restTemplate, objectMapper, webClient, multimodalService);
        // 设置默认的 baseUrl
        ReflectionTestUtils.setField(adapter, "baseUrl", "https://dashscope.aliyuncs.com/compatible-mode/v1");
        ReflectionTestUtils.setField(adapter, "defaultApiKey", "test-api-key");
    }

    @Test
    void testGetProviderType() {
        assertEquals("dashscope", adapter.getProviderType());
    }

    @Test
    void testSupportsTextGeneration() {
        assertTrue(adapter.supportsTextGeneration());
    }

    @Test
    void testSupportsImageGeneration() {
        assertTrue(adapter.supportsImageGeneration());
    }

    @Test
    void testGetSupportedModels_Text() {
        List<String> models = adapter.getSupportedModels("text");
        assertNotNull(models);
        assertFalse(models.isEmpty());
        assertTrue(models.contains("qwen-max"));
    }

    @Test
    void testGetSupportedModels_Image() {
        List<String> models = adapter.getSupportedModels("image");
        assertNotNull(models);
        assertFalse(models.isEmpty());
    }

    @Test
    void testGenerateImage_Success() {
        // Given
        ImageGenerationRequest request = new ImageGenerationRequest();
        request.setPrompt("一只可爱的小猫");
        request.setModel("wanx-v1");

        org.springframework.ai.image.ImageResponse mockResponse = mock(org.springframework.ai.image.ImageResponse.class);
        when(multimodalService.generateImage(anyString(), any())).thenReturn(mockResponse);

        // When
        ImageGenerationResponse response = adapter.generateImage(request);

        // Then
        assertNotNull(response);
        assertEquals("dashscope", response.getProvider());
        verify(multimodalService, times(1)).generateImage(anyString(), any());
    }
}
