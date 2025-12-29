package com.heartsphere.heartconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.heartconnect.dto.CreateWarmMessageRequest;
import com.heartsphere.heartconnect.dto.WarmMessageDTO;
import com.heartsphere.heartconnect.service.WarmMessageService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 体验模式控制器
 */
@RestController
@RequestMapping("/api/heartconnect/experience")
public class ExperienceController {
    
    @Autowired
    private WarmMessageService warmMessageService;
    
    /**
     * 创建暖心留言
     */
    @PostMapping("/{shareConfigId}/warm-message")
    public ApiResponse<WarmMessageDTO> createWarmMessage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long shareConfigId,
            @RequestBody CreateWarmMessageRequest request) {
        WarmMessageDTO message = warmMessageService.createWarmMessage(
                shareConfigId, userDetails.getId(), request);
        return ApiResponse.success("留言发送成功", message);
    }
    
    /**
     * 获取暖心留言列表（主人查看）
     */
    @GetMapping("/{shareConfigId}/warm-messages")
    public ApiResponse<List<WarmMessageDTO>> getWarmMessages(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long shareConfigId) {
        List<WarmMessageDTO> messages = warmMessageService.getWarmMessages(
                shareConfigId, userDetails.getId());
        return ApiResponse.success(messages);
    }
}

