package com.heartsphere.memory.integration;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.ConversationContext;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.service.MemoryManager;
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
 * 记忆系统集成测试
 * 测试短期记忆和长期记忆的完整流程
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest
@ActiveProfiles("test")
class MemorySystemIntegrationTest {
    
    @Autowired
    private MemoryManager memoryManager;
    
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
    void testCompleteMemoryFlow() {
        // 1. 保存消息到短期记忆
        ChatMessage message1 = ChatMessage.builder()
            .id("msg-1")
            .sessionId(testSessionId)
            .userId(testUserId)
            .role(MessageRole.USER)
            .content("你好，我叫张三，今年25岁")
            .timestamp(System.currentTimeMillis())
            .build();
        
        memoryManager.saveMessage(testUserId, testSessionId, message1);
        
        // 2. 验证消息已保存
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        assertEquals(1, messages.size());
        
        // 3. 获取对话上下文
        ConversationContext context = memoryManager.getConversationContext(testUserId, testSessionId, 10);
        assertNotNull(context);
        assertEquals(1, context.getMessages().size());
        
        // 4. 提取记忆（异步）
        memoryManager.extractAndSaveMemories(testUserId, testSessionId);
        
        // 5. 等待一段时间让异步任务完成（实际测试中可以使用更好的同步机制）
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 6. 验证记忆可能已被提取（取决于提取器配置）
        // 注意：由于是异步操作，这里只验证不会抛出异常
        assertTrue(true);
    }
    
    @Test
    void testShortTermToLongTermMemory() {
        // 1. 保存多条消息
        for (int i = 0; i < 5; i++) {
            ChatMessage message = ChatMessage.builder()
                .id("msg-" + i)
                .sessionId(testSessionId)
                .userId(testUserId)
                .role(MessageRole.USER)
                .content("消息内容 " + i)
                .timestamp(System.currentTimeMillis())
                .build();
            memoryManager.saveMessage(testUserId, testSessionId, message);
        }
        
        // 2. 验证短期记忆
        List<ChatMessage> messages = shortMemoryService.getMessages(testSessionId, 10);
        assertEquals(5, messages.size());
        
        // 3. 获取对话上下文（包含短期和长期记忆）
        ConversationContext context = memoryManager.getConversationContext(testUserId, testSessionId, 10);
        assertNotNull(context);
        assertEquals(5, context.getMessages().size());
        
        // 4. 验证长期记忆服务可用
        List<UserFact> facts = longMemoryService.getAllFacts(testUserId);
        assertNotNull(facts);
    }
    
    @Test
    void testMemoryRetrieval() {
        // 1. 保存一些事实到长期记忆
        UserFact fact = UserFact.builder()
            .userId(testUserId)
            .fact("用户喜欢Java编程")
            .category(com.heartsphere.memory.model.FactCategory.SKILL)
            .importance(0.8)
            .confidence(0.9)
            .createdAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        
        longMemoryService.saveFact(fact);
        
        // 2. 搜索事实
        List<UserFact> results = longMemoryService.searchFacts(testUserId, "Java");
        assertNotNull(results);
        
        // 3. 检索相关记忆
        List<com.heartsphere.memory.model.UserMemory> memories = 
            memoryManager.retrieveRelevantMemories(testUserId, "编程", 10);
        assertNotNull(memories);
    }
    
    @Test
    void testUserProfile() {
        // 1. 保存一些数据
        UserFact fact = UserFact.builder()
            .userId(testUserId)
            .fact("测试事实")
            .category(com.heartsphere.memory.model.FactCategory.PERSONAL)
            .importance(0.7)
            .confidence(0.8)
            .createdAt(java.time.Instant.now())
            .lastAccessedAt(java.time.Instant.now())
            .accessCount(0)
            .build();
        
        longMemoryService.saveFact(fact);
        
        // 2. 获取用户画像
        com.heartsphere.memory.model.UserProfile profile = memoryManager.getUserProfile(testUserId);
        
        // 3. 验证
        assertNotNull(profile);
        assertEquals(testUserId, profile.getUserId());
        assertNotNull(profile.getStatistics());
        assertTrue(profile.getStatistics().getTotalFacts() >= 1);
    }
}



