package com.heartsphere.memory.controller;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.character.CharacterInteractionMemory;
import com.heartsphere.memory.model.character.CharacterRelationshipMemory;
import com.heartsphere.memory.model.character.CharacterSceneMemory;
import com.heartsphere.memory.model.character.CharacterSelfMemory;
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
 * 角色记忆系统Controller测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(com.heartsphere.config.TestSecurityConfig.class)
class CharacterMemoryControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String testCharacterId;
    private String testUserId;
    private String testEraId;
    
    @BeforeEach
    void setUp() {
        testCharacterId = "test-character-" + System.currentTimeMillis();
        testUserId = "test-user-" + System.currentTimeMillis();
        testEraId = "test-era-" + System.currentTimeMillis();
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveCharacterSelfMemory() throws Exception {
        CharacterSelfMemory memory = CharacterSelfMemory.builder()
            .type(MemoryType.PERSONALITY)
            .importance(MemoryImportance.IMPORTANT)
            .content("性格温和，喜欢帮助他人")
            .source(MemorySource.MANUAL_CREATE)
            .confidence(0.9)
            .createdAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v2/characters/{characterId}/self-memories", testCharacterId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testGetCharacterSelfMemories() throws Exception {
        mockMvc.perform(get("/api/memory/v2/characters/{characterId}/self-memories", testCharacterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveInteractionMemory() throws Exception {
        CharacterInteractionMemory memory = CharacterInteractionMemory.builder()
            .type(MemoryType.CONVERSATION_TOPIC)
            .importance(MemoryImportance.NORMAL)
            .content("用户喜欢谈论旅行话题")
            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
            .interactionTime(Instant.now())
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v2/characters/{characterId}/interaction-memories", testCharacterId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testGetInteractionMemories() throws Exception {
        mockMvc.perform(get("/api/memory/v2/characters/{characterId}/interaction-memories", testCharacterId)
                .param("eraId", testEraId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveSceneMemory() throws Exception {
        CharacterSceneMemory memory = CharacterSceneMemory.builder()
            .eraId(testEraId)
            .type(MemoryType.CONVERSATION_TOPIC)
            .importance(MemoryImportance.NORMAL)
            .content("在大学场景中，角色是学生")
            .sceneContext("大学场景")
            .inheritable(false)
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v2/characters/{characterId}/scene-memories", testCharacterId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testSaveRelationshipMemory() throws Exception {
        CharacterRelationshipMemory relationship = CharacterRelationshipMemory.builder()
            .relatedCharacterId("related-character-123")
            .relationshipType(CharacterRelationshipMemory.RelationshipType.FRIEND)
            .strength(0.8)
            .description("好朋友")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        
        mockMvc.perform(post("/api/memory/v2/characters/{characterId}/relationships", testCharacterId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(relationship)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    @WithMockUser(username = "test-user-123")
    void testGetCharacterMemoryProfile() throws Exception {
        mockMvc.perform(get("/api/memory/v2/characters/{characterId}/profile", testCharacterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());
    }
}

