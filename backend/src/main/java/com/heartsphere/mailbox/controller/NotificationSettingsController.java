package com.heartsphere.mailbox.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mailbox.dto.NotificationSettingsResponse;
import com.heartsphere.mailbox.dto.UnreadCountResponse;
import com.heartsphere.mailbox.entity.NotificationSettings;
import com.heartsphere.mailbox.service.NotificationService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 提醒设置控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mailbox/notification-settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationSettingsController {
    
    private final NotificationService notificationService;
    
    /**
     * 获取提醒设置
     */
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> getSettings(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        NotificationSettings settings = notificationService.getOrCreateSettings(userId);
        
        // 转换为DTO避免序列化问题
        NotificationSettingsResponse response = new NotificationSettingsResponse();
        BeanUtils.copyProperties(settings, response);
        response.setUserId(userId);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 更新提醒设置
     */
    @PutMapping
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> updateSettings(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody NotificationSettings request) {
        
        Long userId = userDetails.getId();
        NotificationSettings settings = notificationService.updateSettings(userId, request);
        
        // 转换为DTO避免序列化问题
        NotificationSettingsResponse response = new NotificationSettingsResponse();
        BeanUtils.copyProperties(settings, response);
        response.setUserId(userId);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 获取未读消息统计
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Long userId = userDetails.getId();
        UnreadCountResponse count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}

