package com.heartsphere.heartconnect.service;

import com.heartsphere.entity.User;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.dto.*;
import com.heartsphere.heartconnect.entity.HeartSphereConnection;
import com.heartsphere.heartconnect.entity.HeartSphereConnectionRequest;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRepository;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRequestRepository;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 连接请求服务
 */
@Service
public class ConnectionRequestService {
    
    @Autowired
    private HeartSphereConnectionRequestRepository requestRepository;
    
    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;
    
    @Autowired
    private HeartSphereConnectionRepository connectionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 创建连接请求
     */
    @Transactional
    public ConnectionRequestDTO createConnectionRequest(Long requesterId, CreateConnectionRequestRequest request) {
        // 验证请求者
        if (!userRepository.existsById(requesterId)) {
            throw new ResourceNotFoundException("用户不存在");
        }
        
        // 查找共享配置
        HeartSphereShareConfig shareConfig = shareConfigRepository.findByShareCode(request.getShareCode())
                .orElseThrow(() -> new ResourceNotFoundException("共享码不存在或已失效"));
        
        // 检查权限
        if (shareConfig.getUserId().equals(requesterId)) {
            throw new BusinessException("不能请求连接自己的心域");
        }
        
        // 检查共享状态
        if (shareConfig.getShareStatus() != HeartSphereShareConfig.ShareStatus.ACTIVE) {
            throw new BusinessException("该共享已暂停或已关闭");
        }
        
        // 检查是否过期
        if (shareConfig.getExpiresAt() != null && shareConfig.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("该共享已过期");
        }
        
        // 检查访问权限
        if (shareConfig.getAccessPermission() == HeartSphereShareConfig.AccessPermission.FREE) {
            // 自由连接，直接创建连接记录
            return createDirectConnection(requesterId, shareConfig);
        }
        
        // 检查是否已有请求
        if (requestRepository.findByShareConfigIdAndRequesterId(shareConfig.getId(), requesterId).isPresent()) {
            throw new BusinessException("您已经发送过连接请求");
        }
        
        // 创建连接请求
        HeartSphereConnectionRequest connectionRequest = new HeartSphereConnectionRequest();
        connectionRequest.setShareConfigId(shareConfig.getId());
        connectionRequest.setRequesterId(requesterId);
        connectionRequest.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.PENDING);
        connectionRequest.setRequestMessage(request.getRequestMessage());
        
        connectionRequest = requestRepository.save(connectionRequest);
        
        // 更新共享配置的请求计数
        shareConfig.setRequestCount(shareConfig.getRequestCount() + 1);
        shareConfigRepository.save(shareConfig);
        
