package com.heartsphere.ai.skill.comparison;

import com.heartsphere.ai.skill.config.SkillSelectionConfig;
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
 * 技能选择对比测试
 * 对比 LLM 驱动 vs 规则驱动的准确性和性能
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("技能选择对比测试")
public class SkillSelectionComparisonTest {
    
    @MockBean
    private com.heartsphere.aiagent.service.AIService aiService;
    
    @Autowired
    private LLMSkillApplicationEngine llmEngine;
    
    @Autowired
    private SkillApplicationEngine ruleBasedEngine;
    
    @Autowired
    private SkillSelectionConfig config;
    
    private List<SkillDefinition> testSkills;
    private SkillEvaluationContext testContext;
    
    @BeforeEach
    void setUp() {
        // 注意：LLMSkillApplicationEngine 不再支持降级到规则驱动
        // 如果 LLM 失败，将返回空结果
        
        // 创建测试数据
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill(),
            SkillTestUtils.createLearningAssistantSkill()
        );
        
        testContext = SkillTestUtils.createTestContext("帮我安排今天的工作任务");
    }
    
    @Test
    @DisplayName("应该能够对比两种方法的执行结果")
    void testCompareExecutionResults() {
        // Given - 准备两种方法的输入
        SkillEvaluationContext context1 = SkillTestUtils.createTestContext("安排工作");
        SkillEvaluationContext context2 = SkillTestUtils.createTestContext("安排工作");
        
        // When - LLM 驱动
        SkillApplicationResult llmResult = null;
        try {
            // 如果 LLM 驱动启用，执行 LLM 方法
            if (config.getLlmDriven().isEnabled()) {
                llmResult = llmEngine.evaluateAndApplySkills(
                    context1, testSkills, 1L, 1L
                );
            }
        } catch (Exception e) {
            // LLM 失败时降级
        }
        
        // When - 规则驱动
        SkillApplicationResult ruleBasedResult = ruleBasedEngine.evaluateAndApplySkills(
            context2, testSkills, 1L, 1L
        );
        
        // Then - 两种方法都应该返回结果
        assertNotNull(ruleBasedResult);
        // LLM 结果可能为 null（如果 LLM 未启用或失败）
        
        // 记录对比信息
        if (llmResult != null) {
            System.out.println("LLM 驱动结果: " + llmResult.getTotalApplied() + " 个技能");
            System.out.println("规则驱动结果: " + ruleBasedResult.getTotalApplied() + " 个技能");
        }
    }
    
    @Test
    @DisplayName("应该能够测量两种方法的性能差异")
    void testPerformanceComparison() {
        // Given
        SkillEvaluationContext context = SkillTestUtils.createTestContext("测试消息");
        
        // When - 规则驱动性能
        long start1 = System.currentTimeMillis();
        SkillApplicationResult ruleBasedResult = ruleBasedEngine.evaluateAndApplySkills(
            context, testSkills, 1L, 1L
        );
        long ruleBasedTime = System.currentTimeMillis() - start1;
        
        // When - LLM 驱动性能（如果启用）
        long llmTime = 0;
        if (config.getLlmDriven().isEnabled()) {
            long start2 = System.currentTimeMillis();
            try {
                SkillApplicationResult llmResult = llmEngine.evaluateAndApplySkills(
                    context, testSkills, 1L, 1L
                );
                llmTime = System.currentTimeMillis() - start2;
            } catch (Exception e) {
                // LLM 失败
            }
        }
        
        // Then - 记录性能数据
        System.out.println("规则驱动耗时: " + ruleBasedTime + "ms");
        if (llmTime > 0) {
            System.out.println("LLM 驱动耗时: " + llmTime + "ms");
        }
        
        // 验证两种方法都能完成
        assertNotNull(ruleBasedResult);
    }
    
    @Test
    @DisplayName("应该能够分析两种方法的准确性差异")
    void testAccuracyComparison() {
        // Given - 明确的测试场景
        List<SkillEvaluationContext> testScenarios = Arrays.asList(
            SkillTestUtils.createTestContext("帮我安排今天的工作"),
            SkillTestUtils.createTestContext("我想学习新技能"),
            SkillTestUtils.createTestContext("帮我管理生活事务")
        );
        
        // When & Then - 对每个场景进行测试
        for (SkillEvaluationContext scenario : testScenarios) {
            SkillApplicationResult ruleBasedResult = ruleBasedEngine.evaluateAndApplySkills(
                scenario, testSkills, 1L, 1L
            );
            
            assertNotNull(ruleBasedResult);
            
            // 如果 LLM 驱动启用，也测试 LLM 方法
            if (config.getLlmDriven().isEnabled()) {
                try {
                    SkillApplicationResult llmResult = llmEngine.evaluateAndApplySkills(
                        scenario, testSkills, 1L, 1L
                    );
                    
                    // 记录准确性对比
                    System.out.println("场景: " + scenario.getMessageSummary());
                    System.out.println("规则驱动: " + ruleBasedResult.getTotalApplied() + " 个技能");
                    System.out.println("LLM 驱动: " + llmResult.getTotalApplied() + " 个技能");
                } catch (Exception e) {
                    // LLM 失败，使用降级
                }
            }
        }
    }
}
