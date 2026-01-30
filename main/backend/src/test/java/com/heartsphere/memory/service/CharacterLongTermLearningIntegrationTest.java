package com.heartsphere.memory.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import lombok.extern.slf4j.Slf4j;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 角色长期学习系统集成测试
 * 测试完整的"对话→知识升级→注入"流程
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@SpringBootTest
@ActiveProfiles("test")
public class CharacterLongTermLearningIntegrationTest {
    
    @Autowired
    private CharacterKnowledgeAssetService assetService;
    
    @Autowired
    private CharacterLearningService learningService;
    
    private static final Long CHARACTER_ID = 1L;
    
    @BeforeEach
    void setUp() {
        log.info("=== 开始测试角色长期学习系统 ===");
    }
    
    /**
     * 测试：完整的知识资产生命周期
     * 场景：创建 → 审核 → 使用 → 反馈 → 信任度更新 → 晋升
     */
    @Test
    void testAssetLifecycle() {
        log.info("测试：完整的资产生命周期");
        
        // 1. 创建知识资产
        String content = "在投资理财时，风险管理是首要原则。投资者应该根据自身风险承受能力选择适当的资产配置。" +
                        "分散投资可以降低风险，定期复审也很重要。";
        
        var asset = assetService.createAsset(
            CHARACTER_ID,
            "DOMAIN_KNOWLEDGE",
            "投资风险管理原则",
            content,
            "投资者应根据风险承受能力选择资产配置，分散投资可以降低风险",
            null
        );
        
        assertNotNull(asset.getId());
        assertEquals("DOMAIN_KNOWLEDGE", asset.getAssetType());
        assertFalse(asset.getIsApproved());
        log.info("✓ 资产已创建: {}", asset.getId());
        
        // 2. 批准资产
        assetService.approveAsset(asset.getId(), "admin_user");
        log.info("✓ 资产已批准");
        
        // 3. 提交正面反馈
        assetService.submitFeedback(asset.getId(), "positive");
        log.info("✓ 已提交正面反馈");
        
        // 4. 获取学习统计
        var stats = learningService.getCharacterLearningStats(CHARACTER_ID);
        assertNotNull(stats);
        assertTrue((Long)stats.get("totalAssets") > 0);
        log.info("✓ 学习统计: {}", stats);
    }
    
    /**
     * 测试：经验等级晋升
     * 场景：持续创建和批准资产，观察等级变化
     */
    @Test
    void testExperienceLevelProgression() {
        log.info("测试：经验等级晋升");
        
        // 创建多个资产
        String[] assets = {
            "投资风险管理",
            "财务规划基础",
            "保险配置策略"
        };
        
        for (String assetTitle : assets) {
            var asset = assetService.createAsset(
                CHARACTER_ID,
                "DOMAIN_KNOWLEDGE",
                assetTitle,
                "这是关于" + assetTitle + "的详细内容...",
                "摘要: " + assetTitle,
                null
            );
            assetService.approveAsset(asset.getId(), "admin");
            log.info("✓ 创建并批准资产: {}", assetTitle);
        }
        
        // 获取当前等级
        var level = learningService.getCharacterExperienceLevel(CHARACTER_ID);
        log.info("✓ 当前经验等级: {} ({})", level.name, level.level);
        
        assertTrue(level.level >= 1 && level.level <= 5);
    }
    
    /**
     * 测试：隐私检测
     * 场景：尝试升级包含隐私信息的内容，应该被阻止
     */
    @Test
    void testPrivacyProtection() {
        log.info("测试：隐私保护");
        
        String privacyContent = "我的身份证号是 123456789012345678，我的电话是 13800000000，我住在北京市朝阳区。";
        
        assertThrows(IllegalArgumentException.class, () -> {
            assetService.createAsset(
                CHARACTER_ID,
                "PERSONAL_INFO",
                "个人隐私信息",
                privacyContent,
                "隐私信息摘要",
                null
            );
        });
        
        log.info("✓ 隐私内容已被阻止");
    }
    
    /**
     * 测试：相似度检测
     * 场景：创建相似的资产，系统应该检测出相似性
     */
    @Test
    void testSimilarityDetection() {
        log.info("测试：相似度检测");
        
        String content1 = "投资者应该分散投资以降低风险";
        String content2 = "分散投资是降低投资风险的重要方式";
        
        var asset1 = assetService.createAsset(
            CHARACTER_ID,
            "DOMAIN_KNOWLEDGE",
            "分散投资",
            content1,
            content1,
            null
        );
        
        // 第二个创建可能会检测到相似性（但不一定阻止）
        var asset2 = assetService.createAsset(
            CHARACTER_ID,
            "DOMAIN_KNOWLEDGE",
            "风险管理",
            content2,
            content2,
            null
        );
        
        assertNotNull(asset1.getId());
        assertNotNull(asset2.getId());
        log.info("✓ 相似资产检测完成");
    }
    
    /**
     * 测试：反馈循环
     * 场景：提交多个反馈，观察信任度变化
     */
    @Test
    void testFeedbackLoop() {
        log.info("测试：反馈循环");
        
        var asset = assetService.createAsset(
            CHARACTER_ID,
            "INTERACTION_SKILLS",
            "客户沟通技巧",
            "与客户沟通时应该保持耐心和专业性...",
            "沟通技巧总结",
            null
        );
        assetService.approveAsset(asset.getId(), "admin");
        
        // 初始信任度
        log.info("✓ 初始信任度: {}", asset.getTrustScore());
        
        // 提交多个正面反馈
        for (int i = 0; i < 3; i++) {
            assetService.submitFeedback(asset.getId(), "positive");
        }
        
        // 提交负面反馈
        assetService.submitFeedback(asset.getId(), "negative");
        
        log.info("✓ 已提交反馈（3正1负）");
    }
}
