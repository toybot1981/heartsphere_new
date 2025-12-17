package com.heartsphere.service;

import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.MembershipRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
import com.heartsphere.repository.PointTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 会员服务测试
 */
@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private SubscriptionPlanRepository planRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @InjectMocks
    private MembershipService membershipService;

    // Helper method to create a spy for testing addPoints
    private MembershipService createSpy() {
        return spy(membershipService);
    }

    private SubscriptionPlan freePlan;
    private SubscriptionPlan premiumPlan;
    private Membership existingMembership;

    @BeforeEach
    void setUp() {
        // 创建免费计划
        freePlan = new SubscriptionPlan();
        freePlan.setId(1L);
        freePlan.setName("免费");
        freePlan.setType("free");
        freePlan.setBillingCycle("monthly");
        freePlan.setPrice(BigDecimal.ZERO);
        freePlan.setPointsPerMonth(0);
        freePlan.setIsActive(true);

        // 创建高级会员计划
        premiumPlan = new SubscriptionPlan();
        premiumPlan.setId(4L);
        premiumPlan.setName("高级会员");
        premiumPlan.setType("premium");
        premiumPlan.setBillingCycle("continuous_yearly");
        premiumPlan.setPrice(new BigDecimal("5199.00"));
        premiumPlan.setPointsPerMonth(15000);
        premiumPlan.setMaxImagesPerMonth(60000);
        premiumPlan.setMaxVideosPerMonth(3000);
        premiumPlan.setIsActive(true);

        // 创建现有会员
        existingMembership = new Membership();
        existingMembership.setId(1L);
        existingMembership.setUserId(1L);
        existingMembership.setPlanId(1L);
        existingMembership.setPlanType("free");
        existingMembership.setBillingCycle("monthly");
        existingMembership.setStatus("active");
        existingMembership.setStartDate(LocalDateTime.now().minusMonths(1));
        existingMembership.setCurrentPoints(100);
        existingMembership.setTotalPointsEarned(100);
        existingMembership.setTotalPointsUsed(0);
    }

    @Test
    void testGetUserMembership_WhenExists() {
        // Given
        Long userId = 1L;
        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.of(existingMembership));

        // When
        Optional<Membership> result = membershipService.getUserMembership(userId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(existingMembership.getId(), result.get().getId());
        verify(membershipRepository).findByUserId(userId);
    }

    @Test
    void testGetUserMembership_WhenNotExists() {
        // Given
        Long userId = 999L;
        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.empty());

        // When
        Optional<Membership> result = membershipService.getUserMembership(userId);

        // Then
        assertFalse(result.isPresent());
        verify(membershipRepository).findByUserId(userId);
    }

    @Test
    void testGetOrCreateFreeMembership_WhenExists() {
        // Given
        Long userId = 1L;
        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.of(existingMembership));

        // When
        Membership result = membershipService.getOrCreateFreeMembership(userId);

        // Then
        assertNotNull(result);
        assertEquals(existingMembership.getId(), result.getId());
        verify(membershipRepository, never()).save(any());
    }

    @Test
    void testGetOrCreateFreeMembership_WhenNotExists() {
        // Given
        Long userId = 999L;
        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.empty());
        when(planRepository.findByTypeAndIsActiveTrueOrderBySortOrderAsc("free"))
                .thenReturn(java.util.List.of(freePlan));
        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation -> {
                    Membership m = invocation.getArgument(0);
                    m.setId(2L);
                    return m;
                });

        // When
        Membership result = membershipService.getOrCreateFreeMembership(userId);

        // Then
        assertNotNull(result);
        assertEquals("free", result.getPlanType());
        assertEquals("monthly", result.getBillingCycle());
        assertEquals("active", result.getStatus());
        verify(membershipRepository).save(any(Membership.class));
    }

    @Test
    void testActivateMembership_Monthly() {
        // Given
        Long userId = 1L;
        Long planId = 4L;
        String billingCycle = "monthly";

        Membership savedMembership = new Membership();
        savedMembership.setId(2L);
        savedMembership.setUserId(userId);
        savedMembership.setCurrentPoints(0);
        savedMembership.setTotalPointsEarned(0);

        when(planRepository.findById(planId))
                .thenReturn(Optional.of(premiumPlan));
        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.empty())  // First call in activateMembership
                .thenReturn(Optional.of(savedMembership));  // Second call in addPoints
        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation -> {
                    Membership m = invocation.getArgument(0);
                    m.setId(2L);
                    return m;
                });
        when(pointTransactionRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Membership result = membershipService.activateMembership(userId, planId, billingCycle);

        // Then
        assertNotNull(result);
        assertEquals("premium", result.getPlanType());
        assertEquals("monthly", result.getBillingCycle());
        assertEquals("active", result.getStatus());
        assertNotNull(result.getEndDate());
        assertFalse(result.getAutoRenew());
        verify(membershipRepository, atLeastOnce()).save(any(Membership.class));
    }

    @Test
    void testActivateMembership_ContinuousYearly() {
        // Given
        Long userId = 1L;
        Long planId = 4L;
        String billingCycle = "continuous_yearly";

        Membership savedMembership = new Membership();
        savedMembership.setId(2L);
        savedMembership.setUserId(userId);
        savedMembership.setCurrentPoints(0);
        savedMembership.setTotalPointsEarned(0);

        when(planRepository.findById(planId))
                .thenReturn(Optional.of(premiumPlan));
        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.empty())  // First call in activateMembership
                .thenReturn(Optional.of(savedMembership));  // Second call in addPoints
        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation -> {
                    Membership m = invocation.getArgument(0);
                    m.setId(2L);
                    return m;
                });
        when(pointTransactionRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Membership result = membershipService.activateMembership(userId, planId, billingCycle);

        // Then
        assertNotNull(result);
        assertEquals("premium", result.getPlanType());
        assertEquals("continuous_yearly", result.getBillingCycle());
        assertEquals("active", result.getStatus());
        assertNull(result.getEndDate());
        assertTrue(result.getAutoRenew());
        assertNotNull(result.getNextRenewalDate());
        verify(membershipRepository, atLeastOnce()).save(any(Membership.class));
    }

    @Test
    void testAddPoints() {
        // Given
        Long userId = 1L;
        Long membershipId = 1L;
        Integer points = 1000;
        String description = "测试积分";

        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.of(existingMembership));
        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation -> {
                    Membership m = invocation.getArgument(0);
                    // 更新积分
                    m.setCurrentPoints(existingMembership.getCurrentPoints() + points);
                    m.setTotalPointsEarned(existingMembership.getTotalPointsEarned() + points);
                    return m;
                });
        when(pointTransactionRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        membershipService.addPoints(userId, membershipId, points, description, null);

        // Then
        verify(membershipRepository).save(any(Membership.class));
        verify(pointTransactionRepository).save(any());
    }

    @Test
    void testUsePoints_Success() {
        // Given
        Long userId = 1L;
        Integer points = 50;
        String description = "使用积分";

        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.of(existingMembership));
        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(pointTransactionRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        boolean result = membershipService.usePoints(userId, points, description);

        // Then
        assertTrue(result);
        verify(membershipRepository).save(any(Membership.class));
        verify(pointTransactionRepository).save(any());
    }

    @Test
    void testUsePoints_InsufficientPoints() {
        // Given
        Long userId = 1L;
        Integer points = 200; // 超过现有积分
        String description = "使用积分";

        when(membershipRepository.findByUserId(userId))
                .thenReturn(Optional.of(existingMembership));

        // When
        boolean result = membershipService.usePoints(userId, points, description);

        // Then
        assertFalse(result);
        verify(membershipRepository, never()).save(any());
    }

    @Test
    void testGetAllPlans() {
        // Given
        when(planRepository.findByIsActiveTrueOrderBySortOrderAsc())
                .thenReturn(java.util.List.of(freePlan, premiumPlan));

        // When
        var result = membershipService.getAllPlans();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(planRepository).findByIsActiveTrueOrderBySortOrderAsc();
    }
}

