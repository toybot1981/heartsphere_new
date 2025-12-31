package com.heartsphere.mailbox.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.service.SystemMessageService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 系统消息控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mailbox/system-messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemMessageController {
    
    private final SystemMessageService systemMessageService;
    
    /**
     * 回复系统消息（用于系统对话）
     */
    @PostMapping("/{messageId}/reply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> replyToSystemMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        String content = request.get("content");
        
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("回复内容不能为空"));
        }
        
        // TODO: 实现系统对话回复逻辑
        // 暂时返回成功
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "success", true,
            "message", "回复成功"
        )));
    }
}

