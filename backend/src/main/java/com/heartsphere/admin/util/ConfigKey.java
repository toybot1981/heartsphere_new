package com.heartsphere.admin.util;

/**
 * 系统配置键枚举
 * 包含所有系统配置的键名、描述和默认值信息
 */
public enum ConfigKey {
    // 注册配置
    INVITE_CODE_REQUIRED("invite_code_required", "注册是否需要邀请码", "false", Boolean.class),
    EMAIL_VERIFICATION_REQUIRED("email_verification_required", "注册是否需要邮箱验证码", "true", Boolean.class),
    
    // 微信OAuth配置
    WECHAT_APP_ID("wechat_app_id", "微信开放平台网站应用的AppID", null, String.class),
    WECHAT_APP_SECRET("wechat_app_secret", "微信开放平台网站应用的AppSecret", null, String.class),
    WECHAT_REDIRECT_URI("wechat_redirect_uri", "微信OAuth回调地址", "http://localhost:8081/api/wechat/callback", String.class),
    
    // 邮件配置
    EMAIL_TYPE("email_type", "邮箱类型：163、qq、custom", "163", String.class),
    EMAIL_HOST("email_host", "邮件服务器地址（SMTP）", null, String.class),
    EMAIL_PORT("email_port", "邮件服务器端口", null, String.class),
    EMAIL_USERNAME("email_username", "邮件服务器用户名（通常是邮箱地址）", null, String.class),
    EMAIL_PASSWORD("email_password", "邮件服务器密码或授权码", null, String.class),
    EMAIL_FROM("email_from", "发件人邮箱地址", "tongyexin@163.com", String.class),
    
    // Notion配置
    NOTION_CLIENT_ID("notion_client_id", "Notion Client ID", null, String.class),
    NOTION_CLIENT_SECRET("notion_client_secret", "Notion Client Secret", null, String.class),
    NOTION_REDIRECT_URI("notion_redirect_uri", "Notion 回调地址", null, String.class),
    NOTION_SYNC_BUTTON_ENABLED("notion_sync_button_enabled", "是否显示笔记同步按钮", "false", Boolean.class),
    
    // 微信支付配置
    WECHAT_PAY_APP_ID("wechat_pay_app_id", "微信支付AppID（商户号对应的AppID）", null, String.class),
    WECHAT_PAY_MCH_ID("wechat_pay_mch_id", "微信支付商户号（MchId）", null, String.class),
    WECHAT_PAY_API_KEY("wechat_pay_api_key", "微信支付API密钥（用于签名）", null, String.class),
    WECHAT_PAY_API_V3_KEY("wechat_pay_api_v3_key", "微信支付API v3密钥", null, String.class),
    WECHAT_PAY_CERT_PATH("wechat_pay_cert_path", "微信支付证书路径（可选）", null, String.class),
    WECHAT_PAY_NOTIFY_URL("wechat_pay_notify_url", "微信支付回调通知地址", null, String.class),
    
    // 支付宝支付配置
    ALIPAY_APP_ID("alipay_app_id", "支付宝应用AppID", null, String.class),
    ALIPAY_PRIVATE_KEY("alipay_private_key", "支付宝应用私钥（RSA2）", null, String.class),
    ALIPAY_PUBLIC_KEY("alipay_public_key", "支付宝公钥（用于验签）", null, String.class),
    ALIPAY_NOTIFY_URL("alipay_notify_url", "支付宝异步回调通知地址", null, String.class),
    ALIPAY_RETURN_URL("alipay_return_url", "支付宝同步返回地址", null, String.class),
    ALIPAY_GATEWAY_URL("alipay_gateway_url", "支付宝网关地址（默认：https://openapi.alipay.com/gateway.do）", "https://openapi.alipay.com/gateway.do", String.class),
    
    // 其他配置
    GUIDE_CONFIG_LINK("guide_config_link", "引导配置链接", null, String.class);
    
    private final String key;
    private final String description;
    private final String defaultValue;
    private final Class<?> type;
    
    ConfigKey(String key, String description, String defaultValue, Class<?> type) {
        this.key = key;
        this.description = description;
        this.defaultValue = defaultValue;
        this.type = type;
    }
    
    public String getKey() {
        return key;
    }
    
    public String getDescription() {
        return description;
    }
    
    public String getDefaultValue() {
        return defaultValue;
    }
    
    public Class<?> getType() {
        return type;
    }
    
    /**
     * 根据键名查找ConfigKey枚举
     */
    public static ConfigKey findByKey(String key) {
        for (ConfigKey configKey : values()) {
            if (configKey.getKey().equals(key)) {
                return configKey;
            }
        }
        return null;
    }
}





