package com.heartsphere.controller;

import com.heartsphere.entity.PaymentOrder;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 支付API
 */
@Slf4j
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
     * 微信支付回调（v3接口）
     */
    @PostMapping("/callback/wechat")
    public ResponseEntity<Map<String, String>> wechatCallback(
            @RequestHeader(value = "Wechatpay-Signature", required = false) String signature,
            @RequestHeader(value = "Wechatpay-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "Wechatpay-Nonce", required = false) String nonce,
            @RequestHeader(value = "Wechatpay-Serial", required = false) String serial,
            @RequestBody String body) {
        try {
            // TODO: 验证签名
            // 解析回调数据（JSON格式）
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> notifyData = mapper.readValue(body, Map.class);
            
            // 获取订单信息
            @SuppressWarnings("unchecked")
            Map<String, Object> resource = (Map<String, Object>) notifyData.get("resource");
            if (resource != null) {
                // TODO: 解密resource.ciphertext获取订单信息
                // 微信支付v3的回调数据是加密的，需要使用AES-256-GCM解密
                // 解密步骤：
                // 1. 使用API v3密钥解密ciphertext
                // 2. 从解密后的数据中获取out_trade_no和transaction_id
                
                // 临时处理：尝试从通知数据中获取订单号
                // 实际应该从解密后的resource中获取
                String orderNo = (String) notifyData.get("out_trade_no");
                String transactionId = (String) notifyData.get("transaction_id");
                
                // 如果通知数据中没有，需要解密resource获取
                if (orderNo == null && resource.containsKey("ciphertext")) {
                    // TODO: 实现AES-256-GCM解密
                    log.warn("微信支付回调数据需要解密，当前使用临时处理方式。请尽快实现解密逻辑。");
                }
                
                if (orderNo != null && transactionId != null) {
                    paymentService.handlePaymentCallback(orderNo, transactionId, "wechat");
                } else {
                    log.warn("微信支付回调中未找到订单号或交易号，请检查解密逻辑");
                }
            }
            
            return ResponseEntity.ok(Map.of("code", "SUCCESS", "message", "成功"));
        } catch (Exception e) {
            log.error("处理微信支付回调失败", e);
            return ResponseEntity.ok(Map.of("code", "FAIL", "message", "处理失败"));
        }
    }

    /**
     * 支付宝支付回调
     */
    @PostMapping("/callback/alipay")
    public ResponseEntity<String> alipayCallback(@RequestParam Map<String, String> params) {
        // TODO: 验证签名，解析回调数据
        String orderNo = params.get("out_trade_no");
        String transactionId = params.get("trade_no");
        String tradeStatus = params.get("trade_status");

        // 只处理支付成功的回调
        if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
            paymentService.handlePaymentCallback(orderNo, transactionId, "alipay");
        }

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

