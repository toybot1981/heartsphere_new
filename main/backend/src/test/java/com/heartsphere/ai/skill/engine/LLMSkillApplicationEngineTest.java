package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
import com.heartsphere.ai.skill.util.MockLLMResponseBuilder;
import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.skill.entity.SkillDefinition;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * LLMSkillApplicationEngine 单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LLM 技能应用引擎测试")
public class LLMSkillApplicationEngineTest {
    
    @Mock
    private LLMSkillSelector llmSkillSelector;
    
    @Mock
    private ProgressiveSkillLoader skillLoader;
    
    @Mock
    private SkillExecutionRecordService recordService;
    
    @Mock
    private SkillSelectionConfig config;
    
    @Mock
    private SkillSelectionConfig.LLMDrivenConfig llmDrivenConfig;
    
    @InjectMocks
    private LLMSkillApplicationEngine engine;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    
    @BeforeEach
    void setUp() {
        // 设置 Mock 配置（使用 lenient 避免不必要的 stubbing 错误）
        lenient().when(config.getLlmDriven()).thenReturn(llmDrivenConfig);
        lenient().when(llmDrivenConfig.isEnabled()).thenReturn(true);
        lenient().when(llmDrivenConfig.getLevel1Candidates()).thenReturn(10);
        lenient().when(llmDrivenConfig.getLevel2Candidates()).thenReturn(5);
        lenient().when(llmDrivenConfig.isEnableLevel3()).thenReturn(true);
        
        // 注意：LLMSkillApplicationEngine 不再支持降级到规则驱动
        // 如果 LLM 失败，将返回空结果
        
        // 创建测试数据
        testSkills = SkillTestUtils.createTestSkills(5);
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作");
    }
    
    @Test
    @DisplayName("应该执行完整的三层渐进式流程")
    void testEvaluateAndApplySkillsCompleteFlow() {
        // Given
        SkillCandidate level1Candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .relevanceScore(85)
            .level(1)
            .build();
        
        SkillCandidate level2Candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .confidence(90)
            .shouldActivate(true)
            .level(2)
            .build();
        
        SkillCandidate level3Candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .priority(1)
            .level(3)
            .build();
        
        when(llmSkillSelector.selectCandidatesLevel1(anyList(), any()))
            .thenReturn(Arrays.asList(level1Candidate));
        when(llmSkillSelector.evaluateCandidatesLevel2(anyList(), any()))
            .thenReturn(Arrays.asList(level2Candidate));
        when(llmSkillSelector.finalizeCandidatesLevel3(anyList(), any()))
            .thenReturn(Arrays.asList(level3Candidate));
        
        com.heartsphere.ai.skill.entity.SkillExecutionRecord mockRecord = 
            com.heartsphere.ai.skill.entity.SkillExecutionRecord.builder()
                .id(1L)
                .conversationId(1L)
                .skillId(1L)
                .userId(1L)
                .build();
        
        when(recordService.createRecord(any(SkillExecutionRecordDTO.class)))
            .thenReturn(mockRecord);
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalApplied());
        assertTrue(result.hasAppliedSkills());
        
        verify(llmSkillSelector, times(1)).selectCandidatesLevel1(anyList(), any());
        verify(llmSkillSelector, times(1)).evaluateCandidatesLevel2(anyList(), any());
        verify(llmSkillSelector, times(1)).finalizeCandidatesLevel3(anyList(), any());
    }
    
    @Test
    @DisplayName("LLM 未启用时应该返回空结果")
    void testLLMDisabledReturnsEmpty() {
        // Given
        when(llmDrivenConfig.isEnabled()).thenReturn(false);
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then - 应该返回空结果（不再降级到规则驱动）
        assertNotNull(result);
        assertEquals(0, result.getTotalApplied());
        assertFalse(result.hasAppliedSkills());
        verify(llmSkillSelector, never()).selectCandidatesLevel1(anyList(), any());
    }
    
    @Test
    @DisplayName("LLM 失败时应该返回空结果")
    void testLLMFailureReturnsEmpty() {
        // Given
        when(llmSkillSelector.selectCandidatesLevel1(anyList(), any()))
            .thenThrow(new RuntimeException("LLM service error"));
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then - 应该返回空结果（不再降级到规则驱动）
        assertNotNull(result);
        assertEquals(0, result.getTotalApplied());
        assertFalse(result.hasAppliedSkills());
    }
    
    @Test
    @DisplayName("Level 1 无候选时应该返回空结果")
    void testLevel1NoCandidatesReturnsEmpty() {
        // Given
        when(llmSkillSelector.selectCandidatesLevel1(anyList(), any()))
            .thenReturn(Arrays.asList());
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalApplied());
        assertFalse(result.hasAppliedSkills());
        verify(llmSkillSelector, never()).evaluateCandidatesLevel2(anyList(), any());
    }
    
    @Test
    @DisplayName("Level 3 未启用时应该跳过 Level 3")
    void testLevel3DisabledSkipsLevel3() {
        // Given
        when(llmDrivenConfig.isEnableLevel3()).thenReturn(false);
        
        SkillCandidate level1Candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .relevanceScore(85)
            .level(1)
            .build();
        
        SkillCandidate level2Candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .confidence(90)
            .shouldActivate(true)
            .level(2)
            .build();
        
        when(llmSkillSelector.selectCandidatesLevel1(anyList(), any()))
            .thenReturn(Arrays.asList(level1Candidate));
        when(llmSkillSelector.evaluateCandidatesLevel2(anyList(), any()))
            .thenReturn(Arrays.asList(level2Candidate));
        
        com.heartsphere.ai.skill.entity.SkillExecutionRecord mockRecord = 
            com.heartsphere.ai.skill.entity.SkillExecutionRecord.builder()
                .id(1L)
                .conversationId(1L)
                .skillId(1L)
                .userId(1L)
                .build();
        
        when(recordService.createRecord(any(SkillExecutionRecordDTO.class)))
            .thenReturn(mockRecord);
        
        // When
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, testSkills, 1L, 1L
        );
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalApplied());
        verify(llmSkillSelector, never()).finalizeCandidatesLevel3(anyList(), any());
    }
    
}
