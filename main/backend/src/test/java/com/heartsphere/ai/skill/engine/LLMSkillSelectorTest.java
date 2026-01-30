package com.heartsphere.ai.skill.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.config.SkillSelectionConfig;
import com.heartsphere.ai.skill.util.MockLLMResponseBuilder;
import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
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
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * LLMSkillSelector 单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LLM 技能选择器测试")
public class LLMSkillSelectorTest {
    
    @Mock
    private AIService aiService;
    
    @Mock
    private SkillPromptBuilder promptBuilder;
    
    @Mock
    private ProgressiveSkillLoader skillLoader;
    
    @Mock
    private SkillSelectionConfig config;
    
    @Mock
    private SkillSelectionConfig.LLMDrivenConfig llmDrivenConfig;
    
    @Mock
    private SkillSelectionCacheService cacheService;
    
    private CacheManager cacheManager;
    
    private LLMSkillSelectorImpl llmSkillSelector;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    private ObjectMapper objectMapper;
    
    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        cacheManager = new ConcurrentMapCacheManager("llmSkillSelection");
        
        // 直接创建实例
        llmSkillSelector = new LLMSkillSelectorImpl(
            aiService,
            promptBuilder,
            skillLoader,
            objectMapper,
            config,
            cacheService,
            cacheManager
        );
        
        // 设置 Mock 配置（使用 lenient 避免不必要的 stubbing 错误）
        lenient().when(config.getLlmDriven()).thenReturn(llmDrivenConfig);
        lenient().when(llmDrivenConfig.getTemperature()).thenReturn(0.3);
        lenient().when(llmDrivenConfig.getMaxTokens()).thenReturn(1000);
        lenient().when(llmDrivenConfig.isEnableLevel3()).thenReturn(true);
        
