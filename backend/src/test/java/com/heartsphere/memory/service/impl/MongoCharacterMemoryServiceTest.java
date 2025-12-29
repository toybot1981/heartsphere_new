package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.character.*;
import com.heartsphere.memory.service.CharacterMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MongoDB角色记忆服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest
@ActiveProfiles("test")
class MongoCharacterMemoryServiceTest {
    
    @Autowired
    private CharacterMemoryService characterMemoryService;
    
    private String testCharacterId;
    private String testUserId;
    private String testEraId;
    
    @BeforeEach
    void setUp() {
        testCharacterId = "test-character-" + System.currentTimeMillis();
        testUserId = "test-user-" + System.currentTimeMillis();
        testEraId = "test-era-" + System.currentTimeMillis();
    }
    
    // ========== 角色自身记忆测试 ==========
    
    @Test
    void testSaveAndGetCharacterSelfMemory() {
        // 创建测试记忆
        CharacterSelfMemory memory = CharacterSelfMemory.builder()
            .characterId(testCharacterId)
            .type(MemoryType.PERSONALITY)
            .importance(MemoryImportance.IMPORTANT)
            .content("角色性格温和，喜欢帮助他人")
            .structuredData(Map.of("personality", "温和", "trait", "助人为乐"))
            .source(MemorySource.MANUAL_CREATE)
            .confidence(0.9)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        // 保存记忆
        CharacterSelfMemory saved = characterMemoryService.saveCharacterSelfMemory(memory);
        
        // 验证
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals(testCharacterId, saved.getCharacterId());
        assertEquals(MemoryType.PERSONALITY, saved.getType());
        
        // 获取记忆（通过ID）
        CharacterSelfMemory retrieved = characterMemoryService.getCharacterSelfMemory(saved.getId());
        assertNotNull(retrieved);
        assertEquals(saved.getContent(), retrieved.getContent());
        
        // 验证获取所有记忆
        List<CharacterSelfMemory> allMemories = characterMemoryService.getCharacterSelfMemories(testCharacterId);
        assertNotNull(allMemories);
        assertTrue(allMemories.size() >= 1);
    }
    
    @Test
    void testGetCharacterSelfMemories() {
        // 创建多个测试记忆
        for (int i = 0; i < 3; i++) {
            CharacterSelfMemory memory = CharacterSelfMemory.builder()
                .characterId(testCharacterId)
                .type(MemoryType.PERSONALITY)
                .importance(MemoryImportance.NORMAL)
                .content("测试记忆 " + i)
                .source(MemorySource.MANUAL_CREATE)
                .confidence(0.8)
                .createdAt(Instant.now())
                .build();
            characterMemoryService.saveCharacterSelfMemory(memory);
        }
        
        // 获取所有记忆
        List<CharacterSelfMemory> memories = characterMemoryService.getCharacterSelfMemories(testCharacterId);
        
        // 验证
        assertNotNull(memories);
        assertTrue(memories.size() >= 3);
    }
    
    // ========== 角色交互记忆测试 ==========
    
    @Test
    void testSaveAndGetInteractionMemory() {
        // 创建测试记忆
        CharacterInteractionMemory memory = CharacterInteractionMemory.builder()
            .characterId(testCharacterId)
            .userId(testUserId)
            .eraId(testEraId)
            .type(MemoryType.CONVERSATION_TOPIC)
            .importance(MemoryImportance.NORMAL)
            .content("用户喜欢谈论旅行话题")
            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
            .interactionSessionId("session-123")
            .interactionTime(Instant.now())
            .userRelatedData(Map.of("preference", "旅行"))
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        // 保存记忆
        CharacterInteractionMemory saved = characterMemoryService.saveInteractionMemory(memory);
        
        // 验证
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals(testCharacterId, saved.getCharacterId());
        assertEquals(testUserId, saved.getUserId());
        
        // 获取记忆
        List<CharacterInteractionMemory> memories = characterMemoryService.getInteractionMemories(
            testCharacterId, testUserId, testEraId);
        
        // 验证
        assertNotNull(memories);
        assertTrue(memories.size() >= 1);
    }
    
    // ========== 角色场景记忆测试 ==========
    
