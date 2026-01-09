package com.heartsphere.mentis.controller;

import com.heartsphere.dto.ApiResponse;
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
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("用户未认证");
        }
        
        if (!(authentication.getPrincipal() instanceof com.heartsphere.security.UserDetailsImpl)) {
            throw new RuntimeException("无效的认证信息");
        }
        
        com.heartsphere.security.UserDetailsImpl userDetails = 
            (com.heartsphere.security.UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}
