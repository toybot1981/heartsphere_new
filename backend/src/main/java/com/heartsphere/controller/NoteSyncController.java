package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.entity.Note;
import com.heartsphere.entity.NoteSync;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.NotionAuthService;
import com.heartsphere.service.NoteSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 笔记同步控制器
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notes")
public class NoteSyncController {

    @Autowired
    private NotionAuthService notionAuthService;

    @Autowired
    private com.heartsphere.admin.service.SystemConfigService systemConfigService;

    @Autowired
    private NoteSyncService noteSyncService;

    /**
     * 获取笔记同步按钮显示状态（公共API，无需认证）
     */
    @GetMapping("/sync-button-enabled")
    public ResponseEntity<Map<String, Boolean>> getSyncButtonEnabled() {
        Map<String, Boolean> result = new HashMap<>();
        result.put("enabled", systemConfigService.isNotionSyncButtonEnabled());
        return ResponseEntity.ok(result);
    }

    /**
     * 获取 Notion 授权URL
     */
    @GetMapping("/notion/authorize")
    public ResponseEntity<ApiResponse<Map<String, String>>> getNotionAuthUrl(
            Authentication authentication,
            @RequestParam String callbackUrl) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            Map<String, String> authInfo = notionAuthService.getAuthorizationUrl(userId, callbackUrl);
            return ResponseEntity.ok(ApiResponse.success("获取授权URL成功", authInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("获取授权URL失败: " + e.getMessage()));
        }
    }

    /**
     * 处理 Notion 授权回调
     */
    @GetMapping("/notion/callback")
    public ResponseEntity<String> handleNotionCallback(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String code) {
        
        try {
            Map<String, Object> result = notionAuthService.handleCallback(state, code);
            
            // 返回HTML页面，用于显示授权结果并通知父窗口
            String status = (String) result.get("status");
            String message = status.equals("success") ? "授权成功！" : (String) result.getOrDefault("error", "授权失败");
            
            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Notion 授权</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            color: white;
                        }
                        .container {
                            text-align: center;
                            padding: 2rem;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 1rem;
                            backdrop-filter: blur(10px);
                        }
                        .success { color: #4ade80; }
                        .error { color: #f87171; }
                        .spinner {
                            border: 3px solid rgba(255, 255, 255, 0.3);
                            border-top: 3px solid white;
                            border-radius: 50%%;
                            width: 40px;
                            height: 40px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 1rem;
                        }
                        @keyframes spin {
                            0%% { transform: rotate(0deg); }
                            100%% { transform: rotate(360deg); }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="spinner"></div>
                        <h2 class="%s">%s</h2>
                        <p>窗口将在3秒后自动关闭...</p>
                    </div>
                    <script>
                        // 通知父窗口授权结果
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'notion_auth_result',
                                status: '%s',
                                message: '%s'
                            }, '*');
                        }
                        // 3秒后自动关闭窗口
                        setTimeout(() => {
                            window.close();
                        }, 3000);
                    </script>
                </body>
                </html>
                """, 
                status.equals("success") ? "success" : "error",
                message,
                status,
                message.replace("'", "\\'")
            );
            
            return ResponseEntity.ok()
                .header("Content-Type", "text/html;charset=UTF-8")
                .body(html);
        } catch (Exception e) {
            String errorHtml = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Notion 授权失败</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #f87171 0%%, #dc2626 100%%);
                            color: white;
                        }
                        .container {
                            text-align: center;
                            padding: 2rem;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 1rem;
                            backdrop-filter: blur(10px);
                        }
                        .error { color: #fecaca; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2 class="error">授权失败</h2>
                        <p>%s</p>
                        <p>窗口将在3秒后自动关闭...</p>
                    </div>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'notion_auth_result',
                                status: 'error',
                                message: '%s'
                            }, '*');
                        }
                        setTimeout(() => {
                            window.close();
                        }, 3000);
                    </script>
                </body>
                </html>
                """,
                e.getMessage(),
                e.getMessage().replace("'", "\\'")
            );
            
            return ResponseEntity.ok()
                .header("Content-Type", "text/html;charset=UTF-8")
                .body(errorHtml);
        }
    }

    /**
     * 获取用户的笔记同步配置列表
     */
    @GetMapping("/syncs")
    public ResponseEntity<ApiResponse<List<NoteSync>>> getNoteSyncs(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<NoteSync> syncs = noteSyncService.getUserNoteSyncs(userId);
        return ResponseEntity.ok(ApiResponse.success("获取同步配置成功", syncs));
    }

    /**
     * 获取指定provider的授权状态
     */
    @GetMapping("/syncs/{provider}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSyncStatus(
            Authentication authentication,
            @PathVariable String provider) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        Map<String, Object> status = new HashMap<>();
        
        if ("notion".equalsIgnoreCase(provider)) {
            boolean authorized = notionAuthService.isAuthorized(userId);
            status.put("authorized", authorized);
            
            if (authorized) {
                NoteSync noteSync = notionAuthService.getAuthorization(userId);
                status.put("lastSyncAt", noteSync.getLastSyncAt());
                status.put("syncStatus", noteSync.getSyncStatus());
            }
        } else {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("不支持的笔记服务提供商: " + provider));
        }

        return ResponseEntity.ok(ApiResponse.success("获取状态成功", status));
    }

    /**
     * 同步笔记
     */
    @PostMapping("/syncs/{provider}/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncNotes(
            Authentication authentication,
            @PathVariable String provider) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        Map<String, Object> result = noteSyncService.syncNotes(userId, provider);
        return ResponseEntity.ok(ApiResponse.success("同步完成", result));
    }

    /**
     * 撤销授权
     */
    @DeleteMapping("/syncs/{provider}")
    public ResponseEntity<ApiResponse<Void>> revokeAuthorization(
            Authentication authentication,
            @PathVariable String provider) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        if ("notion".equalsIgnoreCase(provider)) {
            notionAuthService.revokeAuthorization(userId);
        } else {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("不支持的笔记服务提供商: " + provider));
        }

        return ResponseEntity.ok(ApiResponse.success("撤销授权成功", null));
    }

    /**
     * 更新 Notion 数据库 ID
     */
    @PutMapping("/syncs/notion/database-id")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateNotionDatabaseId(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        String databaseId = request.get("databaseId");
        if (databaseId == null || databaseId.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("数据库 ID 不能为空"));
        }

        try {
            notionAuthService.updateDatabaseId(userId, databaseId.trim());
            Map<String, Object> result = new HashMap<>();
            result.put("databaseId", databaseId.trim());
            result.put("message", "数据库 ID 更新成功");
            return ResponseEntity.ok(ApiResponse.success("更新成功", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("更新失败: " + e.getMessage()));
        }
    }

    /**
     * 获取用户的笔记列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Note>>> getNotes(
            Authentication authentication,
            @RequestParam(required = false) String provider) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<Note> notes = noteSyncService.getUserNotes(userId, provider);
        return ResponseEntity.ok(ApiResponse.success("获取笔记列表成功", notes));
    }

    /**
     * 获取单个笔记详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Note>> getNote(
            Authentication authentication,
            @PathVariable Long id) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401)
                .body(ApiResponse.error("未授权，请先登录"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        Note note = noteSyncService.getUserNotes(userId, null).stream()
            .filter(n -> n.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new com.heartsphere.exception.ResourceNotFoundException("笔记", id));

        return ResponseEntity.ok(ApiResponse.success("获取笔记成功", note));
    }
}

