package com.heartsphere.service;

import com.heartsphere.entity.PaymentOrder;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.payment.entity.PaymentConfig;
import com.heartsphere.payment.service.AlipayPaymentService;
import com.heartsphere.payment.service.PaymentConfigService;
import com.heartsphere.payment.service.WechatPaymentService;
import com.heartsphere.repository.PaymentOrderRepository;
import com.heartsphere.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final AlipayPaymentService alipayPaymentService;
    private final WechatPaymentService wechatPaymentService;
    private final PaymentConfigService paymentConfigService;

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

        // 调用支付接口获取支付二维码或支付URL
        try {
            if ("alipay".equals(paymentType)) {
                // 获取支付宝配置
                PaymentConfig alipayConfig = paymentConfigService.getEnabledConfig("alipay")
                        .orElseThrow(() -> new RuntimeException("支付宝支付未配置或未启用"));

                // 生成订单标题和描述
                String subject = plan.getName() + " - " + plan.getBillingCycle();
                String body = "订阅计划：" + plan.getName();

                // 创建扫码支付（返回二维码URL）
                String qrCode = alipayPaymentService.createQrCodePay(
                        alipayConfig,
                        orderNo,
                        plan.getPrice(),
                        subject,
                        body
                );

                saved.setQrCodeUrl(qrCode);
                saved.setPaymentProvider("alipay");
                orderRepository.save(saved);
            } else if ("wechat".equals(paymentType)) {
                // 获取微信支付配置
                PaymentConfig wechatConfig = paymentConfigService.getEnabledConfig("wechat")
                        .orElseThrow(() -> new RuntimeException("微信支付未配置或未启用"));

                // 生成订单描述
                String description = plan.getName() + " - " + plan.getBillingCycle();

                // 创建扫码支付（返回二维码URL）
                String qrCode = wechatPaymentService.createNativePay(
                        wechatConfig,
                        orderNo,
                        plan.getPrice(),
                        description
                );

                saved.setQrCodeUrl(qrCode);
                saved.setPaymentProvider("wechat");
                orderRepository.save(saved);
            } else {
                throw new RuntimeException("不支持的支付类型: " + paymentType);
            }
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
        Long planId = Long.valueOf(order.getPlanId());
        membershipService.activateMembership(
                order.getUserId(),
                planId,
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

