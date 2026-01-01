package com.heartsphere.mailbox.integration;

import com.heartsphere.entity.User;
import com.heartsphere.mailbox.dto.CreateConversationRequest;
import com.heartsphere.mailbox.dto.SendMessageRequest;
import com.heartsphere.mailbox.entity.Conversation;
import com.heartsphere.mailbox.entity.ConversationMessage;
import com.heartsphere.mailbox.repository.ConversationMessageRepository;
import com.heartsphere.mailbox.repository.ConversationRepository;
import com.heartsphere.mailbox.service.ConversationService;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 对话功能集成测试
 */
@SpringBootTest
@Transactional
public class ConversationIntegrationTest {
    
    @Autowired
    private ConversationService conversationService;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ConversationMessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User user1;
    private User user2;
    
    @BeforeEach
    void setUp() {
        conversationRepository.deleteAll();
        messageRepository.deleteAll();
        
        user1 = createTestUser("user1", "user1@test.com");
        user2 = createTestUser("user2", "user2@test.com");
    }
    
    @Test
    void testCreateConversation() {
        CreateConversationRequest request = new CreateConversationRequest();
        request.setParticipant2Id(user2.getId());
        request.setInitialMessage("你好，这是一条初始消息");
        
        Conversation conversation = conversationService.createConversation(user1.getId(), request);
        
        assertNotNull(conversation);
        assertNotNull(conversation.getId());
        assertEquals(user1.getId(), conversation.getParticipant1Id());
        assertEquals(user2.getId(), conversation.getParticipant2Id());
    }
    
    @Test
    void testSendMessage() {
        // 创建对话
        CreateConversationRequest createRequest = new CreateConversationRequest();
        createRequest.setParticipant2Id(user2.getId());
        Conversation conversation = conversationService.createConversation(user1.getId(), createRequest);
        
        // 发送消息
        SendMessageRequest sendRequest = new SendMessageRequest();
        sendRequest.setContent("这是一条测试消息");
        sendRequest.setMessageType("text");
        
        ConversationMessage message = conversationService.sendMessage(
            conversation.getId(), user1.getId(), sendRequest);
        
        assertNotNull(message);
        assertNotNull(message.getId());
        assertEquals(conversation.getId(), message.getConversationId());
        assertEquals(user1.getId(), message.getSenderId());
        assertEquals("这是一条测试消息", message.getContent());
        
        // 验证对话的最后消息已更新
        Conversation updated = conversationService.getConversationById(conversation.getId(), user1.getId());
        assertEquals(message.getId(), updated.getLastMessageId());
        assertNotNull(updated.getLastMessageAt());
        
        // 验证接收者未读数量增加
        assertEquals(1, updated.getUnreadCount2());
    }
    
    @Test
    void testMarkConversationAsRead() {
        // 创建对话并发送消息
        CreateConversationRequest createRequest = new CreateConversationRequest();
        createRequest.setParticipant2Id(user2.getId());
        Conversation conversation = conversationService.createConversation(user1.getId(), createRequest);
        
        SendMessageRequest sendRequest = new SendMessageRequest();
        sendRequest.setContent("测试消息");
        sendRequest.setMessageType("text");
        conversationService.sendMessage(conversation.getId(), user1.getId(), sendRequest);
        
        // 标记为已读
        Conversation read = conversationService.markAsRead(conversation.getId(), user2.getId());
        assertEquals(0, read.getUnreadCount2());
    }
    
    @Test
    void testGetConversationMessages() {
        // 创建对话并发送多条消息
        CreateConversationRequest createRequest = new CreateConversationRequest();
        createRequest.setParticipant2Id(user2.getId());
        Conversation conversation = conversationService.createConversation(user1.getId(), createRequest);
        
        for (int i = 0; i < 3; i++) {
            SendMessageRequest sendRequest = new SendMessageRequest();
            sendRequest.setContent("消息 " + i);
            sendRequest.setMessageType("text");
            conversationService.sendMessage(conversation.getId(), user1.getId(), sendRequest);
        }
        
        // 获取消息列表
        Page<ConversationMessage> messages = conversationService.getMessages(
            conversation.getId(), user1.getId(), 0, 20, null);
        
        assertEquals(3, messages.getContent().size());
    }
    
    private User createTestUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("password");
        user.setIsEnabled(true);
        return userRepository.save(user);
    }
}


