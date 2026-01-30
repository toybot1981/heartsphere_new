package com.heartsphere.ai.skill.e2e;

import com.heartsphere.ai.skill.engine.*;
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
 * 技能选择端到端测试
 * 测试真实场景下的完整流程
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("技能选择端到端测试")
public class SkillSelectionE2ETest {
    
    @MockBean
    private AIService aiService;
    
    @Autowired
    private LLMSkillApplicationEngine engine;
    
    @MockBean
    private SkillDefinitionRepository skillDefinitionRepository;
    
    @MockBean
    private SkillInstructionRepository skillInstructionRepository;
    
    @MockBean
    private SkillResourceRepository skillResourceRepository;
    
    private List<SkillDefinition> testSkills;
    
    @BeforeEach
    void setUp() {
        // 创建测试技能
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill(),
            SkillTestUtils.createLearningAssistantSkill()
        );
    }
    
    @Test
    @DisplayName("真实工作场景：用户请求工作安排")
    void testRealWorldWorkScenario() {
        // Given - 用户消息
        SkillEvaluationContext context = SkillTestUtils.createTestContext(
            "帮我安排今天的工作任务，包括会议、代码审查和文档编写"
        );
        
        // Given - Level 1 响应：筛选出工作助手
        TextGenerationResponse level1Response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 95, "与工作安排高度相关")
            )
        );
        
        // Given - Level 2 响应：确认激活
        TextGenerationResponse level2Response = MockLLMResponseBuilder.buildLevel2Response(
            Arrays.asList(
                new MockLLMResponseBuilder.EvaluatedSkill("work_assistant", true, 98, "非常适合处理工作安排")
            )
        );
        
        // Given - Level 3 响应：最终决策
        TextGenerationResponse level3Response = MockLLMResponseBuilder.buildLevel3Response(
            Arrays.asList(
                new MockLLMResponseBuilder.FinalSkill("work_assistant", 1, 1, "最高优先级，立即激活")
            )
        );
        
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(level1Response)
            .thenReturn(level2Response)
            .thenReturn(level3Response);
        
        // Mock Level 2 和 Level 3 数据
        when(skillInstructionRepository.findBySkillIdIn(anyList()))
            .thenReturn(Arrays.asList(
                SkillTestUtils.createLevel2Instruction("work_assistant", "工作助手指令")
            ));
        
        when(skillResourceRepository.findBySkillIdIn(anyList()))
            .thenReturn(Arrays.asList(
                SkillTestUtils.createLevel3Resource("work_assistant", "template", "工作模板", "模板内容")
            ));
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            context, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalApplied());
        assertTrue(result.hasAppliedSkills());
        assertNotNull(result.getExecutionRecordIds());
        assertEquals(1, result.getExecutionRecordIds().size());
    }
    
    @Test
    @DisplayName("真实学习场景：用户请求学习建议")
    void testRealWorldLearningScenario() {
        // Given - 用户消息
        SkillEvaluationContext context = SkillTestUtils.createTestContext(
            "我想学习 Java 编程，能给我一些建议吗？"
        );
        
        // Given - Level 1 响应：筛选出学习助手
        TextGenerationResponse level1Response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("learning_assistant", 90, "与学习相关")
            )
        );
        
        // Given - Level 2 响应：确认激活
        TextGenerationResponse level2Response = MockLLMResponseBuilder.buildLevel2Response(
            Arrays.asList(
                new MockLLMResponseBuilder.EvaluatedSkill("learning_assistant", true, 92, "适合提供学习建议")
            )
        );
        
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(level1Response)
            .thenReturn(level2Response);
        
        when(skillInstructionRepository.findBySkillIdIn(anyList()))
            .thenReturn(Arrays.asList(
                SkillTestUtils.createLevel2Instruction("learning_assistant", "学习助手指令")
            ));
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            context, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertTrue(result.hasAppliedSkills());
    }
    
    @Test
    @DisplayName("真实多技能场景：用户请求涉及多个领域")
    void testRealWorldMultiSkillScenario() {
        // Given - 用户消息涉及多个领域
        SkillEvaluationContext context = SkillTestUtils.createTestContext(
            "帮我安排今天的工作，然后给我一些学习建议，最后帮我规划一下生活"
        );
        
        // Given - Level 1 响应：筛选出多个技能
        TextGenerationResponse level1Response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关"),
                new MockLLMResponseBuilder.SelectedSkill("learning_assistant", 80, "与学习相关"),
                new MockLLMResponseBuilder.SelectedSkill("life_assistant", 75, "与生活相关")
            )
        );
        
        // Given - Level 2 响应：评估后保留部分技能
        TextGenerationResponse level2Response = MockLLMResponseBuilder.buildLevel2Response(
            Arrays.asList(
                new MockLLMResponseBuilder.EvaluatedSkill("work_assistant", true, 90, "高度相关"),
                new MockLLMResponseBuilder.EvaluatedSkill("learning_assistant", true, 85, "相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(level1Response)
            .thenReturn(level2Response);
        
        when(skillInstructionRepository.findBySkillIdIn(anyList()))
            .thenReturn(Arrays.asList(
                SkillTestUtils.createLevel2Instruction("work_assistant", "工作助手指令"),
                SkillTestUtils.createLevel2Instruction("learning_assistant", "学习助手指令")
            ));
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            context, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertTrue(result.getTotalApplied() >= 1);
    }
    
    @Test
    @DisplayName("真实边界场景：用户消息不明确")
    void testRealWorldAmbiguousScenario() {
        // Given - 模糊的用户消息
        SkillEvaluationContext context = SkillTestUtils.createTestContext("你好");
        
        // Given - Level 1 响应：可能筛选出多个技能或空
        TextGenerationResponse level1Response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList()
        );
        
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(level1Response);
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            context, testSkills, 1L, 1L
        );
        
        // Then - 应该优雅处理，不抛出异常
        assertNotNull(result);
        // 可能没有激活任何技能，这是正常的
    }
}
