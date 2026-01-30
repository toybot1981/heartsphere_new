package com.heartsphere.memory.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 关系深度计算器测试
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
class RelationshipDepthCalculatorTest {
    
    private RelationshipDepthCalculator calculator;
    
    @BeforeEach
    void setUp() {
        calculator = new RelationshipDepthCalculator();
    }
    
    @Test
    void testCalculateRelationshipDepth_Stranger() {
        // 测试陌生人阶段：交互少、情感连接低
        int score = calculator.calculateRelationshipDepth(
                5,      // 交互次数少
                20,     // 情感连接分数低
                0,      // 无共同经历
                0.3,    // 正面反馈比例低
                10      // 10天前首次交互
        );
        
        RelationshipDepthCalculator.RelationshipStage stage = 
                calculator.determineRelationshipStage(score);
        
        assertEquals(RelationshipDepthCalculator.RelationshipStage.STRANGER, stage);
        assertTrue(score < 30, "陌生人阶段分数应该 < 30");
    }
    
    @Test
    void testCalculateRelationshipDepth_Friend() {
        // 测试朋友阶段：中等交互、中等情感连接
        int score = calculator.calculateRelationshipDepth(
                30,     // 中等交互次数
                50,     // 中等情感连接分数
                2,      // 少量共同经历
                0.6,    // 中等正面反馈比例
                30      // 30天前首次交互
        );
        
        RelationshipDepthCalculator.RelationshipStage stage = 
                calculator.determineRelationshipStage(score);
        
        assertTrue(stage == RelationshipDepthCalculator.RelationshipStage.FRIEND ||
                   stage == RelationshipDepthCalculator.RelationshipStage.STRANGER,
                "应该是朋友或陌生人阶段");
    }
    
    @Test
    void testCalculateRelationshipDepth_CloseFriend() {
        // 测试挚友阶段：高交互、高情感连接
        int score = calculator.calculateRelationshipDepth(
                100,    // 高交互次数
                70,     // 高情感连接分数
                8,      // 多个共同经历
                0.8,    // 高正面反馈比例
                60      // 60天前首次交互
        );
        
        RelationshipDepthCalculator.RelationshipStage stage = 
                calculator.determineRelationshipStage(score);
        
        assertTrue(stage == RelationshipDepthCalculator.RelationshipStage.CLOSE_FRIEND ||
                   stage == RelationshipDepthCalculator.RelationshipStage.MENTOR,
                "应该是挚友或导师阶段");
        assertTrue(score >= 60, "挚友阶段分数应该 >= 60");
    }
    
    @Test
    void testCalculateRelationshipDepth_Mentor() {
        // 测试导师阶段：极高交互、极高情感连接
        int score = calculator.calculateRelationshipDepth(
                200,    // 极高交互次数
                90,     // 极高情感连接分数
                15,     // 大量共同经历
                0.95,   // 极高正面反馈比例
                120     // 120天前首次交互
        );
        
        RelationshipDepthCalculator.RelationshipStage stage = 
                calculator.determineRelationshipStage(score);
        
        assertEquals(RelationshipDepthCalculator.RelationshipStage.MENTOR, stage);
        assertTrue(score >= 80, "导师阶段分数应该 >= 80");
    }
    
    @Test
    void testDetermineRelationshipStage() {
        // 测试阶段确定逻辑
        assertEquals(RelationshipDepthCalculator.RelationshipStage.STRANGER,
                calculator.determineRelationshipStage(20));
        assertEquals(RelationshipDepthCalculator.RelationshipStage.FRIEND,
                calculator.determineRelationshipStage(45));
        assertEquals(RelationshipDepthCalculator.RelationshipStage.CLOSE_FRIEND,
                calculator.determineRelationshipStage(70));
        assertEquals(RelationshipDepthCalculator.RelationshipStage.MENTOR,
                calculator.determineRelationshipStage(85));
    }
    
    @Test
    void testShouldTransitionStage() {
        // 测试阶段转换判断
        assertTrue(calculator.shouldTransitionStage(
                RelationshipDepthCalculator.RelationshipStage.STRANGER,
                RelationshipDepthCalculator.RelationshipStage.FRIEND));
        
        assertFalse(calculator.shouldTransitionStage(
                RelationshipDepthCalculator.RelationshipStage.FRIEND,
                RelationshipDepthCalculator.RelationshipStage.FRIEND));
    }
    
    @Test
    void testCalculateRelationshipDepth_BoundaryValues() {
        // 测试边界值
        int minScore = calculator.calculateRelationshipDepth(0, 0, 0, 0.0, 1);
        assertTrue(minScore >= 0, "分数应该 >= 0");
        
        int maxScore = calculator.calculateRelationshipDepth(
                1000, 100, 100, 1.0, 1);
        assertTrue(maxScore <= 100, "分数应该 <= 100");
    }
}
