package com.heartsphere.service;

import com.heartsphere.entity.SystemConfig;
import com.heartsphere.repository.SystemConfigRepository;
import com.heartsphere.util.ConfigKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

/**
 * 系统配置服务
 * 提供统一的配置管理接口，支持String和Boolean类型的配置
 * 注意：此服务直接访问数据库，admin 只负责配置
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
    public void setConfigValue(String key, String value) {
        ConfigKey configKey = ConfigKey.findByKey(key);
        if (configKey != null) {
            setConfigValue(configKey, value);
        } else {
            SystemConfig config = configRepository.findByConfigKey(key)
                    .orElseGet(() -> {
                        SystemConfig newConfig = new SystemConfig();
                        newConfig.setConfigKey(key);
                        return newConfig;
                    });
            config.setConfigValue(value != null ? value : "");
            configRepository.save(config);
        }
    }
    
    // ========== 特定配置方法 ==========
    
    /**
     * 检查是否需要邀请码
     */
    public boolean isInviteCodeRequired() {
        return getBooleanConfigValue(ConfigKey.INVITE_CODE_REQUIRED);
    }
    
    /**
     * 检查是否需要邮箱验证
     */
    public boolean isEmailVerificationRequired() {
        return getBooleanConfigValue(ConfigKey.EMAIL_VERIFICATION_REQUIRED);
    }
    
    /**
     * 获取微信AppID
     */
    public String getWechatAppId() {
        return getConfigValue(ConfigKey.WECHAT_APP_ID);
    }
    
    /**
     * 获取微信AppSecret
     */
    public String getWechatAppSecret() {
        return getConfigValue(ConfigKey.WECHAT_APP_SECRET);
    }
    
    /**
     * 获取微信回调地址
     */
    public String getWechatRedirectUri() {
        return getConfigValue(ConfigKey.WECHAT_REDIRECT_URI);
    }
    
    /**
     * 获取邮件主机
     */
    public String getEmailHost() {
        return getConfigValue(ConfigKey.EMAIL_HOST);
    }
    
    /**
     * 获取邮件端口
     */
    public String getEmailPort() {
        return getConfigValue(ConfigKey.EMAIL_PORT);
    }
    
    /**
     * 获取邮件用户名
     */
    public String getEmailUsername() {
        return getConfigValue(ConfigKey.EMAIL_USERNAME);
    }
    
    /**
     * 获取邮件密码
     */
    public String getEmailPassword() {
        return getConfigValue(ConfigKey.EMAIL_PASSWORD);
    }
    
    /**
     * 获取发件人邮箱
     */
    public String getEmailFrom() {
        return getConfigValue(ConfigKey.EMAIL_FROM);
    }
    
    /**
     * 获取Notion Client ID
     */
    public String getNotionClientId() {
        return getConfigValue(ConfigKey.NOTION_CLIENT_ID);
    }
    
    /**
     * 获取Notion Client Secret
     */
    public String getNotionClientSecret() {
        return getConfigValue(ConfigKey.NOTION_CLIENT_SECRET);
    }
    
    /**
     * 获取Notion回调地址
     */
    public String getNotionRedirectUri() {
        return getConfigValue(ConfigKey.NOTION_REDIRECT_URI);
    }
    
    /**
     * 检查是否启用笔记同步按钮
     */
    public boolean isNotionSyncButtonEnabled() {
        return getBooleanConfigValue(ConfigKey.NOTION_SYNC_BUTTON_ENABLED);
    }
    
    /**
     * 检查是否启用配额拦截
     */
    public boolean isBillingQuotaEnforcementEnabled() {
        return getBooleanConfigValue(ConfigKey.BILLING_QUOTA_ENFORCEMENT_ENABLED);
    }
}