    @Test
    void testSaveAndGetSceneMemory() {
        // 创建测试记忆
        CharacterSceneMemory memory = CharacterSceneMemory.builder()
            .characterId(testCharacterId)
            .eraId(testEraId)
            .type(MemoryType.CONVERSATION_TOPIC)
            .importance(MemoryImportance.NORMAL)
            .content("在大学场景中，角色是学生")
            .sceneContext("大学场景")
            .inheritable(false)
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        // 保存记忆
        CharacterSceneMemory saved = characterMemoryService.saveSceneMemory(memory);
        
        // 验证
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals(testCharacterId, saved.getCharacterId());
        assertEquals(testEraId, saved.getEraId());
        
        // 获取记忆
        List<CharacterSceneMemory> memories = characterMemoryService.getSceneMemories(
            testCharacterId, testEraId);
        
        // 验证
        assertNotNull(memories);
        assertTrue(memories.size() >= 1);
    }
    
    // ========== 角色关系记忆测试 ==========
    
    @Test
    void testSaveAndGetRelationshipMemory() {
        String relatedCharacterId = "related-character-123";
        
        // 创建测试关系
        CharacterRelationshipMemory relationship = CharacterRelationshipMemory.builder()
            .characterId(testCharacterId)
            .relatedCharacterId(relatedCharacterId)
            .relationshipType(CharacterRelationshipMemory.RelationshipType.FRIEND)
            .strength(0.8)
            .description("好朋友")
            .interactionCount(0)
            .firstMetAt(Instant.now())
            .lastInteractedAt(Instant.now())
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        
        // 保存关系
        CharacterRelationshipMemory saved = characterMemoryService.saveRelationshipMemory(relationship);
        
        // 验证
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals(testCharacterId, saved.getCharacterId());
        assertEquals(relatedCharacterId, saved.getRelatedCharacterId());
        
        // 获取关系
        CharacterRelationshipMemory retrieved = characterMemoryService.getRelationshipMemory(
            testCharacterId, relatedCharacterId);
        
        // 验证
        assertNotNull(retrieved);
        assertEquals(CharacterRelationshipMemory.RelationshipType.FRIEND, retrieved.getRelationshipType());
        assertEquals(0.8, retrieved.getStrength());
    }
    
    @Test
    void testUpdateRelationshipStrength() {
        String relatedCharacterId = "related-character-456";
        
        // 创建关系
        CharacterRelationshipMemory relationship = CharacterRelationshipMemory.builder()
            .characterId(testCharacterId)
            .relatedCharacterId(relatedCharacterId)
            .relationshipType(CharacterRelationshipMemory.RelationshipType.FRIEND)
            .strength(0.6)
            .description("朋友")
            .interactionCount(0)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        characterMemoryService.saveRelationshipMemory(relationship);
        
        // 更新关系强度
        CharacterRelationshipMemory updated = characterMemoryService.updateRelationshipStrength(
            testCharacterId, relatedCharacterId, 0.9);
        
        // 验证
        assertNotNull(updated);
        assertEquals(0.9, updated.getStrength());
        assertNotNull(updated.getRelationshipHistory());
        assertTrue(updated.getRelationshipHistory().size() >= 1);
    }
    
    // ========== 角色记忆画像测试 ==========
    
    @Test
    void testGetCharacterMemoryProfile() {
        // 创建一些测试数据
        CharacterSelfMemory selfMemory = CharacterSelfMemory.builder()
            .characterId(testCharacterId)
            .type(MemoryType.PERSONALITY)
            .importance(MemoryImportance.IMPORTANT)
            .content("测试自身记忆")
            .source(MemorySource.MANUAL_CREATE)
            .confidence(0.9)
            .createdAt(Instant.now())
            .build();
        characterMemoryService.saveCharacterSelfMemory(selfMemory);
        
        // 获取记忆画像
        CharacterMemoryProfile profile = characterMemoryService.getCharacterMemoryProfile(testCharacterId);
        
        // 验证
        assertNotNull(profile);
        assertEquals(testCharacterId, profile.getCharacterId());
        assertNotNull(profile.getStatistics());
        assertTrue(profile.getStatistics().getTotalSelfMemories() >= 1);
    }
}

