package com.heartsphere.heartconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.heartconnect.dto.*;
import com.heartsphere.heartconnect.service.ConnectionRequestService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 连接请求控制器
 */
@RestController
@RequestMapping("/api/heartconnect/requests")
public class ConnectionRequestController {
    
    @Autowired
    private ConnectionRequestService connectionRequestService;
    
    /**
     * 创建连接请求
     */
    @PostMapping
    public ApiResponse<ConnectionRequestDTO> createConnectionRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CreateConnectionRequestRequest request) {
        ConnectionRequestDTO connectionRequest = connectionRequestService.createConnectionRequest(
                userDetails.getId(), request);
        return ApiResponse.success("连接请求发送成功", connectionRequest);
    }
    
    /**
     * 响应连接请求（批准或拒绝）
     */
    @PostMapping("/{requestId}/response")
    public ApiResponse<ConnectionRequestDTO> responseConnectionRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long requestId,
            @RequestBody ResponseConnectionRequestRequest request) {
        ConnectionRequestDTO connectionRequest = connectionRequestService.responseConnectionRequest(
                userDetails.getId(), requestId, request);
        return ApiResponse.success("连接请求处理成功", connectionRequest);
    }
    
    /**
     * 获取共享配置的所有连接请求
     */
    @GetMapping("/share-config/{shareConfigId}")
    public ApiResponse<List<ConnectionRequestDTO>> getConnectionRequests(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long shareConfigId,
            @RequestParam(required = false) String status) {
        List<ConnectionRequestDTO> requests = connectionRequestService.getConnectionRequests(
                userDetails.getId(), shareConfigId, status);
        return ApiResponse.success(requests);
    }
    
    /**
     * 获取我的连接请求
     */
    @GetMapping("/my")
    public ApiResponse<List<ConnectionRequestDTO>> getMyConnectionRequests(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<ConnectionRequestDTO> requests = connectionRequestService.getMyConnectionRequests(
                userDetails.getId());
        return ApiResponse.success(requests);
    }
    
    /**
     * 取消连接请求
     */
    @PostMapping("/{requestId}/cancel")
    public ApiResponse<Void> cancelConnectionRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long requestId) {
        connectionRequestService.cancelConnectionRequest(userDetails.getId(), requestId);
        return ApiResponse.success("连接请求已取消", null);
    }
}

