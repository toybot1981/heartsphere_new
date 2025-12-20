package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemConfig;
import com.heartsphere.admin.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

@Service
public class SystemConfigService {

    private static final Logger logger = Logger.getLogger(SystemConfigService.class.getName());

    @Autowired
    private SystemConfigRepository configRepository;

    private static final String INVITE_CODE_REQUIRED_KEY = "invite_code_required";
    private static final String EMAIL_VERIFICATION_REQUIRED_KEY = "email_verification_required";
    private static final String WECHAT_APP_ID_KEY = "wechat_app_id";
    private static final String WECHAT_APP_SECRET_KEY = "wechat_app_secret";
    private static final String WECHAT_REDIRECT_URI_KEY = "wechat_redirect_uri";
    
    // 邮件配置键
    private static final String EMAIL_HOST_KEY = "email_host";
    private static final String EMAIL_PORT_KEY = "email_port";
    private static final String EMAIL_USERNAME_KEY = "email_username";
    private static final String EMAIL_PASSWORD_KEY = "email_password";
    private static final String EMAIL_FROM_KEY = "email_from";
    
    // Notion 配置键
    private static final String NOTION_CLIENT_ID_KEY = "notion_client_id";
    private static final String NOTION_CLIENT_SECRET_KEY = "notion_client_secret";
    private static final String NOTION_REDIRECT_URI_KEY = "notion_redirect_uri";
    private static final String NOTION_SYNC_BUTTON_ENABLED_KEY = "notion_sync_button_enabled";

    /**
     * 获取邀请码是否必需
     */
    public boolean isInviteCodeRequired() {
        return configRepository.findByConfigKey(INVITE_CODE_REQUIRED_KEY)
                .map(config -> Boolean.parseBoolean(config.getConfigValue()))
                .orElse(false); // 默认不需要邀请码
    }

