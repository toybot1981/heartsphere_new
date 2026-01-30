package com.heartsphere.multiagent.protocol.a2a;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * A2A Protocol 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("A2A Protocol 单元测试")
class AgentToAgentProtocolTest {
    
    private A2AMessage testMessage;
    
    @BeforeEach
    void setUp() {
        testMessage = new A2AMessage();
        testMessage.setMessageId("msg-1");
        testMessage.setFromAgentId("agent-1");
        testMessage.setToAgentId("agent-2");
        testMessage.setType(A2AMessage.MessageType.REQUEST);
        testMessage.setContent("Test message content");
        testMessage.setTimestamp(LocalDateTime.now());
    }
    
    @Test
    @DisplayName("测试 A2A 消息创建")
    void testCreateMessage() {
        assertNotNull(testMessage);
        assertEquals("msg-1", testMessage.getMessageId());
        assertEquals("agent-1", testMessage.getFromAgentId());
        assertEquals("agent-2", testMessage.getToAgentId());
        assertEquals(A2AMessage.MessageType.REQUEST, testMessage.getType());
        assertEquals("Test message content", testMessage.getContent());
    }
    
    @Test
    @DisplayName("测试消息类型")
    void testMessageTypes() {
        // 测试请求消息
        testMessage.setType(A2AMessage.MessageType.REQUEST);
        assertEquals(A2AMessage.MessageType.REQUEST, testMessage.getType());
        
        // 测试响应消息
        testMessage.setType(A2AMessage.MessageType.RESPONSE);
        assertEquals(A2AMessage.MessageType.RESPONSE, testMessage.getType());
        
        // 测试通知消息
        testMessage.setType(A2AMessage.MessageType.NOTIFICATION);
        assertEquals(A2AMessage.MessageType.NOTIFICATION, testMessage.getType());
        
        // 测试错误消息
        testMessage.setType(A2AMessage.MessageType.ERROR);
        assertEquals(A2AMessage.MessageType.ERROR, testMessage.getType());
    }
    
    @Test
    @DisplayName("测试消息负载")
    void testMessagePayload() {
        Map<String, Object> payload = Map.of(
            "key1", "value1",
            "key2", 123
        );
        testMessage.setPayload(payload);
        
        assertNotNull(testMessage.getPayload());
        assertEquals("value1", testMessage.getPayload().get("key1"));
        assertEquals(123, testMessage.getPayload().get("key2"));
    }
    
    @Test
    @DisplayName("测试消息时间戳")
    void testMessageTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        testMessage.setTimestamp(now);
        
        assertNotNull(testMessage.getTimestamp());
        assertEquals(now, testMessage.getTimestamp());
    }
    
    @Test
    @DisplayName("测试消息完整性")
    void testMessageIntegrity() {
        // 验证消息包含所有必需字段
        assertNotNull(testMessage.getMessageId());
        assertNotNull(testMessage.getFromAgentId());
        assertNotNull(testMessage.getToAgentId());
        assertNotNull(testMessage.getType());
        assertNotNull(testMessage.getContent());
        assertNotNull(testMessage.getTimestamp());
    }
}
