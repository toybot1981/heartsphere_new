-- 创建支付配置表
CREATE TABLE IF NOT EXISTS `payment_configs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `payment_type` VARCHAR(20) NOT NULL COMMENT '支付类型：alipay, wechat',
    `app_id` VARCHAR(100) COMMENT '应用ID（支付宝AppID或微信AppID）',
    `merchant_private_key` TEXT COMMENT '商户私钥（RSA2格式）',
    `alipay_public_key` TEXT COMMENT '支付宝公钥（用于验签）',
    `wechat_mch_id` VARCHAR(100) COMMENT '微信支付商户号',
    `wechat_api_key` VARCHAR(200) COMMENT '微信支付API密钥（v2）',
    `wechat_api_v3_key` VARCHAR(200) COMMENT '微信支付API v3密钥',
    `wechat_cert_serial_no` VARCHAR(200) COMMENT '微信支付证书序列号',
    `wechat_private_key` TEXT COMMENT '微信支付商户私钥',
    `gateway_url` VARCHAR(500) COMMENT '网关地址（支付宝用）',
    `sign_type` VARCHAR(20) DEFAULT 'RSA2' COMMENT '签名类型',
    `charset` VARCHAR(20) DEFAULT 'UTF-8' COMMENT '字符编码',
    `format` VARCHAR(20) DEFAULT 'JSON' COMMENT '数据格式',
    `notify_url` VARCHAR(500) COMMENT '异步通知地址',
    `return_url` VARCHAR(500) COMMENT '同步返回地址',
    `is_enabled` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否启用',
    `is_sandbox` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否沙箱环境',
    `description` VARCHAR(500) COMMENT '配置描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_payment_type` (`payment_type`),
    INDEX `idx_payment_type_enabled` (`payment_type`, `is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付配置表';

