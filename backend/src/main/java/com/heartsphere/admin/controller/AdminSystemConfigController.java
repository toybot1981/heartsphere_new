package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.SystemConfigService;
import com.heartsphere.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * 系统配置管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/config")
public class AdminSystemConfigController extends BaseAdminController {

    private static final Logger logger = Logger.getLogger(AdminSystemConfigController.class.getName());

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private EmailService emailService;

    // ========== Invite Code Required Config ==========
    @GetMapping("/invite-code-required")
    public ResponseEntity<Map<String, Object>> getInviteCodeRequired(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        boolean required = systemConfigService.isInviteCodeRequired();
        return ResponseEntity.ok(Map.of("inviteCodeRequired", required));
    }

    @PutMapping("/invite-code-required")
    public ResponseEntity<Map<String, Object>> setInviteCodeRequired(
            @RequestBody Map<String, Boolean> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Boolean required = request.get("inviteCodeRequired");
        if (required == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "inviteCodeRequired is required"));
        }
        systemConfigService.setInviteCodeRequired(required);
        return ResponseEntity.ok(Map.of("inviteCodeRequired", required));
    }

    // ========== Email Verification Config ==========
    @GetMapping("/email-verification-required")
    public ResponseEntity<Map<String, Object>> getEmailVerificationRequired(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        boolean required = systemConfigService.isEmailVerificationRequired();
        return ResponseEntity.ok(Map.of("emailVerificationRequired", required));
    }

    @PutMapping("/email-verification-required")
    public ResponseEntity<Map<String, Object>> setEmailVerificationRequired(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Object requiredObj = request.get("emailVerificationRequired");
        if (requiredObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "emailVerificationRequired is required"));
        }
        Boolean required;
        if (requiredObj instanceof Boolean) {
            required = (Boolean) requiredObj;
        } else if (requiredObj instanceof String) {
            required = Boolean.parseBoolean((String) requiredObj);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "emailVerificationRequired must be a boolean"));
        }
        systemConfigService.setEmailVerificationRequired(required);
        return ResponseEntity.ok(Map.of("emailVerificationRequired", required));
    }

    // ========== WeChat Config ==========
    @GetMapping("/wechat")
    public ResponseEntity<Map<String, Object>> getWechatConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> config = new HashMap<>();
        config.put("appId", systemConfigService.getWechatAppId() != null ? systemConfigService.getWechatAppId() : "");
        config.put("appSecret", systemConfigService.getWechatAppSecret() != null ? "******" : "");
        config.put("redirectUri", systemConfigService.getWechatRedirectUri());
        return ResponseEntity.ok(config);
    }

    @PutMapping("/wechat")
    public ResponseEntity<Map<String, Object>> setWechatConfig(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        String appId = request.get("appId");
        String appSecret = request.get("appSecret");
        String redirectUri = request.get("redirectUri");
        
        if (appId != null) {
            systemConfigService.setWechatAppId(appId);
        }
        if (appSecret != null && !appSecret.isEmpty()) {
            systemConfigService.setWechatAppSecret(appSecret);
        }
        if (redirectUri != null) {
            systemConfigService.setWechatRedirectUri(redirectUri);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("appId", systemConfigService.getWechatAppId() != null ? systemConfigService.getWechatAppId() : "");
        response.put("appSecret", "******");
        response.put("redirectUri", systemConfigService.getWechatRedirectUri());
        return ResponseEntity.ok(response);
    }

    // ========== Email Config ==========
    @GetMapping("/email")
    public ResponseEntity<Map<String, Object>> getEmailConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> config = new HashMap<>();
        config.put("host", systemConfigService.getEmailHost() != null ? systemConfigService.getEmailHost() : "smtp.163.com");
        config.put("port", systemConfigService.getEmailPort() != null ? systemConfigService.getEmailPort() : "25");
        config.put("username", systemConfigService.getEmailUsername() != null ? systemConfigService.getEmailUsername() : "tongyexin@163.com");
        config.put("password", systemConfigService.getEmailPassword() != null ? "******" : "");
        config.put("from", systemConfigService.getEmailFrom());
        return ResponseEntity.ok(config);
    }

    @PutMapping("/email")
    public ResponseEntity<Map<String, Object>> setEmailConfig(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        String host = request.get("host");
        String port = request.get("port");
        String username = request.get("username");
        String password = request.get("password");
        String from = request.get("from");
        
        if (host != null) {
            systemConfigService.setEmailHost(host);
        }
        if (port != null) {
            systemConfigService.setEmailPort(port);
        }
        if (username != null) {
            systemConfigService.setEmailUsername(username);
        }
        if (password != null) {
            systemConfigService.setEmailPassword(password);
        }
        if (from != null) {
            systemConfigService.setEmailFrom(from);
        }
        
        try {
            emailService.updateMailSender();
        } catch (Exception e) {
            logger.warning("更新邮件服务配置失败: " + e.getMessage());
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("host", systemConfigService.getEmailHost() != null ? systemConfigService.getEmailHost() : "smtp.163.com");
        response.put("port", systemConfigService.getEmailPort() != null ? systemConfigService.getEmailPort() : "25");
        response.put("username", systemConfigService.getEmailUsername() != null ? systemConfigService.getEmailUsername() : "tongyexin@163.com");
        response.put("password", "******");
        response.put("from", systemConfigService.getEmailFrom());
        return ResponseEntity.ok(response);
    }

    // ========== Notion Config ==========
    @GetMapping("/notion")
    public ResponseEntity<Map<String, Object>> getNotionConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> config = new HashMap<>();
        config.put("clientId", systemConfigService.getNotionClientId() != null ? systemConfigService.getNotionClientId() : "");
        config.put("clientSecret", "******");
        config.put("redirectUri", systemConfigService.getNotionRedirectUri() != null ? systemConfigService.getNotionRedirectUri() : "");
        config.put("syncButtonEnabled", systemConfigService.isNotionSyncButtonEnabled());
        return ResponseEntity.ok(config);
    }

    @PutMapping("/notion")
    public ResponseEntity<Map<String, Object>> setNotionConfig(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        String clientId = request.get("clientId");
        String clientSecret = request.get("clientSecret");
        String redirectUri = request.get("redirectUri");
        Boolean syncButtonEnabled = request.containsKey("syncButtonEnabled") ? Boolean.parseBoolean(request.get("syncButtonEnabled")) : null;

        logger.info("设置 Notion 配置 - clientId: " + (clientId != null ? clientId : "null") + 
                   ", clientSecret: " + (clientSecret != null ? "***" : "null") + 
                   ", redirectUri: " + (redirectUri != null ? redirectUri : "null") +
                   ", syncButtonEnabled: " + syncButtonEnabled);

        if (clientId != null && !clientId.trim().isEmpty()) {
            systemConfigService.setNotionClientId(clientId.trim());
            logger.info("已保存 Client ID: " + clientId.trim());
        }
        if (clientSecret != null && !clientSecret.trim().isEmpty()) {
            systemConfigService.setNotionClientSecret(clientSecret.trim());
            logger.info("已保存 Client Secret");
        }
        if (redirectUri != null && !redirectUri.trim().isEmpty()) {
            systemConfigService.setNotionRedirectUri(redirectUri.trim());
            logger.info("已保存 Redirect URI: " + redirectUri.trim());
        }
        if (syncButtonEnabled != null) {
            systemConfigService.setNotionSyncButtonEnabled(syncButtonEnabled);
            logger.info("已保存笔记同步按钮显示设置: " + syncButtonEnabled);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("clientId", systemConfigService.getNotionClientId() != null ? systemConfigService.getNotionClientId() : "");
        response.put("clientSecret", "******");
        response.put("redirectUri", systemConfigService.getNotionRedirectUri() != null ? systemConfigService.getNotionRedirectUri() : "");
        response.put("syncButtonEnabled", systemConfigService.isNotionSyncButtonEnabled());
        return ResponseEntity.ok(response);
    }

    // ========== WeChat Pay Config ==========
    @GetMapping("/wechat-pay")
    public ResponseEntity<Map<String, Object>> getWechatPayConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> config = new HashMap<>();
        config.put("appId", systemConfigService.getWechatPayAppId() != null ? systemConfigService.getWechatPayAppId() : "");
        config.put("mchId", systemConfigService.getWechatPayMchId() != null ? systemConfigService.getWechatPayMchId() : "");
        config.put("apiKey", systemConfigService.getWechatPayApiKey() != null ? "******" : "");
        config.put("apiV3Key", systemConfigService.getWechatPayApiV3Key() != null ? "******" : "");
        config.put("certPath", systemConfigService.getWechatPayCertPath() != null ? systemConfigService.getWechatPayCertPath() : "");
        config.put("notifyUrl", systemConfigService.getWechatPayNotifyUrl() != null ? systemConfigService.getWechatPayNotifyUrl() : "");
        return ResponseEntity.ok(config);
    }

    @PutMapping("/wechat-pay")
    public ResponseEntity<Map<String, Object>> setWechatPayConfig(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        String appId = request.get("appId");
        String mchId = request.get("mchId");
        String apiKey = request.get("apiKey");
        String apiV3Key = request.get("apiV3Key");
        String certPath = request.get("certPath");
        String notifyUrl = request.get("notifyUrl");
        
        if (appId != null) {
            systemConfigService.setWechatPayAppId(appId);
        }
        if (mchId != null) {
            systemConfigService.setWechatPayMchId(mchId);
        }
        if (apiKey != null && !apiKey.equals("******")) {
            systemConfigService.setWechatPayApiKey(apiKey);
        }
        if (apiV3Key != null && !apiV3Key.equals("******")) {
            systemConfigService.setWechatPayApiV3Key(apiV3Key);
        }
        if (certPath != null) {
            systemConfigService.setWechatPayCertPath(certPath);
        }
        if (notifyUrl != null) {
            systemConfigService.setWechatPayNotifyUrl(notifyUrl);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("appId", systemConfigService.getWechatPayAppId() != null ? systemConfigService.getWechatPayAppId() : "");
        response.put("mchId", systemConfigService.getWechatPayMchId() != null ? systemConfigService.getWechatPayMchId() : "");
        response.put("apiKey", "******");
        response.put("apiV3Key", "******");
        response.put("certPath", systemConfigService.getWechatPayCertPath() != null ? systemConfigService.getWechatPayCertPath() : "");
        response.put("notifyUrl", systemConfigService.getWechatPayNotifyUrl() != null ? systemConfigService.getWechatPayNotifyUrl() : "");
        return ResponseEntity.ok(response);
    }

    // ========== Alipay Config ==========
    @GetMapping("/alipay")
    public ResponseEntity<Map<String, Object>> getAlipayConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> config = new HashMap<>();
        config.put("appId", systemConfigService.getAlipayAppId() != null ? systemConfigService.getAlipayAppId() : "");
        config.put("privateKey", systemConfigService.getAlipayPrivateKey() != null ? "******" : "");
        config.put("publicKey", systemConfigService.getAlipayPublicKey() != null ? systemConfigService.getAlipayPublicKey() : "");
        config.put("notifyUrl", systemConfigService.getAlipayNotifyUrl() != null ? systemConfigService.getAlipayNotifyUrl() : "");
        config.put("returnUrl", systemConfigService.getAlipayReturnUrl() != null ? systemConfigService.getAlipayReturnUrl() : "");
        config.put("gatewayUrl", systemConfigService.getAlipayGatewayUrl());
        return ResponseEntity.ok(config);
    }

    @PutMapping("/alipay")
    public ResponseEntity<Map<String, Object>> setAlipayConfig(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        String appId = request.get("appId");
        String privateKey = request.get("privateKey");
        String publicKey = request.get("publicKey");
        String notifyUrl = request.get("notifyUrl");
        String returnUrl = request.get("returnUrl");
        String gatewayUrl = request.get("gatewayUrl");
        
        if (appId != null) {
            systemConfigService.setAlipayAppId(appId);
        }
        if (privateKey != null && !privateKey.equals("******")) {
            systemConfigService.setAlipayPrivateKey(privateKey);
        }
        if (publicKey != null) {
            systemConfigService.setAlipayPublicKey(publicKey);
        }
        if (notifyUrl != null) {
            systemConfigService.setAlipayNotifyUrl(notifyUrl);
        }
        if (returnUrl != null) {
            systemConfigService.setAlipayReturnUrl(returnUrl);
        }
        if (gatewayUrl != null) {
            systemConfigService.setAlipayGatewayUrl(gatewayUrl);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("appId", systemConfigService.getAlipayAppId() != null ? systemConfigService.getAlipayAppId() : "");
        response.put("privateKey", "******");
        response.put("publicKey", systemConfigService.getAlipayPublicKey() != null ? systemConfigService.getAlipayPublicKey() : "");
        response.put("notifyUrl", systemConfigService.getAlipayNotifyUrl() != null ? systemConfigService.getAlipayNotifyUrl() : "");
        response.put("returnUrl", systemConfigService.getAlipayReturnUrl() != null ? systemConfigService.getAlipayReturnUrl() : "");
        response.put("gatewayUrl", systemConfigService.getAlipayGatewayUrl());
        return ResponseEntity.ok(response);
    }

    // ========== Guide Config Link ==========
    @GetMapping("/guide-link")
    public ResponseEntity<Map<String, Object>> getGuideConfigLink(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> config = new HashMap<>();
        config.put("link", systemConfigService.getGuideConfigLink() != null ? systemConfigService.getGuideConfigLink() : "");
        return ResponseEntity.ok(config);
    }

    @PutMapping("/guide-link")
    public ResponseEntity<Map<String, Object>> setGuideConfigLink(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        String link = request.get("link");
        if (link != null) {
            systemConfigService.setGuideConfigLink(link);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("link", systemConfigService.getGuideConfigLink() != null ? systemConfigService.getGuideConfigLink() : "");
        return ResponseEntity.ok(response);
    }
}

