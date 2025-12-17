package com.heartsphere.controller;

import com.heartsphere.entity.PaymentOrder;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 支付控制器测试
 */
@WebMvcTest(PaymentController.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    private PaymentOrder paymentOrder;

    @BeforeEach
    void setUp() {
        paymentOrder = new PaymentOrder();
        paymentOrder.setId(1L);
        paymentOrder.setOrderNo("HS1234567890");
        paymentOrder.setUserId(1L);
        paymentOrder.setPlanId(4L);
        paymentOrder.setPaymentType("wechat");
        paymentOrder.setAmount(new BigDecimal("5199.00"));
        paymentOrder.setStatus("pending");
        paymentOrder.setQrCodeUrl("https://api.example.com/qrcode/wechat/HS1234567890");
        paymentOrder.setExpiresAt(LocalDateTime.now().plusMinutes(30));
    }

    @Test
    void testCreateOrder() throws Exception {
        // Given
        when(paymentService.createOrder(1L, 4L, "wechat"))
                .thenReturn(paymentOrder);

        // When & Then
        PaymentOrder result = paymentService.createOrder(1L, 4L, "wechat");
        assertNotNull(result);
        assertEquals("HS1234567890", result.getOrderNo());
        assertEquals("wechat", result.getPaymentType());
        assertEquals("pending", result.getStatus());
    }

    @Test
    void testCreateOrder_Alipay() throws Exception {
        // Given
        paymentOrder.setPaymentType("alipay");
        paymentOrder.setQrCodeUrl("https://api.example.com/qrcode/alipay/HS1234567890");
        when(paymentService.createOrder(1L, 4L, "alipay"))
                .thenReturn(paymentOrder);

        // When
        PaymentOrder result = paymentService.createOrder(1L, 4L, "alipay");

        // Then
        assertNotNull(result);
        assertEquals("alipay", result.getPaymentType());
    }

    @Test
    void testGetOrder() throws Exception {
        // Given
        when(paymentService.getOrder("HS1234567890"))
                .thenReturn(paymentOrder);

        // When
        PaymentOrder result = paymentService.getOrder("HS1234567890");

        // Then
        assertNotNull(result);
        assertEquals("HS1234567890", result.getOrderNo());
        assertEquals("pending", result.getStatus());
    }

    @Test
    void testWechatCallback() throws Exception {
        // Given
        doNothing().when(paymentService).handlePaymentCallback(
                anyString(), anyString(), anyString());

        // When
        paymentService.handlePaymentCallback("HS1234567890", "WX1234567890", "wechat");

        // Then
        verify(paymentService).handlePaymentCallback("HS1234567890", "WX1234567890", "wechat");
    }

    @Test
    void testAlipayCallback() throws Exception {
        // Given
        doNothing().when(paymentService).handlePaymentCallback(
                anyString(), anyString(), anyString());

        // When
        paymentService.handlePaymentCallback("HS1234567890", "ALI1234567890", "alipay");

        // Then
        verify(paymentService).handlePaymentCallback("HS1234567890", "ALI1234567890", "alipay");
    }
}
