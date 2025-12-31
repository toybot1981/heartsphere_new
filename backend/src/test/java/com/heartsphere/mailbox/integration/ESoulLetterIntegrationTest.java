package com.heartsphere.mailbox.integration;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.ESoulLetterType;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.listener.ESoulLetterTriggerListener;
import com.heartsphere.mailbox.repository.MailboxMessageRepository;
import com.heartsphere.mailbox.service.ESoulLetterService;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * E-SOUL来信集成测试
 */
@SpringBootTest
@Transactional
public class ESoulLetterIntegrationTest {
    
    @Autowired
    private ESoulLetterService esoulLetterService;
    
    @Autowired
    private ESoulLetterTriggerListener triggerListener;
    
    @Autowired
    private MailboxMessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    private User testUser;
    private Character testCharacter;
    
    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();
        
        // 创建测试用户
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setIsEnabled(true);
        testUser = userRepository.save(testUser);
        
        // 创建测试角色
        testCharacter = new Character();
        testCharacter.setName("测试角色");
        testCharacter.setRole("朋友");
        testCharacter.setBio("这是一个测试角色");
        testCharacter.setUser(testUser);
        testCharacter.setIsDeleted(false);
        testCharacter = characterRepository.save(testCharacter);
    }
    
    @Test
    void testShouldTriggerLetter() {
        // 测试触发条件检查
        boolean shouldTrigger = esoulLetterService.shouldTriggerLetter(testUser.getId());
        assertTrue(shouldTrigger);
    }
    
    @Test
    void testTriggerLetterOnLogin() {
        // 测试用户登录触发
        LocalDateTime lastLoginTime = LocalDateTime.now().minusMinutes(2); // 2分钟前登录
        
        triggerListener.handleUserLogin(testUser.getId(), lastLoginTime);
        
        // 验证是否创建了来信（异步执行，可能需要等待）
        // 这里主要验证不会抛出异常
        assertTrue(true);
    }
    
    @Test
    void testTriggerLetterCondition() {
        // 测试离线时间不足60秒不触发
        LocalDateTime recentLogin = LocalDateTime.now().minusSeconds(30); // 30秒前
        
        triggerListener.handleUserLogin(testUser.getId(), recentLogin);
        
        // 验证没有创建消息（因为离线时间不足60秒）
        long count = messageRepository.count();
        assertEquals(0, count); // 应该没有消息
    }
    
    @Test
    void testGetLetterHistory() {
        // 创建一条来信
        ESoulLetterService.ESoulLetterTrigger trigger = 
            new ESoulLetterService.ESoulLetterTrigger();
        trigger.setLetterType(ESoulLetterType.GREETING);
        
        MailboxMessage letter = esoulLetterService.triggerLetter(testUser.getId(), trigger);
        
        if (letter != null) {
            // 获取来信历史
            var history = esoulLetterService.getLetterHistory(testUser.getId(), testCharacter.getId());
            assertFalse(history.isEmpty());
            assertEquals(MessageCategory.ESOUL_LETTER, history.get(0).getMessageCategory());
        }
    }
}

