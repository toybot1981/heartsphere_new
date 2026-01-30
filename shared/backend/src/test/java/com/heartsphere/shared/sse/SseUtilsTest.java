package com.heartsphere.shared.sse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SseUtils 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class SseUtilsTest {

    private SseEmitter emitter;

    @BeforeEach
    void setUp() {
        emitter = new SseEmitter(300000L);
    }

    @Test
    void testSafeSendWithNullEmitter() {
        // 测试向null emitter发送（应该安全处理）
        AtomicBoolean called = new AtomicBoolean(false);
        
        SseUtils.safeSend(null, em -> {
            called.set(true);
        });
        
        // 应该不会调用action
        assertFalse(called.get());
    }

    @Test
    void testSafeSendWithValidEmitter() {
        // 测试向有效emitter发送
        AtomicBoolean called = new AtomicBoolean(false);
        
        SseUtils.safeSend(emitter, em -> {
            try {
                em.send(SseEmitter.event().data("test"));
                called.set(true);
            } catch (Exception e) {
                // 异常会被safeSend捕获，这里不应该抛出
                fail("Should not throw exception: " + e.getMessage());
            }
        });
        
        assertTrue(called.get());
    }

    @Test
    void testSafeSendWithCompletedEmitter() {
        // 测试向已完成的emitter发送（应该安全处理）
        try {
            emitter.complete();
        } catch (Exception e) {
            // 忽略
        }
        
        // 再次发送应该安全处理
        SseUtils.safeSend(emitter, em -> {
            try {
                em.send(SseEmitter.event().data("test"));
            } catch (IOException e) {
                // 预期会抛出异常，但safeSend应该捕获
            }
        });
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendEvent() {
        // 测试发送标准格式事件
        Map<String, String> data = new HashMap<>();
        data.put("message", "test");
        
        SseUtils.sendEvent(emitter, "message", data);
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendMessage() {
        // 测试发送消息事件
        SseUtils.sendMessage(emitter, "test message");
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendComplete() {
        // 测试发送完成事件
        SseUtils.sendComplete(emitter, "done");
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendError() {
        // 测试发送错误事件
        SseUtils.sendError(emitter, "error message");
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendProgress() {
        // 测试发送进度事件
        Map<String, Integer> progress = new HashMap<>();
        progress.put("percent", 50);
        
        SseUtils.sendProgress(emitter, progress);
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendEventWithNullEmitter() {
        // 测试向null emitter发送事件（应该安全处理）
        SseUtils.sendEvent(null, "message", "test");
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendEventWithComplexData() {
        // 测试发送复杂数据对象
        Map<String, Object> complexData = new HashMap<>();
        complexData.put("string", "value");
        complexData.put("number", 123);
        complexData.put("nested", new HashMap<String, String>() {{
            put("key", "value");
        }});
        
        SseUtils.sendEvent(emitter, "message", complexData);
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendEventWithNullData() {
        // 测试发送null数据
        SseUtils.sendEvent(emitter, "message", null);
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendEventWithEmptyString() {
        // 测试发送空字符串
        SseUtils.sendEvent(emitter, "message", "");
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testSendEventWithSpecialCharacters() {
        // 测试发送包含特殊字符的数据
        String dataWithSpecialChars = "Test with \"quotes\" and\nnewlines\tand\ttabs";
        
        SseUtils.sendEvent(emitter, "message", dataWithSpecialChars);
        
        // 应该不会抛出异常
        assertTrue(true);
    }
}
