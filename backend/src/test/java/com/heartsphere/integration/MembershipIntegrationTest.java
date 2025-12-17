package com.heartsphere.integration;

import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.MembershipRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
import com.heartsphere.service.MembershipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.heartsphere.repository.PointTransactionRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 会员服务集成测试
 */
@DataJpaTest
@ActiveProfiles("test")
@Import(MembershipService.class)
class MembershipIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private MembershipService membershipService;

    private SubscriptionPlan testPlan;

    @BeforeEach
    void setUp() {
        // 创建测试计划
        testPlan = new SubscriptionPlan();
        testPlan.setName("测试计划");
        testPlan.setType("premium");
        testPlan.setBillingCycle("monthly");
        testPlan.setPrice(new BigDecimal("649.00"));
        testPlan.setPointsPerMonth(15000);
        testPlan.setIsActive(true);
        testPlan = entityManager.persistAndFlush(testPlan);
    }

    @Test
    void testCreateAndRetrieveMembership() {
        // Given
        Long userId = 1L;

        // When
        Membership membership = membershipService.activateMembership(
                userId, testPlan.getId(), "monthly");

        // Then
        assertNotNull(membership.getId());
        assertEquals(userId, membership.getUserId());
        assertEquals(testPlan.getId(), membership.getPlanId());
        assertEquals("premium", membership.getPlanType());
        assertEquals("active", membership.getStatus());

        // 验证可以从数据库检索
        Optional<Membership> retrieved = membershipRepository.findByUserId(userId);
        assertTrue(retrieved.isPresent());
        assertEquals(membership.getId(), retrieved.get().getId());
    }

    @Test
    void testAddAndUsePoints() {
        // Given
        Long userId = 1L;
        Membership membership = membershipService.activateMembership(
                userId, testPlan.getId(), "monthly");
        Long membershipId = membership.getId();

        // When - 添加积分
        membershipService.addPoints(userId, membershipId, 1000, "测试积分", null);

        // Then
        Membership updated = membershipRepository.findByUserId(userId).orElseThrow();
        assertEquals(15000 + 1000, updated.getCurrentPoints()); // 初始15000 + 1000

        // When - 使用积分
        boolean success = membershipService.usePoints(userId, 500, "使用积分");

        // Then
        assertTrue(success);
        Membership afterUse = membershipRepository.findByUserId(userId).orElseThrow();
        assertEquals(15000 + 1000 - 500, afterUse.getCurrentPoints());
    }

    @Test
    void testUsePoints_Insufficient() {
        // Given
        Long userId = 1L;
        membershipService.activateMembership(userId, testPlan.getId(), "monthly");

        // When
        boolean success = membershipService.usePoints(userId, 20000, "使用积分");

        // Then
        assertFalse(success);
    }
}

