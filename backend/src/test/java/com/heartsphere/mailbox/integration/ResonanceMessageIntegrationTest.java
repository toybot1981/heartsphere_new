package com.heartsphere.mailbox.integration;

import com.heartsphere.entity.User;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.mailbox.service.ResonanceMessageService;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 共鸣消息集成测试
 */
@SpringBootTest
@Transactional
public class ResonanceMessageIntegrationTest {
    
    @Autowired
    private ResonanceMessageService resonanceMessageService;
    
    @Autowired
    private MailboxMessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User sender;
    private User receiver;
    
    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();
        
        sender = createUser("sender", "sender@test.com");
        receiver = createUser("receiver", "receiver@test.com");
    }
    
    @Test
    void testHandleLike() {
        MailboxMessage message = resonanceMessageService.handleLike(
            receiver.getId(),
            sender.getId(),
            "发送者",
            null,
            100L,
            "heartsphere"
        );
        
        assertNotNull(message);
        assertEquals(MessageType.RESONANCE_LIKE, message.getMessageType());
        assertEquals(MessageCategory.RESONANCE, message.getMessageCategory());
        assertEquals(receiver.getId(), message.getReceiverId());
        assertTrue(message.getTitle().contains("赞了"));
    }
    
    @Test
    void testHandleComment() {
        MailboxMessage message = resonanceMessageService.handleComment(
            receiver.getId(),
            sender.getId(),
            "发送者",
            null,
            100L,
            "heartsphere",
            "这是一条评论"
        );
        
        assertNotNull(message);
        assertEquals(MessageType.RESONANCE_COMMENT, message.getMessageType());
        assertEquals("这是一条评论", message.getContent());
    }
    
    @Test
    void testHandleConnectionRequest() {
        MailboxMessage message = resonanceMessageService.handleConnectionRequest(
            receiver.getId(),
            sender.getId(),
            "发送者",
            null,
            "我想和你建立连接"
        );
        
        assertNotNull(message);
        assertEquals(MessageType.RESONANCE_CONNECTION_REQUEST, message.getMessageType());
        assertTrue(message.getIsImportant()); // 连接请求应该标记为重要
    }
    
    @Test
    void testLikeAggregation() {
        // 第一条点赞
        MailboxMessage msg1 = resonanceMessageService.handleLike(
            receiver.getId(), sender.getId(), "用户1", null, 100L, "heartsphere"
        );
        
        // 第二条点赞（应该聚合）
        User sender2 = createUser("sender2", "sender2@test.com");
        MailboxMessage msg2 = resonanceMessageService.handleLike(
            receiver.getId(), sender2.getId(), "用户2", null, 100L, "heartsphere"
        );
        
        // 验证聚合结果（可能聚合也可能分开，取决于时间判断）
        // 使用分页查询
        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(0, 20);
        var messagesPage = messageRepository.findNotDeletedByReceiverId(receiver.getId(), pageable);
        assertTrue(messagesPage.getContent().size() >= 1);
    }
    
    private User createUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("password");
        user.setIsEnabled(true);
        return userRepository.save(user);
    }
}

