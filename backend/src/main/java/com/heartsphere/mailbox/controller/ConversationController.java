package com.heartsphere.mailbox.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mailbox.dto.ConversationQueryRequest;
import com.heartsphere.mailbox.dto.CreateConversationRequest;
import com.heartsphere.mailbox.dto.SendMessageRequest;
import com.heartsphere.mailbox.entity.Conversation;
import com.heartsphere.mailbox.entity.ConversationMessage;
import com.heartsphere.mailbox.service.ConversationService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 对话控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mailbox/conversations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConversationController {
    
    private final ConversationService conversationService;
    
    /**
     * 获取对话列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Conversation>>> getConversations(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            ConversationQueryRequest request) {
        
        Long userId = userDetails.getId();
        Page<Conversation> conversations = conversationService.getConversations(userId, request);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }
    
    /**
     * 创建对话
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Conversation>> createConversation(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CreateConversationRequest request) {
        
        Long userId = userDetails.getId();
        Conversation conversation = conversationService.createConversation(userId, request);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }
    
    /**
     * 获取对话详情
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<Conversation>> getConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        Conversation conversation = conversationService.getConversationById(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }
    
    /**
     * 获取对话消息列表
     */
    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<Page<ConversationMessage>>> getMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Long beforeMessageId) {
        
        Long userId = userDetails.getId();
        Page<ConversationMessage> messages = conversationService.getMessages(
            conversationId, userId, page, size, beforeMessageId
        );
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
    
    /**
     * 发送消息
     */
    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<ConversationMessage>> sendMessage(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody SendMessageRequest request) {
        
        Long userId = userDetails.getId();
        ConversationMessage message = conversationService.sendMessage(conversationId, userId, request);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
    
    /**
     * 标记对话为已读
     */
    @PutMapping("/{conversationId}/read")
    public ResponseEntity<ApiResponse<Conversation>> markAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        Conversation conversation = conversationService.markAsRead(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }
    
    /**
     * 置顶/取消置顶对话
     */
    @PutMapping("/{conversationId}/pin")
    public ResponseEntity<ApiResponse<Conversation>> pinConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Boolean> request) {
        
        Long userId = userDetails.getId();
        boolean pinned = request.getOrDefault("pinned", false);
        Conversation conversation = conversationService.pinConversation(conversationId, userId, pinned);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }
    
    /**
     * 设置对话免打扰
     */
    @PutMapping("/{conversationId}/mute")
    public ResponseEntity<ApiResponse<Conversation>> muteConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Boolean> request) {
        
        Long userId = userDetails.getId();
        boolean muted = request.getOrDefault("muted", false);
        Conversation conversation = conversationService.muteConversation(conversationId, userId, muted);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }
    
    /**
     * 删除对话
     */
    @DeleteMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        conversationService.deleteConversation(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

