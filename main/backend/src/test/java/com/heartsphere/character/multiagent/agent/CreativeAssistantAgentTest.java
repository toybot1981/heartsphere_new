package com.heartsphere.character.multiagent.agent;

import com.heartsphere.multiagent.core.Agent.AgentResult;
import com.heartsphere.skill.service.SkillExecutor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * 创意助手智能体单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class CreativeAssistantAgentTest {
    
    @Mock
    private SkillExecutor skillExecutor;
    
    private CreativeAssistantAgent agent;
    
    @BeforeEach
    void setUp() {
        agent = new CreativeAssistantAgent(skillExecutor);
    }
    
    @Test
    void testAgentCreation() {
        assertNotNull(agent);
        assertEquals("creativeassistant", agent.getId());
        assertEquals("创意助手", agent.getName());
        assertTrue(agent.getCapabilities().contains("creative"));
        assertTrue(agent.getCapabilities().contains("creativity"));
    }
    
    @Test
    void testCanHandleIdeaGeneration() {
        // canHandle 检查技能名称（将下划线替换为空格）
        assertTrue(agent.canHandle("idea generation"));
        assertTrue(agent.canHandle("我需要 idea generation"));
    }
    
    @Test
    void testExecuteIdeaGeneration() {
        // Mock 技能执行
        when(skillExecutor.execute(anyString(), anyMap(), any()))
            .thenReturn(createSuccessResult("创意想法已生成"));
        
        Map<String, Object> context = new HashMap<>();
        context.put("userId", 1L);
        
        AgentResult result = agent.execute("我需要创意想法", context);
        
        assertTrue(result.isSuccess());
    }
    
    @Test
    void testCapabilities() {
        Set<String> capabilities = agent.getCapabilities();
        assertTrue(capabilities.contains("creative"));
        assertTrue(capabilities.contains("creativity"));
        assertTrue(capabilities.contains("idea-generation"));
        assertTrue(capabilities.contains("artistic"));
        assertTrue(capabilities.contains("life-assistant"));
    }
    
    private SkillExecutor.SkillExecutionResult createSuccessResult(String message) {
        return SkillExecutor.SkillExecutionResult.builder()
            .success(true)
            .result(message)
            .build();
    }
}
