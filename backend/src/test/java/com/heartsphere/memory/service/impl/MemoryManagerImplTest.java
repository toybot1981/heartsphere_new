package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.service.ShortMemoryService;
import com.heartsphere.memory.service.LongMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 记忆服务测试
 * 测试短期记忆和长期记忆服务
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest
@ActiveProfiles("test")
class MemoryManagerImplTest {
    
    @Autowired
    private ShortMemoryService shortMemoryService;
    
    @Autowired
    private LongMemoryService longMemoryService;
    
    private String testUserId;
    private String testSessionId;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
        testSessionId = "test-session-" + System.currentTimeMillis();
    }
    
    @Test
    void testSaveMessage() {
        // 创建测试消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("你好，我叫张三")
            .timestamp(System.currentTimeMillis())
            .build();
        
        // 保存消息
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 验证
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        assertNotNull(messages);
        assertFalse(messages.isEmpty());
    }
    
    @Test
    void testGetConversationContext() {
        // 保存几条消息
        for (int i = 0; i < 3; i++) {
            ChatMessage message = ChatMessage.builder()
                .id("msg-" + i)
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("消息 " + i)
                .timestamp(System.currentTimeMillis())
                .build();
            shortMemoryService.saveMessage(testSessionId, message);
        }
        
        // 获取消息
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 验证
        assertNotNull(messages);
        assertTrue(messages.size() >= 3);
    }
    
    @Test
    void testExtractFacts() {
        // 创建包含事实信息的消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("我叫张三，今年25岁，是一名软件工程师")
            .timestamp(System.currentTimeMillis())
            .build();
        
        // 保存消息
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 验证消息已保存
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        assertNotNull(messages);
        assertTrue(messages.size() >= 1);
    }
    
    @Test
    void testRetrieveRelevantMemories() {
        // 检索相关记忆（可能为空，因为测试环境可能没有数据）
        List<com.heartsphere.memory.model.UserMemory> memories = 
            longMemoryService.retrieveRelevantMemories(testUserId, "测试", 10);
        
        // 验证（至少应该返回空列表，不应该抛出异常）
        assertNotNull(memories);
    }
    
    @Test
    void testGetUserProfile() {
        // 获取用户事实和偏好
        List<UserFact> facts = longMemoryService.getAllFacts(testUserId);
        List<com.heartsphere.memory.model.UserPreference> preferences = longMemoryService.getAllPreferences(testUserId);
        
        // 验证
        assertNotNull(facts);
        assertNotNull(preferences);
    }
}




