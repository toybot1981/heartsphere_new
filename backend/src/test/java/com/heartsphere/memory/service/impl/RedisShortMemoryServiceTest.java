package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.service.ShortMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.heartsphere.memory.config.MemoryTestConfig;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Redis短期记忆服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest(classes = {com.heartsphere.HeartSphereApplication.class})
@ActiveProfiles("test")
@Import(MemoryTestConfig.class)
class RedisShortMemoryServiceTest {
    
    @Autowired
    private ShortMemoryService shortMemoryService;
    
    private String testSessionId;
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testSessionId = "test-session-" + System.currentTimeMillis();
        testUserId = "test-user-1";
        
        // 清理测试数据
        shortMemoryService.clearSession(testSessionId);
    }
    
    @Test
    void testSaveAndGetMessage() {
        // 创建测试消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("这是一条测试消息")
            .timestamp(System.currentTimeMillis())
            .build();
        
        // 保存消息
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 获取消息
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 验证
        assertNotNull(messages);
        assertFalse(messages.isEmpty());
        assertEquals(1, messages.size());
        assertEquals("这是一条测试消息", messages.get(0).getContent());
    }
    
    @Test
    void testMessageLimit() {
        // 保存超过限制的消息
        for (int i = 0; i < 110; i++) {
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
        
        // 验证消息数量不超过限制
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 200);
        assertTrue(messages.size() <= 100, "消息数量应该不超过100条");
    }
    
    @Test
    void testWorkingMemory() {
        // 保存工作记忆
        String key = "test-key";
        String value = "test-value";
        shortMemoryService.saveWorkingMemory(testSessionId, key, value);
        
        // 获取工作记忆
        String retrieved = shortMemoryService.getWorkingMemory(testSessionId, key, String.class);
        
        // 验证
        assertNotNull(retrieved);
        assertEquals(value, retrieved);
        
        // 删除工作记忆
        shortMemoryService.deleteWorkingMemory(testSessionId, key);
        
        // 验证已删除
        String deleted = shortMemoryService.getWorkingMemory(testSessionId, key, String.class);
        assertNull(deleted);
    }
    
    @Test
    void testSessionManagement() {
        // 验证会话不存在
        assertFalse(shortMemoryService.sessionExists(testSessionId));
        
        // 保存消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("测试消息")
            .timestamp(System.currentTimeMillis())
            .build();
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 验证会话存在
        assertTrue(shortMemoryService.sessionExists(testSessionId));
        
        // 获取会话数量
        int sessionCount = shortMemoryService.getSessionCount(testUserId);
        assertTrue(sessionCount > 0);
        
        // 删除会话
        shortMemoryService.deleteSession(testSessionId);
        
        // 验证会话已删除
        assertFalse(shortMemoryService.sessionExists(testSessionId));
    }
    
    @Test
    void testGetMessagesByTimeRange() {
        // 保存不同时间的消息
        long baseTime = System.currentTimeMillis();
        
        for (int i = 0; i < 5; i++) {
            ChatMessage message = ChatMessage.builder()
                .id("msg-" + i)
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("消息 " + i)
                .timestamp(baseTime + i * 1000)
                .build();
            shortMemoryService.saveMessage(testSessionId, message);
        }
        
        // 获取时间范围内的消息
        Instant startTime = Instant.ofEpochMilli(baseTime + 1000);
        Instant endTime = Instant.ofEpochMilli(baseTime + 4000);
        
        List<ChatMessage> messages = shortMemoryService.getMessages(
            testSessionId, startTime, endTime
        );
        
        // 验证
        assertNotNull(messages);
        assertTrue(messages.size() > 0);
    }
}

