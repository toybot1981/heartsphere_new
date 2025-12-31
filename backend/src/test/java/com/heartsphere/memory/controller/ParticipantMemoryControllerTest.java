package com.heartsphere.memory.controller;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.participant.*;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 参与者记忆系统Controller测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(com.heartsphere.config.TestSecurityConfig.class)
class ParticipantMemoryControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String testParticipantId;
    private String testRelatedParticipantId;
    private String testSceneId;
    
    @BeforeEach
    void setUp() {
        testParticipantId = "test-participant-" + System.currentTimeMillis();
        testRelatedParticipantId = "test-related-" + System.currentTimeMillis();
        testSceneId = "test-scene-" + System.currentTimeMillis();
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveIdentityMemory() throws Exception {
        ParticipantIdentityMemory memory = ParticipantIdentityMemory.builder()
            .identity("测试参与者")
            .role("用户")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v3/participants/{participantId}/identity-memories", testParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testGetIdentityMemory() throws Exception {
        // 先创建身份记忆
        ParticipantIdentityMemory memory = ParticipantIdentityMemory.builder()
            .identity("测试参与者")
            .role("用户")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v3/participants/{participantId}/identity-memories", testParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated());
        
        // 然后获取身份记忆
        mockMvc.perform(get("/api/memory/v3/participants/{participantId}/identity-memories", testParticipantId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveInteractionMemory() throws Exception {
        ParticipantInteractionMemory memory = ParticipantInteractionMemory.builder()
            .relatedParticipantId(testRelatedParticipantId)
            .type(MemoryType.CONVERSATION_TOPIC)
            .importance(MemoryImportance.NORMAL)
            .content("参与者之间进行了协作")
            .interactionType(ParticipantInteractionMemory.InteractionType.COLLABORATION)
            .interactionTime(Instant.now())
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v3/participants/{participantId}/interaction-memories", testParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveRelationship() throws Exception {
        ParticipantRelationship relationship = ParticipantRelationship.builder()
            .relatedParticipantId(testRelatedParticipantId)
            .relationshipType(ParticipantRelationship.RelationshipType.FRIEND)
            .strength(0.8)
            .description("好朋友")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v3/participants/{participantId}/relationships", testParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(relationship)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSavePreference() throws Exception {
        ParticipantPreference preference = ParticipantPreference.builder()
            .key("interactionStyle")
            .value("collaborative")
            .type(com.heartsphere.memory.model.PreferenceType.STRING)
            .confidence(0.8)
            .updatedAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v3/participants/{participantId}/preferences", testParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(preference)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveSceneMemory() throws Exception {
        ParticipantSceneMemory memory = ParticipantSceneMemory.builder()
            .sceneId(testSceneId)
            .type(MemoryType.CONVERSATION_TOPIC)
            .importance(MemoryImportance.NORMAL)
            .content("在场景中的记忆")
            .sceneContext("协作场景")
            .inheritable(false)
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v3/participants/{participantId}/scene-memories", testParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
}

