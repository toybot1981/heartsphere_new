package com.heartsphere.mailbox.controller;

import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.dto.MessageQueryRequest;
import com.heartsphere.mailbox.dto.UnreadCountResponse;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.service.MailboxMessageService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 跨时空信箱消息控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mailbox/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MailboxMessageController {
    
    private final MailboxMessageService messageService;
    
    /**
     * 创建消息
     */
    @PostMapping
    public ResponseEntity<MailboxMessage> createMessage(
            @RequestBody CreateMessageRequest request,
            Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            
            // 如果是迁移场景，receiverId可能已设置；否则使用当前用户
            if (request.getReceiverId() == null) {
                request.setReceiverId(userId);
            }
            
            MailboxMessage message = messageService.createMessage(request);
            log.info("创建消息成功 - messageId={}, receiverId={}, type={}", 
                message.getId(), message.getReceiverId(), message.getMessageType());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("创建消息失败", e);
            throw e;
        }
    }
    
    /**
     * 获取消息列表
     */
    @GetMapping
    public ResponseEntity<Page<MailboxMessage>> getMessages(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) Boolean isImportant,
            @RequestParam(required = false) Boolean isStarred,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        
        MessageQueryRequest request = new MessageQueryRequest();
        if (category != null) {
            try {
                request.setCategory(com.heartsphere.mailbox.enums.MessageCategory.fromCode(category));
            } catch (IllegalArgumentException e) {
                // 忽略无效的分类参数
            }
        }
        request.setIsRead(isRead);
        request.setIsImportant(isImportant);
        request.setIsStarred(isStarred);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setKeyword(keyword);
        request.setPage(page);
        request.setSize(size);
        
        Page<MailboxMessage> messages = messageService.getMessages(userId, request);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * 获取消息详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<MailboxMessage> getMessageById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        MailboxMessage message = messageService.getMessageById(id, userId);
        return ResponseEntity.ok(message);
    }
    
    /**
     * 标记消息为已读
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<MailboxMessage> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        MailboxMessage message = messageService.markAsRead(id, userId);
        return ResponseEntity.ok(message);
    }
    
    /**
     * 标记/取消标记消息为重要
     */
    @PutMapping("/{id}/important")
    public ResponseEntity<MailboxMessage> markAsImportant(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Boolean isImportant = request.getOrDefault("isImportant", false);
        MailboxMessage message = messageService.markAsImportant(id, userId, isImportant);
        return ResponseEntity.ok(message);
    }
    
    /**
     * 收藏/取消收藏消息
     */
    @PutMapping("/{id}/star")
    public ResponseEntity<MailboxMessage> markAsStarred(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Boolean isStarred = request.getOrDefault("isStarred", false);
        MailboxMessage message = messageService.markAsStarred(id, userId, isStarred);
        return ResponseEntity.ok(message);
    }
    
    /**
     * 删除消息
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        messageService.deleteMessage(id, userId);
        return ResponseEntity.ok(Map.of("message", "消息已删除"));
    }
    
    /**
     * 批量删除消息
     */
    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> batchDeleteMessages(
            @RequestBody Map<String, List<Long>> request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<Long> messageIds = request.get("messageIds");
        if (messageIds == null || messageIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        int deletedCount = messageService.batchDeleteMessages(messageIds, userId);
        return ResponseEntity.ok(Map.of("deletedCount", deletedCount));
    }
    
    /**
     * 获取未读消息数量
     */
    @GetMapping("/unread/count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        UnreadCountResponse response = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("未授权");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}

