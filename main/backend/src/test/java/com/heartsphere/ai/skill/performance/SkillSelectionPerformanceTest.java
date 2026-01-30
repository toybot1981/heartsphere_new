package com.heartsphere.ai.skill.performance;

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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 技能选择性能测试
 * 测试缓存效果和并发性能
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("技能选择性能测试")
public class SkillSelectionPerformanceTest {
    
    @MockBean
    private AIService aiService;
    
    @Autowired
    private LLMSkillSelector llmSkillSelector;
    
    @Autowired
    private CacheManager cacheManager;
    
    private List<SkillDefinition> testSkills;
    
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
        testSkills = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            testSkills.add(SkillTestUtils.createWorkAssistantSkill());
        }
    }
    
    @Test
    @DisplayName("缓存应该显著提升性能")
    void testCachePerformanceImprovement() {
        // Given
        TextGenerationResponse response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any())).thenReturn(response);
        
        SkillEvaluationContext context = SkillTestUtils.createTestContext("测试消息");
        
        // When - 第一次调用（无缓存）
        long start1 = System.currentTimeMillis();
        llmSkillSelector.selectCandidatesLevel1(testSkills, context);
        long time1 = System.currentTimeMillis() - start1;
        
        // When - 第二次调用（有缓存）
        long start2 = System.currentTimeMillis();
        llmSkillSelector.selectCandidatesLevel1(testSkills, context);
        long time2 = System.currentTimeMillis() - start2;
        
        // Then - 缓存调用应该更快
        assertTrue(time2 < time1, 
            String.format("缓存调用 (%dms) 应该比首次调用 (%dms) 更快", time2, time1));
        
        // Then - 应该只调用一次 LLM
        verify(aiService, times(1)).generateText(anyLong(), any());
    }
    
    @Test
    @DisplayName("应该支持并发请求")
    void testConcurrentRequests() throws Exception {
        // Given
        TextGenerationResponse response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any())).thenReturn(response);
        
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<CompletableFuture<List<SkillCandidate>>> futures = new ArrayList<>();
        
        // When - 并发调用
        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            CompletableFuture<List<SkillCandidate>> future = CompletableFuture.supplyAsync(() -> {
                SkillEvaluationContext context = SkillTestUtils.createTestContext("消息 " + index);
                return llmSkillSelector.selectCandidatesLevel1(testSkills, context);
            }, executor);
            futures.add(future);
        }
        
        // Then - 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .get(5, TimeUnit.SECONDS);
        
        // Then - 验证所有任务都成功
        for (CompletableFuture<List<SkillCandidate>> future : futures) {
            assertTrue(future.isDone());
            assertNotNull(future.get());
        }
        
        executor.shutdown();
    }
    
    @Test
    @DisplayName("批量处理应该高效")
    void testBatchProcessingEfficiency() {
        // Given
        TextGenerationResponse response = MockLLMResponseBuilder.buildLevel1Response(
            Arrays.asList(
                new MockLLMResponseBuilder.SelectedSkill("work_assistant", 85, "与工作相关")
            )
        );
        
        when(aiService.generateText(anyLong(), any())).thenReturn(response);
        
        // When - 处理多个请求
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10; i++) {
            SkillEvaluationContext context = SkillTestUtils.createTestContext("消息 " + i);
            llmSkillSelector.selectCandidatesLevel1(testSkills, context);
        }
        long totalTime = System.currentTimeMillis() - start;
        
        // Then - 总时间应该在合理范围内（考虑缓存）
        assertTrue(totalTime < 5000, 
            String.format("批量处理 10 个请求应该在 5 秒内完成，实际: %dms", totalTime));
    }
}
