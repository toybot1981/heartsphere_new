package com.heartsphere.mentis.controller;

import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.entity.MentisMessage;
import com.heartsphere.mentis.service.MentisAgentService;
import com.heartsphere.mentis.service.MentisMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Mentis 对话控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mentis/chat")
@ConditionalOnProperty(prefix = "mentis", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class MentisChatController {
    
    private final MentisAgentService agentService;
    private final MentisMessageService messageService;
    
    /**
     * 获取会话消息历史
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ApiResponse<List<MentisMessage>>> getChatHistory(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        log.info("获取聊天历史: userId={}, sessionId={}", userId, sessionId);
        
        try {
            List<MentisMessage> messages = messageService.getSessionMessages(sessionId);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (RuntimeException e) {
            log.warn("获取聊天历史失败: sessionId={}, error={}", sessionId, e.getMessage());
            // 如果会话不存在，返回空列表而不是错误
            if (e.getMessage() != null && e.getMessage().contains("会话不存在")) {
                return ResponseEntity.ok(ApiResponse.success(new java.util.ArrayList<>()));
            }
            // 其他错误返回 500
            return ResponseEntity.status(500).body(ApiResponse.error("获取聊天历史失败: " + e.getMessage()));
        } catch (Exception e) {
            log.error("获取聊天历史异常: sessionId={}", sessionId, e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取聊天历史失败: " + e.getMessage()));
        }
    }
    
    /**
     * 发送消息给 Mentis（同步）
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<ChatResponseDTO>> sendMessage(
            @RequestBody ChatRequestDTO request,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        log.info("收到聊天请求: userId={}, sessionId={}", userId, request.getSessionId());
        
        ChatResponseDTO response = agentService.processMessage(userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 发送消息给 Mentis（兼容旧接口）
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponseDTO>> chat(
            @RequestBody ChatRequestDTO request,
            Authentication authentication) {
        return sendMessage(request, authentication);
    }
    
    /**
     * 流式发送消息给 Mentis
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(
            @RequestBody ChatRequestDTO request,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        log.info("收到流式聊天请求: userId={}, sessionId={}", userId, request.getSessionId());
        
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        AtomicBoolean completed = new AtomicBoolean(false); // 跟踪 emitter 是否已完成
        
        // 安全发送 SSE 事件的辅助方法
        java.util.function.Consumer<java.util.function.Consumer<SseEmitter>> safeSend = (sendAction) -> {
            if (!completed.get()) {
                try {
                    sendAction.accept(emitter);
                } catch (IllegalStateException e) {
                    // Emitter 已经完成，忽略错误
                    if (e.getMessage() != null && e.getMessage().contains("already completed")) {
                        log.debug("SSE emitter 已完成，跳过发送: sessionId={}", request.getSessionId());
                        completed.set(true);
                    } else {
                        log.warn("SSE emitter 状态异常: sessionId={}, error={}", request.getSessionId(), e.getMessage());
                    }
                } catch (Exception e) {
                    log.error("发送 SSE 事件失败: sessionId={}", request.getSessionId(), e);
                    if (!completed.get()) {
                        try {
                            completed.set(true);
                            emitter.completeWithError(e);
                        } catch (Exception ex) {
                            log.error("完成 SSE emitter 失败: sessionId={}", request.getSessionId(), ex);
                        }
                    }
                }
            }
        };
        
        // 使用异步处理，避免阻塞
        new Thread(() -> {
            try {
                agentService.processMessageStream(userId, request, (ChatResponseDTO chunk) -> {
                    safeSend.accept((em) -> {
                        try {
                            // 发送 SSE 事件
                            log.debug("准备发送 SSE 事件: sessionId={}, responseLength={}", 
                                    chunk.getSessionId(), 
                                    chunk.getResponse() != null ? chunk.getResponse().length() : 0);
                            em.send(SseEmitter.event()
                                    .name("message")
                                    .data(chunk));
                            log.debug("SSE 事件已发送: sessionId={}", chunk.getSessionId());
                        } catch (IOException e) {
                            throw new RuntimeException("发送 SSE 事件 IO 失败", e);
                        }
                    });
                });
                
                // 发送完成事件
                safeSend.accept((em) -> {
                    try {
                        em.send(SseEmitter.event()
                                .name("complete")
                                .data("Stream completed"));
                        completed.set(true);
                        em.complete();
                    } catch (IOException e) {
                        throw new RuntimeException("发送完成事件 IO 失败", e);
                    }
                });
                
            } catch (Exception e) {
                log.error("流式处理失败: sessionId={}", request.getSessionId(), e);
                safeSend.accept((em) -> {
                    try {
                        em.send(SseEmitter.event()
                                .name("error")
                                .data("Error: " + e.getMessage()));
                    } catch (IOException ioException) {
                        throw new RuntimeException("发送错误事件 IO 失败", ioException);
                    }
                });
                if (!completed.get()) {
                    try {
                        completed.set(true);
                        emitter.completeWithError(e);
                    } catch (Exception ex) {
                        log.error("完成 SSE emitter 失败: sessionId={}", request.getSessionId(), ex);
                    }
                }
            }
        }).start();
        
        // 设置超时和错误处理
        emitter.onTimeout(() -> {
            log.warn("SSE 连接超时: userId={}, sessionId={}", userId, request.getSessionId());
            if (!completed.get()) {
                completed.set(true);
                try {
                    emitter.complete();
                } catch (Exception e) {
                    log.error("完成超时的 SSE emitter 失败: sessionId={}", request.getSessionId(), e);
                }
            }
        });
        
        emitter.onError((ex) -> {
            log.error("SSE 连接错误: userId={}, sessionId={}", userId, request.getSessionId(), ex);
            if (!completed.get()) {
                completed.set(true);
                try {
                    emitter.completeWithError(ex);
                } catch (Exception e) {
                    log.error("完成错误的 SSE emitter 失败: sessionId={}", request.getSessionId(), e);
                }
            }
        });
        
        return emitter;
    }
    
    private Long getUserId(Authentication authentication) {
        // 如果没有认证信息，返回默认用户ID（允许匿名访问，使用默认用户）
        if (authentication == null || authentication.getPrincipal() == null) {
            log.warn("未提供认证信息，使用默认用户ID: 1");
            return 1L; // 默认用户ID，允许匿名访问
        }
        
        // 如果 principal 是 UserDetailsImpl 类型，获取用户ID
        if (authentication.getPrincipal() instanceof com.heartsphere.mentis.security.UserDetailsImpl) {
            com.heartsphere.mentis.security.UserDetailsImpl userDetails = 
                (com.heartsphere.mentis.security.UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        
        // 如果 principal 是字符串类型（可能是用户名），返回默认ID
        if (authentication.getPrincipal() instanceof String) {
            log.warn("认证信息为字符串类型（用户名），使用默认用户ID: 1");
            return 1L;
        }
        
        // 其他情况，返回默认ID
        log.warn("未知的认证信息类型，使用默认用户ID: 1");
        return 1L;
    }
}
