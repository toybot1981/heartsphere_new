package com.heartsphere.service;

import com.heartsphere.entity.PaymentOrder;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.PaymentOrderRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 支付服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentOrderRepository orderRepository;
    private final SubscriptionPlanRepository planRepository;
    private final MembershipService membershipService;

    /**
     * 创建支付订单
     */
    @Transactional
    public PaymentOrder createOrder(Long userId, Long planId, String paymentType) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("订阅计划不存在"));

        // 生成订单号
        String orderNo = generateOrderNo();

        // 创建订单
        PaymentOrder order = new PaymentOrder();
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setPlanId(planId);
        order.setPaymentType(paymentType);
        order.setAmount(plan.getPrice());
        order.setStatus("pending");
        order.setExpiresAt(LocalDateTime.now().plusMinutes(30)); // 30分钟过期

        PaymentOrder saved = orderRepository.save(order);

        // 调用支付接口获取支付二维码（暂时使用模拟数据，后续集成真实支付SDK）
        try {
            // TODO: 集成微信支付和支付宝SDK
            // 暂时返回模拟的二维码URL
            if ("wechat".equals(paymentType)) {
                saved.setQrCodeUrl("https://api.example.com/qrcode/wechat/" + orderNo);
                saved.setPaymentUrl("weixin://wxpay/bizpayurl?pr=" + orderNo);
            } else if ("alipay".equals(paymentType)) {
                saved.setQrCodeUrl("https://api.example.com/qrcode/alipay/" + orderNo);
                saved.setPaymentUrl("https://mapi.alipay.com/gateway.do?order=" + orderNo);
            }
            orderRepository.save(saved);
        } catch (Exception e) {
            log.error("创建支付订单失败", e);
            saved.setStatus("failed");
            orderRepository.save(saved);
            throw new RuntimeException("创建支付订单失败: " + e.getMessage());
        }

        return saved;
    }

    /**
     * 查询订单状态
     */
    public PaymentOrder getOrder(String orderNo) {
        return orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
    }

    /**
     * 处理支付回调
     */
    @Transactional
    public void handlePaymentCallback(String orderNo, String transactionId, String paymentType) {
        PaymentOrder order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!"pending".equals(order.getStatus())) {
            log.warn("订单状态不是pending，忽略回调: orderNo={}, status={}", orderNo, order.getStatus());
            return;
        }

        order.setStatus("paid");
        order.setTransactionId(transactionId);
        order.setPaymentProvider(paymentType);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);

        // 激活会员
        membershipService.activateMembership(
                order.getUserId(),
                order.getPlanId(),
                planRepository.findById(order.getPlanId())
                        .map(SubscriptionPlan::getBillingCycle)
                        .orElse("monthly")
        );

        log.info("支付成功，会员已激活: orderNo={}, userId={}", orderNo, order.getUserId());
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        return "HS" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

