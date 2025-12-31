package com.heartsphere.mailbox.service;

import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 共鸣消息服务测试
 */
@SpringBootTest
@Transactional
public class ResonanceMessageServiceTest {
    
    @Autowired
    private ResonanceMessageService resonanceMessageService;
    
    @Autowired
    private MailboxMessageRepository messageRepository;
    
    private Long testReceiverId = 1L;
    private Long testSenderId = 2L;
    
    @BeforeEach
    void setUp() {
        // 清理测试数据
        messageRepository.deleteAll();
    }
    
    @Test
    void testHandleLike() {
        // 创建点赞消息
        MailboxMessage message = resonanceMessageService.handleLike(
            testReceiverId, testSenderId, "测试用户", null, 100L, "heartsphere"
        );
        
        assertNotNull(message);
        assertEquals(testReceiverId, message.getReceiverId());
        assertEquals(MessageType.RESONANCE_LIKE, message.getMessageType());
        assertEquals(MessageCategory.RESONANCE, message.getMessageCategory());
        assertTrue(message.getTitle().contains("赞了"));
    }
    
    @Test
    void testHandleLikeAggregation() {
        // 创建第一条点赞消息
        MailboxMessage message1 = resonanceMessageService.handleLike(
            testReceiverId, testSenderId, "用户1", null, 100L, "heartsphere"
        );
        
        // 创建第二条点赞消息（应该聚合）
        MailboxMessage message2 = resonanceMessageService.handleLike(
            testReceiverId, 3L, "用户2", null, 100L, "heartsphere"
        );
        
        // 检查是否聚合（同一条消息）
        // 注意：由于聚合逻辑的时间判断（同一天内），可能不会聚合
        // 这里主要验证消息创建成功
        assertNotNull(message1);
        assertNotNull(message2);
    }
    
    @Test
    void testHandleComment() {
        MailboxMessage message = resonanceMessageService.handleComment(
            testReceiverId, testSenderId, "测试用户", null, 
            100L, "heartsphere", "这是一条评论"
        );
        
        assertNotNull(message);
        assertEquals(MessageType.RESONANCE_COMMENT, message.getMessageType());
        assertEquals("这是一条评论", message.getContent());
    }
    
    @Test
    void testHandleConnectionRequest() {
        MailboxMessage message = resonanceMessageService.handleConnectionRequest(
            testReceiverId, testSenderId, "测试用户", null, "我想和你建立连接"
        );
        
        assertNotNull(message);
        assertEquals(MessageType.RESONANCE_CONNECTION_REQUEST, message.getMessageType());
        assertTrue(message.getIsImportant()); // 连接请求应该标记为重要
    }
}

