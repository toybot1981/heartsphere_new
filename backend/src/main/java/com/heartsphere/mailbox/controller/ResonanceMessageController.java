package com.heartsphere.mailbox.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.service.ResonanceMessageService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 共鸣消息控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mailbox/resonance-messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResonanceMessageController {
    
    private final ResonanceMessageService resonanceMessageService;
    
    /**
     * 回复共鸣消息
     */
    @PostMapping("/{messageId}/reply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> replyToResonanceMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        String content = request.get("content");
        String replyType = request.getOrDefault("replyType", "full");
        
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("回复内容不能为空"));
        }
        
        // TODO: 实现回复逻辑（可以创建对话或直接回复）
        // 暂时返回成功
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "success", true,
            "message", "回复成功"
        )));
    }
}


