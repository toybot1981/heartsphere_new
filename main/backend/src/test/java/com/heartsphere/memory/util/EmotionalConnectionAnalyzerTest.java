package com.heartsphere.memory.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 情感连接分析器测试
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
class EmotionalConnectionAnalyzerTest {
    
    private EmotionalConnectionAnalyzer analyzer;
    
    @BeforeEach
    void setUp() {
        analyzer = new EmotionalConnectionAnalyzer();
    }
    
    @Test
    void testCalculateEmotionalConnectionScore_Low() {
        // 测试低情感连接：共鸣少、记忆少
        int score = analyzer.calculateEmotionalConnectionScore(
                1,      // 少量情感共鸣
                2,      // 少量情感记忆
                0.4,    // 低正面情绪比例
                1       // 少量深度对话
        );
        
        assertTrue(score < 50, "低情感连接分数应该 < 50");
    }
    
    @Test
    void testCalculateEmotionalConnectionScore_Medium() {
        // 测试中等情感连接
        int score = analyzer.calculateEmotionalConnectionScore(
                5,      // 中等情感共鸣
                4,      // 中等情感记忆
                0.6,    // 中等正面情绪比例
                3       // 中等深度对话
        );
        
        assertTrue(score >= 40 && score < 80, "中等情感连接分数应该在 40-80 之间");
    }
    
    @Test
    void testCalculateEmotionalConnectionScore_High() {
        // 测试高情感连接：共鸣多、记忆多
        int score = analyzer.calculateEmotionalConnectionScore(
                20,     // 大量情感共鸣
                15,     // 大量情感记忆
                0.9,    // 高正面情绪比例
                10      // 大量深度对话
        );
        
        assertTrue(score >= 70, "高情感连接分数应该 >= 70");
    }
    
    @Test
    void testDetectEmotionalResonance_WithKeywords() {
        // 测试检测情感共鸣（包含关键词）
        boolean hasResonance = analyzer.detectEmotionalResonance(
                "我很难过，需要理解",
                "我理解你的感受，感同身受"
        );
        
        assertTrue(hasResonance, "应该检测到情感共鸣");
    }
    
    @Test
    void testDetectEmotionalResonance_WithoutKeywords() {
        // 测试检测情感共鸣（不包含关键词）
        boolean hasResonance = analyzer.detectEmotionalResonance(
                "今天天气不错",
                "是的，天气很好"
        );
        
        assertFalse(hasResonance, "不应该检测到情感共鸣");
    }
    
    @Test
    void testDetectEmotionalResonance_NullInput() {
        // 测试空输入
        assertFalse(analyzer.detectEmotionalResonance(null, "回应"));
        assertFalse(analyzer.detectEmotionalResonance("消息", null));
        assertFalse(analyzer.detectEmotionalResonance(null, null));
    }
    
    @Test
    void testCalculateEmotionalConnectionScore_BoundaryValues() {
        // 测试边界值
        int minScore = analyzer.calculateEmotionalConnectionScore(0, 0, 0.0, 0);
        assertTrue(minScore >= 0, "分数应该 >= 0");
        
        int maxScore = analyzer.calculateEmotionalConnectionScore(100, 100, 1.0, 100);
        assertTrue(maxScore <= 100, "分数应该 <= 100");
    }
}
