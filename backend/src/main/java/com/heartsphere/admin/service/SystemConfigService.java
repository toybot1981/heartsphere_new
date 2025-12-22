package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemConfig;
import com.heartsphere.admin.repository.SystemConfigRepository;
import com.heartsphere.admin.util.ConfigKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

/**
 * 系统配置服务
 * 提供统一的配置管理接口，支持String和Boolean类型的配置
 */
@Service
public class SystemConfigService {

    private static final Logger logger = Logger.getLogger(SystemConfigService.class.getName());

    @Autowired
    private SystemConfigRepository configRepository;

    // ========== 通用配置方法 ==========
    
    /**
     * 获取配置值（String类型）
     */
    public String getConfigValue(ConfigKey configKey) {
        String value = configRepository.findByConfigKey(configKey.getKey())
                .map(SystemConfig::getConfigValue)
                .orElse(configKey.getDefaultValue());
        
        // 对于有默认值且当前值为空的情况，返回默认值
        if ((value == null || value.isEmpty()) && configKey.getDefaultValue() != null) {
            return configKey.getDefaultValue();
        }
        return value;
    }
    
    /**
     * 获取配置值（Boolean类型）
     */
    public boolean getBooleanConfigValue(ConfigKey configKey) {
        return configRepository.findByConfigKey(configKey.getKey())
                .map(config -> Boolean.parseBoolean(config.getConfigValue()))
                .orElse(configKey.getDefaultValue() != null && Boolean.parseBoolean(configKey.getDefaultValue()));
    }
    
