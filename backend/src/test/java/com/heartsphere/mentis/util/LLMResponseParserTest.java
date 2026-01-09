package com.heartsphere.mentis.util;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * LLMResponseParser 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class LLMResponseParserTest {
    
    private LLMResponseParser parser;
    
    @BeforeEach
    void setUp() {
        parser = new LLMResponseParser();
    }
    
    @Test
    void testExtractJsonFromMarkdownCodeBlock() {
        // Given
        String response = """
            ```json
            {
              "taskType": "COMMAND",
              "intent": "执行命令",
              "confidence": 0.9
            }
            ```
            """;
        
        // When
        String json = parser.extractJson(response);
        
        // Then
        assertNotNull(json);
        assertTrue(json.contains("taskType"));
        assertTrue(json.contains("COMMAND"));
    }
    
    @Test
    void testExtractJsonFromPureJson() {
        // Given
        String response = """
            {
              "taskType": "SCRIPT",
              "intent": "执行脚本"
            }
            """;
        
        // When
        String json = parser.extractJson(response);
        
        // Then
        assertNotNull(json);
        assertTrue(json.contains("taskType"));
    }
    
    @Test
    void testExtractJsonFromTextWithJson() {
        // Given
        String response = """
            根据分析，用户意图如下：
            {
              "taskType": "COMPUTER_USE",
              "intent": "GUI操作"
            }
            以上是识别结果。
            """;
        
        // When
        String json = parser.extractJson(response);
        
        // Then
        assertNotNull(json);
        assertTrue(json.contains("taskType"));
    }
    
    @Test
    void testExtractJsonInvalidInput() {
        // Given
        String response = "这不是JSON内容";
        
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            parser.extractJson(response);
        });
    }
    
    @Test
    void testParseJson() {
        // Given
        String json = """
            {
              "taskType": "COMMAND",
              "intent": "执行命令",
              "confidence": 0.9
            }
            """;
        
        // When
        JsonNode node = parser.parseJson(json);
        
        // Then
        assertNotNull(node);
        assertEquals("COMMAND", node.get("taskType").asText());
        assertEquals("执行命令", node.get("intent").asText());
        assertEquals(0.9, node.get("confidence").asDouble());
    }
    
    @Test
    void testExtractAndParseJson() {
        // Given
        String response = """
            ```json
            {
              "taskType": "SCRIPT",
              "intent": "执行脚本"
            }
            ```
            """;
        
        // When
        JsonNode node = parser.extractAndParseJson(response);
        
        // Then
        assertNotNull(node);
        assertEquals("SCRIPT", node.get("taskType").asText());
    }
    
    @Test
    void testExtractJsonSafely() {
        // Given
        String invalidResponse = "这不是JSON";
        
        // When
        String result = parser.extractJsonSafely(invalidResponse);
        
        // Then
        assertNull(result);
    }
    
    @Test
    void testIsValidJson() {
        // Given
        String validJson = "{\"key\": \"value\"}";
        String invalidJson = "这不是JSON";
        
        // When & Then
        assertTrue(parser.isValidJson(validJson));
        assertFalse(parser.isValidJson(invalidJson));
    }
    
    @Test
    void testCleanJson() {
        // Given
        String jsonWithMarkdown = """
            ```json
            {"key": "value"}
            ```
            """;
        
        // When
        String cleaned = parser.cleanJson(jsonWithMarkdown);
        
        // Then
        assertNotNull(cleaned);
        assertTrue(cleaned.contains("key"));
        assertFalse(cleaned.contains("```"));
    }
}
