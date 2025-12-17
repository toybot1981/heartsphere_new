package com.heartsphere.controller;

import com.heartsphere.entity.PaymentOrder;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 支付API
 */
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 创建支付订单
     */
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未授权，请先登录"));
        }
        
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(Map.of("error", "无效的认证信息"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        PaymentOrder order = paymentService.createOrder(
                userId,
                request.getPlanId(),
                request.getPaymentType()
        );

        PaymentOrderResponse response = new PaymentOrderResponse();
        response.setOrderNo(order.getOrderNo());
        response.setAmount(order.getAmount());
        response.setPaymentType(order.getPaymentType());
        response.setStatus(order.getStatus());
        response.setQrCodeUrl(order.getQrCodeUrl());
        response.setPaymentUrl(order.getPaymentUrl());
        response.setExpiresAt(order.getExpiresAt());

        return ResponseEntity.ok(response);
    }

    /**
     * 查询订单状态
     */
    @GetMapping("/order/{orderNo}")
    public ResponseEntity<PaymentOrderResponse> getOrder(@PathVariable String orderNo) {
        PaymentOrder order = paymentService.getOrder(orderNo);

        PaymentOrderResponse response = new PaymentOrderResponse();
        response.setOrderNo(order.getOrderNo());
        response.setAmount(order.getAmount());
        response.setPaymentType(order.getPaymentType());
        response.setStatus(order.getStatus());
        response.setQrCodeUrl(order.getQrCodeUrl());
        response.setPaymentUrl(order.getPaymentUrl());
        response.setExpiresAt(order.getExpiresAt());
        response.setPaidAt(order.getPaidAt());

        return ResponseEntity.ok(response);
    }

    /**
     * 微信支付回调
     */
    @PostMapping("/callback/wechat")
    public ResponseEntity<Map<String, String>> wechatCallback(@RequestBody Map<String, Object> notifyData) {
        // TODO: 验证签名，解析回调数据
        String orderNo = (String) notifyData.get("out_trade_no");
        String transactionId = (String) notifyData.get("transaction_id");

        paymentService.handlePaymentCallback(orderNo, transactionId, "wechat");

        return ResponseEntity.ok(Map.of("return_code", "SUCCESS", "return_msg", "OK"));
    }

    /**
     * 支付宝支付回调
     */
    @PostMapping("/callback/alipay")
    public ResponseEntity<String> alipayCallback(@RequestParam Map<String, String> params) {
        // TODO: 验证签名，解析回调数据
        String orderNo = params.get("out_trade_no");
        String transactionId = params.get("trade_no");

        paymentService.handlePaymentCallback(orderNo, transactionId, "alipay");

        return ResponseEntity.ok("success");
    }

    @Data
    public static class CreateOrderRequest {
        private Long planId;
        private String paymentType; // wechat, alipay
    }

    @Data
    public static class PaymentOrderResponse {
        private String orderNo;
        private java.math.BigDecimal amount;
        private String paymentType;
        private String status;
        private String qrCodeUrl;
        private String paymentUrl;
        private java.time.LocalDateTime expiresAt;
        private java.time.LocalDateTime paidAt;
    }
}

