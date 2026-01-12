package com.heartsphere.payment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 支付配置实体
 * 用于存储支付宝等支付方式的配置参数
 */
@Data
@Entity
@Table(name = "payment_configs")
public class PaymentConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_type", nullable = false, length = 20)
    private String paymentType; // alipay, wechat

    @Column(name = "app_id", length = 100)
    private String appId; // 支付宝应用ID

    @Column(name = "merchant_private_key", columnDefinition = "TEXT")
    private String merchantPrivateKey; // 商户私钥

    @Column(name = "alipay_public_key", columnDefinition = "TEXT")
    private String alipayPublicKey; // 支付宝公钥

    // 微信支付相关字段
    @Column(name = "wechat_mch_id", length = 100)
    private String wechatMchId; // 微信支付商户号

    @Column(name = "wechat_api_key", length = 200)
    private String wechatApiKey; // 微信支付API密钥（v2）

    @Column(name = "wechat_api_v3_key", length = 200)
    private String wechatApiV3Key; // 微信支付API v3密钥

    @Column(name = "wechat_cert_serial_no", length = 200)
    private String wechatCertSerialNo; // 微信支付证书序列号

    @Column(name = "wechat_private_key", columnDefinition = "TEXT")
    private String wechatPrivateKey; // 微信支付商户私钥

    @Column(name = "gateway_url", length = 500)
    private String gatewayUrl; // 网关地址（支付宝用）

    @Column(name = "sign_type", length = 20)
    private String signType = "RSA2"; // 签名类型

    @Column(name = "charset", length = 20)
    private String charset = "UTF-8"; // 字符编码

    @Column(name = "format", length = 20)
    private String format = "JSON"; // 数据格式

    @Column(name = "notify_url", length = 500)
    private String notifyUrl; // 异步通知地址

    @Column(name = "return_url", length = 500)
    private String returnUrl; // 同步跳转地址

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = false; // 是否启用

    @Column(name = "is_sandbox", nullable = false)
    private Boolean isSandbox = true; // 是否沙箱环境

    @Column(name = "description", length = 500)
    private String description; // 配置描述

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

