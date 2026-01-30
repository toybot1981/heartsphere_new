package com.heartsphere.shared.sse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SseEventBuilder 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class SseEventBuilderTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testCreate() {
        // 测试创建构建器
        SseEventBuilder builder = SseEventBuilder.create();
        
        assertNotNull(builder);
    }

    @Test
    void testType() {
        // 测试设置事件类型
        SseEventBuilder builder = SseEventBuilder.create()
                .type("test-event");
        
        assertNotNull(builder);
    }

    @Test
    void testData() {
        // 测试设置事件数据
        Map<String, String> data = new HashMap<>();
        data.put("key", "value");
        
        SseEventBuilder builder = SseEventBuilder.create()
                .data(data);
        
        assertNotNull(builder);
    }

    @Test
    void testId() {
        // 测试设置事件ID
        SseEventBuilder builder = SseEventBuilder.create()
                .id("event-123");
        
        assertNotNull(builder);
    }

    @Test
    void testTimestamp() {
        // 测试设置时间戳
        long timestamp = System.currentTimeMillis();
        SseEventBuilder builder = SseEventBuilder.create()
                .timestamp(timestamp);
        
        assertNotNull(builder);
    }

    @Test
    void testBuildJson() throws Exception {
        // 测试构建JSON
        Map<String, String> data = new HashMap<>();
        data.put("message", "test");
        
        String json = SseEventBuilder.create()
                .type("message")
                .data(data)
                .id("event-123")
                .buildJson();
        
        assertNotNull(json);
        assertTrue(json.contains("\"type\":\"message\""));
        assertTrue(json.contains("\"data\""));
        assertTrue(json.contains("\"id\":\"event-123\""));
        assertTrue(json.contains("\"timestamp\""));
        
        // 验证JSON格式正确
        JsonNode node = objectMapper.readTree(json);
        assertEquals("message", node.get("type").asText());
        assertEquals("event-123", node.get("id").asText());
        assertTrue(node.has("timestamp"));
        assertTrue(node.has("data"));
    }

    @Test
    void testBuildJsonWithDefaultType() throws Exception {
        // 测试默认事件类型
        String json = SseEventBuilder.create()
                .data("test data")
                .buildJson();
        
        assertNotNull(json);
        JsonNode node = objectMapper.readTree(json);
        assertEquals("message", node.get("type").asText()); // 默认类型
    }

    @Test
    void testBuildJsonWithoutId() throws Exception {
        // 测试不设置ID的情况
        String json = SseEventBuilder.create()
                .type("message")
                .data("test")
                .buildJson();
        
        assertNotNull(json);
        JsonNode node = objectMapper.readTree(json);
        assertFalse(node.has("id")); // 没有ID字段
    }

    @Test
    void testBuild() {
        // 测试构建SseEmitter.SseEventBuilder
        SseEmitter.SseEventBuilder event = SseEventBuilder.create()
                .type("message")
                .data("test")
                .id("event-123")
                .build();
        
        assertNotNull(event);
    }

    @Test
    void testMessage() {
        // 测试快速创建消息事件
        SseEventBuilder builder = SseEventBuilder.message("test message");
        
        assertNotNull(builder);
        String json = builder.buildJson();
        assertTrue(json.contains("\"type\":\"message\""));
    }

    @Test
    void testComplete() {
        // 测试快速创建完成事件
        SseEventBuilder builder = SseEventBuilder.complete("done");
        
        assertNotNull(builder);
        String json = builder.buildJson();
        assertTrue(json.contains("\"type\":\"complete\""));
    }

    @Test
    void testError() {
        // 测试快速创建错误事件
        SseEventBuilder builder = SseEventBuilder.error("error message");
        
        assertNotNull(builder);
        String json = builder.buildJson();
        assertTrue(json.contains("\"type\":\"error\""));
    }

    @Test
    void testProgress() {
        // 测试快速创建进度事件
        Map<String, Integer> progress = new HashMap<>();
        progress.put("percent", 50);
        
        SseEventBuilder builder = SseEventBuilder.progress(progress);
        
        assertNotNull(builder);
        String json = builder.buildJson();
        assertTrue(json.contains("\"type\":\"progress\""));
    }

    @Test
    void testBuildJsonWithComplexData() throws Exception {
        // 测试复杂数据对象
        Map<String, Object> complexData = new HashMap<>();
        complexData.put("string", "value");
        complexData.put("number", 123);
        complexData.put("boolean", true);
        complexData.put("array", new String[]{"a", "b", "c"});
        
        String json = SseEventBuilder.create()
                .type("message")
                .data(complexData)
                .buildJson();
        
        assertNotNull(json);
        JsonNode node = objectMapper.readTree(json);
        assertTrue(node.has("data"));
        JsonNode dataNode = node.get("data");
        assertEquals("value", dataNode.get("string").asText());
        assertEquals(123, dataNode.get("number").asInt());
        assertTrue(dataNode.get("boolean").asBoolean());
    }

    @Test
    void testBuildJsonErrorHandling() {
        // 测试JSON构建错误处理（使用无法序列化的对象）
        Object invalidData = new Object() {
            @Override
            public String toString() {
                throw new RuntimeException("Cannot serialize");
            }
        };
        
        // 应该返回错误格式的JSON而不是抛出异常
        String json = SseEventBuilder.create()
                .type("error")
                .data(invalidData)
                .buildJson();
        
        assertNotNull(json);
        assertTrue(json.contains("\"type\":\"error\""));
    }
}
