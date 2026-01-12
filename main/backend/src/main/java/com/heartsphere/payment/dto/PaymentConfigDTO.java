package com.heartsphere.payment.dto;

import lombok.Data;

/**
 * 支付配置DTO
 */
@Data
public class PaymentConfigDTO {
    private Long id;
    private String paymentType; // alipay, wechat
    private String appId;
    private String gatewayUrl;
    private String signType;
    private String charset;
    private String format;
    private String notifyUrl;
    private String returnUrl;
    private Boolean isEnabled;
    private Boolean isSandbox;
    private String description;
    // 微信支付相关字段
    private String wechatMchId;
    private String wechatCertSerialNo;
    // 注意：私钥、公钥、API密钥等敏感信息不通过DTO传输，只在后台管理时使用
}

