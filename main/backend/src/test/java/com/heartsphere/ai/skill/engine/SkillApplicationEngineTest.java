package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
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

/**
 * 技能应用引擎测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能应用引擎测试")
public class SkillApplicationEngineTest {

    @Mock
    private SkillScoringService scoringService;

    @Mock
    private SkillExecutionRecordService recordService;

    @InjectMocks
    private SkillApplicationEngine engine;

    private SkillDefinition testSkill;
    private SkillEvaluationContext testContext;

    @BeforeEach
    public void setUp() {
        testSkill = new SkillDefinition();
        testSkill.setId(1L);
        testSkill.setName("测试技能");
        testSkill.setDescription("这是一个测试技能");

        testContext = SkillEvaluationContext.builder()
            .userMessage("我想学习编程")
            .roleId(1L)
            .timestamp(java.time.LocalDateTime.now())
            .build();
    }

    @Test
    @DisplayName("应该评估并应用符合条件的技能")
    public void testEvaluateAndApplySkills() {
        // Setup
        List<SkillDefinition> skills = Arrays.asList(testSkill);
        
        SkillApplicationEngine.SkillScore highScore = new SkillApplicationEngine.SkillScore(
            testSkill, 85, 80, 75, Arrays.asList("编程", "学习")
        );
        
        when(scoringService.scoreSkill(any(SkillDefinition.class), any(SkillEvaluationContext.class)))
            .thenReturn(highScore);
        
        when(recordService.createRecord(any(SkillExecutionRecordDTO.class)))
            .thenReturn(null); // Mock 返回

        // Test
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, skills, 1L, 1L
        );

        // Assert
        assertNotNull(result);
        assertTrue(result.hasAppliedSkills());
        assertEquals(1, result.getTotalApplied());
        verify(scoringService, times(1)).scoreSkill(any(), any());
    }

    @Test
    @DisplayName("应该拒绝评分低于阈值的技能")
    public void testRejectLowScoreSkills() {
        // Setup
        List<SkillDefinition> skills = Arrays.asList(testSkill);
        
        SkillApplicationEngine.SkillScore lowScore = new SkillApplicationEngine.SkillScore(
            testSkill, 30, 25, 20, Arrays.asList()
        );
        
        when(scoringService.scoreSkill(any(SkillDefinition.class), any(SkillEvaluationContext.class)))
            .thenReturn(lowScore);

        // Test
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, skills, 1L, 1L
        );

        // Assert
        assertNotNull(result);
        assertFalse(result.hasAppliedSkills());
        assertTrue(result.getRejectedSkills().size() > 0);
    }

    @Test
    @DisplayName("应该按评分排序选择技能")
    public void testSkillPrioritySorting() {
        // Setup
        SkillDefinition skill1 = new SkillDefinition();
        skill1.setId(1L);
        skill1.setName("技能1");

        SkillDefinition skill2 = new SkillDefinition();
        skill2.setId(2L);
        skill2.setName("技能2");

        List<SkillDefinition> skills = Arrays.asList(skill1, skill2);
        
        SkillApplicationEngine.SkillScore score1 = new SkillApplicationEngine.SkillScore(
            skill1, 70, 70, 70, Arrays.asList()
        );
        
        SkillApplicationEngine.SkillScore score2 = new SkillApplicationEngine.SkillScore(
            skill2, 90, 90, 90, Arrays.asList()
        );
        
        when(scoringService.scoreSkill(eq(skill1), any()))
            .thenReturn(score1);
        when(scoringService.scoreSkill(eq(skill2), any()))
            .thenReturn(score2);

        // Test
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, skills, 1L, 1L
        );

        // Assert
        assertNotNull(result);
        // 应该应用评分更高的技能2
        assertTrue(result.getAppliedSkills().containsKey(2L));
    }

    @Test
    @DisplayName("应该处理空技能列表")
    public void testEmptySkillsList() {
        // Test
        SkillApplicationResult result = engine.evaluateAndApplySkills(
            testContext, Arrays.asList(), 1L, 1L
        );

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getTotalApplied());
        assertFalse(result.hasAppliedSkills());
    }

    @Test
    @DisplayName("应该处理评分失败的情况")
    public void testScoringFailure() {
        // Setup
        List<SkillDefinition> skills = Arrays.asList(testSkill);
        
        when(scoringService.scoreSkill(any(), any()))
            .thenThrow(new RuntimeException("评分失败"));

        // Test & Assert
        assertThrows(RuntimeException.class, () -> {
            engine.evaluateAndApplySkills(testContext, skills, 1L, 1L);
        });
    }
}
