package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.ConversationContext;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.service.MemoryManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 记忆管理器测试
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest
@ActiveProfiles("test")
class MemoryManagerImplTest {
    
    @Autowired
    private MemoryManager memoryManager;
    
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
        memoryManager.saveMessage(testUserId, testSessionId, message);
        
        // 验证（通过获取对话上下文验证）
        ConversationContext context = memoryManager.getConversationContext(testUserId, testSessionId, 10);
        assertNotNull(context);
        assertFalse(context.getMessages().isEmpty());
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
            memoryManager.saveMessage(testUserId, testSessionId, message);
        }
        
        // 获取对话上下文
        ConversationContext context = memoryManager.getConversationContext(testUserId, testSessionId, 10);
        
        // 验证
        assertNotNull(context);
        assertEquals(testUserId, context.getUserId());
        assertEquals(testSessionId, context.getSessionId());
        assertNotNull(context.getMessages());
        assertTrue(context.getMessages().size() >= 3);
        assertNotNull(context.getRelevantMemories());
        assertNotNull(context.getUserPreferences());
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
        
        // 提取事实
        List<UserFact> facts = memoryManager.extractFacts(testUserId, List.of(message));
        
        // 验证（可能为空，取决于提取器是否启用）
        assertNotNull(facts);
    }
    
    @Test
    void testRetrieveRelevantMemories() {
        // 检索相关记忆（可能为空，因为测试环境可能没有数据）
        List<com.heartsphere.memory.model.UserMemory> memories = 
            memoryManager.retrieveRelevantMemories(testUserId, "测试", 10);
        
        // 验证（至少应该返回空列表，不应该抛出异常）
        assertNotNull(memories);
    }
    
    @Test
    void testGetUserProfile() {
        // 获取用户画像
        com.heartsphere.memory.model.UserProfile profile = memoryManager.getUserProfile(testUserId);
        
        // 验证
        assertNotNull(profile);
        assertEquals(testUserId, profile.getUserId());
        assertNotNull(profile.getFacts());
        assertNotNull(profile.getPreferences());
        assertNotNull(profile.getMemories());
        assertNotNull(profile.getStatistics());
    }
}




