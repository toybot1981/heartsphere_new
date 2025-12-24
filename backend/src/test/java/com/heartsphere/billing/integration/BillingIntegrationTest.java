package com.heartsphere.billing.integration;

import com.heartsphere.billing.entity.*;
import com.heartsphere.billing.repository.*;
import com.heartsphere.billing.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 计费系统集成测试
 * 测试完整的业务流程
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BillingIntegrationTest {

    @Autowired
    private AIProviderRepository providerRepository;

    @Autowired
    private AIModelRepository modelRepository;

    @Autowired
    private AIModelPricingRepository pricingRepository;

    @Autowired
    private UserTokenQuotaRepository quotaRepository;

    @Autowired
    private TokenQuotaTransactionRepository transactionRepository;

    @Autowired
    private AIUsageRecordRepository usageRecordRepository;

    @Autowired
    private TokenQuotaService tokenQuotaService;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private UsageRecordService usageRecordService;

    @Autowired
    private AIModelLookupService modelLookupService;

    private Long userId;
    private AIProvider provider;
    private AIModel model;
    private AIModelPricing inputPricing;
    private AIModelPricing outputPricing;

    @BeforeEach
    void setUp() {
        userId = 1L;

        // 创建提供商
        provider = new AIProvider();
        provider.setName("dashscope-integration-test");
        provider.setDisplayName("集成测试提供商");
        provider.setEnabled(true);
        provider = providerRepository.save(provider);

        // 创建模型
        model = new AIModel();
        model.setProviderId(provider.getId());
        model.setModelCode("qwen-max-integration");
        model.setModelName("集成测试模型");
        model.setModelType("text");
        model.setEnabled(true);
        model = modelRepository.save(model);

        // 创建输入Token资费
        inputPricing = new AIModelPricing();
        inputPricing.setModelId(model.getId());
        inputPricing.setPricingType("input_token");
        inputPricing.setUnitPrice(new BigDecimal("0.002"));
        inputPricing.setUnit("per_1k_tokens");
        inputPricing.setMinChargeUnit(BigDecimal.ZERO);
        inputPricing.setEffectiveDate(LocalDateTime.now().minusDays(1));
        inputPricing.setIsActive(true);
        inputPricing = pricingRepository.save(inputPricing);

        // 创建输出Token资费
        outputPricing = new AIModelPricing();
        outputPricing.setModelId(model.getId());
        outputPricing.setPricingType("output_token");
        outputPricing.setUnitPrice(new BigDecimal("0.008"));
        outputPricing.setUnit("per_1k_tokens");
        outputPricing.setMinChargeUnit(BigDecimal.ZERO);
        outputPricing.setEffectiveDate(LocalDateTime.now().minusDays(1));
        outputPricing.setIsActive(true);
        outputPricing = pricingRepository.save(outputPricing);
    }

    @Test
    void testCompleteBillingFlow() {
        // 1. 分配配额
        tokenQuotaService.grantQuota(userId, "text_token", 10000L, 
            "test", null, "测试分配");

        // 2. 验证配额已分配
        UserTokenQuota quota = tokenQuotaService.getUserQuota(userId);
        assertEquals(10000L, quota.getTextTokenTotal());

        // 3. 计算费用
        BigDecimal cost = pricingService.calculateTextGenerationCost(
            model.getId(), 1000, 2000);
        assertTrue(cost.compareTo(BigDecimal.ZERO) > 0);

        // 4. 扣除配额
        boolean success = tokenQuotaService.consumeQuota(userId, "text_token", 3000L);
        assertTrue(success);

        // 5. 验证配额已扣除
        quota = tokenQuotaService.getUserQuota(userId);
        assertTrue(quota.getTextTokenUsed() > 0 || quota.getTextTokenMonthlyUsed() > 0);

        // 6. 记录使用情况
        usageRecordService.recordTextGeneration(
            userId, provider.getId(), model.getId(),
            1000, 2000, 3000,
            cost, 3000L,
            true, null
        );

        // 7. 验证使用记录已保存
        long recordCount = usageRecordRepository.count();
        assertTrue(recordCount > 0);
    }

    @Test
    void testQuotaInsufficient() {
        // Given
        tokenQuotaService.grantQuota(userId, "text_token", 1000L, 
            "test", null, "少量配额");

        // When & Then
        boolean success = tokenQuotaService.consumeQuota(userId, "text_token", 2000L);
        assertFalse(success);
    }

    @Test
    void testFindModelId() {
        // When
        Optional<Long> modelIdOpt = modelLookupService.findModelId(
            provider.getName(), model.getModelCode());

        // Then
        assertTrue(modelIdOpt.isPresent());
        assertEquals(model.getId(), modelIdOpt.get());
    }

    @Test
    void testCalculateCostWithMinCharge() {
        // Given - 设置最低计费单位
        inputPricing.setMinChargeUnit(new BigDecimal("1")); // 最低1千Token
        inputPricing = pricingRepository.save(inputPricing);

        // When - 使用500Token，不足1千
        BigDecimal cost = pricingService.calculateTextGenerationCost(
            model.getId(), 500, 0);

        // Then - 应该按1千Token计费
        assertTrue(cost.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testMonthlyAndTotalQuota() {
        // Given - 分配总配额和月度配额
        tokenQuotaService.grantQuota(userId, "text_token", 10000L, 
            "test", null, "总配额");
        
        UserTokenQuota quota = tokenQuotaService.getUserQuota(userId);
        quota.setTextTokenMonthlyQuota(5000L);
        quotaRepository.save(quota);

        // When - 消耗超过月度配额
        boolean success = tokenQuotaService.consumeQuota(userId, "text_token", 7000L);

        // Then - 应该成功，先用月度配额，再用总配额
        assertTrue(success);
        quota = tokenQuotaService.getUserQuota(userId);
        assertEquals(5000L, quota.getTextTokenMonthlyUsed()); // 月度配额用尽
        assertTrue(quota.getTextTokenUsed() > 0); // 使用了总配额
    }

    @Test
    void testTransactionRecord() {
        // Given
        long initialTransactionCount = transactionRepository.count();

        // When
        tokenQuotaService.grantQuota(userId, "text_token", 1000L, 
            "test", 1L, "测试记录");

        // Then
        long finalTransactionCount = transactionRepository.count();
        assertEquals(initialTransactionCount + 1, finalTransactionCount);

        Optional<TokenQuotaTransaction> transactionOpt = transactionRepository
            .findById(transactionRepository.findAll().get(transactionRepository.findAll().size() - 1).getId());
        assertTrue(transactionOpt.isPresent());
        TokenQuotaTransaction transaction = transactionOpt.get();
        assertEquals("grant", transaction.getTransactionType());
        assertEquals(1000L, transaction.getAmount());
    }
}

