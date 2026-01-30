package com.heartsphere.ai.skill.integration;

import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.ai.skill.engine.*;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
import com.heartsphere.ai.skill.util.MockLLMResponseBuilder;
import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.repository.SkillInstructionRepository;
import com.heartsphere.skill.repository.SkillResourceRepository;
import com.heartsphere.skill.service.SkillRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * LLM 技能选择集成测试
 * 测试完整的三层渐进式流程
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("LLM 技能选择集成测试")
public class LLMSkillSelectionIntegrationTest {
    
    @MockBean
    private AIService aiService;
    
    @MockBean
    private SkillRegistry skillRegistry;
    
    @Autowired
    private SkillPromptBuilder promptBuilder;
    
    @Autowired
    private ProgressiveSkillLoader skillLoader;
    
    @Autowired
    private SkillSelectionCacheService cacheService;
    
    @Autowired
    private SkillSelectionConfig config;
    
    @Autowired
    private SkillExecutionRecordService recordService;
    
    @Autowired
    private LLMSkillSelector llmSkillSelector;
    
    @Autowired
    private LLMSkillApplicationEngine engine;
    
    @MockBean
    private SkillDefinitionRepository skillDefinitionRepository;
    
    @MockBean
    private SkillInstructionRepository skillInstructionRepository;
    
    @MockBean
    private SkillResourceRepository skillResourceRepository;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    
    @BeforeEach
    void setUp() {
        // 创建测试数据
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill(),
            SkillTestUtils.createLearningAssistantSkill()
        );
        
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作任务");
        
        // Mock SkillRegistry
        when(skillRegistry.getCharacterSkills(anyLong())).thenReturn(testSkills);
    }
    
    @Test
    @DisplayName("应该完成完整的三层渐进式流程")
    void testCompleteThreeLayerFlow() {
        // Given - Level 1 响应
        TextGenerationResponse level1Response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关"),
                new MockLLMResponseBuilder.SelectedSkill("learning_assistant", 70, "与学习相关")
            )
        );
        
        // Given - Level 2 响应
        TextGenerationResponse level2Response = MockLLMResponseBuilder.buildLevel2Response(
            Arrays.asList(
                new MockLLMResponseBuilder.EvaluatedSkill("work_assistant", true, 90, "高度相关")
            )
        );
        
        // Given - Level 3 响应
        TextGenerationResponse level3Response = MockLLMResponseBuilder.buildLevel3Response(
            Arrays.asList(
                new MockLLMResponseBuilder.FinalSkill("work_assistant", 1, 1, "最高优先级")
            )
        );
        
        // Mock LLM 响应序列
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(level1Response)  // Level 1
            .thenReturn(level2Response)  // Level 2
            .thenReturn(level3Response); // Level 3
        
        // Mock Level 2 指令
        List<SkillInstruction> instructions = Arrays.asList(
            SkillTestUtils.createLevel2Instruction("work_assistant", "工作助手指令")
        );
        Map<String, List<SkillInstruction>> instructionsMap = Map.of("work_assistant", instructions);
        when(skillInstructionRepository.findBySkillIdIn(anyList())).thenReturn(instructions);
        
        // Mock Level 3 资源
        List<SkillResource> resources = Arrays.asList(
            SkillTestUtils.createLevel3Resource("work_assistant", "template", "工作模板", "模板内容")
        );
        Map<String, List<SkillResource>> resourcesMap = Map.of("work_assistant", resources);
        when(skillResourceRepository.findBySkillIdIn(anyList())).thenReturn(resources);
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalApplied());
        assertTrue(result.hasAppliedSkills());
        assertNotNull(result.getExecutionRecordIds());
        assertEquals(1, result.getExecutionRecordIds().size());
        
        // 验证三层流程都被调用
        verify(aiService, atLeast(3)).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("应该正确创建执行记录")
    void testExecutionRecordCreation() {
        // Given
        TextGenerationResponse level1Response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        
        TextGenerationResponse level2Response = MockLLMResponseBuilder.buildLevel2Response(
            Arrays.asList(
                new MockLLMResponseBuilder.EvaluatedSkill("work_assistant", true, 90, "高度相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(level1Response)
            .thenReturn(level2Response);
        
        when(skillInstructionRepository.findBySkillIdIn(anyList()))
            .thenReturn(Arrays.asList());
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertTrue(result.hasAppliedSkills());
        assertNotNull(result.getExecutionRecordIds());
        assertFalse(result.getExecutionRecordIds().isEmpty());
    }
}
