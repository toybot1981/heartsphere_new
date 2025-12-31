package com.heartsphere.memory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.config.TestSecurityConfig;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.model.*;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.service.impl.MySQLLongMemoryService;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MemoryController集成测试
 * 测试记忆系统API端点
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
@Transactional
class MemoryControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private MySQLLongMemoryService mySQLLongMemoryService;
    
    @Autowired
    private UserMemoryRepository userMemoryRepository;
    
    private String testUserId;
    private UserDetailsImpl testUserDetails;
    
    @BeforeEach
    void setUp() {
        testUserId = "114";
        testUserDetails = new UserDetailsImpl();
        testUserDetails.setId(114L);
        testUserDetails.setUsername("testuser");
    }
    
    @Test
    void testSaveMemory_Success() throws Exception {
        // Given
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("用户喜欢看电影");
        request.setSource(MemorySource.JOURNAL);
        request.setSourceId("journal-1");
        request.setConfidence(0.8);
        
        // When & Then
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", testUserId)
                .with(user(testUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.content").value("用户喜欢看电影"))
                .andExpect(jsonPath("$.data.type").value("PREFERENCE"));
    }
    
    @Test
    void testSaveMemory_Unauthorized() throws Exception {
        // Given
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("测试内容");
        request.setSource(MemorySource.JOURNAL);
        
        // When & Then - 没有认证信息
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
    
    @Test
    void testSaveMemory_Forbidden() throws Exception {
        // Given
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("测试内容");
        request.setSource(MemorySource.JOURNAL);
        
        UserDetailsImpl otherUser = new UserDetailsImpl();
        otherUser.setId(999L);
        otherUser.setUsername("otheruser");
        
        // When & Then - 不同用户ID
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", testUserId)
                .with(user(otherUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.message").value("无权访问该用户的数据"));
    }
    
    @Test
    void testSaveMemories_Batch() throws Exception {
        // Given
        SaveMemoryRequest request1 = new SaveMemoryRequest();
        request1.setMemoryType(MemoryType.PREFERENCE);
        request1.setImportance(MemoryImportance.IMPORTANT);
        request1.setContent("记忆1");
        request1.setSource(MemorySource.JOURNAL);
        
        SaveMemoryRequest request2 = new SaveMemoryRequest();
        request2.setMemoryType(MemoryType.HABIT);
        request2.setImportance(MemoryImportance.NORMAL);
        request2.setContent("记忆2");
        request2.setSource(MemorySource.JOURNAL);
        
        List<SaveMemoryRequest> requests = Arrays.asList(request1, request2);
        
        // When & Then
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories/batch", testUserId)
                .with(user(testUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requests)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }
    
    @Test
    void testSearchMemories_Success() throws Exception {
        // Given - 先保存一些记忆
        UserMemory memory = UserMemory.builder()
            .id("memory-1")
            .userId(testUserId)
            .type(MemoryType.PREFERENCE)
            .importance(MemoryImportance.IMPORTANT)
            .content("用户喜欢看电影")
            .source(MemorySource.JOURNAL)
            .sourceId("journal-1")
            .confidence(0.8)
            .createdAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        
        mySQLLongMemoryService.saveMemory(memory);
        
        // When & Then
        mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", testUserId)
                .with(user(testUserDetails))
                .param("query", "电影")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }
    
    @Test
    void testSearchMemories_EmptyQuery() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", testUserId)
                .with(user(testUserDetails))
                .param("query", "")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }
    
    @Test
    void testSearchMemories_Forbidden() throws Exception {
        // Given
        UserDetailsImpl otherUser = new UserDetailsImpl();
        otherUser.setId(999L);
        otherUser.setUsername("otheruser");
        
        // When & Then
        mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", testUserId)
                .with(user(otherUser))
                .param("query", "test")
                .param("limit", "10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }
}

