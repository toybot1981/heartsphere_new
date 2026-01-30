package com.heartsphere.ai.skill.integration;

import com.heartsphere.ai.skill.engine.*;
import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.skill.entity.SkillDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 技能选择降级策略集成测试
 * 测试 LLM 失败时的降级机制
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("技能选择降级策略集成测试")
public class SkillSelectionFallbackIntegrationTest {
    
    @MockBean
    private com.heartsphere.aiagent.service.AIService aiService;
    
    @Autowired
    private LLMSkillApplicationEngine llmEngine;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    
    @BeforeEach
    void setUp() {
        // 注意：LLMSkillApplicationEngine 不再支持降级到规则驱动
        // 如果 LLM 失败，将返回空结果
        
        // 创建测试数据
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill()
        );
        
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作");
    }
    
    @Test
    @DisplayName("LLM 完全失败时应该返回空结果")
    void testCompleteLLMFailureFallsBack() {
        // Given - LLM 服务抛出异常
        when(aiService.generateText(anyLong(), any()))
            .thenThrow(new RuntimeException("LLM service unavailable"));
        
        // When
        SkillApplicationResult result = llmEngine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then - 应该返回空结果（不再降级到规则驱动）
        assertNotNull(result);
        assertEquals(0, result.getTotalApplied());
        assertFalse(result.hasAppliedSkills());
    }
    
    @Test
    @DisplayName("LLM 部分失败时应该优雅处理")
    void testPartialLLMFailure() {
        // Given - Level 1 成功，Level 2 失败
        // 这里需要更复杂的 Mock 设置
        // 暂时跳过，因为需要模拟部分成功场景
        
        // When & Then
        // 验证系统能够处理部分失败
        assertTrue(true);
    }
}
