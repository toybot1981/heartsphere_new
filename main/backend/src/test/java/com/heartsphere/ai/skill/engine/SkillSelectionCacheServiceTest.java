package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.skill.entity.SkillDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SkillSelectionCacheService 单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能选择缓存服务测试")
public class SkillSelectionCacheServiceTest {
    
    @InjectMocks
    private SkillSelectionCacheService cacheService;
    
    private SkillEvaluationContext testContext;
    private List<SkillDefinition> testSkills;
    
    @BeforeEach
    void setUp() {
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作");
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill()
        );
    }
    
    @Test
    @DisplayName("应该正确生成缓存键")
    void testGenerateCacheKey() {
        // Given
        String prompt = "test prompt";
        String level = "level1";
        
        // When
        String cacheKey = cacheService.generateCacheKey(prompt, testContext, level, testSkills);
        
        // Then
        assertNotNull(cacheKey);
        assertTrue(cacheKey.startsWith("llm_skill_selection:level1:"));
        assertTrue(cacheKey.length() > 30); // MD5 hash length
    }
    
    @Test
    @DisplayName("相同输入应该生成相同的缓存键")
    void testCacheKeyConsistency() {
        // Given
        String prompt = "test prompt";
        String level = "level1";
        
        // When
        String key1 = cacheService.generateCacheKey(prompt, testContext, level, testSkills);
        String key2 = cacheService.generateCacheKey(prompt, testContext, level, testSkills);
        
        // Then
        assertEquals(key1, key2);
    }
    
    @Test
    @DisplayName("不同输入应该生成不同的缓存键")
    void testCacheKeyUniqueness() {
        // Given
        String prompt1 = "test prompt 1";
        String prompt2 = "test prompt 2";
        String level = "level1";
        
        // 创建不同的上下文
        SkillEvaluationContext context1 = SkillTestUtils.createTestContext("消息1");
        SkillEvaluationContext context2 = SkillTestUtils.createTestContext("消息2");
        
        // When
        String key1 = cacheService.generateCacheKey(prompt1, context1, level, testSkills);
        String key2 = cacheService.generateCacheKey(prompt2, context2, level, testSkills);
        
        // Then
        assertNotEquals(key1, key2, "不同的提示词和上下文应该生成不同的缓存键");
    }
    
    @Test
    @DisplayName("应该正确缓存结果")
    void testCacheResult() {
        // Given
        String cacheKey = "test_cache_key";
        String result = "test result";
        
        // When
        String cached = cacheService.cacheResult(cacheKey, result);
        
        // Then
        assertNotNull(cached);
        assertEquals(result, cached);
    }
}
