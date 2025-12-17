package com.heartsphere.service;

import com.heartsphere.entity.User;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * 微信OAuth2.0扫码登录服务
 */
@Service
public class WeChatAuthService {

    private static final Logger logger = Logger.getLogger(WeChatAuthService.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.heartsphere.service.InitializationService initializationService;

    @Autowired
    private com.heartsphere.admin.service.SystemConfigService systemConfigService;

    // 从配置文件读取默认值（如果数据库中没有配置）
    @Value("${wechat.app-id:}")
    private String defaultAppId;

    @Value("${wechat.app-secret:}")
    private String defaultAppSecret;

    @Value("${wechat.redirect-uri:http://localhost:8081/api/wechat/callback}")
    private String defaultRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 获取微信AppID（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    public String getAppId() {
        String dbAppId = systemConfigService.getWechatAppId();
        return (dbAppId != null && !dbAppId.trim().isEmpty()) ? dbAppId : defaultAppId;
    }

    /**
     * 获取微信AppSecret（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getAppSecret() {
        String dbAppSecret = systemConfigService.getWechatAppSecret();
        return (dbAppSecret != null && !dbAppSecret.trim().isEmpty()) ? dbAppSecret : defaultAppSecret;
    }

    /**
     * 获取微信回调地址（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getRedirectUri() {
        String dbRedirectUri = systemConfigService.getWechatRedirectUri();
        return (dbRedirectUri != null && !dbRedirectUri.trim().isEmpty()) ? dbRedirectUri : defaultRedirectUri;
    }

    // 存储登录状态：state -> {status: 'waiting'|'scanned'|'confirmed'|'expired', openid: '', token: ''}
    private final Map<String, Map<String, Object>> loginStates = new ConcurrentHashMap<>();

    /**
     * 生成登录二维码URL和state
     */
    public Map<String, String> generateQrCodeUrl() {
        String appId = getAppId();
        String redirectUri = getRedirectUri();
        
        if (appId == null || appId.trim().isEmpty()) {
            throw new RuntimeException("微信AppID未配置，请在管理后台配置");
        }
        
        String state = UUID.randomUUID().toString().replace("-", "");
        String scope = "snsapi_login"; // 网站应用使用snsapi_login
        
        // 微信开放平台扫码登录URL
        String qrCodeUrl = String.format(
            "https://open.weixin.qq.com/connect/qrconnect?appid=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s#wechat_redirect",
            appId,
            java.net.URLEncoder.encode(redirectUri, java.nio.charset.StandardCharsets.UTF_8),
            scope,
            state
        );

        // 初始化登录状态
        Map<String, Object> stateInfo = new HashMap<>();
        stateInfo.put("status", "waiting");
        stateInfo.put("createdAt", System.currentTimeMillis());
        loginStates.put(state, stateInfo);

        // 清理过期状态（30分钟）
        cleanupExpiredStates();

        logger.info("生成微信登录二维码，state: " + state);
        
        Map<String, String> result = new HashMap<>();
        result.put("qrCodeUrl", qrCodeUrl);
        result.put("state", state);
        return result;
    }

    /**
     * 处理微信回调
     */
    public Map<String, Object> handleCallback(String code, String state) {
        logger.info("收到微信回调，code: " + code + ", state: " + state);

        if (code == null || state == null) {
            throw new RuntimeException("微信回调参数错误");
        }

        Map<String, Object> stateInfo = loginStates.get(state);
        if (stateInfo == null) {
            throw new RuntimeException("无效的state参数");
        }

        try {
            String appId = getAppId();
            String appSecret = getAppSecret();
            
            if (appId == null || appId.trim().isEmpty() || appSecret == null || appSecret.trim().isEmpty()) {
                throw new RuntimeException("微信配置未完成，请在管理后台配置AppID和AppSecret");
            }
            
            // 1. 通过code获取access_token
            String tokenUrl = String.format(
                "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code",
                appId, appSecret, code
            );

            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
            if (tokenResponse == null || tokenResponse.containsKey("errcode")) {
                logger.severe("获取access_token失败: " + tokenResponse);
                stateInfo.put("status", "error");
                stateInfo.put("error", "获取access_token失败");
                return stateInfo;
            }

            String accessToken = (String) tokenResponse.get("access_token");
            String openid = (String) tokenResponse.get("openid");

            // 2. 通过access_token获取用户信息
            String userInfoUrl = String.format(
                "https://api.weixin.qq.com/sns/userinfo?access_token=%s&openid=%s",
                accessToken, openid
            );

            Map<String, Object> userInfoResponse = restTemplate.getForObject(userInfoUrl, Map.class);
            if (userInfoResponse == null || userInfoResponse.containsKey("errcode")) {
                logger.severe("获取用户信息失败: " + userInfoResponse);
                stateInfo.put("status", "error");
                stateInfo.put("error", "获取用户信息失败");
                return stateInfo;
            }

            String nickname = (String) userInfoResponse.get("nickname");
            String avatar = (String) userInfoResponse.get("headimgurl");
            // unionid可能为空，不需要使用

            // 3. 查找或创建用户
            User user = userRepository.findByWechatOpenid(openid)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setWechatOpenid(openid);
                        newUser.setUsername("wx_" + openid.substring(0, Math.min(10, openid.length())));
                        newUser.setEmail(openid + "@wechat.com");
                        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                        newUser.setNickname(nickname != null ? nickname : "微信用户");
                        newUser.setAvatar(avatar);
                        newUser.setIsEnabled(true);
                        User saved = userRepository.save(newUser);
                        // 初始化用户数据
                        initializationService.initializeUserData(saved);
                        return saved;
                    });

            // 更新用户信息（如果微信信息有更新）
            boolean needUpdate = false;
            if (nickname != null && (user.getNickname() == null || !nickname.equals(user.getNickname()))) {
                user.setNickname(nickname);
                needUpdate = true;
            }
            if (avatar != null && (user.getAvatar() == null || !avatar.equals(user.getAvatar()))) {
                user.setAvatar(avatar);
                needUpdate = true;
            }
            if (needUpdate) {
                userRepository.save(user);
            }

            // 4. 生成JWT token
            String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());

