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
        return generateQrCodeUrl(null, "login");
    }

    /**
     * 生成绑定二维码URL和state（用于绑定微信）
     * @param userId 当前登录用户的ID
     */
    public Map<String, String> generateBindQrCodeUrl(Long userId) {
        return generateQrCodeUrl(userId, "bind");
    }

    /**
     * 生成二维码URL和state（通用方法）
     * @param userId 用户ID（绑定操作时需要，登录时可为null）
     * @param type 操作类型：login（登录）或 bind（绑定）
     */
    private Map<String, String> generateQrCodeUrl(Long userId, String type) {
        String operationType = "bind".equals(type) ? "绑定" : "登录";
        logger.info(String.format("开始生成微信%s二维码，userId=%s", operationType, userId));
        
        // 获取配置信息
        String appId = getAppId();
        String appSecret = getAppSecret();
        String redirectUri = getRedirectUri();
        
        logger.info(String.format("获取微信配置信息: appId=%s, appSecret=%s, redirectUri=%s", 
            appId != null ? appId : "null", 
            appSecret != null ? appSecret : "null", 
            redirectUri));
        
        if (appId == null || appId.trim().isEmpty()) {
            logger.warning("微信AppID未配置，请在管理后台配置");
            throw new RuntimeException("微信AppID未配置，请在管理后台配置");
        }
        
        // 生成state
        String state = UUID.randomUUID().toString().replace("-", "");
        // 网站应用使用snsapi_login，移动应用不支持扫码登录
        // 如果出现"Scope参数错误"错误，请检查微信开放平台应用类型是否为"网站应用"
        String scope = "snsapi_login"; 
        logger.info(String.format("生成微信%s二维码state: %s, scope: %s (注意：scope=snsapi_login仅适用于网站应用)", operationType, state, scope));
        
        // 微信开放平台扫码登录URL
        String qrCodeUrl = String.format(
            "https://open.weixin.qq.com/connect/qrconnect?appid=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s#wechat_redirect",
            appId,
            java.net.URLEncoder.encode(redirectUri, java.nio.charset.StandardCharsets.UTF_8),
            scope,
            state
        );
        logger.info(String.format("构建微信%s二维码URL完成，URL长度: %d", operationType, qrCodeUrl.length()));

        // 初始化状态
        Map<String, Object> stateInfo = new HashMap<>();
        stateInfo.put("status", "waiting");
        stateInfo.put("type", type);
        stateInfo.put("createdAt", System.currentTimeMillis());
        if (userId != null) {
            stateInfo.put("userId", userId);
        }
        loginStates.put(state, stateInfo);
        logger.info(String.format("初始化微信%s状态完成，state: %s, 当前状态数: %d", operationType, state, loginStates.size()));

        // 清理过期状态（30分钟）
        int beforeCleanup = loginStates.size();
        cleanupExpiredStates();
        int afterCleanup = loginStates.size();
        if (beforeCleanup != afterCleanup) {
            logger.info(String.format("清理过期状态完成，清理前: %d, 清理后: %d", beforeCleanup, afterCleanup));
        }

        logger.info(String.format("生成微信%s二维码完成，state: %s, qrCodeUrl已生成", operationType, state));
        
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

            logger.info(String.format("请求微信access_token，URL: %s", tokenUrl.replace(appSecret, "***")));
            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
            if (tokenResponse == null || tokenResponse.containsKey("errcode")) {
                String errorMsg = "获取access_token失败";
                if (tokenResponse != null) {
                    Object errcode = tokenResponse.get("errcode");
                    Object errmsg = tokenResponse.get("errmsg");
                    errorMsg = String.format("获取access_token失败: errcode=%s, errmsg=%s", errcode, errmsg);
                    logger.severe(errorMsg + ", 完整响应: " + tokenResponse);
                    
                    // 如果是scope相关错误，提供更详细的提示
                    if (errcode != null && (errcode.toString().equals("40029") || errmsg != null && errmsg.toString().contains("scope"))) {
                        errorMsg = "Scope参数错误或没有Scope权限。请检查：1) 微信开放平台应用类型是否为'网站应用'；2) 是否已申请网站应用权限；3) 授权回调域名是否正确配置";
                    }
                } else {
                    logger.severe("获取access_token失败: tokenResponse为null");
                }
                stateInfo.put("status", "error");
                stateInfo.put("error", errorMsg);
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

            // 判断操作类型
            String type = (String) stateInfo.get("type");
            if (type == null) {
                type = "login"; // 默认为登录
            }

            if ("bind".equals(type)) {
                // 绑定操作：将微信openid绑定到当前登录的用户
                Long userId = (Long) stateInfo.get("userId");
                if (userId == null) {
                    stateInfo.put("status", "error");
                    stateInfo.put("error", "绑定操作缺少用户ID");
                    return stateInfo;
                }

                // 检查该openid是否已被其他账号使用
                java.util.Optional<User> existingUser = userRepository.findByWechatOpenid(openid);
                if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                    stateInfo.put("status", "error");
                    stateInfo.put("error", "该微信账号已被其他账号绑定");
                    return stateInfo;
                }

                // 获取当前用户
                User currentUser = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("用户不存在"));

                // 如果该openid已被当前用户绑定，直接返回成功
                if (openid.equals(currentUser.getWechatOpenid())) {
                    stateInfo.put("status", "confirmed");
                    stateInfo.put("openid", openid);
                    stateInfo.put("message", "微信账号已绑定");
                    logger.info("微信账号已绑定，用户ID: " + userId + ", openid: " + openid);
                    return stateInfo;
                }

                // 绑定openid到当前用户
                currentUser.setWechatOpenid(openid);
                // 可选：更新头像和昵称（如果当前用户没有设置）
                if (avatar != null && (currentUser.getAvatar() == null || currentUser.getAvatar().trim().isEmpty())) {
                    currentUser.setAvatar(avatar);
                }
                if (nickname != null && (currentUser.getNickname() == null || currentUser.getNickname().trim().isEmpty())) {
                    currentUser.setNickname(nickname);
                }

                userRepository.save(currentUser);

                stateInfo.put("status", "confirmed");
                stateInfo.put("openid", openid);
                stateInfo.put("message", "微信绑定成功");
                logger.info("微信绑定成功，用户ID: " + userId + ", openid: " + openid);
                return stateInfo;
            } else {
                // 登录操作：查找或创建用户
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

                // 生成JWT token
                String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());

                // 更新状态
                stateInfo.put("status", "confirmed");
                stateInfo.put("openid", openid);
                stateInfo.put("token", jwt);
                stateInfo.put("userId", user.getId());
                stateInfo.put("username", user.getUsername());
                stateInfo.put("nickname", user.getNickname());
                stateInfo.put("avatar", user.getAvatar());

                logger.info("微信登录成功，用户ID: " + user.getId() + ", openid: " + openid);
                return stateInfo;
            }

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

