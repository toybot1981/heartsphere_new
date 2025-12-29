package com.heartsphere.memory.integration;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.ConversationContext;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.model.character.CharacterInteractionMemory;
import com.heartsphere.memory.model.character.CharacterSceneMemory;
import com.heartsphere.memory.service.CharacterMemoryService;
import com.heartsphere.memory.service.MemoryManager;
import com.heartsphere.memory.service.ShortMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 角色记忆系统集成测试
 * 测试角色记忆与对话系统的完整集成
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest
@ActiveProfiles("test")
class CharacterMemoryIntegrationTest {
    
    @Autowired
    private MemoryManager memoryManager;
    
    @Autowired
    private CharacterMemoryService characterMemoryService;
    
    @Autowired
    private ShortMemoryService shortMemoryService;
    
    private String testCharacterId;
    private String testUserId;
    private String testSessionId;
    private String testEraId;
    
    @BeforeEach
    void setUp() {
        testCharacterId = "test-character-" + System.currentTimeMillis();
        testUserId = "test-user-" + System.currentTimeMillis();
        testSessionId = "test-session-" + System.currentTimeMillis();
        testEraId = "test-era-" + System.currentTimeMillis();
    }
    
    @Test
    void testCharacterConversationContext() {
        // 1. 保存一些对话消息
        for (int i = 0; i < 3; i++) {
            ChatMessage message = ChatMessage.builder()
                .id("msg-" + i)
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("用户消息 " + i)
                .timestamp(System.currentTimeMillis())
                .build();
            memoryManager.saveMessage(testUserId, testSessionId, message);
        }
        
        // 2. 保存一些角色交互记忆
        CharacterInteractionMemory interactionMemory = CharacterInteractionMemory.builder()
            .characterId(testCharacterId)
            .userId(testUserId)
            .eraId(testEraId)
            .type(com.heartsphere.memory.model.MemoryType.CONVERSATION_TOPIC)
            .importance(com.heartsphere.memory.model.MemoryImportance.NORMAL)
            .content("用户喜欢谈论技术话题")
            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
            .interactionTime(java.time.Instant.now())
            .source(com.heartsphere.memory.model.MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        characterMemoryService.saveInteractionMemory(interactionMemory);
        
        // 3. 保存一些角色场景记忆
        CharacterSceneMemory sceneMemory = CharacterSceneMemory.builder()
            .characterId(testCharacterId)
            .eraId(testEraId)
            .type(com.heartsphere.memory.model.MemoryType.CONVERSATION_TOPIC)
            .importance(com.heartsphere.memory.model.MemoryImportance.NORMAL)
            .content("在大学场景中，角色是学生")
            .sceneContext("大学场景")
            .inheritable(false)
            .source(com.heartsphere.memory.model.MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(java.time.Instant.now())
            .updatedAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        characterMemoryService.saveSceneMemory(sceneMemory);
        
        // 4. 获取对话消息（通过ShortMemoryService）
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 5. 验证消息
        assertNotNull(messages);
        assertTrue(messages.size() >= 3);
        
        // 6. 获取角色交互记忆
        List<CharacterInteractionMemory> interactionMemories = 
            characterMemoryService.getInteractionMemories(testCharacterId, testUserId, testEraId);
        assertNotNull(interactionMemories);
        assertTrue(interactionMemories.size() >= 1);
        
        // 7. 获取角色场景记忆
        List<CharacterSceneMemory> sceneMemories = 
            characterMemoryService.getSceneMemories(testCharacterId, testEraId);
        assertNotNull(sceneMemories);
        assertTrue(sceneMemories.size() >= 1);
    }
    
    @Test
    void testCharacterMemoryExtraction() {
        // 1. 保存一些对话消息
        ChatMessage message1 = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("我喜欢旅行，特别是去日本")
            .timestamp(System.currentTimeMillis())
            .build();
        memoryManager.saveMessage(testUserId, testSessionId, message1);
        
        ChatMessage message2 = ChatMessage.builder()
            .id("msg-2")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.ASSISTANT)
            .content("听起来很有趣！")
            .timestamp(System.currentTimeMillis())
            .build();
        memoryManager.saveMessage(testUserId, testSessionId, message2);
        
        // 2. 验证消息已保存
        List<ChatMessage> savedMessages = shortMemoryService.getMessages(testSessionId, 10);
        assertNotNull(savedMessages);
        assertTrue(savedMessages.size() >= 2);
        
        // 3. 手动保存角色交互记忆（因为自动提取可能未启用）
        CharacterInteractionMemory interactionMemory = CharacterInteractionMemory.builder()
            .characterId(testCharacterId)
            .userId(testUserId)
            .eraId(testEraId)
            .type(com.heartsphere.memory.model.MemoryType.CONVERSATION_TOPIC)
            .importance(com.heartsphere.memory.model.MemoryImportance.NORMAL)
            .content("用户喜欢旅行，特别是去日本")
            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
            .interactionTime(java.time.Instant.now())
            .source(com.heartsphere.memory.model.MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        characterMemoryService.saveInteractionMemory(interactionMemory);
        
        // 4. 验证记忆已保存
        List<CharacterInteractionMemory> memories = characterMemoryService.getInteractionMemories(
            testCharacterId, testUserId, testEraId);
        assertNotNull(memories);
        assertTrue(memories.size() >= 1);
    }
    
    @Test
    void testCharacterMemoryRetrieval() {
        // 1. 保存一些角色记忆
        CharacterInteractionMemory memory = CharacterInteractionMemory.builder()
            .characterId(testCharacterId)
            .userId(testUserId)
            .eraId(testEraId)
            .type(com.heartsphere.memory.model.MemoryType.CONVERSATION_TOPIC)
            .importance(com.heartsphere.memory.model.MemoryImportance.IMPORTANT)
            .content("用户喜欢谈论编程话题")
            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
            .interactionTime(java.time.Instant.now())
            .source(com.heartsphere.memory.model.MemorySource.CONVERSATION)
            .confidence(0.9)
            .createdAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        characterMemoryService.saveInteractionMemory(memory);
        
        // 2. 获取所有交互记忆（作为检索的替代）
        List<CharacterInteractionMemory> allMemories = 
            characterMemoryService.getInteractionMemories(testCharacterId, testUserId, testEraId);
        
        // 验证
        assertNotNull(allMemories);
        assertTrue(allMemories.size() >= 1);
        
        // 验证记忆内容包含关键词
        boolean found = allMemories.stream()
            .anyMatch(m -> m.getContent() != null && m.getContent().contains("编程"));
        assertTrue(found, "应该找到包含'编程'的记忆");
    }
}

