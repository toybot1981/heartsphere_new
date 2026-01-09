package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.service.MentisAgentService;
import com.heartsphere.mentis.service.MentisSessionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 管理员 Mentis 体验控制器
 * 专门为管理员提供的 Mentis 功能接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/mentis")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "mentis", name = "enabled", havingValue = "true")
public class AdminMentisController extends BaseAdminController {
    
    private final MentisAgentService agentService;
    private final MentisSessionService sessionService;
    private final ObjectMapper objectMapper;
    
    /**
     * 创建管理员会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<MentisSession>> createSession(
            @RequestBody(required = false) CreateSessionRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            log.debug("收到创建会话请求: authHeader={}, request={}", 
                    authHeader != null ? (authHeader.length() > 10 ? authHeader.substring(0, 10) + "..." : authHeader) : "null",
                    request != null ? request.getTitle() : "null");
            
            SystemAdmin admin = validateAdminToken(authHeader);
            log.debug("管理员验证成功: adminId={}, username={}", admin.getId(), admin.getUsername());
            
            Long adminUserId = -admin.getId().longValue(); // 使用负数ID标识管理员
            
            log.info("管理员创建会话: adminId={}, adminUserId={}, title={}", 
                    admin.getId(), adminUserId, request != null ? request.getTitle() : null);
            
            String title = request != null ? request.getTitle() : "管理员体验会话";
            MentisSession session = sessionService.createSession(adminUserId, title);
            
            log.info("会话创建成功: sessionId={}, userId={}", session.getSessionId(), session.getUserId());
            return ResponseEntity.ok(ApiResponse.success(session));
            
        } catch (RuntimeException e) {
            log.error("创建会话失败", e);
            throw e; // 重新抛出，让全局异常处理器处理
        } catch (Exception e) {
            log.error("创建会话时发生未知错误", e);
            throw new RuntimeException("创建会话失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取管理员的所有会话
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<MentisSession>>> getAdminSessions(
            HttpServletRequest httpRequest) {
        
        SystemAdmin admin = validateAdminToken(httpRequest.getHeader("Authorization"));
        Long adminUserId = -admin.getId().longValue();
        
        log.debug("获取管理员会话列表: adminId={}, adminUserId={}", admin.getId(), adminUserId);
        
        List<MentisSession> sessions = sessionService.getUserSessions(adminUserId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }
    
    /**
     * 获取会话信息
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<MentisSession>> getSession(
            @PathVariable String sessionId,
            HttpServletRequest httpRequest) {
        
        validateAdminToken(httpRequest.getHeader("Authorization"));
        
        log.debug("获取会话信息: sessionId={}", sessionId);
        
        MentisSession session = sessionService.getSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }
    
    /**
     * 发送消息给 Mentis（同步）
     */
    @PostMapping("/chat/send")
    public ResponseEntity<ApiResponse<ChatResponseDTO>> sendMessage(
            @RequestBody ChatRequestDTO request,
            HttpServletRequest httpRequest) {
        
        SystemAdmin admin = validateAdminToken(httpRequest.getHeader("Authorization"));
        Long adminUserId = -admin.getId().longValue();
        
        log.info("管理员发送消息: adminId={}, adminUserId={}, sessionId={}", 
                admin.getId(), adminUserId, request.getSessionId());
        
        ChatResponseDTO response = agentService.processMessage(adminUserId, request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 流式发送消息给 Mentis
     */
    @PostMapping(value = "/chat/stream", produces = "text/event-stream")
    public SseEmitter chatStream(
            @RequestBody ChatRequestDTO request,
            HttpServletRequest httpRequest) {
        
        SystemAdmin admin = validateAdminToken(httpRequest.getHeader("Authorization"));
        Long adminUserId = -admin.getId().longValue();
        
        log.info("管理员流式发送消息: adminId={}, adminUserId={}, sessionId={}", 
                admin.getId(), adminUserId, request.getSessionId());
        
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        // 使用异步处理，避免阻塞
        new Thread(() -> {
            try {
                agentService.processMessageStream(adminUserId, request, (ChatResponseDTO chunk) -> {
                    try {
                        log.debug("准备发送 SSE 数据: sessionId={}, messageId={}, response={}", 
                                chunk.getSessionId(), chunk.getMessageId(), 
                                chunk.getResponse() != null ? chunk.getResponse().substring(0, Math.min(50, chunk.getResponse().length())) : "null");
                        // 发送 SSE 事件
                        emitter.send(SseEmitter.event()
                                .name("message")
                                .data(chunk));
                        log.debug("SSE 数据已发送");
                    } catch (Exception e) {
                        log.error("发送SSE数据失败", e);
                        emitter.completeWithError(e);
                    }
                });
                
                // 发送完成事件
                log.debug("发送 SSE 完成事件");
                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data("Stream completed"));
                emitter.complete();
                log.debug("SSE 流已完成");
                
            } catch (Exception e) {
                log.error("流式处理失败", e);
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data("Error: " + e.getMessage()));
                } catch (Exception ex) {
                    log.error("发送错误事件失败", ex);
                }
                emitter.completeWithError(e);
            }
        }).start();
        
        // 设置超时和错误处理
        emitter.onTimeout(() -> {
            log.warn("SSE 连接超时: adminId={}, sessionId={}", admin.getId(), request.getSessionId());
            emitter.complete();
        });
        
        emitter.onError((ex) -> {
            log.error("SSE 连接错误: adminId={}, sessionId={}", admin.getId(), request.getSessionId(), ex);
            emitter.completeWithError(ex);
        });
        
        return emitter;
    }
    
    /**
     * 更新会话状态
     */
    @PutMapping("/sessions/{sessionId}/status")
    public ResponseEntity<ApiResponse<Void>> updateSessionStatus(
            @PathVariable String sessionId,
            @RequestParam String status,
            HttpServletRequest httpRequest) {
        
        validateAdminToken(httpRequest.getHeader("Authorization"));
        
        log.info("更新会话状态: sessionId={}, status={}", sessionId, status);
        
        sessionService.updateSessionStatus(sessionId, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 删除会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable String sessionId,
            HttpServletRequest httpRequest) {
        
        validateAdminToken(httpRequest.getHeader("Authorization"));
        
        log.info("删除会话: sessionId={}", sessionId);
        
        sessionService.deleteSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 创建会话请求DTO
     */
    @Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateSessionRequest {
        private String title;
    }
}