    /**
     * 设置配置值
     */
    @Transactional
    public void setConfigValue(ConfigKey configKey, String value) {
        logger.info(String.format("设置配置: %s = %s", configKey.getKey(), value != null ? "***" : "null"));
        SystemConfig config = configRepository.findByConfigKey(configKey.getKey())
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(configKey.getKey());
                    newConfig.setDescription(configKey.getDescription());
                    return newConfig;
                });
        config.setConfigValue(value != null ? value : "");
        configRepository.save(config);
        logger.info(String.format("配置已设置: %s", configKey.getKey()));
    }
    
    /**
     * 设置配置值（Boolean类型）
     */
    @Transactional
    public void setBooleanConfigValue(ConfigKey configKey, boolean value) {
        logger.info(String.format("设置配置: %s = %s", configKey.getKey(), value));
        SystemConfig config = configRepository.findByConfigKey(configKey.getKey())
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(configKey.getKey());
                    newConfig.setDescription(configKey.getDescription());
                    return newConfig;
                });
        config.setConfigValue(String.valueOf(value));
        configRepository.save(config);
        logger.info(String.format("配置已设置: %s = %s", configKey.getKey(), value));
    }
    
    /**
     * 通用的getConfigValue方法（兼容旧接口）
     */
    public String getConfigValue(String key) {
        ConfigKey configKey = ConfigKey.findByKey(key);
        if (configKey != null) {
            return getConfigValue(configKey);
        }
        return configRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }
    
    /**
     * 通用的setConfigValue方法（兼容旧接口）
     */
    @Transactional
    public void setConfigValue(String key, String value, String description) {
        ConfigKey configKey = ConfigKey.findByKey(key);
        if (configKey != null) {
            setConfigValue(configKey, value);
        } else {
            SystemConfig config = configRepository.findByConfigKey(key)
                    .orElseGet(() -> {
                        SystemConfig newConfig = new SystemConfig();
                        newConfig.setConfigKey(key);
                        newConfig.setDescription(description);
                        return newConfig;
                    });
            config.setConfigValue(value);
            configRepository.save(config);
        }
    }

    // ========== 注册相关配置 ==========

    /**
     * 获取邀请码是否必需
     */
    public boolean isInviteCodeRequired() {
        return getBooleanConfigValue(ConfigKey.INVITE_CODE_REQUIRED);
    }

    /**
     * 设置邀请码是否必需
     */
    @Transactional
    public void setInviteCodeRequired(boolean required) {
        setBooleanConfigValue(ConfigKey.INVITE_CODE_REQUIRED, required);
    }

    /**
     * 获取邮箱验证是否必需
     */
    public boolean isEmailVerificationRequired() {
        return getBooleanConfigValue(ConfigKey.EMAIL_VERIFICATION_REQUIRED);
    }

    /**
     * 设置邮箱验证是否必需
     */
    @Transactional
    public void setEmailVerificationRequired(boolean required) {
        setBooleanConfigValue(ConfigKey.EMAIL_VERIFICATION_REQUIRED, required);
    }

    // ========== 微信OAuth配置 ==========

    /**
     * 获取微信AppID
     */
    public String getWechatAppId() {
        return getConfigValue(ConfigKey.WECHAT_APP_ID);
    }

    /**
     * 设置微信AppID
     */
    @Transactional
    public void setWechatAppId(String appId) {
        setConfigValue(ConfigKey.WECHAT_APP_ID, appId);
    }

    /**
     * 获取微信AppSecret
     */
    public String getWechatAppSecret() {
        return getConfigValue(ConfigKey.WECHAT_APP_SECRET);
    }

    /**
     * 设置微信AppSecret
     */
    @Transactional
    public void setWechatAppSecret(String appSecret) {
        setConfigValue(ConfigKey.WECHAT_APP_SECRET, appSecret);
    }

    /**
     * 获取微信回调地址
     */
    public String getWechatRedirectUri() {
        return getConfigValue(ConfigKey.WECHAT_REDIRECT_URI);
    }

    /**
     * 设置微信回调地址
     */
    @Transactional
    public void setWechatRedirectUri(String redirectUri) {
        setConfigValue(ConfigKey.WECHAT_REDIRECT_URI, redirectUri);
    }

    // ========== 邮件配置 ==========

    /**
     * 获取邮件服务器地址
     */
    public String getEmailHost() {
        return getConfigValue(ConfigKey.EMAIL_HOST);
    }

    /**
     * 设置邮件服务器地址
     */
    @Transactional
    public void setEmailHost(String host) {
        setConfigValue(ConfigKey.EMAIL_HOST, host);
    }

    /**
     * 获取邮件服务器端口
     */
    public String getEmailPort() {
        return getConfigValue(ConfigKey.EMAIL_PORT);
    }

    /**
     * 设置邮件服务器端口
     */
    @Transactional
    public void setEmailPort(String port) {
        setConfigValue(ConfigKey.EMAIL_PORT, port);
    }

    /**
     * 获取邮件用户名
     */
    public String getEmailUsername() {
        return getConfigValue(ConfigKey.EMAIL_USERNAME);
    }

    /**
     * 设置邮件用户名
     */
    @Transactional
    public void setEmailUsername(String username) {
        setConfigValue(ConfigKey.EMAIL_USERNAME, username);
    }

    /**
     * 获取邮件密码
     */
    public String getEmailPassword() {
        return getConfigValue(ConfigKey.EMAIL_PASSWORD);
    }

    /**
     * 设置邮件密码
     */
    @Transactional
    public void setEmailPassword(String password) {
        setConfigValue(ConfigKey.EMAIL_PASSWORD, password);
    }

    /**
     * 获取发件人邮箱
     */
    public String getEmailFrom() {
        return getConfigValue(ConfigKey.EMAIL_FROM);
    }

    /**
     * 设置发件人邮箱
     */
    @Transactional
    public void setEmailFrom(String from) {
        setConfigValue(ConfigKey.EMAIL_FROM, from);
    }

    // ========== Notion配置 ==========

    /**
     * 获取 Notion Client ID
     */
    public String getNotionClientId() {
        return getConfigValue(ConfigKey.NOTION_CLIENT_ID);
    }

    /**
     * 设置 Notion Client ID
     */
    @Transactional
    public void setNotionClientId(String clientId) {
        setConfigValue(ConfigKey.NOTION_CLIENT_ID, clientId);
    }

    /**
     * 获取 Notion Client Secret
     */
    public String getNotionClientSecret() {
        return getConfigValue(ConfigKey.NOTION_CLIENT_SECRET);
    }

    /**
     * 设置 Notion Client Secret
     */
    @Transactional
    public void setNotionClientSecret(String clientSecret) {
        setConfigValue(ConfigKey.NOTION_CLIENT_SECRET, clientSecret);
    }

    /**
     * 获取 Notion 回调地址
     */
    public String getNotionRedirectUri() {
        return getConfigValue(ConfigKey.NOTION_REDIRECT_URI);
    }

    /**
     * 设置 Notion 回调地址
     */
    @Transactional
    public void setNotionRedirectUri(String redirectUri) {
        setConfigValue(ConfigKey.NOTION_REDIRECT_URI, redirectUri);
    }

    /**
     * 获取笔记同步按钮是否显示
     */
    public boolean isNotionSyncButtonEnabled() {
        return getBooleanConfigValue(ConfigKey.NOTION_SYNC_BUTTON_ENABLED);
    }

    /**
     * 设置笔记同步按钮是否显示
     */
    @Transactional
    public void setNotionSyncButtonEnabled(boolean enabled) {
        setBooleanConfigValue(ConfigKey.NOTION_SYNC_BUTTON_ENABLED, enabled);
    }

    // ========== 微信支付配置 ==========
    
    /**
     * 获取微信支付AppID
     */
    public String getWechatPayAppId() {
        return getConfigValue(ConfigKey.WECHAT_PAY_APP_ID);
    }

    /**
     * 设置微信支付AppID
     */
    @Transactional
    public void setWechatPayAppId(String appId) {
        setConfigValue(ConfigKey.WECHAT_PAY_APP_ID, appId);
    }

    /**
     * 获取微信支付商户号
     */
    public String getWechatPayMchId() {
        return getConfigValue(ConfigKey.WECHAT_PAY_MCH_ID);
    }

    /**
     * 设置微信支付商户号
     */
    @Transactional
    public void setWechatPayMchId(String mchId) {
        setConfigValue(ConfigKey.WECHAT_PAY_MCH_ID, mchId);
    }

    /**
     * 获取微信支付API密钥
     */
    public String getWechatPayApiKey() {
        return getConfigValue(ConfigKey.WECHAT_PAY_API_KEY);
    }

    /**
     * 设置微信支付API密钥
     */
    @Transactional
    public void setWechatPayApiKey(String apiKey) {
        setConfigValue(ConfigKey.WECHAT_PAY_API_KEY, apiKey);
    }

    /**
     * 获取微信支付API v3密钥
     */
    public String getWechatPayApiV3Key() {
        return getConfigValue(ConfigKey.WECHAT_PAY_API_V3_KEY);
    }

    /**
     * 设置微信支付API v3密钥
     */
    @Transactional
    public void setWechatPayApiV3Key(String apiV3Key) {
        setConfigValue(ConfigKey.WECHAT_PAY_API_V3_KEY, apiV3Key);
    }

    /**
     * 获取微信支付证书路径
     */
    public String getWechatPayCertPath() {
        return getConfigValue(ConfigKey.WECHAT_PAY_CERT_PATH);
    }

    /**
     * 设置微信支付证书路径
     */
    @Transactional
    public void setWechatPayCertPath(String certPath) {
        setConfigValue(ConfigKey.WECHAT_PAY_CERT_PATH, certPath);
    }

    /**
     * 获取微信支付回调地址
     */
    public String getWechatPayNotifyUrl() {
        return getConfigValue(ConfigKey.WECHAT_PAY_NOTIFY_URL);
    }

    /**
     * 设置微信支付回调地址
     */
    @Transactional
    public void setWechatPayNotifyUrl(String notifyUrl) {
        setConfigValue(ConfigKey.WECHAT_PAY_NOTIFY_URL, notifyUrl);
    }

    // ========== 支付宝支付配置 ==========
    
    /**
     * 获取支付宝AppID
     */
    public String getAlipayAppId() {
        return getConfigValue(ConfigKey.ALIPAY_APP_ID);
    }

    /**
     * 设置支付宝AppID
     */
    @Transactional
    public void setAlipayAppId(String appId) {
        setConfigValue(ConfigKey.ALIPAY_APP_ID, appId);
    }

    /**
     * 获取支付宝应用私钥
     */
    public String getAlipayPrivateKey() {
        return getConfigValue(ConfigKey.ALIPAY_PRIVATE_KEY);
    }

    /**
     * 设置支付宝应用私钥
     */
    @Transactional
    public void setAlipayPrivateKey(String privateKey) {
        setConfigValue(ConfigKey.ALIPAY_PRIVATE_KEY, privateKey);
    }

    /**
     * 获取支付宝公钥
     */
    public String getAlipayPublicKey() {
        return getConfigValue(ConfigKey.ALIPAY_PUBLIC_KEY);
    }

    /**
     * 设置支付宝公钥
     */
    @Transactional
    public void setAlipayPublicKey(String publicKey) {
        setConfigValue(ConfigKey.ALIPAY_PUBLIC_KEY, publicKey);
    }

    /**
     * 获取支付宝回调地址
     */
    public String getAlipayNotifyUrl() {
        return getConfigValue(ConfigKey.ALIPAY_NOTIFY_URL);
    }

    /**
     * 设置支付宝回调地址
     */
    @Transactional
    public void setAlipayNotifyUrl(String notifyUrl) {
        setConfigValue(ConfigKey.ALIPAY_NOTIFY_URL, notifyUrl);
    }

    /**
     * 获取支付宝同步返回地址
     */
    public String getAlipayReturnUrl() {
        return getConfigValue(ConfigKey.ALIPAY_RETURN_URL);
    }

    /**
     * 设置支付宝同步返回地址
     */
    @Transactional
    public void setAlipayReturnUrl(String returnUrl) {
        setConfigValue(ConfigKey.ALIPAY_RETURN_URL, returnUrl);
    }

    /**
     * 获取支付宝网关地址
     */
    public String getAlipayGatewayUrl() {
        return getConfigValue(ConfigKey.ALIPAY_GATEWAY_URL);
    }

    /**
     * 设置支付宝网关地址
     */
    @Transactional
    public void setAlipayGatewayUrl(String gatewayUrl) {
        setConfigValue(ConfigKey.ALIPAY_GATEWAY_URL, gatewayUrl);
    }

    // ========== 其他配置 ==========
    
    /**
     * 获取引导配置链接
     */
    public String getGuideConfigLink() {
        return getConfigValue(ConfigKey.GUIDE_CONFIG_LINK);
    }

    /**
     * 设置引导配置链接
     */
    @Transactional
    public void setGuideConfigLink(String link) {
        setConfigValue(ConfigKey.GUIDE_CONFIG_LINK, link);
    }
}
