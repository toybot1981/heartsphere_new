package com.heartsphere.mentis.controller;

import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.service.MentisSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Mentis 会话管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mentis/sessions")
@RequiredArgsConstructor
public class MentisSessionController {
    
    private final MentisSessionService sessionService;
    
    /**
     * 创建新会话
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MentisSession>> createSession(
            @RequestBody(required = false) CreateSessionRequest request,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        String title = request != null ? request.getTitle() : null;
        MentisSession session = sessionService.createSession(userId, title);
        
        return ResponseEntity.ok(ApiResponse.success(session));
    }
    
    /**
     * 创建会话请求DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateSessionRequest {
        private String title;
    }
    
    /**
     * 获取会话信息
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<MentisSession>> getSession(
            @PathVariable String sessionId) {
        
        MentisSession session = sessionService.getSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }
    
    /**
     * 获取用户的所有会话
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MentisSession>>> getUserSessions(
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        List<MentisSession> sessions = sessionService.getUserSessions(userId);
        
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }
    
    /**
     * 更新会话状态
     */
    @PutMapping("/{sessionId}/status")
    public ResponseEntity<ApiResponse<Void>> updateSessionStatus(
            @PathVariable String sessionId,
            @RequestParam String status) {
        
        sessionService.updateSessionStatus(sessionId, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 删除会话
     */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable String sessionId) {
        
        sessionService.deleteSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    private Long getUserId(Authentication authentication) {
        // 临时实现：如果没有认证信息，返回默认用户ID（开发测试用）
        // 生产环境需要配置真实的认证机制
        if (authentication == null || authentication.getPrincipal() == null) {
            log.warn("未提供认证信息，使用默认用户ID: 1");
            return 1L; // 默认用户ID，仅用于开发测试
        }
        
        if (authentication.getPrincipal() instanceof com.heartsphere.mentis.security.UserDetailsImpl) {
            com.heartsphere.mentis.security.UserDetailsImpl userDetails = 
                (com.heartsphere.mentis.security.UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        
        // 如果是字符串类型的 principal（可能是用户名），返回默认ID
        if (authentication.getPrincipal() instanceof String) {
            log.warn("认证信息为字符串类型，使用默认用户ID: 1");
            return 1L;
        }
        
        log.warn("未知的认证信息类型，使用默认用户ID: 1");
        return 1L;
    }
}
