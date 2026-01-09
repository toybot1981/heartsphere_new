package com.heartsphere.mentis.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.service.MentisAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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
    @PostMapping("/stream")
    public SseEmitter chatStream(
            @RequestBody ChatRequestDTO request,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        log.info("收到流式聊天请求: userId={}, sessionId={}", userId, request.getSessionId());
        
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        // 使用异步处理，避免阻塞
        new Thread(() -> {
            try {
                agentService.processMessageStream(userId, request, (ChatResponseDTO chunk) -> {
                    try {
                        // 发送 SSE 事件
                        emitter.send(SseEmitter.event()
                                .name("message")
                                .data(chunk));
                    } catch (Exception e) {
                        log.error("发送SSE数据失败", e);
                        emitter.completeWithError(e);
                    }
                });
                
                // 发送完成事件
                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data("Stream completed"));
                emitter.complete();
                
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
            log.warn("SSE 连接超时: userId={}, sessionId={}", userId, request.getSessionId());
            emitter.complete();
        });
        
        emitter.onError((ex) -> {
            log.error("SSE 连接错误: userId={}, sessionId={}", userId, request.getSessionId(), ex);
            emitter.completeWithError(ex);
        });
        
        return emitter;
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
