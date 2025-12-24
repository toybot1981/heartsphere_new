package com.heartsphere.controller;

import com.heartsphere.entity.ChronosLetter;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ChronosLetterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 跨时空信箱（时间信件）控制器
 * 注意：与EmailService（真实邮件发送）区分开
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/chronos-letters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChronosLetterController {
    
    private final ChronosLetterService chronosLetterService;
    
    /**
     * 获取当前用户的所有信件
     */
    @GetMapping
    public ResponseEntity<List<ChronosLetter>> getUserLetters(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<ChronosLetter> letters = chronosLetterService.getUserLetters(userId);
        return ResponseEntity.ok(letters);
    }
    
    /**
     * 获取未读信件数量
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadLetterCount(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Long count = chronosLetterService.getUnreadLetterCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * 获取未读信件
     */
    @GetMapping("/unread")
    public ResponseEntity<List<ChronosLetter>> getUnreadLetters(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<ChronosLetter> letters = chronosLetterService.getUnreadLetters(userId);
        return ResponseEntity.ok(letters);
    }
    
    /**
     * 根据ID获取信件
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChronosLetter> getLetterById(@PathVariable String id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        ChronosLetter letter = chronosLetterService.getLetterById(id, userId);
        return ResponseEntity.ok(letter);
    }
    
    /**
     * 创建用户反馈信件
     */
    @PostMapping
    public ResponseEntity<ChronosLetter> createUserFeedback(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        
        String subject = request.get("subject");
        String content = request.get("content");
        String senderId = request.get("senderId");
        String senderName = request.get("senderName");
        String senderAvatarUrl = request.get("senderAvatarUrl");
        String themeColor = request.get("themeColor");
        
        if (subject == null || subject.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        ChronosLetter letter = chronosLetterService.createUserFeedback(
                userId, subject, content, senderId, senderName, senderAvatarUrl, themeColor);
        return ResponseEntity.ok(letter);
    }
    
    /**
     * 标记信件为已读
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ChronosLetter> markAsRead(@PathVariable String id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        ChronosLetter letter = chronosLetterService.markAsRead(id, userId);
        return ResponseEntity.ok(letter);
    }
    
    /**
     * 删除信件
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLetter(@PathVariable String id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        chronosLetterService.deleteLetter(id, userId);
        return ResponseEntity.ok(Map.of("message", "信件已删除"));
    }
    
    /**
     * 获取信件的回复
     */
    @GetMapping("/{id}/replies")
    public ResponseEntity<List<ChronosLetter>> getLetterReplies(@PathVariable String id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        // 验证信件属于该用户
        chronosLetterService.getLetterById(id, userId);
        List<ChronosLetter> replies = chronosLetterService.getLetterReplies(id);
        return ResponseEntity.ok(replies);
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

