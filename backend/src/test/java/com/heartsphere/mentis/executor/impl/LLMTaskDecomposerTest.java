package com.heartsphere.mentis.executor.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.mentis.executor.TaskDecomposer;
import com.heartsphere.mentis.util.LLMResponseParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * LLMTaskDecomposer 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class LLMTaskDecomposerTest {
    
    @Mock
    private AIService aiService;
    
    @Mock
    private LLMResponseParser responseParser;
    
    @InjectMocks
    private LLMTaskDecomposer taskDecomposer;
    
    private String testSessionId;
    
    @BeforeEach
    void setUp() {
        testSessionId = "mentis_test_session_123";
    }
    
    @Test
    void testDecompose() {
        // Given
        String userRequest = "帮我创建一个文件并写入内容";
        String jsonResponse = """
            {
              "steps": [
                {
                  "stepId": "step1",
                  "taskType": "COMMAND",
                  "description": "创建文件",
                  "command": "touch test.txt",
                  "order": 1,
                  "dependencies": []
                },
                {
                  "stepId": "step2",
                  "taskType": "COMMAND",
                  "description": "写入内容",
                  "command": "echo 'content' > test.txt",
                  "order": 2,
                  "dependencies": ["step1"]
                }
              ]
            }
            """;
        
        TextGenerationResponse llmResponse = new TextGenerationResponse();
        llmResponse.setContent(jsonResponse);
        
        JsonNode jsonNode = mock(JsonNode.class);
        when(jsonNode.has("steps")).thenReturn(true);
        when(jsonNode.get("steps")).thenReturn(mock(JsonNode.class));
        when(jsonNode.get("steps").isArray()).thenReturn(true);
        // Mock steps array iteration
        when(responseParser.extractAndParseJsonSafely(jsonResponse)).thenReturn(jsonNode);
        when(aiService.generateText(eq(1L), any(TextGenerationRequest.class))).thenReturn(llmResponse);
        
        // When
        java.util.List<TaskDecomposer.TaskStep> steps = taskDecomposer.decompose(userRequest, testSessionId);
        
        // Then
        assertNotNull(steps);
        verify(aiService, times(1)).generateText(eq(1L), any(TextGenerationRequest.class));
    }
    
    @Test
    void testDecomposeWithLLMError() {
        // Given
        String userRequest = "执行任务";
        when(aiService.generateText(eq(1L), any(TextGenerationRequest.class)))
                .thenThrow(new RuntimeException("LLM调用失败"));
        
        // When
        java.util.List<TaskDecomposer.TaskStep> steps = taskDecomposer.decompose(userRequest, testSessionId);
        
        // Then
        assertNotNull(steps);
        assertFalse(steps.isEmpty());
        // 应该返回默认的简单任务步骤
        assertEquals(1, steps.size());
    }
    
    @Test
    void testIdentifyTaskType_Command() {
        // When
        String taskType = taskDecomposer.identifyTaskType("执行 ls 命令");
        
        // Then
        assertEquals("COMMAND", taskType);
    }
    
    @Test
    void testIdentifyTaskType_Script() {
        // When
        String taskType = taskDecomposer.identifyTaskType("运行 Python 脚本");
        
        // Then
        assertEquals("SCRIPT", taskType);
    }
    
    @Test
    void testIdentifyTaskType_ComputerUse() {
        // When
        String taskType = taskDecomposer.identifyTaskType("GUI自动化操作");
        
        // Then
        assertEquals("COMPUTER_USE", taskType);
    }
    
    @Test
    void testIdentifyTaskType_Default() {
        // When
        String taskType = taskDecomposer.identifyTaskType("普通请求");
        
        // Then
        assertEquals("COMMAND", taskType); // 默认类型
    }
}
