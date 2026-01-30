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
 * 工作助手智能体单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class WorkAssistantAgentTest {
    
    @Mock
    private SkillExecutor skillExecutor;
    
    private WorkAssistantAgent agent;
    
    @BeforeEach
    void setUp() {
        agent = new WorkAssistantAgent(skillExecutor);
    }
    
    @Test
    void testAgentCreation() {
        assertNotNull(agent);
        assertEquals("workassistant", agent.getId());
        assertEquals("工作助手", agent.getName());
        assertTrue(agent.getCapabilities().contains("work-management"));
        assertTrue(agent.getCapabilities().contains("productivity"));
    }
    
    @Test
    void testCanHandleWorkPlanning() {
        // canHandle 检查技能名称（将下划线替换为空格）
        assertTrue(agent.canHandle("work planning"));
        assertTrue(agent.canHandle("我需要 work planning"));
    }
    
    @Test
    void testCanHandleTaskManagement() {
        // canHandle 检查技能名称（将下划线替换为空格）
        assertTrue(agent.canHandle("task management"));
        assertTrue(agent.canHandle("我需要 task management"));
    }
    
    @Test
    void testExecuteWorkPlanning() {
        // Mock 技能执行
        when(skillExecutor.execute(anyString(), anyMap(), any()))
            .thenReturn(createSuccessResult("工作计划已制定"));
        
        Map<String, Object> context = new HashMap<>();
        context.put("userId", 1L);
        
        AgentResult result = agent.execute("我需要制定工作计划", context);
        
        assertTrue(result.isSuccess());
        assertNotNull(result.getResult());
    }
    
    @Test
    void testExecuteTaskManagement() {
        // Mock 技能执行
        when(skillExecutor.execute(anyString(), anyMap(), any()))
            .thenReturn(createSuccessResult("任务管理完成"));
        
        Map<String, Object> context = new HashMap<>();
        context.put("userId", 1L);
        
        AgentResult result = agent.execute("帮我管理任务", context);
        
        assertTrue(result.isSuccess());
    }
    
    @Test
    void testCapabilities() {
        Set<String> capabilities = agent.getCapabilities();
        assertTrue(capabilities.contains("work-management"));
        assertTrue(capabilities.contains("productivity"));
        assertTrue(capabilities.contains("task-planning"));
        assertTrue(capabilities.contains("project-management"));
        assertTrue(capabilities.contains("life-assistant"));
    }
    
    private SkillExecutor.SkillExecutionResult createSuccessResult(String message) {
        return SkillExecutor.SkillExecutionResult.builder()
            .success(true)
            .result(message)
            .build();
    }
}
