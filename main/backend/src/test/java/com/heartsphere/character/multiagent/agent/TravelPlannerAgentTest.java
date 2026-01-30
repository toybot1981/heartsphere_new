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
 * 旅行规划师智能体单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class TravelPlannerAgentTest {
    
    @Mock
    private SkillExecutor skillExecutor;
    
    private TravelPlannerAgent agent;
    
    @BeforeEach
    void setUp() {
        agent = new TravelPlannerAgent(skillExecutor);
    }
    
    @Test
    void testAgentCreation() {
        assertNotNull(agent);
        assertEquals("travelplanner", agent.getId());
        assertEquals("旅行规划师", agent.getName());
        assertTrue(agent.getCapabilities().contains("travel"));
        assertTrue(agent.getCapabilities().contains("travel-planning"));
    }
    
    @Test
    void testCanHandleItineraryPlanning() {
        // canHandle 检查技能名称（将下划线替换为空格）
        assertTrue(agent.canHandle("itinerary planning"));
        assertTrue(agent.canHandle("我需要 itinerary planning"));
    }
    
    @Test
    void testExecuteItineraryPlanning() {
        // Mock 技能执行
        when(skillExecutor.execute(anyString(), anyMap(), any()))
            .thenReturn(createSuccessResult("行程规划完成"));
        
        Map<String, Object> context = new HashMap<>();
        context.put("userId", 1L);
        
        AgentResult result = agent.execute("我需要规划旅行行程", context);
        
        assertTrue(result.isSuccess());
    }
    
    @Test
    void testCapabilities() {
        Set<String> capabilities = agent.getCapabilities();
        assertTrue(capabilities.contains("travel"));
        assertTrue(capabilities.contains("travel-planning"));
        assertTrue(capabilities.contains("itinerary"));
        assertTrue(capabilities.contains("tourism"));
        assertTrue(capabilities.contains("life-assistant"));
    }
    
    private SkillExecutor.SkillExecutionResult createSuccessResult(String message) {
        return SkillExecutor.SkillExecutionResult.builder()
            .success(true)
            .result(message)
            .build();
    }
}
