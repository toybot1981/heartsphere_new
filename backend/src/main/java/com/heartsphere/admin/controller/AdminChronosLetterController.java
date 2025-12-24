package com.heartsphere.admin.controller;

import com.heartsphere.entity.ChronosLetter;
import com.heartsphere.service.ChronosLetterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理员跨时空信箱（时间信件）管理控制器
 * 注意：与EmailService（真实邮件发送）区分开
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/chronos-letters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminChronosLetterController extends BaseAdminController {
    
    private final ChronosLetterService chronosLetterService;
    
    /**
     * 获取所有用户反馈（待回复）
     */
    @GetMapping("/user-feedbacks")
    public ResponseEntity<List<ChronosLetter>> getUserFeedbacks(
            @RequestHeader("Authorization") String authHeader) {
        validateAdmin(authHeader);
        
        List<ChronosLetter> feedbacks = chronosLetterService.getAllUserFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }
    
    /**
     * 获取单个信件详情（管理员用）
     */
    @GetMapping("/{letterId}")
    public ResponseEntity<ChronosLetter> getLetterById(
            @PathVariable String letterId,
            @RequestHeader("Authorization") String authHeader) {
        validateAdmin(authHeader);
        
        ChronosLetter letter = chronosLetterService.getLetterByIdForAdmin(letterId);
        return ResponseEntity.ok(letter);
    }
    
    /**
     * 管理员回复用户反馈
     */
    @PostMapping("/{letterId}/reply")
    public ResponseEntity<ChronosLetter> replyToUserFeedback(
            @PathVariable String letterId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        validateAdmin(authHeader);
        
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        ChronosLetter reply = chronosLetterService.createAdminReply(letterId, content);
        return ResponseEntity.ok(reply);
    }
}

