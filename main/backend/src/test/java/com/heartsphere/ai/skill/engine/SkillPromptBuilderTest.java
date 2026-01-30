package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * SkillPromptBuilder 单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能提示词构建器测试")
public class SkillPromptBuilderTest {
    
    @Mock
    private SkillSelectionConfig config;
    
    @Mock
    private SkillSelectionConfig.LLMDrivenConfig llmDrivenConfig;
    
    @InjectMocks
    private SkillPromptBuilderImpl promptBuilder;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    
    @BeforeEach
    void setUp() {
        // 创建测试数据
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill()
        );
        
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作");
    }
    
    @Test
    @DisplayName("应该正确构建 Level 1 提示词")
    void testBuildLevel1Prompt() {
        // Given
        when(config.getLlmDriven()).thenReturn(llmDrivenConfig);
        when(llmDrivenConfig.getLevel1Candidates()).thenReturn(10);
        
        // When
        String prompt = promptBuilder.buildLevel1Prompt(testSkills, testContext);
        
        // Then
        assertNotNull(prompt);
        assertTrue(prompt.contains("技能选择助手"));
        assertTrue(prompt.contains("用户消息"));
        assertTrue(prompt.contains("帮我安排今天的工作"));
        assertTrue(prompt.contains("工作助手"));
        assertTrue(prompt.contains("生活助手"));
        assertTrue(prompt.contains("selectedSkills"));
        assertTrue(prompt.contains("relevanceScore"));
    }
    
    @Test
    @DisplayName("应该正确构建 Level 2 提示词")
    void testBuildLevel2Prompt() {
        // Given
        SkillDefinition skill = SkillTestUtils.createWorkAssistantSkill();
        List<SkillInstruction> instructions = Arrays.asList(
            SkillTestUtils.createLevel2Instruction("work_assistant", "这是一个工作助手技能")
        );
        
        // When
        String prompt = promptBuilder.buildLevel2Prompt(skill, instructions, testContext);
        
        // Then
        assertNotNull(prompt);
        assertTrue(prompt.contains("深度评估"));
        assertTrue(prompt.contains("work_assistant"));
        assertTrue(prompt.contains("工作助手"));
        assertTrue(prompt.contains("这是一个工作助手技能"));
        assertTrue(prompt.contains("evaluatedSkills"));
        assertTrue(prompt.contains("shouldActivate"));
    }
    
    @Test
    @DisplayName("应该正确构建 Level 3 提示词")
    void testBuildLevel3Prompt() {
        // Given
        SkillDefinition skill = SkillTestUtils.createWorkAssistantSkill();
        List<SkillResource> resources = Arrays.asList(
            SkillTestUtils.createLevel3Resource("work_assistant", "template", "工作模板", "模板内容")
        );
        
        // When
        String prompt = promptBuilder.buildLevel3Prompt(skill, resources, testContext);
        
        // Then
        assertNotNull(prompt);
        assertTrue(prompt.contains("最终决策"));
        assertTrue(prompt.contains("work_assistant"));
        assertTrue(prompt.contains("工作助手"));
        assertTrue(prompt.contains("工作模板"));
        assertTrue(prompt.contains("finalSkills"));
        assertTrue(prompt.contains("priority"));
    }
    
    @Test
    @DisplayName("应该正确构建批量 Level 2 提示词")
    void testBuildLevel2BatchPrompt() {
        // Given
        List<SkillCandidate> candidates = Arrays.asList(
            SkillCandidate.builder()
                .skill(SkillTestUtils.createWorkAssistantSkill())
                .relevanceScore(85)
                .reason("与工作相关")
                .level(1)
                .build()
        );
        
        // When
        String prompt = promptBuilder.buildLevel2BatchPrompt(candidates, testContext);
        
        // Then
        assertNotNull(prompt);
        assertTrue(prompt.contains("深度评估"));
        assertTrue(prompt.contains("work_assistant"));
        assertTrue(prompt.contains("85"));
        assertTrue(prompt.contains("evaluatedSkills"));
    }
    
    @Test
    @DisplayName("应该正确构建批量 Level 3 提示词")
    void testBuildLevel3BatchPrompt() {
        // Given
        List<SkillCandidate> candidates = Arrays.asList(
            SkillCandidate.builder()
                .skill(SkillTestUtils.createWorkAssistantSkill())
                .confidence(90)
                .level(2)
                .build()
        );
        
        // When
        String prompt = promptBuilder.buildLevel3BatchPrompt(candidates, testContext);
        
        // Then
        assertNotNull(prompt);
        assertTrue(prompt.contains("最终决策"));
        assertTrue(prompt.contains("work_assistant"));
        assertTrue(prompt.contains("90"));
        assertTrue(prompt.contains("finalSkills"));
    }
    
    @Test
    @DisplayName("Level 1 提示词应该包含对话历史")
    void testLevel1PromptWithHistory() {
        // Given
        SkillEvaluationContext contextWithHistory = SkillTestUtils.createTestContextWithHistory(
            "继续刚才的话题",
            Arrays.asList("用户: 你好", "助手: 你好，有什么可以帮助你的？")
        );
        
        // When
        String prompt = promptBuilder.buildLevel1Prompt(testSkills, contextWithHistory);
        
        // Then
        assertNotNull(prompt);
        assertTrue(prompt.contains("对话上下文"));
        assertTrue(prompt.contains("你好"));
    }
}
