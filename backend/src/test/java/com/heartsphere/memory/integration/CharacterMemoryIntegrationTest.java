package com.heartsphere.memory.integration;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
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
 * 测试对话系统的消息管理
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest
@ActiveProfiles("test")
class CharacterMemoryIntegrationTest {
    
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
            shortMemoryService.saveMessage(testSessionId, message);
        }
        
        // 2. 获取对话消息（通过ShortMemoryService）
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 3. 验证消息
        assertNotNull(messages);
        assertTrue(messages.size() >= 3);
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
        shortMemoryService.saveMessage(testSessionId, message1);
        
        ChatMessage message2 = ChatMessage.builder()
            .id("msg-2")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.ASSISTANT)
            .content("听起来很有趣！")
            .timestamp(System.currentTimeMillis())
            .build();
        shortMemoryService.saveMessage(testSessionId, message2);
        
        // 2. 验证消息已保存
        List<ChatMessage> savedMessages = shortMemoryService.getMessages(testSessionId, 10);
        assertNotNull(savedMessages);
        assertTrue(savedMessages.size() >= 2);
    }
    
    @Test
    void testCharacterMemoryRetrieval() {
        // 1. 保存一些对话消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("用户喜欢谈论编程话题")
            .timestamp(System.currentTimeMillis())
            .build();
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 2. 获取消息
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 验证
        assertNotNull(messages);
        assertTrue(messages.size() >= 1);
        
        // 验证消息内容包含关键词
        boolean found = messages.stream()
            .anyMatch(m -> m.getContent() != null && m.getContent().contains("编程"));
        assertTrue(found, "应该找到包含'编程'的消息");
    }
}