        // 创建测试数据
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill()
        );
        
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作");
        
        // Mock 缓存服务（在需要时设置）
    }
    
    @Test
    @DisplayName("应该正确执行 Level 1 初步筛选")
    void testSelectCandidatesLevel1() {
        // Given
        when(cacheService.generateCacheKey(anyString(), any(), anyString(), anyList()))
            .thenReturn("test_cache_key");
        
        String level1Prompt = "Level 1 prompt";
        when(promptBuilder.buildLevel1Prompt(testSkills, testContext)).thenReturn(level1Prompt);
        
        TextGenerationResponse llmResponse = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        when(aiService.generateText(anyLong(), any())).thenReturn(llmResponse);
        
        // When
        List<SkillCandidate> candidates = llmSkillSelector.selectCandidatesLevel1(testSkills, testContext);
        
        // Then
        assertNotNull(candidates);
        assertEquals(1, candidates.size());
        assertEquals("work_assistant", candidates.get(0).getSkill().getSkillId());
        assertEquals(85, candidates.get(0).getRelevanceScore());
        assertEquals(1, candidates.get(0).getLevel());
        
        verify(promptBuilder, times(1)).buildLevel1Prompt(testSkills, testContext);
        verify(aiService, times(1)).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("应该正确执行 Level 2 深度评估")
    void testEvaluateCandidatesLevel2() {
        // Given
        when(cacheService.generateCacheKey(anyString(), any(), anyString(), anyList()))
            .thenReturn("test_cache_key");
        
        SkillCandidate candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .relevanceScore(85)
            .reason("与工作相关")
            .level(1)
            .build();
        
        List<SkillCandidate> level1Candidates = Arrays.asList(candidate);
        
        List<SkillInstruction> instructions = Arrays.asList(
            SkillTestUtils.createLevel2Instruction("work_assistant", "工作助手指令")
        );
        Map<String, List<SkillInstruction>> instructionsMap = Map.of("work_assistant", instructions);
        when(skillLoader.loadLevel2Batch(anyList())).thenReturn(instructionsMap);
        
        String level2Prompt = "Level 2 prompt";
        when(promptBuilder.buildLevel2Prompt(any(), anyList(), any())).thenReturn(level2Prompt);
        
        TextGenerationResponse llmResponse = MockLLMResponseBuilder.buildLevel2Response(
            Arrays.asList(
                new MockLLMResponseBuilder.EvaluatedSkill("work_assistant", true, 90, "高度相关")
            )
        );
        when(aiService.generateText(anyLong(), any())).thenReturn(llmResponse);
        
        // When
        List<SkillCandidate> evaluated = llmSkillSelector.evaluateCandidatesLevel2(level1Candidates, testContext);
        
        // Then
        assertNotNull(evaluated);
        assertEquals(1, evaluated.size());
        assertTrue(evaluated.get(0).getShouldActivate());
        assertEquals(90, evaluated.get(0).getConfidence());
        assertEquals(2, evaluated.get(0).getLevel());
        
        verify(skillLoader, times(1)).loadLevel2Batch(anyList());
        verify(aiService, times(1)).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("应该正确执行 Level 3 最终决策")
    void testFinalizeCandidatesLevel3() {
        // Given
        when(cacheService.generateCacheKey(anyString(), any(), anyString(), anyList()))
            .thenReturn("test_cache_key");
        
        SkillCandidate candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .confidence(90)
            .level(2)
            .build();
        
        List<SkillCandidate> level2Candidates = Arrays.asList(candidate);
        
        List<SkillResource> resources = Arrays.asList(
            SkillTestUtils.createLevel3Resource("work_assistant", "template", "工作模板", "模板内容")
        );
        Map<String, List<SkillResource>> resourcesMap = Map.of("work_assistant", resources);
        when(skillLoader.loadLevel3Batch(anyList())).thenReturn(resourcesMap);
        
        String level3Prompt = "Level 3 prompt";
        when(promptBuilder.buildLevel3Prompt(any(), anyList(), any())).thenReturn(level3Prompt);
        
        TextGenerationResponse llmResponse = MockLLMResponseBuilder.buildLevel3Response(
            Arrays.asList(
                new MockLLMResponseBuilder.FinalSkill("work_assistant", 1, 1, "最高优先级")
            )
        );
        when(aiService.generateText(anyLong(), any())).thenReturn(llmResponse);
        
        // When
        List<SkillCandidate> finalized = llmSkillSelector.finalizeCandidatesLevel3(level2Candidates, testContext);
        
        // Then
        assertNotNull(finalized);
        assertEquals(1, finalized.size());
        assertEquals(1, finalized.get(0).getPriority());
        assertEquals(3, finalized.get(0).getLevel());
        
        verify(skillLoader, times(1)).loadLevel3Batch(anyList());
        verify(aiService, times(1)).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("Level 3 未启用时应该跳过")
    void testFinalizeCandidatesLevel3Disabled() {
        // Given
        when(llmDrivenConfig.isEnableLevel3()).thenReturn(false);
        
        SkillCandidate candidate = SkillCandidate.builder()
            .skill(SkillTestUtils.createWorkAssistantSkill())
            .level(2)
            .build();
        
        List<SkillCandidate> level2Candidates = Arrays.asList(candidate);
        
        // When
        List<SkillCandidate> result = llmSkillSelector.finalizeCandidatesLevel3(level2Candidates, testContext);
        
        // Then
        assertNotNull(result);
        assertEquals(level2Candidates, result); // 应该返回原列表
        
        verify(skillLoader, never()).loadLevel3Batch(anyList());
        verify(aiService, never()).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("LLM 响应解析失败时应该抛出异常")
    void testParseResponseFailure() {
        // Given
        when(cacheService.generateCacheKey(anyString(), any(), anyString(), anyList()))
            .thenReturn("test_cache_key");
        
        String level1Prompt = "Level 1 prompt";
        when(promptBuilder.buildLevel1Prompt(testSkills, testContext)).thenReturn(level1Prompt);
        
        TextGenerationResponse invalidResponse = new TextGenerationResponse();
        invalidResponse.setContent("invalid json");
        when(aiService.generateText(anyLong(), any())).thenReturn(invalidResponse);
        
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            llmSkillSelector.selectCandidatesLevel1(testSkills, testContext);
        });
    }
}
