package com.heartsphere.memory.integration;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
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
 * 参与者记忆系统集成测试
 * 测试对话系统的消息管理
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@SpringBootTest
@ActiveProfiles("test")
class ParticipantMemoryIntegrationTest {
    
    @Autowired
    private ShortMemoryService shortMemoryService;
    
    private String testSessionId;
    
    @BeforeEach
    void setUp() {
        testSessionId = "test-session-" + System.currentTimeMillis();
    }
    
    @Test
    void testParticipantCollaborationMemory() {
        // 1. 保存对话消息
        ChatMessage message1 = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId("participant-1")
            .role(MessageRole.USER)
            .content("参与者A和B成功协作完成了任务X")
            .timestamp(System.currentTimeMillis())
            .build();
        shortMemoryService.saveMessage(testSessionId, message1);
        
        // 2. 验证消息已保存
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        assertNotNull(messages);
        assertTrue(messages.size() >= 1);
    }
    
    @Test
    void testParticipantSceneMemory() {
        // 1. 保存对话消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId("participant-1")
            .role(MessageRole.USER)
            .content("在协作场景中，参与者A是项目负责人")
            .timestamp(System.currentTimeMillis())
            .build();
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 2. 获取消息
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 验证
        assertNotNull(messages);
        assertTrue(messages.size() >= 1);
    }
    
    @Test
    void testParticipantPreferenceMemory() {
        // 1. 保存对话消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId("participant-1")
            .role(MessageRole.USER)
            .content("communicationStyle: direct")
            .timestamp(System.currentTimeMillis())
            .build();
        shortMemoryService.saveMessage(testSessionId, message);
        
        // 2. 获取消息
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        
        // 验证
        assertNotNull(messages);
        assertTrue(messages.size() >= 1);
    }
    
    @Test
    void testParticipantMemoryRetrieval() {
        // 1. 保存对话消息
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId("participant-1")
            .role(MessageRole.USER)
            .content("参与者之间讨论了技术问题")
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
            .anyMatch(m -> m.getContent() != null && m.getContent().contains("技术"));
        assertTrue(found, "应该找到包含'技术'的消息");
    }
}

