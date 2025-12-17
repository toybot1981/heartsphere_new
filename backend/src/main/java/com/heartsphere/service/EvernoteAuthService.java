package com.heartsphere.service;

import com.heartsphere.entity.NoteSync;
import com.heartsphere.repository.NoteSyncRepository;
import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import oauth.signpost.basic.DefaultOAuthConsumer;
import oauth.signpost.basic.DefaultOAuthProvider;
import oauth.signpost.exception.OAuthCommunicationException;
import oauth.signpost.exception.OAuthExpectationFailedException;
import oauth.signpost.exception.OAuthMessageSignerException;
import oauth.signpost.exception.OAuthNotAuthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * 印象笔记OAuth授权服务
 * 印象笔记使用OAuth 1.0a协议
 */
@Service
public class EvernoteAuthService {

    private static final Logger logger = Logger.getLogger(EvernoteAuthService.class.getName());

    @Autowired
    private NoteSyncRepository noteSyncRepository;

    @Autowired
    private com.heartsphere.admin.service.SystemConfigService systemConfigService;

    // 从配置文件读取默认值（如果数据库中没有配置）
    @Value("${evernote.consumer-key:}")
    private String defaultConsumerKey;

    @Value("${evernote.consumer-secret:}")
    private String defaultConsumerSecret;

    @Value("${evernote.sandbox:true}")
    private boolean defaultSandbox; // 是否使用沙箱环境

