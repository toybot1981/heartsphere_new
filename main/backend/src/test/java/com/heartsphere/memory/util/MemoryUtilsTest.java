package com.heartsphere.memory.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 敏感信息检测工具测试
 */
@DisplayName("SensitiveInfoDetector Tests")
class SensitiveInfoDetectorTest {
    
    private SensitiveInfoDetector detector;
    
    @BeforeEach
    void setUp() {
        detector = new SensitiveInfoDetector();
    }
    
    @Test
    @DisplayName("应该检测包含敏感词的内容")
    void testDetectSensitiveKeywords() {
        String content = "我的电话是 13800000000，请不要泄露";
        assertTrue(detector.hasSensitiveInfo(content), "应该检测到敏感关键词");
    }
    
    @Test
    @DisplayName("应该检测邮箱地址")
    void testDetectEmail() {
        String content = "我的邮箱是 user@example.com，请务必保密";
        assertTrue(detector.hasSensitiveInfo(content), "应该检测到邮箱地址");
    }
    
    @Test
    @DisplayName("应该检测身份证号")
    void testDetectIdCard() {
        String content = "身份证号：123456789012345678";
        assertTrue(detector.hasSensitiveInfo(content), "应该检测到身份证号");
    }
    
    @Test
    @DisplayName("应该检测高频第一人称")
    void testDetectFirstPersonPronouns() {
        String content = "我喜欢这个，我觉得很好，我认为应该这样做，我建议我们这样";
        assertTrue(detector.hasSensitiveInfo(content), "应该检测到高频第一人称");
    }
    
    @Test
    @DisplayName("应该允许通用内容")
    void testAllowGenericContent() {
        String content = "在投资理财时，风险管理是首要原则。投资者应该根据自身风险承受能力选择适当的资产配置。";
        assertFalse(detector.hasSensitiveInfo(content), "不应该标记通用内容为敏感");
    }
    
    @Test
    @DisplayName("空内容应该返回 false")
    void testEmptyContent() {
        assertFalse(detector.hasSensitiveInfo(""), "空字符串不应该被标记为敏感");
        assertFalse(detector.hasSensitiveInfo(null), "null 不应该被标记为敏感");
    }
}

/**
 * 相似度计算工具测试
 */
@DisplayName("SimilarityCalculator Tests")
class SimilarityCalculatorTest {
    
    private SimilarityCalculator calculator;
    
    @BeforeEach
    void setUp() {
        calculator = new SimilarityCalculator();
    }
    
    @Test
    @DisplayName("完全相同的文本相似度应该是 100%")
    void testIdenticalTexts() {
        double similarity = calculator.calculateSimilarity("投资", "投资");
        assertEquals(100.0, similarity, 1.0, "相同文本相似度应该接近 100");
    }
    
    @Test
    @DisplayName("完全不同的文本相似度应该接近 0%")
    void testCompletelyDifferentTexts() {
        double similarity = calculator.calculateSimilarity("苹果", "橙子");
        assertTrue(similarity < 50, "完全不同的文本相似度应该很低");
    }
    
    @Test
    @DisplayName("相似文本应该有高相似度")
    void testSimilarTexts() {
        double similarity = calculator.calculateSimilarity(
            "投资者应该分散投资以降低风险",
            "分散投资可以帮助投资者降低风险"
        );
        assertTrue(similarity > 60, "相似文本相似度应该较高");
    }
    
    @Test
    @DisplayName("支持中文分词")
    void testChineseText() {
        double similarity = calculator.calculateJaccardSimilarity(
            "财务规划很重要",
            "财务规划是重要的"
        );
        assertTrue(similarity > 50, "中文文本应该能正确计算相似度");
    }
}

/**
 * 经验等级计算工具测试
 */
@DisplayName("ExperienceLevelCalculator Tests")
class ExperienceLevelCalculatorTest {
    
    private ExperienceLevelCalculator calculator;
    
    @BeforeEach
    void setUp() {
        calculator = new ExperienceLevelCalculator();
    }
    
    @Test
    @DisplayName("0 个资产应该是新手等级")
    void testNoviceLevel() {
        var level = calculator.calculateLevel(0, 0);
        assertEquals(ExperienceLevelCalculator.ExperienceLevel.L1_NOVICE, level);
    }
    
    @Test
    @DisplayName("6 个资产且信任度 >= 60 应该是初级等级")
    void testBeginnerLevel() {
        var level = calculator.calculateLevel(10, 70);
        assertEquals(ExperienceLevelCalculator.ExperienceLevel.L2_BEGINNER, level);
    }
    
    @Test
    @DisplayName("25 个资产且信任度 >= 70 应该是中级等级")
    void testIntermediateLevel() {
        var level = calculator.calculateLevel(30, 75);
        assertEquals(ExperienceLevelCalculator.ExperienceLevel.L3_INTERMEDIATE, level);
    }
    
    @Test
    @DisplayName("应该检测等级晋升")
    void testLevelUp() {
        var oldLevel = calculator.calculateLevel(5, 50);
        var newLevel = calculator.calculateLevel(10, 70);
        assertTrue(calculator.isLevelUp(oldLevel, newLevel), "应该检测到晋升");
    }
    
    @Test
    @DisplayName("应该计算晋升进度")
    void testProgressPercentage() {
        int progress = calculator.getProgressPercentage(15, ExperienceLevelCalculator.ExperienceLevel.L2_BEGINNER);
        assertTrue(progress > 0 && progress < 100, "进度应该在 0-100 之间");
    }
}
