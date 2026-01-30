package com.heartsphere.ai.skill.integration;

import com.heartsphere.ai.skill.engine.*;
import com.heartsphere.ai.skill.util.MockLLMResponseBuilder;
import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.skill.entity.SkillDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 技能选择缓存集成测试
 * 测试缓存在实际场景中的工作
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("技能选择缓存集成测试")
public class SkillSelectionCacheIntegrationTest {
    
    @MockBean
    private AIService aiService;
    
    @Autowired
    private LLMSkillSelector llmSkillSelector;
    
    @Autowired
    private SkillSelectionCacheService cacheService;
    
    @Autowired
    private CacheManager cacheManager;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    
    @BeforeEach
    void setUp() {
        // 清理缓存
        if (cacheManager != null) {
            var cache = cacheManager.getCache("llmSkillSelection");
            if (cache != null) {
                cache.clear();
            }
        }
        
        // 创建测试数据
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill()
        );
        
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作");
    }
    
    @Test
    @DisplayName("相同请求应该使用缓存")
    void testCacheHitForSameRequest() {
        // Given - 第一次调用
        TextGenerationResponse response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any())).thenReturn(response);
        
        // When - 第一次调用
        List<SkillCandidate> result1 = llmSkillSelector.selectCandidatesLevel1(testSkills, testContext);
        
        // When - 第二次调用（相同参数）
        List<SkillCandidate> result2 = llmSkillSelector.selectCandidatesLevel1(testSkills, testContext);
        
        // Then - 应该只调用一次 LLM
        verify(aiService, times(1)).generateText(anyLong(), any());
        
        // Then - 两次结果应该相同
        assertEquals(result1.size(), result2.size());
    }
    
    @Test
    @DisplayName("不同请求应该不使用缓存")
    void testCacheMissForDifferentRequest() {
        // Given - 第一次调用
        TextGenerationResponse response1 = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        
        // Given - 第二次调用（不同上下文）
        TextGenerationResponse response2 = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("life_assistant", 80, "与生活相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any()))
            .thenReturn(response1)
            .thenReturn(response2);
        
        // When - 第一次调用
        SkillEvaluationContext context1 = SkillTestUtils.createTestContext("帮我安排工作");
        List<SkillCandidate> result1 = llmSkillSelector.selectCandidatesLevel1(testSkills, context1);
        
        // When - 第二次调用（不同上下文）
        SkillEvaluationContext context2 = SkillTestUtils.createTestContext("帮我安排生活");
        List<SkillCandidate> result2 = llmSkillSelector.selectCandidatesLevel1(testSkills, context2);
        
        // Then - 应该调用两次 LLM
        verify(aiService, times(2)).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("缓存键应该唯一且一致")
    void testCacheKeyUniquenessAndConsistency() {
        // Given
        String prompt = "test prompt";
        
        // When - 相同参数生成两次缓存键
        String key1 = cacheService.generateCacheKey(prompt, testContext, "level1", testSkills);
        String key2 = cacheService.generateCacheKey(prompt, testContext, "level1", testSkills);
        
        // Then - 应该相同
        assertEquals(key1, key2);
        
        // When - 不同参数生成缓存键
        SkillEvaluationContext differentContext = SkillTestUtils.createTestContext("不同的消息");
        String key3 = cacheService.generateCacheKey(prompt, differentContext, "level1", testSkills);
        
        // Then - 应该不同
        assertNotEquals(key1, key3);
    }
}
