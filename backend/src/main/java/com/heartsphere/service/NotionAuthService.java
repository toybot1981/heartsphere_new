package com.heartsphere.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.entity.NoteSync;
import com.heartsphere.repository.NoteSyncRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * Notion OAuth授权服务
 * Notion 使用 OAuth 2.0 协议
 * 参考：https://developers.notion.com/docs/authorization
 */
@Service
public class NotionAuthService {

    private static final Logger logger = Logger.getLogger(NotionAuthService.class.getName());

    @Autowired
    private NoteSyncRepository noteSyncRepository;

    @Autowired
    private com.heartsphere.admin.service.SystemConfigService systemConfigService;

    // 从配置文件读取默认值（如果数据库中没有配置）
    @Value("${notion.client-id:}")
    private String defaultClientId;

    @Value("${notion.client-secret:}")
    private String defaultClientSecret;

    @Value("${notion.redirect-uri:http://localhost:8081/api/notes/notion/callback}")
    private String defaultRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Notion API 端点
    // 参考官方文档: https://developers.notion.com/docs/authorization
    private static final String NOTION_AUTHORIZE_URL = "https://api.notion.com/v1/oauth/authorize";
    private static final String NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";

    // 存储授权状态：state -> {userId, createdAt}
    private final Map<String, Map<String, Object>> authStates = new ConcurrentHashMap<>();

    /**
     * 获取 Notion Client ID（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getClientId() {
        String dbClientId = systemConfigService.getNotionClientId();
        logger.info("读取 Notion Client ID - 数据库值: " + (dbClientId != null ? dbClientId : "null") + ", 默认值: " + (defaultClientId != null ? defaultClientId : "null"));
        String result = (dbClientId != null && !dbClientId.trim().isEmpty()) ? dbClientId : defaultClientId;
        logger.info("最终使用的 Client ID: " + (result != null ? result : "null"));
        return result;
    }

    /**
     * 获取 Notion Client Secret（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getClientSecret() {
        String dbClientSecret = systemConfigService.getNotionClientSecret();
        logger.info("读取 Notion Client Secret - 数据库值: " + (dbClientSecret != null ? "***" : "null") + ", 默认值: " + (defaultClientSecret != null ? "***" : "null"));
        String result = (dbClientSecret != null && !dbClientSecret.trim().isEmpty()) ? dbClientSecret : defaultClientSecret;
        logger.info("最终使用的 Client Secret: " + (result != null ? "***" : "null"));
        return result;
    }

    /**
     * 获取 Notion 回调地址（优先从数据库读取，如果数据库没有则使用配置文件默认值）
     */
    private String getRedirectUri() {
        String dbRedirectUri = systemConfigService.getNotionRedirectUri();
        return (dbRedirectUri != null && !dbRedirectUri.trim().isEmpty()) ? dbRedirectUri : defaultRedirectUri;
    }

    /**
     * 获取 Notion 授权URL
     * OAuth 2.0 授权码模式流程：
     * 1. 构建授权URL，引导用户授权
     * 2. 用户授权后，回调到callback，获取授权码code
     * 3. 使用code交换access_token
     * 
     * @param userId 用户ID
     * @param callbackUrl 回调URL（前端传递，但实际使用数据库配置的回调地址）
     * @return 包含授权URL和state的Map
     */
    public Map<String, String> getAuthorizationUrl(Long userId, String callbackUrl) {
        String clientId = getClientId();
        String clientSecret = getClientSecret();
        String redirectUri = getRedirectUri();

        logger.info("检查 Notion 配置 - Client ID: " + (clientId != null && !clientId.isEmpty() ? "已配置" : "未配置") + 
                   ", Client Secret: " + (clientSecret != null && !clientSecret.isEmpty() ? "已配置" : "未配置") +
                   ", Redirect URI: " + redirectUri);

        if (clientId == null || clientId.isEmpty() || clientSecret == null || clientSecret.isEmpty()) {
            logger.severe("Notion 配置检查失败 - Client ID为空: " + (clientId == null || clientId.isEmpty()) + 
                         ", Client Secret为空: " + (clientSecret == null || clientSecret.isEmpty()));
            throw new RuntimeException("Notion Client ID 和 Client Secret 未配置，请在管理后台配置");
        }

        try {
            String state = UUID.randomUUID().toString().replace("-", "");
            
            // 构建授权URL
            // Notion OAuth 2.0 参数：client_id, redirect_uri, response_type, owner
            // owner 参数可选：user（用户授权）或 workspace（工作区授权）
            String authorizeUrl = String.format(
                "%s?client_id=%s&redirect_uri=%s&response_type=code&owner=user&state=%s",
                NOTION_AUTHORIZE_URL,
                clientId,
                java.net.URLEncoder.encode(redirectUri, java.nio.charset.StandardCharsets.UTF_8),
                state
            );
            
            logger.info("生成 Notion 授权URL - userId=" + userId + ", state=" + state);
            logger.info("授权URL: " + authorizeUrl);

            // 存储授权状态
            Map<String, Object> stateInfo = new HashMap<>();
            stateInfo.put("userId", userId);
            stateInfo.put("createdAt", System.currentTimeMillis());
            authStates.put(state, stateInfo);

            // 清理过期状态（30分钟）
            cleanupExpiredStates();

            Map<String, String> result = new HashMap<>();
            result.put("authorizationUrl", authorizeUrl);
            result.put("state", state);

            return result;

        } catch (Exception e) {
            logger.severe("生成 Notion 授权URL失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("生成授权URL失败: " + e.getMessage(), e);
        }
    }

    /**
     * 处理授权回调
     * OAuth 2.0 流程步骤2和3: 使用授权码code交换access_token
     * 
     * @param state 状态码
     * @param code 授权码
     * @return 授权结果
     */
    public Map<String, Object> handleCallback(String state, String code) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 验证state
            Map<String, Object> stateInfo = authStates.get(state);
            if (stateInfo == null) {
                result.put("status", "error");
                result.put("error", "无效的state参数");
                return result;
            }

            // 检查是否过期（30分钟）
            long createdAt = (Long) stateInfo.get("createdAt");
            if (System.currentTimeMillis() - createdAt > 30 * 60 * 1000) {
                authStates.remove(state);
                result.put("status", "error");
                result.put("error", "授权已过期，请重新授权");
                return result;
            }

            Long userId = ((Number) stateInfo.get("userId")).longValue();
            String clientId = getClientId();
            String clientSecret = getClientSecret();
            String redirectUri = getRedirectUri();

            if (code == null || code.isEmpty()) {
                result.put("status", "error");
                result.put("error", "授权码为空");
                return result;
            }

            logger.info("处理 Notion 授权回调 - userId=" + userId + ", code=" + code.substring(0, Math.min(10, code.length())) + "...");

            // 使用授权码获取access_token
            // Notion 要求使用 Basic Auth 或表单数据提交
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "authorization_code");
            body.add("code", code);
            body.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            logger.info("请求 access_token - URL: " + NOTION_TOKEN_URL);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(NOTION_TOKEN_URL, request, Map.class);
            Map<String, Object> tokenResponseBody = tokenResponse.getBody();

