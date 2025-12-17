package com.heartsphere.service;

import com.heartsphere.entity.PaymentOrder;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.PaymentOrderRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
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
import static org.mockito.Mockito.*;

/**
 * 支付服务测试
 */
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentOrderRepository orderRepository;

    @Mock
    private SubscriptionPlanRepository planRepository;

    @Mock
    private MembershipService membershipService;

    @InjectMocks
    private PaymentService paymentService;

    private SubscriptionPlan premiumPlan;
    private PaymentOrder existingOrder;

    @BeforeEach
    void setUp() {
        premiumPlan = new SubscriptionPlan();
        premiumPlan.setId(4L);
        premiumPlan.setName("高级会员");
        premiumPlan.setType("premium");
        premiumPlan.setBillingCycle("continuous_yearly");
        premiumPlan.setPrice(new BigDecimal("5199.00"));
        premiumPlan.setIsActive(true);

        existingOrder = new PaymentOrder();
        existingOrder.setId(1L);
        existingOrder.setOrderNo("HS1234567890");
        existingOrder.setUserId(1L);
        existingOrder.setPlanId(4L);
        existingOrder.setPaymentType("wechat");
        existingOrder.setAmount(new BigDecimal("5199.00"));
        existingOrder.setStatus("pending");
        existingOrder.setExpiresAt(LocalDateTime.now().plusMinutes(30));
    }

    @Test
    void testCreateOrder_WeChat() {
        // Given
        Long userId = 1L;
        Long planId = 4L;
        String paymentType = "wechat";

        when(planRepository.findById(planId))
                .thenReturn(Optional.of(premiumPlan));
        when(orderRepository.save(any(PaymentOrder.class)))
                .thenAnswer(invocation -> {
                    PaymentOrder order = invocation.getArgument(0);
                    order.setId(1L);
                    order.setOrderNo("HS1234567890");
                    order.setQrCodeUrl("https://api.example.com/qrcode/wechat/HS1234567890");
                    return order;
                });

        // When
        PaymentOrder result = paymentService.createOrder(userId, planId, paymentType);

        // Then
        assertNotNull(result);
        assertNotNull(result.getOrderNo());
        assertEquals(userId, result.getUserId());
        assertEquals(planId, result.getPlanId());
        assertEquals(paymentType, result.getPaymentType());
        assertEquals("pending", result.getStatus());
        assertNotNull(result.getQrCodeUrl());
        verify(orderRepository, atLeastOnce()).save(any(PaymentOrder.class));
    }

    @Test
    void testCreateOrder_Alipay() {
        // Given
        Long userId = 1L;
        Long planId = 4L;
        String paymentType = "alipay";

        when(planRepository.findById(planId))
                .thenReturn(Optional.of(premiumPlan));
        when(orderRepository.save(any(PaymentOrder.class)))
                .thenAnswer(invocation -> {
                    PaymentOrder order = invocation.getArgument(0);
                    order.setId(1L);
                    order.setOrderNo("HS1234567890");
                    order.setQrCodeUrl("https://api.example.com/qrcode/alipay/HS1234567890");
                    return order;
                });

        // When
        PaymentOrder result = paymentService.createOrder(userId, planId, paymentType);

        // Then
        assertNotNull(result);
        assertEquals(paymentType, result.getPaymentType());
        assertNotNull(result.getQrCodeUrl());
        verify(orderRepository, atLeastOnce()).save(any(PaymentOrder.class));
    }

    @Test
    void testCreateOrder_PlanNotFound() {
        // Given
        Long userId = 1L;
        Long planId = 999L;
        String paymentType = "wechat";

        when(planRepository.findById(planId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            paymentService.createOrder(userId, planId, paymentType);
        });
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testGetOrder() {
        // Given
        String orderNo = "HS1234567890";
        when(orderRepository.findByOrderNo(orderNo))
                .thenReturn(Optional.of(existingOrder));

        // When
        PaymentOrder result = paymentService.getOrder(orderNo);

        // Then
        assertNotNull(result);
        assertEquals(orderNo, result.getOrderNo());
        verify(orderRepository).findByOrderNo(orderNo);
    }

    @Test
    void testGetOrder_NotFound() {
        // Given
        String orderNo = "HS9999999999";
        when(orderRepository.findByOrderNo(orderNo))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            paymentService.getOrder(orderNo);
        });
    }

    @Test
    void testHandlePaymentCallback() {
        // Given
        String orderNo = "HS1234567890";
        String transactionId = "WX1234567890";
        String paymentType = "wechat";

        when(orderRepository.findByOrderNo(orderNo))
                .thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(PaymentOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(planRepository.findById(anyLong()))
                .thenReturn(Optional.of(premiumPlan));
        when(membershipService.activateMembership(anyLong(), anyLong(), anyString()))
                .thenReturn(new com.heartsphere.entity.Membership());

        // When
        paymentService.handlePaymentCallback(orderNo, transactionId, paymentType);

        // Then
        verify(orderRepository).save(any(PaymentOrder.class));
        verify(membershipService).activateMembership(anyLong(), anyLong(), anyString());
    }

    @Test
    void testHandlePaymentCallback_OrderNotPending() {
        // Given
        String orderNo = "HS1234567890";
        String transactionId = "WX1234567890";
        String paymentType = "wechat";

        existingOrder.setStatus("paid");
        when(orderRepository.findByOrderNo(orderNo))
                .thenReturn(Optional.of(existingOrder));

        // When
        paymentService.handlePaymentCallback(orderNo, transactionId, paymentType);

        // Then
        verify(orderRepository, never()).save(any());
        verify(membershipService, never()).activateMembership(anyLong(), anyLong(), anyString());
    }
}