    /**
     * 获取印象笔记Consumer Key（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getConsumerKey() {
        String dbKey = systemConfigService.getEvernoteConsumerKey();
        logger.info("读取印象笔记Consumer Key - 数据库值: " + (dbKey != null ? dbKey : "null") + ", 默认值: " + (defaultConsumerKey != null ? defaultConsumerKey : "null"));
        String result = (dbKey != null && !dbKey.trim().isEmpty()) ? dbKey : defaultConsumerKey;
        logger.info("最终使用的Consumer Key: " + (result != null ? result : "null"));
        return result;
    }

    /**
     * 获取印象笔记Consumer Secret（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getConsumerSecret() {
        String dbSecret = systemConfigService.getEvernoteConsumerSecret();
        logger.info("读取印象笔记Consumer Secret - 数据库值: " + (dbSecret != null ? "***" : "null") + ", 默认值: " + (defaultConsumerSecret != null ? "***" : "null"));
        String result = (dbSecret != null && !dbSecret.trim().isEmpty()) ? dbSecret : defaultConsumerSecret;
        logger.info("最终使用的Consumer Secret: " + (result != null ? "***" : "null"));
        return result;
    }

    /**
     * 获取印象笔记是否使用沙箱环境（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private boolean isSandbox() {
        try {
            return systemConfigService.isEvernoteSandbox();
        } catch (Exception e) {
            return defaultSandbox;
        }
    }

    // 印象笔记API端点
    // 参考官方文档: https://dev.yinxiang.com/doc/articles/authentication.php
    // OAuth 端点: https://sandbox.yinxiang.com/oauth (沙箱环境)
    // OAuth 端点: https://www.yinxiang.com/oauth (生产环境)
    // 授权页面: https://sandbox.yinxiang.com/OAuth.action (沙箱环境)
    // 授权页面: https://www.yinxiang.com/OAuth.action (生产环境)
    private static final String EVERNOTE_SANDBOX_URL = "https://sandbox.yinxiang.com";
    private static final String EVERNOTE_PRODUCTION_URL = "https://www.yinxiang.com";
    // Request Token 和 Access Token 使用相同的端点 /oauth，通过不同的 HTTP 方法和参数区分
    private static final String EVERNOTE_SANDBOX_REQUEST_TOKEN_URL = "https://sandbox.yinxiang.com/oauth";
    private static final String EVERNOTE_PRODUCTION_REQUEST_TOKEN_URL = "https://www.yinxiang.com/oauth";
    private static final String EVERNOTE_SANDBOX_ACCESS_TOKEN_URL = "https://sandbox.yinxiang.com/oauth";
    private static final String EVERNOTE_PRODUCTION_ACCESS_TOKEN_URL = "https://www.yinxiang.com/oauth";
    private static final String EVERNOTE_SANDBOX_AUTHORIZE_URL = "https://sandbox.yinxiang.com/OAuth.action";
    private static final String EVERNOTE_PRODUCTION_AUTHORIZE_URL = "https://www.yinxiang.com/OAuth.action";

    // 存储临时请求令牌：state -> {requestToken, requestTokenSecret, userId}
    private final Map<String, Map<String, Object>> requestTokens = new ConcurrentHashMap<>();

    /**
     * 获取印象笔记授权URL
     * OAuth 1.0a 流程：
     * 1. 获取 request token（需要签名）
     * 2. 使用 request token 构建授权URL
     * 3. 用户授权后，使用 request token 和 verifier 获取 access token
     * 
     * @param userId 用户ID
     * @param callbackUrl 回调URL
     * @return 包含授权URL和state的Map
     */
    public Map<String, String> getAuthorizationUrl(Long userId, String callbackUrl) {
        String consumerKey = getConsumerKey();
        String consumerSecret = getConsumerSecret();
        boolean sandbox = isSandbox();

        logger.info("检查印象笔记配置 - Consumer Key: " + (consumerKey != null && !consumerKey.isEmpty() ? "已配置" : "未配置") + 
                   ", Consumer Secret: " + (consumerSecret != null && !consumerSecret.isEmpty() ? "已配置" : "未配置"));

        if (consumerKey == null || consumerKey.isEmpty() || consumerSecret == null || consumerSecret.isEmpty()) {
            logger.severe("印象笔记配置检查失败 - Consumer Key为空: " + (consumerKey == null || consumerKey.isEmpty()) + 
                         ", Consumer Secret为空: " + (consumerSecret == null || consumerSecret.isEmpty()));
            throw new RuntimeException("印象笔记Consumer Key和Secret未配置，请在管理后台配置");
        }

        try {
            String state = UUID.randomUUID().toString().replace("-", "");
            
            // 选择正确的端点
            String requestTokenUrl = sandbox ? EVERNOTE_SANDBOX_REQUEST_TOKEN_URL : EVERNOTE_PRODUCTION_REQUEST_TOKEN_URL;
            String authorizeUrl = sandbox ? EVERNOTE_SANDBOX_AUTHORIZE_URL : EVERNOTE_PRODUCTION_AUTHORIZE_URL;
            
            logger.info("开始OAuth 1.0a流程 - 使用沙箱环境: " + sandbox + ", requestTokenUrl: " + requestTokenUrl);

            // 创建 OAuth Consumer
            OAuthConsumer consumer = new DefaultOAuthConsumer(consumerKey, consumerSecret);
            
            // 创建 OAuth Provider
            // 注意：request token 和 access token 使用相同的端点，但通过不同的 HTTP 方法区分
            String accessTokenUrl = sandbox ? EVERNOTE_SANDBOX_ACCESS_TOKEN_URL : EVERNOTE_PRODUCTION_ACCESS_TOKEN_URL;
            OAuthProvider provider = new DefaultOAuthProvider(
                requestTokenUrl,
                accessTokenUrl,
                authorizeUrl
            );

            // 步骤1: 获取 request token（需要签名）
            logger.info("步骤1: 获取 request token...");
            logger.info("OAuth配置详情 - Consumer Key: " + consumerKey + ", Callback URL: " + callbackUrl);
            logger.info("OAuth端点 - Request Token URL: " + requestTokenUrl + ", Access Token URL: " + accessTokenUrl + ", Authorize URL: " + authorizeUrl);
            
            String authUrl = provider.retrieveRequestToken(consumer, callbackUrl);
            
            // 获取 request token 和 secret
            String requestToken = consumer.getToken();
            String requestTokenSecret = consumer.getTokenSecret();
            
            logger.info("成功获取 request token - token: " + requestToken + ", secret: " + (requestTokenSecret != null ? "***" : "null"));
            logger.info("授权URL: " + authUrl);
            
            // 验证授权URL格式
            if (authUrl == null || authUrl.isEmpty()) {
                logger.severe("授权URL为空！");
                throw new RuntimeException("获取授权URL失败：授权URL为空");
            }
            
            if (!authUrl.contains("oauth_token=")) {
                logger.warning("授权URL格式异常，可能不包含oauth_token参数: " + authUrl);
            }

            // 存储 request token 和 secret，用于后续交换 access token
            Map<String, Object> tokenInfo = new HashMap<>();
            tokenInfo.put("userId", userId);
            tokenInfo.put("requestToken", requestToken);
            tokenInfo.put("requestTokenSecret", requestTokenSecret);
            tokenInfo.put("createdAt", System.currentTimeMillis());
            requestTokens.put(state, tokenInfo);

            Map<String, String> result = new HashMap<>();
            result.put("authorizationUrl", authUrl);
            result.put("state", state);

            logger.info("生成印象笔记授权URL成功: userId=" + userId + ", state=" + state);
            return result;

        } catch (OAuthMessageSignerException e) {
            logger.severe("OAuth签名失败: " + e.getMessage());
            throw new RuntimeException("OAuth签名失败: " + e.getMessage(), e);
        } catch (OAuthNotAuthorizedException e) {
            logger.severe("OAuth未授权: " + e.getMessage());
            throw new RuntimeException("OAuth未授权: " + e.getMessage(), e);
        } catch (OAuthExpectationFailedException e) {
            logger.severe("OAuth期望失败: " + e.getMessage());
            throw new RuntimeException("OAuth期望失败: " + e.getMessage(), e);
        } catch (OAuthCommunicationException e) {
            logger.severe("OAuth通信失败: " + e.getMessage());
            throw new RuntimeException("OAuth通信失败: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.severe("生成印象笔记授权URL失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("生成授权URL失败: " + e.getMessage(), e);
        }
    }

    /**
     * 处理授权回调
     * OAuth 1.0a 流程步骤3: 使用 request token 和 verifier 交换 access token
     * 
     * @param state 状态码
     * @param oauthToken OAuth令牌（request token）
     * @param oauthVerifier OAuth验证码
     * @return 授权结果
     */
    public Map<String, Object> handleCallback(String state, String oauthToken, String oauthVerifier) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 验证state
            Map<String, Object> tokenInfo = requestTokens.get(state);
            if (tokenInfo == null) {
                result.put("status", "error");
                result.put("error", "无效的state参数");
                return result;
            }

            // 检查是否过期（30分钟）
            long createdAt = (Long) tokenInfo.get("createdAt");
            if (System.currentTimeMillis() - createdAt > 30 * 60 * 1000) {
                requestTokens.remove(state);
                result.put("status", "error");
                result.put("error", "授权已过期，请重新授权");
                return result;
            }

            Long userId = ((Number) tokenInfo.get("userId")).longValue();
            String requestToken = (String) tokenInfo.get("requestToken");
            String requestTokenSecret = (String) tokenInfo.get("requestTokenSecret");
            boolean sandbox = isSandbox();

            if (requestToken == null || requestTokenSecret == null) {
                result.put("status", "error");
                result.put("error", "无效的request token");
                return result;
            }

            String consumerKey = getConsumerKey();
            String consumerSecret = getConsumerSecret();
            String accessTokenUrl = sandbox ? EVERNOTE_SANDBOX_ACCESS_TOKEN_URL : EVERNOTE_PRODUCTION_ACCESS_TOKEN_URL;

            logger.info("步骤3: 交换 access token - userId=" + userId + ", requestToken=" + requestToken);

            // 创建 OAuth Consumer，使用 request token
            OAuthConsumer consumer = new DefaultOAuthConsumer(consumerKey, consumerSecret);
            consumer.setTokenWithSecret(requestToken, requestTokenSecret);

            // 创建 OAuth Provider
            OAuthProvider provider = new DefaultOAuthProvider(
                accessTokenUrl,
                accessTokenUrl,
                sandbox ? EVERNOTE_SANDBOX_AUTHORIZE_URL : EVERNOTE_PRODUCTION_AUTHORIZE_URL
            );

            // 使用 verifier 交换 access token
            provider.retrieveAccessToken(consumer, oauthVerifier);

            // 获取 access token 和 secret
            String accessToken = consumer.getToken();
            String accessTokenSecret = consumer.getTokenSecret();

            logger.info("成功获取 access token - token: " + accessToken + ", secret: " + (accessTokenSecret != null ? "***" : "null"));

            // 保存或更新授权信息
            NoteSync noteSync = noteSyncRepository.findByUserIdAndProvider(userId, "evernote")
                .orElse(new NoteSync());

            noteSync.setUserId(userId);
            noteSync.setProvider("evernote");
            noteSync.setAccessToken(accessToken);
            noteSync.setRefreshToken(accessTokenSecret); // 将 access token secret 存储在 refreshToken 字段中
            noteSync.setIsActive(true);
            noteSync.setSyncStatus("authorized");
            noteSync.setLastSyncAt(java.time.LocalDateTime.now());

            noteSyncRepository.save(noteSync);

            // 清理临时token
            requestTokens.remove(state);

            result.put("status", "success");
            result.put("message", "授权成功");
            logger.info("印象笔记授权成功: userId=" + userId);

        } catch (OAuthMessageSignerException e) {
            logger.severe("OAuth签名失败: " + e.getMessage());
            result.put("status", "error");
            result.put("error", "OAuth签名失败: " + e.getMessage());
        } catch (OAuthNotAuthorizedException e) {
            logger.severe("OAuth未授权: " + e.getMessage());
            result.put("status", "error");
            result.put("error", "OAuth未授权: " + e.getMessage());
        } catch (OAuthExpectationFailedException e) {
            logger.severe("OAuth期望失败: " + e.getMessage());
            result.put("status", "error");
            result.put("error", "OAuth期望失败: " + e.getMessage());
        } catch (OAuthCommunicationException e) {
            logger.severe("OAuth通信失败: " + e.getMessage());
            result.put("status", "error");
            result.put("error", "OAuth通信失败: " + e.getMessage());
        } catch (Exception e) {
            logger.severe("处理印象笔记授权回调失败: " + e.getMessage());
            e.printStackTrace();
            result.put("status", "error");
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * 获取用户的授权信息
     * @param userId 用户ID
     * @return 授权信息
     */
    public NoteSync getAuthorization(Long userId) {
        return noteSyncRepository.findByUserIdAndProvider(userId, "evernote")
            .orElse(null);
    }

    /**
     * 撤销授权
     * @param userId 用户ID
     */
    public void revokeAuthorization(Long userId) {
        noteSyncRepository.findByUserIdAndProvider(userId, "evernote")
            .ifPresent(noteSync -> {
                noteSync.setIsActive(false);
                noteSync.setAccessToken(null);
                noteSync.setRefreshToken(null);
                noteSyncRepository.save(noteSync);
                logger.info("撤销印象笔记授权: userId=" + userId);
            });
    }

    /**
     * 检查授权是否有效
     * @param userId 用户ID
     * @return 是否已授权且有效
     */
    public boolean isAuthorized(Long userId) {
        return noteSyncRepository.findByUserIdAndProvider(userId, "evernote")
            .map(noteSync -> noteSync.getIsActive() != null && noteSync.getIsActive() 
                && noteSync.getAccessToken() != null && !noteSync.getAccessToken().isEmpty())
            .orElse(false);
    }
}

