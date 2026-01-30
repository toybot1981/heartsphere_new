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
 * 财务顾问智能体单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class FinanceAdvisorAgentTest {
    
    @Mock
    private SkillExecutor skillExecutor;
    
    private FinanceAdvisorAgent agent;
    
    @BeforeEach
    void setUp() {
        agent = new FinanceAdvisorAgent(skillExecutor);
    }
    
    @Test
    void testAgentCreation() {
        assertNotNull(agent);
        assertEquals("financeadvisor", agent.getId());
        assertEquals("财务顾问", agent.getName());
        assertTrue(agent.getCapabilities().contains("finance"));
        assertTrue(agent.getCapabilities().contains("financial-planning"));
    }
    
    @Test
    void testCanHandleBudgetPlanning() {
        // canHandle 检查技能名称（将下划线替换为空格）
        assertTrue(agent.canHandle("budget planning"));
        assertTrue(agent.canHandle("我需要 budget planning"));
    }
    
    @Test
    void testCanHandleInvestment() {
        // canHandle 检查技能名称（将下划线替换为空格）
        assertTrue(agent.canHandle("investment advice"));
        assertTrue(agent.canHandle("我需要 investment advice"));
    }
    
    @Test
    void testExecuteBudgetPlanning() {
        // Mock 技能执行
        when(skillExecutor.execute(anyString(), anyMap(), any()))
            .thenReturn(createSuccessResult("预算规划完成"));
        
        Map<String, Object> context = new HashMap<>();
        context.put("userId", 1L);
        
        AgentResult result = agent.execute("我需要制定预算", context);
        
        assertTrue(result.isSuccess());
    }
    
    @Test
    void testCapabilities() {
        Set<String> capabilities = agent.getCapabilities();
        assertTrue(capabilities.contains("finance"));
        assertTrue(capabilities.contains("financial-planning"));
        assertTrue(capabilities.contains("budgeting"));
        assertTrue(capabilities.contains("investment"));
        assertTrue(capabilities.contains("life-assistant"));
    }
    
    private SkillExecutor.SkillExecutionResult createSuccessResult(String message) {
        return SkillExecutor.SkillExecutionResult.builder()
            .success(true)
            .result(message)
            .build();
    }
}