            if (tokenResponseBody == null || tokenResponseBody.containsKey("error")) {
                logger.severe("获取 access_token 失败: " + tokenResponseBody);
                result.put("status", "error");
                result.put("error", "获取 access_token 失败: " + (tokenResponseBody != null ? tokenResponseBody.get("error_description") : "未知错误"));
                return result;
            }

            String accessToken = (String) tokenResponseBody.get("access_token");
            String workspaceId = (String) tokenResponseBody.get("workspace_id");
            String workspaceName = (String) tokenResponseBody.get("workspace_name");
            String botId = (String) tokenResponseBody.get("bot_id");

            if (accessToken == null || accessToken.isEmpty()) {
                logger.severe("access_token 为空");
                result.put("status", "error");
                result.put("error", "access_token 为空");
                return result;
            }

            logger.info("成功获取 access_token - token: " + accessToken.substring(0, Math.min(10, accessToken.length())) + "..., workspace_id: " + workspaceId);

            // 保存或更新授权信息
            NoteSync noteSync = noteSyncRepository.findByUserIdAndProvider(userId, "notion")
                .orElse(new NoteSync());

            noteSync.setUserId(userId);
            noteSync.setProvider("notion");
            noteSync.setAccessToken(accessToken);
            noteSync.setRefreshToken(workspaceId); // 将 workspace_id 存储在 refreshToken 字段中
            noteSync.setIsActive(true);
            noteSync.setSyncStatus("authorized");
            noteSync.setLastSyncAt(java.time.LocalDateTime.now());

            noteSyncRepository.save(noteSync);

            // 清理临时状态
            authStates.remove(state);

            result.put("status", "success");
            result.put("message", "授权成功");
            logger.info("Notion 授权成功: userId=" + userId + ", workspace_id=" + workspaceId);

        } catch (Exception e) {
            logger.severe("处理 Notion 授权回调失败: " + e.getMessage());
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
        return noteSyncRepository.findByUserIdAndProvider(userId, "notion")
            .orElse(null);
    }

    /**
     * 撤销授权
     * @param userId 用户ID
     */
    public void revokeAuthorization(Long userId) {
        noteSyncRepository.findByUserIdAndProvider(userId, "notion")
            .ifPresent(noteSync -> {
                noteSync.setIsActive(false);
                noteSync.setAccessToken(null);
                noteSync.setRefreshToken(null);
                noteSyncRepository.save(noteSync);
                logger.info("撤销 Notion 授权: userId=" + userId);
            });
    }

    /**
     * 检查授权是否有效
     * @param userId 用户ID
     * @return 是否已授权且有效
     */
    public boolean isAuthorized(Long userId) {
        return noteSyncRepository.findByUserIdAndProvider(userId, "notion")
            .map(noteSync -> noteSync.getIsActive() != null && noteSync.getIsActive()
                && noteSync.getAccessToken() != null && !noteSync.getAccessToken().isEmpty())
            .orElse(false);
    }

    /**
     * 更新 Notion 数据库 ID
     * @param userId 用户ID
     * @param databaseId 数据库 ID
     */
    public void updateDatabaseId(Long userId, String databaseId) {
        NoteSync noteSync = noteSyncRepository.findByUserIdAndProvider(userId, "notion")
            .orElseThrow(() -> new RuntimeException("未找到 Notion 授权信息，请先完成授权"));

        noteSync.setRefreshToken(databaseId); // 将数据库 ID 存储在 refreshToken 字段中
        noteSyncRepository.save(noteSync);
        
        logger.info("更新 Notion 数据库 ID - userId=" + userId + ", databaseId=" + databaseId);
    }

    /**
     * 清理过期的授权状态
     */
    private void cleanupExpiredStates() {
        long now = System.currentTimeMillis();
        authStates.entrySet().removeIf(entry -> {
            long createdAt = (Long) entry.getValue().get("createdAt");
            return now - createdAt > 30 * 60 * 1000; // 30分钟
        });
    }
}