    /**
     * 设置邀请码是否必需
     */
    @Transactional
    public void setInviteCodeRequired(boolean required) {
        logger.info(String.format("设置邀请码开关: %s", required));
        SystemConfig config = configRepository.findByConfigKey(INVITE_CODE_REQUIRED_KEY)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(INVITE_CODE_REQUIRED_KEY);
                    newConfig.setDescription("注册是否需要邀请码");
                    return newConfig;
                });
        config.setConfigValue(String.valueOf(required));
        configRepository.save(config);
        logger.info(String.format("邀请码开关已设置为: %s", required));
    }

    /**
     * 获取邮箱验证是否必需
     */
    public boolean isEmailVerificationRequired() {
        return configRepository.findByConfigKey(EMAIL_VERIFICATION_REQUIRED_KEY)
                .map(config -> Boolean.parseBoolean(config.getConfigValue()))
                .orElse(true); // 默认需要邮箱验证
    }

    /**
     * 设置邮箱验证是否必需
     */
    @Transactional
    public void setEmailVerificationRequired(boolean required) {
        logger.info(String.format("设置邮箱验证开关: %s", required));
        SystemConfig config = configRepository.findByConfigKey(EMAIL_VERIFICATION_REQUIRED_KEY)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(EMAIL_VERIFICATION_REQUIRED_KEY);
                    newConfig.setDescription("注册是否需要邮箱验证码");
                    return newConfig;
                });
        config.setConfigValue(String.valueOf(required));
        configRepository.save(config);
        logger.info(String.format("邮箱验证开关已设置为: %s", required));
    }

    /**
     * 获取微信AppID
     */
    public String getWechatAppId() {
        return configRepository.findByConfigKey(WECHAT_APP_ID_KEY)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    /**
     * 设置微信AppID
     */
    @Transactional
    public void setWechatAppId(String appId) {
        logger.info("设置微信AppID");
        SystemConfig config = configRepository.findByConfigKey(WECHAT_APP_ID_KEY)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(WECHAT_APP_ID_KEY);
                    newConfig.setDescription("微信开放平台网站应用的AppID");
                    return newConfig;
                });
        config.setConfigValue(appId != null ? appId : "");
        configRepository.save(config);
        logger.info("微信AppID已设置");
    }

    /**
     * 获取微信AppSecret
     */
    public String getWechatAppSecret() {
        return configRepository.findByConfigKey(WECHAT_APP_SECRET_KEY)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    /**
     * 设置微信AppSecret
     */
    @Transactional
    public void setWechatAppSecret(String appSecret) {
        logger.info("设置微信AppSecret");
        SystemConfig config = configRepository.findByConfigKey(WECHAT_APP_SECRET_KEY)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(WECHAT_APP_SECRET_KEY);
                    newConfig.setDescription("微信开放平台网站应用的AppSecret");
                    return newConfig;
                });
        config.setConfigValue(appSecret != null ? appSecret : "");
        configRepository.save(config);
        logger.info("微信AppSecret已设置");
    }

    /**
     * 获取微信回调地址
     */
    public String getWechatRedirectUri() {
        return configRepository.findByConfigKey(WECHAT_REDIRECT_URI_KEY)
                .map(SystemConfig::getConfigValue)
                .orElse("http://localhost:8081/api/wechat/callback");
    }

    /**
     * 设置微信回调地址
     */
    @Transactional
    public void setWechatRedirectUri(String redirectUri) {
        logger.info("设置微信回调地址: " + redirectUri);
        SystemConfig config = configRepository.findByConfigKey(WECHAT_REDIRECT_URI_KEY)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(WECHAT_REDIRECT_URI_KEY);
                    newConfig.setDescription("微信OAuth回调地址");
                    return newConfig;
                });
        config.setConfigValue(redirectUri != null ? redirectUri : "http://localhost:8081/api/wechat/callback");
        configRepository.save(config);
        logger.info("微信回调地址已设置");
    }

    /**
     * 获取配置值
     */
    public String getConfigValue(String key) {
        return configRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    /**
     * 设置配置值
     */
    @Transactional
    public void setConfigValue(String key, String value, String description) {
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

    /**
     * 获取邮件服务器地址
     */
    public String getEmailHost() {
        return getConfigValue(EMAIL_HOST_KEY);
    }

    /**
     * 设置邮件服务器地址
     */
    @Transactional
    public void setEmailHost(String host) {
        setConfigValue(EMAIL_HOST_KEY, host, "邮件服务器地址（SMTP）");
    }

    /**
     * 获取邮件服务器端口
     */
    public String getEmailPort() {
        return getConfigValue(EMAIL_PORT_KEY);
    }

    /**
     * 设置邮件服务器端口
     */
    @Transactional
    public void setEmailPort(String port) {
        setConfigValue(EMAIL_PORT_KEY, port, "邮件服务器端口");
    }

    /**
     * 获取邮件用户名
     */
    public String getEmailUsername() {
        return getConfigValue(EMAIL_USERNAME_KEY);
    }

    /**
     * 设置邮件用户名
     */
    @Transactional
    public void setEmailUsername(String username) {
        setConfigValue(EMAIL_USERNAME_KEY, username, "邮件服务器用户名（通常是邮箱地址）");
    }

    /**
     * 获取邮件密码
     */
    public String getEmailPassword() {
        return getConfigValue(EMAIL_PASSWORD_KEY);
    }

    /**
     * 设置邮件密码
     */
    @Transactional
    public void setEmailPassword(String password) {
        setConfigValue(EMAIL_PASSWORD_KEY, password, "邮件服务器密码或授权码");
    }

    /**
     * 获取发件人邮箱
     */
    public String getEmailFrom() {
        String from = getConfigValue(EMAIL_FROM_KEY);
        return from != null && !from.isEmpty() ? from : "tongyexin@163.com";
    }

    /**
     * 设置发件人邮箱
     */
    @Transactional
    public void setEmailFrom(String from) {
        setConfigValue(EMAIL_FROM_KEY, from, "发件人邮箱地址");
    }

    /**
     * 获取 Notion Client ID
     */
    public String getNotionClientId() {
        return getConfigValue(NOTION_CLIENT_ID_KEY);
    }

    /**
     * 设置 Notion Client ID
     */
    @Transactional
    public void setNotionClientId(String clientId) {
        setConfigValue(NOTION_CLIENT_ID_KEY, clientId, "Notion Client ID");
    }

    /**
     * 获取 Notion Client Secret
     */
    public String getNotionClientSecret() {
        return getConfigValue(NOTION_CLIENT_SECRET_KEY);
    }

    /**
     * 设置 Notion Client Secret
     */
    @Transactional
    public void setNotionClientSecret(String clientSecret) {
        setConfigValue(NOTION_CLIENT_SECRET_KEY, clientSecret, "Notion Client Secret");
    }

    /**
     * 获取 Notion 回调地址
     */
    public String getNotionRedirectUri() {
        return getConfigValue(NOTION_REDIRECT_URI_KEY);
    }

    /**
     * 设置 Notion 回调地址
     */
    @Transactional
    public void setNotionRedirectUri(String redirectUri) {
        setConfigValue(NOTION_REDIRECT_URI_KEY, redirectUri, "Notion 回调地址");
    }

    /**
     * 获取笔记同步按钮是否显示
     */
    public boolean isNotionSyncButtonEnabled() {
        return configRepository.findByConfigKey(NOTION_SYNC_BUTTON_ENABLED_KEY)
                .map(config -> Boolean.parseBoolean(config.getConfigValue()))
                .orElse(false); // 默认不显示笔记同步按钮
    }

    /**
     * 设置笔记同步按钮是否显示
     */
    @Transactional
    public void setNotionSyncButtonEnabled(boolean enabled) {
        logger.info(String.format("设置笔记同步按钮显示: %s", enabled));
        SystemConfig config = configRepository.findByConfigKey(NOTION_SYNC_BUTTON_ENABLED_KEY)
                .orElseGet(() -> {
                    SystemConfig newConfig = new SystemConfig();
                    newConfig.setConfigKey(NOTION_SYNC_BUTTON_ENABLED_KEY);
                    newConfig.setDescription("是否显示笔记同步按钮");
                    return newConfig;
                });
        config.setConfigValue(String.valueOf(enabled));
        configRepository.save(config);
        logger.info(String.format("笔记同步按钮显示已设置为: %s", enabled));
    }
}

