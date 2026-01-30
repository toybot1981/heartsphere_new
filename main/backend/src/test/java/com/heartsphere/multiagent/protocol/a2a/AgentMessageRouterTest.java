package com.heartsphere.multiagent.protocol.a2a;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AgentMessageRouter 测试
 */
class AgentMessageRouterTest {

    private AgentMessageRouter router;

    @BeforeEach
    void setUp() {
        router = new AgentMessageRouter();
    }

    @Test
    void testSendMessage() {
        boolean[] messageReceived = {false};
        
        router.registerHandler("agent-1", (message) -> {
            messageReceived[0] = true;
            return A2AMessage.createResponse(
                message.getMessageId(),
                "agent-1",
                message.getFromAgentId(),
                "Response",
                null
            );
        });
        
        A2AMessage message = A2AMessage.createRequest(
            "agent-0",
            "agent-1",
            "Test message",
            null
        );
        
        boolean sent = router.send(message);
        assertTrue(sent);
        assertTrue(messageReceived[0]);
    }

    @Test
    void testSendAndWait() throws Exception {
        router.registerHandler("agent-1", (message) -> {
            return A2AMessage.createResponse(
                message.getMessageId(),
                "agent-1",
                message.getFromAgentId(),
                "Response message",
                null
            );
        });
        
        A2AMessage request = A2AMessage.createRequest(
            "agent-0",
            "agent-1",
            "Test request",
            null
        );
        
        CompletableFuture<A2AMessage> future = router.sendAndWait(request);
        A2AMessage response = future.get(5, TimeUnit.SECONDS);
        
        assertNotNull(response);
        assertEquals(A2AMessage.MessageType.RESPONSE, response.getType());
        assertEquals("Response message", response.getContent());
    }

    @Test
    void testBroadcastMessage() {
        int[] messageCount = {0};
        
        router.registerHandler("agent-1", (message) -> {
            messageCount[0]++;
            return null;
        });
        
        router.registerHandler("agent-2", (message) -> {
            messageCount[0]++;
            return null;
        });
        
        A2AMessage broadcast = A2AMessage.createNotification(
            "agent-0",
            null, // null 表示广播
            "Broadcast message",
            null
        );
        
        router.send(broadcast);
        
        assertEquals(2, messageCount[0]);
    }

    @Test
    void testUnregisterHandler() {
        boolean[] messageReceived = {false};
        
        router.registerHandler("agent-1", (message) -> {
            messageReceived[0] = true;
            return null;
        });
        
        router.unregisterHandler("agent-1");
        
        A2AMessage message = A2AMessage.createRequest(
            "agent-0",
            "agent-1",
            "Test",
            null
        );
        
        boolean sent = router.send(message);
        assertFalse(sent);
        assertFalse(messageReceived[0]);
    }
}