        return convertToDTO(connectionRequest);
    }
    
    /**
     * 直接创建连接（自由连接模式）
     */
    private ConnectionRequestDTO createDirectConnection(Long requesterId, HeartSphereShareConfig shareConfig) {
        // 检查是否已有连接
        if (connectionRepository.findByShareConfigIdAndVisitorIdAndConnectionStatus(
                shareConfig.getId(), requesterId, HeartSphereConnection.ConnectionStatus.ACTIVE).isPresent()) {
            throw new BusinessException("您已经连接到此心域");
        }
        
        // 创建连接记录
        HeartSphereConnection connection = new HeartSphereConnection();
        connection.setShareConfigId(shareConfig.getId());
        connection.setVisitorId(requesterId);
        connection.setConnectionStatus(HeartSphereConnection.ConnectionStatus.ACTIVE);
        connectionRepository.save(connection);
        
        // 更新共享配置的批准计数
        shareConfig.setApprovedCount(shareConfig.getApprovedCount() + 1);
        shareConfigRepository.save(shareConfig);
        
        // 返回一个虚拟的请求DTO（表示已直接连接）
        ConnectionRequestDTO dto = new ConnectionRequestDTO();
        dto.setShareConfigId(shareConfig.getId());
        dto.setRequesterId(requesterId);
        dto.setRequestStatus("approved");
        return dto;
    }
    
    /**
     * 响应连接请求（批准或拒绝）
     */
    @Transactional
    public ConnectionRequestDTO responseConnectionRequest(Long ownerId, Long requestId, ResponseConnectionRequestRequest request) {
        HeartSphereConnectionRequest connectionRequest = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("连接请求不存在"));
        
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(connectionRequest.getShareConfigId())
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        // 检查权限
        if (!shareConfig.getUserId().equals(ownerId)) {
            throw new BusinessException("无权处理此连接请求");
        }
        
        // 检查请求状态
        if (connectionRequest.getRequestStatus() != HeartSphereConnectionRequest.RequestStatus.PENDING) {
            throw new BusinessException("该请求已被处理");
        }
        
        // 处理请求
        if ("approve".equalsIgnoreCase(request.getAction())) {
            // 批准请求
            connectionRequest.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.APPROVED);
            connectionRequest.setResponseMessage(request.getResponseMessage());
            connectionRequest.setRespondedAt(LocalDateTime.now());
            requestRepository.save(connectionRequest);
            
            // 创建连接记录
            HeartSphereConnection connection = new HeartSphereConnection();
            connection.setShareConfigId(shareConfig.getId());
            connection.setVisitorId(connectionRequest.getRequesterId());
            connection.setConnectionStatus(HeartSphereConnection.ConnectionStatus.ACTIVE);
            connectionRepository.save(connection);
            
            // 更新共享配置的批准计数
            shareConfig.setApprovedCount(shareConfig.getApprovedCount() + 1);
            shareConfigRepository.save(shareConfig);
            
        } else if ("reject".equalsIgnoreCase(request.getAction())) {
            // 拒绝请求
            connectionRequest.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.REJECTED);
            connectionRequest.setResponseMessage(request.getResponseMessage());
            connectionRequest.setRespondedAt(LocalDateTime.now());
            requestRepository.save(connectionRequest);
        } else {
            throw new BusinessException("无效的操作类型");
        }
        
        return convertToDTO(connectionRequest);
    }
    
    /**
     * 获取共享配置的所有连接请求
     */
    public List<ConnectionRequestDTO> getConnectionRequests(Long ownerId, Long shareConfigId, String status) {
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        if (!shareConfig.getUserId().equals(ownerId)) {
            throw new BusinessException("无权查看此共享配置的连接请求");
        }
        
        List<HeartSphereConnectionRequest> requests;
        if (status != null && !status.isEmpty()) {
            requests = requestRepository.findByShareConfigIdAndRequestStatus(
                    shareConfigId, HeartSphereConnectionRequest.RequestStatus.valueOf(status.toUpperCase()));
        } else {
            requests = requestRepository.findByShareConfigId(shareConfigId);
        }
        
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * 获取用户的连接请求
     */
    public List<ConnectionRequestDTO> getMyConnectionRequests(Long requesterId) {
        List<HeartSphereConnectionRequest> requests = requestRepository.findByRequesterId(requesterId);
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * 取消连接请求
     */
    @Transactional
    public void cancelConnectionRequest(Long requesterId, Long requestId) {
        HeartSphereConnectionRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("连接请求不存在"));
        
        if (!request.getRequesterId().equals(requesterId)) {
            throw new BusinessException("无权取消此连接请求");
        }
        
        if (request.getRequestStatus() != HeartSphereConnectionRequest.RequestStatus.PENDING) {
            throw new BusinessException("只能取消待审批的请求");
        }
        
        request.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.CANCELLED);
        requestRepository.save(request);
    }
    
    /**
     * 根据共享配置和请求者获取连接请求
     */
    public java.util.Optional<HeartSphereConnectionRequest> getConnectionRequestByShareConfigAndRequester(
            Long shareConfigId, Long requesterId) {
        return requestRepository.findByShareConfigIdAndRequesterId(shareConfigId, requesterId);
    }
    
    /**
     * 转换为DTO
     */
    private ConnectionRequestDTO convertToDTO(HeartSphereConnectionRequest request) {
        ConnectionRequestDTO dto = new ConnectionRequestDTO();
        dto.setId(request.getId());
        dto.setShareConfigId(request.getShareConfigId());
        dto.setRequesterId(request.getRequesterId());
        dto.setRequestStatus(request.getRequestStatus().name().toLowerCase());
        dto.setRequestMessage(request.getRequestMessage());
        dto.setResponseMessage(request.getResponseMessage());
        
        if (request.getRequestedAt() != null) {
            dto.setRequestedAt(java.time.Instant.from(request.getRequestedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        if (request.getRespondedAt() != null) {
            dto.setRespondedAt(java.time.Instant.from(request.getRespondedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        if (request.getExpiresAt() != null) {
            dto.setExpiresAt(java.time.Instant.from(request.getExpiresAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        
        // 加载请求者信息
        User requester = userRepository.findById(request.getRequesterId()).orElse(null);
        if (requester != null) {
            dto.setRequesterName(requester.getUsername());
            // dto.setRequesterAvatar(requester.getAvatarUrl()); // 如果有头像字段
        }
        
        return dto;
    }
}

