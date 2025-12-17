package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SubscriptionPlanDTO;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.SubscriptionPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminSubscriptionPlanServiceTest {

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @InjectMocks
    private AdminSubscriptionPlanService adminSubscriptionPlanService;

    private SubscriptionPlan testPlan;
    private SubscriptionPlanDTO testPlanDTO;

    @BeforeEach
    void setUp() {
        testPlan = new SubscriptionPlan();
        testPlan.setId(1L);
        testPlan.setName("测试会员");
        testPlan.setType("basic");
        testPlan.setBillingCycle("monthly");
        testPlan.setPrice(new BigDecimal("99.00"));
        testPlan.setOriginalPrice(new BigDecimal("129.00"));
        testPlan.setDiscountPercent(23);
        testPlan.setPointsPerMonth(100);
        testPlan.setMaxImagesPerMonth(100);
        testPlan.setMaxVideosPerMonth(10);
        testPlan.setMaxTextGenerationsPerMonth(1000);
        testPlan.setMaxAudioGenerationsPerMonth(500);
        testPlan.setAllowedAiModels("[\"qwen3-max\", \"gpt-4\"]");
        testPlan.setMaxImageResolution("2k");
        testPlan.setMaxVideoDuration(60);
        testPlan.setAllowPriorityQueue(true);
        testPlan.setAllowWatermarkRemoval(true);
        testPlan.setAllowBatchProcessing(false);
        testPlan.setAllowApiAccess(true);
        testPlan.setMaxApiCallsPerDay(10000);
        testPlan.setAiBenefits("{\"text\": {\"maxTokens\": 4000}, \"image\": {\"maxResolution\": \"2k\"}}");
        testPlan.setFeatures("[\"功能1\", \"功能2\"]");
        testPlan.setIsActive(true);
        testPlan.setSortOrder(1);
        testPlan.setCreatedAt(LocalDateTime.now());
        testPlan.setUpdatedAt(LocalDateTime.now());

        testPlanDTO = new SubscriptionPlanDTO();
        testPlanDTO.setName("测试会员");
        testPlanDTO.setType("basic");
        testPlanDTO.setBillingCycle("monthly");
        testPlanDTO.setPrice(new BigDecimal("99.00"));
        testPlanDTO.setOriginalPrice(new BigDecimal("129.00"));
        testPlanDTO.setDiscountPercent(23);
        testPlanDTO.setPointsPerMonth(100);
        testPlanDTO.setMaxImagesPerMonth(100);
        testPlanDTO.setMaxVideosPerMonth(10);
        testPlanDTO.setMaxTextGenerationsPerMonth(1000);
        testPlanDTO.setMaxAudioGenerationsPerMonth(500);
        testPlanDTO.setAllowedAiModels("[\"qwen3-max\", \"gpt-4\"]");
        testPlanDTO.setMaxImageResolution("2k");
        testPlanDTO.setMaxVideoDuration(60);
        testPlanDTO.setAllowPriorityQueue(true);
        testPlanDTO.setAllowWatermarkRemoval(true);
        testPlanDTO.setAllowBatchProcessing(false);
        testPlanDTO.setAllowApiAccess(true);
        testPlanDTO.setMaxApiCallsPerDay(10000);
        testPlanDTO.setAiBenefits("{\"text\": {\"maxTokens\": 4000}, \"image\": {\"maxResolution\": \"2k\"}}");
        testPlanDTO.setFeatures("[\"功能1\", \"功能2\"]");
        testPlanDTO.setIsActive(true);
        testPlanDTO.setSortOrder(1);
    }

    @Test
    void testGetAllPlans() {
        // Given
        List<SubscriptionPlan> plans = Arrays.asList(testPlan);
        when(subscriptionPlanRepository.findAll()).thenReturn(plans);

        // When
        List<SubscriptionPlanDTO> result = adminSubscriptionPlanService.getAllPlans();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("测试会员", result.get(0).getName());
        verify(subscriptionPlanRepository, times(1)).findAll();
    }

    @Test
    void testGetPlanById_Success() {
        // Given
        when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));

        // When
        SubscriptionPlanDTO result = adminSubscriptionPlanService.getPlanById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("测试会员", result.getName());
        assertEquals("basic", result.getType());
        verify(subscriptionPlanRepository, times(1)).findById(1L);
    }

    @Test
    void testGetPlanById_NotFound() {
        // Given
        when(subscriptionPlanRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            adminSubscriptionPlanService.getPlanById(999L);
        });
        verify(subscriptionPlanRepository, times(1)).findById(999L);
    }

    @Test
    void testCreatePlan() {
        // Given
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(invocation -> {
            SubscriptionPlan plan = invocation.getArgument(0);
            plan.setId(1L);
            plan.setCreatedAt(LocalDateTime.now());
            plan.setUpdatedAt(LocalDateTime.now());
            return plan;
        });

        // When
        SubscriptionPlanDTO result = adminSubscriptionPlanService.createPlan(testPlanDTO);

        // Then
        assertNotNull(result);
        assertEquals("测试会员", result.getName());
        assertEquals("basic", result.getType());
        assertEquals(new BigDecimal("99.00"), result.getPrice());
        assertEquals(1000, result.getMaxTextGenerationsPerMonth());
        assertEquals(500, result.getMaxAudioGenerationsPerMonth());
        assertTrue(result.getAllowPriorityQueue());
        assertTrue(result.getAllowWatermarkRemoval());
        assertTrue(result.getAllowApiAccess());
        verify(subscriptionPlanRepository, times(1)).save(any(SubscriptionPlan.class));
    }

    @Test
    void testCreatePlan_WithDefaults() {
        // Given
        SubscriptionPlanDTO dto = new SubscriptionPlanDTO();
        dto.setName("新会员");
        dto.setType("premium");
        dto.setBillingCycle("yearly");
        dto.setPrice(new BigDecimal("199.00"));
        // 不设置其他字段，测试默认值

        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(invocation -> {
            SubscriptionPlan plan = invocation.getArgument(0);
            plan.setId(2L);
            plan.setCreatedAt(LocalDateTime.now());
            plan.setUpdatedAt(LocalDateTime.now());
            return plan;
        });

        // When
        SubscriptionPlanDTO result = adminSubscriptionPlanService.createPlan(dto);

        // Then
        assertNotNull(result);
        assertEquals("新会员", result.getName());
        assertEquals(0, result.getPointsPerMonth()); // 默认值
        assertFalse(result.getAllowPriorityQueue()); // 默认值
        assertFalse(result.getAllowWatermarkRemoval()); // 默认值
        assertFalse(result.getAllowBatchProcessing()); // 默认值
        assertFalse(result.getAllowApiAccess()); // 默认值
        assertTrue(result.getIsActive()); // 默认值
        assertEquals(0, result.getSortOrder()); // 默认值
        verify(subscriptionPlanRepository, times(1)).save(any(SubscriptionPlan.class));
    }

    @Test
    void testUpdatePlan_Success() {
        // Given
        when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenAnswer(invocation -> {
            SubscriptionPlan plan = invocation.getArgument(0);
            plan.setUpdatedAt(LocalDateTime.now());
            return plan;
        });

        testPlanDTO.setName("更新后的会员");
        testPlanDTO.setPrice(new BigDecimal("149.00"));
        testPlanDTO.setMaxTextGenerationsPerMonth(2000);

        // When
        SubscriptionPlanDTO result = adminSubscriptionPlanService.updatePlan(1L, testPlanDTO);

        // Then
        assertNotNull(result);
        assertEquals("更新后的会员", result.getName());
        assertEquals(new BigDecimal("149.00"), result.getPrice());
        assertEquals(2000, result.getMaxTextGenerationsPerMonth());
        verify(subscriptionPlanRepository, times(1)).findById(1L);
        verify(subscriptionPlanRepository, times(1)).save(any(SubscriptionPlan.class));
    }

    @Test
    void testUpdatePlan_NotFound() {
        // Given
        when(subscriptionPlanRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            adminSubscriptionPlanService.updatePlan(999L, testPlanDTO);
        });
        verify(subscriptionPlanRepository, times(1)).findById(999L);
        verify(subscriptionPlanRepository, never()).save(any(SubscriptionPlan.class));
    }

    @Test
    void testDeletePlan_Success() {
        // Given
        when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenReturn(testPlan);

        // When
        adminSubscriptionPlanService.deletePlan(1L);

        // Then
        assertFalse(testPlan.getIsActive());
        verify(subscriptionPlanRepository, times(1)).findById(1L);
        verify(subscriptionPlanRepository, times(1)).save(testPlan);
    }

    @Test
    void testDeletePlan_NotFound() {
        // Given
        when(subscriptionPlanRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            adminSubscriptionPlanService.deletePlan(999L);
        });
        verify(subscriptionPlanRepository, times(1)).findById(999L);
        verify(subscriptionPlanRepository, never()).save(any(SubscriptionPlan.class));
    }
}

