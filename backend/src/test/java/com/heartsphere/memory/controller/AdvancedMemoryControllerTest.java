package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.dto.VectorSearchRequest;
import com.heartsphere.memory.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 高级记忆能力Controller测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@WebMvcTest(AdvancedMemoryController.class)
class AdvancedMemoryControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private VectorSearchService vectorSearchService;
    
    @MockBean
    private MemoryAssociationService memoryAssociationService;
    
    @MockBean
    private IntelligentRetrievalService intelligentRetrievalService;
    
    @MockBean
    private MemoryConsolidationService memoryConsolidationService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser
    void testGenerateEmbedding() throws Exception {
        // Mock服务
        float[] embedding = new float[1536];
        when(vectorSearchService.generateEmbedding("测试文本")).thenReturn(embedding);
        
        // 执行测试
        mockMvc.perform(post("/api/memory/v4/vector/embed")
                .param("text", "测试文本")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.dimension").value(1536));
    }
    
    @Test
    @WithMockUser
    void testVectorSearch() throws Exception {
        // 准备测试数据
        VectorSearchRequest request = VectorSearchRequest.builder()
            .query("测试查询")
            .limit(10)
            .threshold(0.6)
            .build();
        
        // Mock服务
        VectorSearchService.SimilarMemory similarMemory = mock(VectorSearchService.SimilarMemory.class);
        when(similarMemory.getMemoryId()).thenReturn("memory-1");
        when(similarMemory.getSimilarity()).thenReturn(0.8);
        when(vectorSearchService.searchSimilarMemories(anyString(), any(), any(), any(), anyInt(), anyDouble()))
            .thenReturn(Arrays.asList(similarMemory));
        
        // 执行测试
        mockMvc.perform(post("/api/memory/v4/vector/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }
    
    @Test
    @WithMockUser
    void testGetAssociations() throws Exception {
        // Mock服务
        MemoryAssociationService.MemoryAssociation association = 
            mock(MemoryAssociationService.MemoryAssociation.class);
        when(association.getId()).thenReturn("assoc-1");
        when(memoryAssociationService.getAssociations("memory-1"))
            .thenReturn(Arrays.asList(association));
        
        // 执行测试
        mockMvc.perform(get("/api/memory/v4/associations/memory-1")
                .param("limit", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }
    
    @Test
    @WithMockUser
    void testDiscoverAssociations() throws Exception {
        // Mock服务
        MemoryAssociationService.MemoryAssociation association = 
            mock(MemoryAssociationService.MemoryAssociation.class);
        when(association.getId()).thenReturn("assoc-1");
        when(memoryAssociationService.discoverAssociations("memory-1", 10))
            .thenReturn(Arrays.asList(association));
        
        // 执行测试
        mockMvc.perform(post("/api/memory/v4/associations/discover")
                .param("memoryId", "memory-1")
                .param("limit", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }
    
    @Test
    @WithMockUser
    void testExecuteConsolidation() throws Exception {
        // 执行测试
        mockMvc.perform(post("/api/memory/v4/consolidation/execute")
                .param("userId", "user-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
        
        // 验证服务被调用
        verify(memoryConsolidationService).batchUpdateImportance("user-1");
    }
}



