package com.heartsphere.mailbox.integration;

import com.heartsphere.entity.User;
import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.mailbox.service.MailboxMessageService;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 跨时空信箱集成测试
 * 测试完整的业务流程
 */
@SpringBootTest
@Transactional
public class MailboxIntegrationTest {
    
    @Autowired
    private MailboxMessageService messageService;
    
    @Autowired
    private MailboxMessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User testUser1;
    private User testUser2;
    
    @BeforeEach
    void setUp() {
        // 清理测试数据
        messageRepository.deleteAll();
        
        // 创建测试用户
        testUser1 = new User();
        testUser1.setUsername("testuser1");
        testUser1.setEmail("test1@example.com");
        testUser1.setPassword("password");
        testUser1.setIsEnabled(true);
        testUser1 = userRepository.save(testUser1);
        
        testUser2 = new User();
        testUser2.setUsername("testuser2");
        testUser2.setEmail("test2@example.com");
        testUser2.setPassword("password");
        testUser2.setIsEnabled(true);
        testUser2 = userRepository.save(testUser2);
    }
    
    @Test
    void testCreateAndRetrieveMessage() {
        // 创建消息
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(testUser2.getId());
        request.setSenderType(SenderType.USER);
        request.setSenderId(testUser1.getId());
        request.setSenderName("测试用户1");
        request.setMessageType(MessageType.USER_PRIVATE_MESSAGE);
        request.setMessageCategory(MessageCategory.USER_MESSAGE);
        request.setTitle("测试消息");
        request.setContent("这是一条测试消息");
        
        MailboxMessage message = messageService.createMessage(request);
        
        assertNotNull(message);
        assertNotNull(message.getId());
        assertEquals(testUser2.getId(), message.getReceiverId());
        assertEquals("测试消息", message.getTitle());
        assertFalse(message.getIsRead());
        
        // 获取消息详情
        MailboxMessage retrieved = messageService.getMessageById(message.getId(), testUser2.getId());
        assertNotNull(retrieved);
        assertEquals(message.getId(), retrieved.getId());
        assertEquals("这是一条测试消息", retrieved.getContent());
    }
    
    @Test
    void testMarkAsRead() {
        // 创建消息
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(testUser2.getId());
        request.setSenderType(SenderType.USER);
        request.setSenderId(testUser1.getId());
        request.setSenderName("测试用户1");
        request.setMessageType(MessageType.USER_PRIVATE_MESSAGE);
        request.setMessageCategory(MessageCategory.USER_MESSAGE);
        request.setTitle("测试消息");
        request.setContent("这是一条测试消息");
        
        MailboxMessage message = messageService.createMessage(request);
        assertFalse(message.getIsRead());
        
        // 标记为已读
        MailboxMessage readMessage = messageService.markAsRead(message.getId(), testUser2.getId());
        assertTrue(readMessage.getIsRead());
        assertNotNull(readMessage.getReadAt());
    }
    
    @Test
    void testGetMessagesByCategory() {
        // 创建不同类型的消息
        createTestMessage(MessageCategory.ESOUL_LETTER);
        createTestMessage(MessageCategory.RESONANCE);
        createTestMessage(MessageCategory.SYSTEM);
        createTestMessage(MessageCategory.USER_MESSAGE);
        
        // 测试按分类查询
        com.heartsphere.mailbox.dto.MessageQueryRequest queryRequest = 
            new com.heartsphere.mailbox.dto.MessageQueryRequest();
        queryRequest.setCategory(MessageCategory.ESOUL_LETTER);
        queryRequest.setPage(0);
        queryRequest.setSize(20);
        
        var result = messageService.getMessages(testUser2.getId(), queryRequest);
        
        assertEquals(1, result.getContent().size());
        assertEquals(MessageCategory.ESOUL_LETTER, result.getContent().get(0).getMessageCategory());
    }
    
    @Test
    void testDeleteMessage() {
        MailboxMessage message = createTestMessage(MessageCategory.USER_MESSAGE);
        
        // 删除消息（软删除）
        messageService.deleteMessage(message.getId(), testUser2.getId());
        
        // 验证消息已软删除
        MailboxMessage deleted = messageRepository.findById(message.getId()).orElse(null);
        assertNotNull(deleted);
        assertNotNull(deleted.getDeletedAt());
    }
    
    private MailboxMessage createTestMessage(MessageCategory category) {
        CreateMessageRequest request = new CreateMessageRequest();
        request.setReceiverId(testUser2.getId());
        request.setSenderType(SenderType.USER);
        request.setSenderId(testUser1.getId());
        request.setSenderName("测试用户1");
        request.setMessageType(MessageType.USER_PRIVATE_MESSAGE);
        request.setMessageCategory(category);
        request.setTitle("测试" + category.name());
        request.setContent("测试内容");
        return messageService.createMessage(request);
    }
}

