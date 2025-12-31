package com.heartsphere.mailbox.controller;

import com.heartsphere.mailbox.entity.MailboxMessage;
import com.heartsphere.mailbox.enums.ESoulLetterType;
import com.heartsphere.mailbox.service.ESoulLetterService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * E-SOUL来信控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mailbox/esoul-letters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ESoulLetterController {
    
    private final ESoulLetterService esoulLetterService;
    
    /**
     * 触发E-SOUL来信（系统内部接口）
     * 注意：这个接口应该只在系统内部调用，可以添加内部认证
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> triggerLetter(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String letterType,
            Authentication authentication) {
        
        // 如果未提供userId，从认证信息中获取
        Long targetUserId = userId != null ? userId : getCurrentUserId(authentication);
        
        // 构建触发信息
        ESoulLetterService.ESoulLetterTrigger trigger = new ESoulLetterService.ESoulLetterTrigger();
        if (letterType != null) {
            try {
                trigger.setLetterType(ESoulLetterType.valueOf(letterType.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // 忽略无效的来信类型
            }
        }
        trigger.setTriggerReason("手动触发");
        
        MailboxMessage message = esoulLetterService.triggerLetter(targetUserId, trigger);
        
        if (message == null) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "未满足触发条件或没有可用角色"
            ));
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "messageId", message.getId()
        ));
    }
    
    /**
     * 回复E-SOUL来信
     */
    @PostMapping("/{messageId}/reply")
    public ResponseEntity<Map<String, Object>> replyToLetter(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        String content = request.get("content");
        String replyType = request.getOrDefault("replyType", "full");
        
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "回复内容不能为空"));
        }
        
        // TODO: 实现回复逻辑
        // 这里可以创建对话或者直接创建回复消息
        // 暂时返回成功
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "回复成功"
        ));
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

