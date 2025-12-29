package com.heartsphere.heartconnect;

import com.heartsphere.heartconnect.context.ExperienceModeContext;
import com.heartsphere.heartconnect.storage.TemporaryDataStorage;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MessageRole;
import com.heartsphere.memory.service.impl.MemoryManagerImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 体验模式数据隔离测试
 */
@SpringBootTest
@ActiveProfiles("test")
public class ExperienceModeTest {
    
    @Autowired
    private MemoryManagerImpl memoryManager;
    
    @Autowired
    private TemporaryDataStorage temporaryDataStorage;
    
    @BeforeEach
    public void setUp() {
        // 清除上下文和临时存储
        ExperienceModeContext.clear();
        temporaryDataStorage.clear("1", "2");
    }
    
    @Test
    public void testNormalModeSaveMessage() {
        // 正常模式：不设置体验模式上下文
        ChatMessage message = ChatMessage.builder()
            .id("msg-1")
            .userId("user-1")
            .sessionId("session-1")
            .role(MessageRole.USER)
            .content("正常模式测试消息")
            .timestamp(System.currentTimeMillis())
            .build();
        
        // 保存消息（应该正常保存，这里只是测试不会抛出异常）
        assertDoesNotThrow(() -> {
            memoryManager.saveMessage("user-1", "session-1", message);
        });
        
        // 验证不在体验模式
        assertFalse(ExperienceModeContext.isActive());
    }
    
    @Test
    public void testExperienceModeSaveMessage() {
        // 设置体验模式上下文
        ExperienceModeContext.set(new ExperienceModeContext.ExperienceModeInfo(
            true, 1L, 2L, 1L
        ));
        
        ChatMessage message = ChatMessage.builder()
            .id("msg-2")
            .userId("2")
            .sessionId("session-2")
            .role(MessageRole.USER)
            .content("体验模式测试消息")
            .timestamp(System.currentTimeMillis())
            .build();
        
        // 保存消息（应该保存到临时存储）
        assertDoesNotThrow(() -> {
            memoryManager.saveMessage("2", "session-2", message);
        });
        
        // 验证体验模式激活
        assertTrue(ExperienceModeContext.isActive());
        assertEquals(1L, ExperienceModeContext.getShareConfigId());
        assertEquals(2L, ExperienceModeContext.getVisitorId());
        
        // 验证数据保存到临时存储
        var storedMessages = temporaryDataStorage.get("1", "2", "dialogue", ChatMessage.class);
        assertFalse(storedMessages.isEmpty(), "消息应该保存到临时存储");
        assertEquals("体验模式测试消息", storedMessages.get(0).getContent());
    }
    
    @Test
    public void testExperienceModeContext() {
        // 测试上下文设置和获取
        ExperienceModeContext.set(new ExperienceModeContext.ExperienceModeInfo(
            true, 1L, 2L, 1L
        ));
        
        assertTrue(ExperienceModeContext.isActive());
        assertEquals(1L, ExperienceModeContext.getShareConfigId());
        assertEquals(2L, ExperienceModeContext.getVisitorId());
        assertEquals(1L, ExperienceModeContext.getOwnerId());
        
        // 清除上下文
        ExperienceModeContext.clear();
        assertFalse(ExperienceModeContext.isActive());
        assertNull(ExperienceModeContext.getShareConfigId());
    }
    
    @Test
    public void testTemporaryDataStorage() {
        // 测试临时存储
        ChatMessage message1 = ChatMessage.builder()
            .id("msg-1")
            .content("消息1")
            .build();
        
        ChatMessage message2 = ChatMessage.builder()
            .id("msg-2")
            .content("消息2")
            .build();
        
        // 保存数据
        temporaryDataStorage.save("1", "2", "dialogue", message1);
        temporaryDataStorage.save("1", "2", "dialogue", message2);
        
        // 获取数据
        var messages = temporaryDataStorage.get("1", "2", "dialogue", ChatMessage.class);
        assertEquals(2, messages.size());
        
        // 获取统计
        var stats = temporaryDataStorage.getStatistics("1", "2");
        assertEquals(1, stats.size());
        assertEquals(2, stats.get("dialogue"));
        
        // 清除数据
        temporaryDataStorage.clear("1", "2");
        messages = temporaryDataStorage.get("1", "2", "dialogue", ChatMessage.class);
        assertTrue(messages.isEmpty());
    }
}