            // 5. 更新状态
            stateInfo.put("status", "confirmed");
            stateInfo.put("openid", openid);
            stateInfo.put("token", jwt);
            stateInfo.put("userId", user.getId());
            stateInfo.put("username", user.getUsername());
            stateInfo.put("nickname", user.getNickname());
            stateInfo.put("avatar", user.getAvatar());

            logger.info("微信登录成功，用户ID: " + user.getId() + ", openid: " + openid);
            return stateInfo;

        } catch (Exception e) {
            logger.severe("处理微信回调异常: " + e.getMessage());
            stateInfo.put("status", "error");
            stateInfo.put("error", e.getMessage());
            return stateInfo;
        }
    }

    /**
     * 检查登录状态
     */
    public Map<String, Object> checkLoginStatus(String state) {
        Map<String, Object> stateInfo = loginStates.get(state);
        if (stateInfo == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("status", "expired");
            return result;
        }

        // 检查是否过期（30分钟）
        long createdAt = (Long) stateInfo.get("createdAt");
        if (System.currentTimeMillis() - createdAt > 30 * 60 * 1000) {
            loginStates.remove(state);
            Map<String, Object> result = new HashMap<>();
            result.put("status", "expired");
            return result;
        }

        return stateInfo;
    }

    /**
     * 清理过期的登录状态
     */
    private void cleanupExpiredStates() {
        long expireTime = System.currentTimeMillis() - 30 * 60 * 1000; // 30分钟
        loginStates.entrySet().removeIf(entry -> {
            Map<String, Object> info = entry.getValue();
            long createdAt = (Long) info.get("createdAt");
            return createdAt < expireTime;
        });
    }
}

