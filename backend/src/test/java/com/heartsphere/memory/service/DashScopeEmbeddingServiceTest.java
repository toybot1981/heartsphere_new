package com.heartsphere.memory.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * DashScope Embedding 服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@ExtendWith(MockitoExtension.class)
class DashScopeEmbeddingServiceTest {
    
    @Mock
    private RestTemplate restTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @InjectMocks
    private DashScopeEmbeddingService embeddingService;
    
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(embeddingService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(embeddingService, "baseUrl", "https://dashscope.aliyuncs.com/compatible-mode/v1");
    }
    
    @Test
    void testGenerateEmbedding_Success() {
        // 准备测试数据
        String text = "测试文本";
        
        // Mock响应
        JsonNode mockBody = mock(JsonNode.class);
        JsonNode mockOutput = mock(JsonNode.class);
        JsonNode mockEmbeddings = mock(JsonNode.class);
        JsonNode mockEmbedding = mock(JsonNode.class);
        JsonNode mockVector = mock(JsonNode.class);
        
        when(restTemplate.exchange(anyString(), any(), any(), eq(JsonNode.class)))
            .thenReturn(new ResponseEntity<>(mockBody, HttpStatus.OK));
        when(mockBody.get("output")).thenReturn(mockOutput);
        when(mockOutput.has("embeddings")).thenReturn(true);
        when(mockOutput.get("embeddings")).thenReturn(mockEmbeddings);
        when(mockEmbeddings.iterator()).thenReturn(Collections.singletonList(mockEmbedding).iterator());
        when(mockEmbedding.get("embedding")).thenReturn(mockVector);
        when(mockVector.size()).thenReturn(1536);
        when(mockVector.get(anyInt())).thenReturn(mock(JsonNode.class));
        when(mockVector.get(anyInt()).asDouble()).thenReturn(0.1);
        
        // 执行测试
        float[] result = embeddingService.generateEmbedding(text);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1536, result.length);
    }
    
    @Test
    void testGenerateEmbedding_EmptyText() {
        // 执行测试
        float[] result = embeddingService.generateEmbedding("");
        
        // 验证结果
        assertNull(result);
    }
    
    @Test
    void testIsAvailable_WithApiKey() {
        // 执行测试
        boolean available = embeddingService.isAvailable();
        
        // 验证结果
        assertTrue(available);
    }
    
    @Test
    void testIsAvailable_WithoutApiKey() {
        // 设置空API Key
        ReflectionTestUtils.setField(embeddingService, "apiKey", "");
        
        // 执行测试
        boolean available = embeddingService.isAvailable();
        
        // 验证结果
        assertFalse(available);
    }
    
    @Test
    void testGetVectorDimension() {
        // 执行测试
        int dimension = embeddingService.getVectorDimension();
        
        // 验证结果
        assertEquals(1536, dimension);
    }
}


