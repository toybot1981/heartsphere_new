package com.heartsphere.controller;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.ConversationLog;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.ConversationLogRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 对话日志控制器
 * 用于管理用户与角色的对话历史
 */
@RestController
@RequestMapping("/api/conversation-logs")
@CrossOrigin(origins = "*")
public class ConversationLogController {
    
    private static final Logger logger = LoggerFactory.getLogger(ConversationLogController.class);
    
    private final ConversationLogRepository conversationLogRepository;
    private final CharacterRepository characterRepository;
    
    public ConversationLogController(
            ConversationLogRepository conversationLogRepository,
            CharacterRepository characterRepository) {
        this.conversationLogRepository = conversationLogRepository;
        this.characterRepository = characterRepository;
    }
    
    /**
     * 获取用户的对话日志列表（未删除的）
     */
    @GetMapping
    public ResponseEntity<List<ConversationLog>> getConversationLogs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        logger.info(String.format("[ConversationLogController] 获取对话日志列表，用户ID: %d", userId));
        
        List<ConversationLog> logs = conversationLogRepository.findByUserIdAndIsDeletedFalseOrderByLastMessageAtDesc(userId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 根据会话ID获取或创建对话日志
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ConversationLog> getOrCreateConversationLog(@PathVariable String sessionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        logger.info(String.format("[ConversationLogController] 获取或创建对话日志，sessionId: %s, 用户ID: %d", sessionId, userId));
        
        Optional<ConversationLog> existing = conversationLogRepository.findBySessionId(sessionId);
        if (existing.isPresent()) {
            ConversationLog log = existing.get();
            if (!log.getUserId().equals(userId)) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.ok(log);
        }
        
        // 从sessionId中提取角色ID（格式：character_{characterId} 或类似）
        // 这里需要根据实际的sessionId格式来解析
        // 暂时返回404，需要前端提供更多信息
        return ResponseEntity.notFound().build();
    }
    
    /**
     * 更新对话日志（更新最后消息等信息）
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConversationLog> updateConversationLog(
            @PathVariable Long id,
            @RequestBody UpdateConversationLogRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        ConversationLog log = conversationLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation log not found"));
        
        if (!log.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        if (request.getLastMessagePreview() != null) {
            log.setLastMessagePreview(request.getLastMessagePreview());
        }
        if (request.getMessageCount() != null) {
            log.setMessageCount(request.getMessageCount());
        }
        if (request.getLastMessageAt() != null) {
            log.setLastMessageAt(request.getLastMessageAt());
        }
        
        conversationLogRepository.save(log);
        logger.info(String.format("[ConversationLogController] 更新对话日志: ID=%d", id));
        return ResponseEntity.ok(log);
    }
    
    /**
     * 删除对话日志到回收站
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversationLog(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        ConversationLog log = conversationLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation log not found"));
        
        if (!log.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        log.softDelete();
        conversationLogRepository.save(log);
        
        logger.info(String.format("[ConversationLogController] 删除对话日志到回收站: ID=%d", id));
        return ResponseEntity.ok().build();
    }
    
    /**
     * 创建或更新对话日志
     */
    @PostMapping
    public ResponseEntity<ConversationLog> createOrUpdateConversationLog(
            @RequestBody CreateConversationLogRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        // 尝试根据sessionId查找现有日志
        Optional<ConversationLog> existing = conversationLogRepository.findBySessionId(request.getSessionId());
        
        ConversationLog log;
        if (existing.isPresent()) {
            log = existing.get();
            if (!log.getUserId().equals(userId)) {
                return ResponseEntity.status(403).build();
            }
            // 更新现有日志
            if (request.getLastMessagePreview() != null) {
                log.setLastMessagePreview(request.getLastMessagePreview());
            }
            if (request.getMessageCount() != null) {
                log.setMessageCount(request.getMessageCount());
            }
            if (request.getLastMessageAt() != null) {
                log.setLastMessageAt(request.getLastMessageAt());
            } else {
                log.setLastMessageAt(LocalDateTime.now());
            }
        } else {
            // 创建新日志
            Character character = characterRepository.findById(request.getCharacterId())
                    .orElseThrow(() -> new RuntimeException("Character not found"));
            
            log = new ConversationLog();
            log.setUserId(userId);
            log.setCharacterId(request.getCharacterId());
            log.setSessionId(request.getSessionId());
            log.setCharacterName(character.getName() != null ? character.getName() : "未知角色");
            log.setCharacterAvatarUrl(character.getAvatarUrl() != null ? character.getAvatarUrl() : null);
            log.setLastMessagePreview(request.getLastMessagePreview());
            log.setMessageCount(request.getMessageCount() != null ? request.getMessageCount() : 1);
            log.setFirstMessageAt(LocalDateTime.now());
            log.setLastMessageAt(request.getLastMessageAt() != null ? request.getLastMessageAt() : LocalDateTime.now());
        }
        
        conversationLogRepository.save(log);
        logger.info(String.format("[ConversationLogController] 创建或更新对话日志: sessionId=%s", request.getSessionId()));
        return ResponseEntity.ok(log);
    }
    
    /**
     * 更新对话日志请求DTO
     */
    public static class UpdateConversationLogRequest {
        private String lastMessagePreview;
        private Integer messageCount;
        private LocalDateTime lastMessageAt;
        
        public String getLastMessagePreview() { return lastMessagePreview; }
        public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }
        
        public Integer getMessageCount() { return messageCount; }
        public void setMessageCount(Integer messageCount) { this.messageCount = messageCount; }
        
        public LocalDateTime getLastMessageAt() { return lastMessageAt; }
        public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    }
    
    /**
     * 创建对话日志请求DTO
     */
    public static class CreateConversationLogRequest {
        private Long characterId;
        private String sessionId;
        private String lastMessagePreview;
        private Integer messageCount;
        private LocalDateTime lastMessageAt;
        
        public Long getCharacterId() { return characterId; }
        public void setCharacterId(Long characterId) { this.characterId = characterId; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getLastMessagePreview() { return lastMessagePreview; }
        public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }
        
        public Integer getMessageCount() { return messageCount; }
        public void setMessageCount(Integer messageCount) { this.messageCount = messageCount; }
        
        public LocalDateTime getLastMessageAt() { return lastMessageAt; }
        public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    }
}

