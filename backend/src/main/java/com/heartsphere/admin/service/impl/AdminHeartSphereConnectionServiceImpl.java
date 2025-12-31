package com.heartsphere.admin.service.impl;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.service.AdminHeartSphereConnectionService;
import com.heartsphere.entity.User;
import com.heartsphere.heartconnect.entity.*;
import com.heartsphere.heartconnect.repository.*;
import com.heartsphere.heartconnect.service.ConnectionRequestService;
import com.heartsphere.heartconnect.service.ShareConfigService;
import com.heartsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 心域连接管理服务实现
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminHeartSphereConnectionServiceImpl implements AdminHeartSphereConnectionService {
    
    private final HeartSphereShareConfigRepository shareConfigRepository;
    private final HeartSphereConnectionRequestRepository connectionRequestRepository;
    private final HeartSphereConnectionRepository connectionRepository;
    private final WarmMessageRepository warmMessageRepository;
    private final HeartSphereShareScopeRepository shareScopeRepository;
    private final UserRepository userRepository;
    private final ShareConfigService shareConfigService;
    private final ConnectionRequestService connectionRequestService;
    
    // ========== 共享配置管理 ==========
    
    @Override
    public Page<HeartSphereShareConfigDTO> getShareConfigs(
            Long userId, String shareType, String status, String search,
            Pageable pageable) {
        
        // 简化实现：不使用Specification，直接查询后过滤
        List<HeartSphereShareConfig> allConfigs = shareConfigRepository.findAll();
        
        // 手动过滤
        List<HeartSphereShareConfig> filtered = allConfigs.stream()
            .filter(config -> {
                if (userId != null && !config.getUserId().equals(userId)) return false;
                if (shareType != null && !shareType.isEmpty()) {
                    try {
                        if (config.getShareType() != HeartSphereShareConfig.ShareType.valueOf(shareType)) return false;
                    } catch (IllegalArgumentException e) {
                        return false;
                    }
                }
                if (status != null && !status.isEmpty()) {
                    try {
                        if (config.getShareStatus() != HeartSphereShareConfig.ShareStatus.valueOf(status)) return false;
                    } catch (IllegalArgumentException e) {
                        return false;
                    }
                }
                return true;
            })
            .collect(Collectors.toList());
        
        // 分页
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<HeartSphereShareConfig> paged = filtered.subList(start, end);
        
        // 创建新的Page对象
        Page<HeartSphereShareConfig> configs = new PageImpl<>(
            paged, pageable, filtered.size());
        
        return configs.map(this::convertToShareConfigDTO);
    }
    
    @Override
    public HeartSphereShareConfigDTO getShareConfigDetail(Long configId) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("共享配置不存在: " + configId));
        
        HeartSphereShareConfigDTO dto = convertToShareConfigDTO(config);
        
        // 添加统计信息
        dto.setAccessCount(getAccessCount(configId));
        dto.setVisitorCount(getVisitorCount(configId));
        dto.setConnectionRequestCount(getConnectionRequestCount(configId));
        dto.setApprovedRequestCount(getApprovedRequestCount(configId));
        
        return dto;
    }
    
    @Override
    @Transactional
    public void disableShareConfig(Long configId, String reason) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("共享配置不存在: " + configId));
        
        config.setShareStatus(HeartSphereShareConfig.ShareStatus.CLOSED);
        shareConfigRepository.save(config);
        
        log.info("管理员禁用了共享配置: configId={}, reason={}", configId, reason);
    }
    
    @Override
    @Transactional
    public void enableShareConfig(Long configId) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("共享配置不存在: " + configId));
        
        config.setShareStatus(HeartSphereShareConfig.ShareStatus.ACTIVE);
        shareConfigRepository.save(config);
        
        log.info("管理员启用了共享配置: configId={}", configId);
    }
    
    @Override
    @Transactional
    public void pauseShareConfig(Long configId, String reason) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("共享配置不存在: " + configId));
        
        config.setShareStatus(HeartSphereShareConfig.ShareStatus.PAUSED);
        shareConfigRepository.save(config);
        
        log.info("管理员暂停了共享配置: configId={}, reason={}", configId, reason);
    }
    
    @Override
    @Transactional
    public void deleteShareConfig(Long configId, String reason) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
            .orElseThrow(() -> new RuntimeException("共享配置不存在: " + configId));
        
        // 删除关联的共享范围
        shareScopeRepository.deleteByShareConfigId(configId);
        
        // 删除共享配置
        shareConfigRepository.delete(config);
        
        log.info("管理员删除了共享配置: configId={}, reason={}", configId, reason);
    }
    
    @Override
    @Transactional
    public void batchDisableShareConfigs(List<Long> configIds, String reason) {
        for (Long configId : configIds) {
            try {
                disableShareConfig(configId, reason);
            } catch (Exception e) {
                log.error("批量禁用共享配置失败: configId={}", configId, e);
            }
        }
    }
    
    @Override
    @Transactional
    public void batchDeleteShareConfigs(List<Long> configIds, String reason) {
        for (Long configId : configIds) {
            try {
                deleteShareConfig(configId, reason);
            } catch (Exception e) {
                log.error("批量删除共享配置失败: configId={}", configId, e);
            }
        }
    }
    
    // ========== 连接请求管理 ==========
    
    @Override
    public Page<ConnectionRequestDTO> getConnectionRequests(
            String status, Instant startDate, Instant endDate,
            Long requesterId, Long targetUserId, Pageable pageable) {
        
        // 简化实现：不使用Specification，直接查询后过滤
        List<HeartSphereConnectionRequest> allRequests = connectionRequestRepository.findAll();
        
        // 手动过滤
        List<HeartSphereConnectionRequest> filtered = allRequests.stream()
            .filter(request -> {
                if (status != null && !status.isEmpty()) {
                    try {
                        if (request.getRequestStatus() != HeartSphereConnectionRequest.RequestStatus.valueOf(status)) return false;
                    } catch (IllegalArgumentException e) {
                        return false;
                    }
                }
                if (startDate != null && request.getRequestedAt() != null) {
                    if (request.getRequestedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().isBefore(startDate)) return false;
                }
                if (endDate != null && request.getRequestedAt() != null) {
                    if (request.getRequestedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().isAfter(endDate)) return false;
                }
                if (requesterId != null && !request.getRequesterId().equals(requesterId)) return false;
                // targetUserId需要通过shareConfig查询，简化实现暂时跳过
                return true;
            })
            .collect(Collectors.toList());
        
        Page<HeartSphereConnectionRequest> requests = new org.springframework.data.domain.PageImpl<>(
            filtered, pageable, filtered.size());
        
        return requests.map(this::convertToConnectionRequestDTO);
    }
    
    @Override
    public ConnectionRequestDTO getConnectionRequestDetail(Long requestId) {
        HeartSphereConnectionRequest request = connectionRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("连接请求不存在: " + requestId));
        
        return convertToConnectionRequestDTO(request);
    }
    
    @Override
    @Transactional
    public void approveConnectionRequest(Long requestId, String adminNote) {
        HeartSphereConnectionRequest request = connectionRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("连接请求不存在: " + requestId));
        
        // 更新请求状态
        request.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.APPROVED);
        request.setRespondedAt(java.time.LocalDateTime.now());
        connectionRequestRepository.save(request);
        
        // TODO: 创建连接记录
        
        log.info("管理员审核通过了连接请求: requestId={}, adminNote={}", requestId, adminNote);
    }
    
    @Override
    @Transactional
    public void rejectConnectionRequest(Long requestId, String reason) {
        HeartSphereConnectionRequest request = connectionRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("连接请求不存在: " + requestId));
        
        // 更新请求状态
        request.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.REJECTED);
        request.setRespondedAt(java.time.LocalDateTime.now());
        request.setResponseMessage(reason);
        connectionRequestRepository.save(request);
        
        log.info("管理员拒绝了连接请求: requestId={}, reason={}", requestId, reason);
    }
    
    @Override
    @Transactional
    public void batchApproveConnectionRequests(List<Long> requestIds, String adminNote) {
        for (Long requestId : requestIds) {
            try {
                approveConnectionRequest(requestId, adminNote);
            } catch (Exception e) {
                log.error("批量审核连接请求失败: requestId={}", requestId, e);
            }
        }
    }
    
    @Override
    @Transactional
    public void batchRejectConnectionRequests(List<Long> requestIds, String reason) {
        for (Long requestId : requestIds) {
            try {
                rejectConnectionRequest(requestId, reason);
            } catch (Exception e) {
                log.error("批量拒绝连接请求失败: requestId={}", requestId, e);
            }
        }
    }
    
    // ========== 访问记录管理 ==========
    
    @Override
    public Page<AccessRecordDTO> getAccessRecords(
            Long visitorId, Long ownerId, Instant startDate, Instant endDate,
            Pageable pageable) {
        
        // 这里需要根据实际的访问记录表来实现
        // 简化实现，实际应该查询access_history表
        return Page.empty(pageable);
    }
    
    @Override
    public AccessRecordDTO getAccessRecordDetail(Long recordId) {
        // 简化实现
        return AccessRecordDTO.builder().build();
    }
    
    @Override
    public List<AccessRecordDTO> exportAccessRecords(
            Long visitorId, Long ownerId, Instant startDate, Instant endDate) {
        // 简化实现
        return Collections.emptyList();
    }
    
    // ========== 留言管理 ==========
    
    @Override
    public Page<WarmMessageDTO> getWarmMessages(
            Long senderId, Long receiverId, String messageType, String status,
            String search, Pageable pageable) {
        
        // 简化实现：不使用Specification，直接查询后过滤
        List<WarmMessage> allMessages = warmMessageRepository.findAll();
        
        // 手动过滤
        List<WarmMessage> filtered = allMessages.stream()
            .filter(message -> {
                if (senderId != null && !message.getVisitorId().equals(senderId)) return false;
                // receiverId需要通过shareConfig查询，简化实现暂时跳过
                // messageType和status字段不存在，简化实现暂时跳过
                return true;
            })
            .collect(Collectors.toList());
        
        Page<WarmMessage> messages = new org.springframework.data.domain.PageImpl<>(
            filtered, pageable, filtered.size());
        
        return messages.map(this::convertToWarmMessageDTO);
    }
    
    @Override
    public WarmMessageDTO getWarmMessageDetail(Long messageId) {
        WarmMessage message = warmMessageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("留言不存在: " + messageId));
        
        return convertToWarmMessageDTO(message);
    }
    
    @Override
    @Transactional
    public void reviewWarmMessage(Long messageId, String status, String reason) {
        WarmMessage message = warmMessageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("留言不存在: " + messageId));
        
        // WarmMessage实体没有status字段，需要添加或使用其他方式记录审核状态
        // 简化实现，暂时只记录日志
        warmMessageRepository.save(message);
        
        log.info("管理员审核了留言: messageId={}, status={}, reason={}", messageId, status, reason);
    }
    
    @Override
    @Transactional
    public void deleteWarmMessage(Long messageId, String reason) {
        WarmMessage message = warmMessageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("留言不存在: " + messageId));
        
        warmMessageRepository.delete(message);
        
        log.info("管理员删除了留言: messageId={}, reason={}", messageId, reason);
    }
    
    @Override
    @Transactional
    public void batchReviewWarmMessages(List<Long> messageIds, String status, String reason) {
        for (Long messageId : messageIds) {
            try {
                reviewWarmMessage(messageId, status, reason);
            } catch (Exception e) {
                log.error("批量审核留言失败: messageId={}", messageId, e);
            }
        }
    }
    
    @Override
    @Transactional
    public void batchDeleteWarmMessages(List<Long> messageIds, String reason) {
        for (Long messageId : messageIds) {
            try {
                deleteWarmMessage(messageId, reason);
            } catch (Exception e) {
                log.error("批量删除留言失败: messageId={}", messageId, e);
            }
        }
    }
    
    // ========== 数据统计 ==========
    
    @Override
    public HeartSphereConnectionStatisticsDTO getStatistics(
            Instant startDate, Instant endDate) {
        
        HeartSphereConnectionStatisticsDTO.HeartSphereConnectionStatisticsDTOBuilder builder = 
            HeartSphereConnectionStatisticsDTO.builder();
        
        // 用户统计
        builder.totalShareUsers(getTotalShareUsers())
               .totalConnectionUsers(getTotalConnectionUsers())
               .totalAccessUsers(getTotalAccessUsers())
               .activeShareUsers(getActiveShareUsers());
        
        // 共享统计
        builder.totalShareConfigs(getTotalShareConfigs())
               .activeShareConfigs(getActiveShareConfigs())
               .shareTypeDistribution(getShareTypeDistribution())
               .accessTypeDistribution(getAccessTypeDistribution());
        
        // 连接统计
        builder.totalConnectionRequests(getTotalConnectionRequests())
               .approvedRequests(getApprovedRequests())
               .rejectedRequests(getRejectedRequests())
               .pendingRequests(getPendingRequests())
               .connectionSuccessRate(calculateConnectionSuccessRate());
        
        // 访问统计
        builder.totalAccessCount(getTotalAccessCount())
               .totalAccessDuration(getTotalAccessDuration())
               .averageAccessDuration(calculateAverageAccessDuration())
               .uniqueVisitors(getUniqueVisitors());
        
        // 留言统计
        builder.totalMessages(getTotalMessages())
               .approvedMessages(getApprovedMessages())
               .rejectedMessages(getRejectedMessages())
               .messageTypeDistribution(getMessageTypeDistribution())
               .replyRate(calculateReplyRate());
        
        return builder.build();
    }
    
    @Override
    public Map<String, Object> getTrendData(String period, Instant startDate, Instant endDate) {
        Map<String, Object> trendData = new HashMap<>();
        
        // 简化实现，实际应该根据period计算趋势数据
        trendData.put("dailyTrend", new HashMap<>());
        trendData.put("weeklyTrend", new HashMap<>());
        trendData.put("monthlyTrend", new HashMap<>());
        
        return trendData;
    }
    
    // ========== 异常处理 ==========
    
    @Override
    public Page<ExceptionHandlingRecordDTO> getExceptionRecords(
            String exceptionType, String status, String severity, Pageable pageable) {
        // 简化实现，实际应该查询exception_handling_records表
        return Page.empty(pageable);
    }
    
    @Override
    @Transactional
    public void handleException(Long exceptionId, String handleResult, String adminNote) {
        // 简化实现
        log.info("管理员处理了异常: exceptionId={}, handleResult={}", exceptionId, handleResult);
    }
    
    @Override
    public Page<ComplaintDTO> getComplaints(
            String status, Long userId, Pageable pageable) {
        // 简化实现，实际应该查询complaints表
        return Page.empty(pageable);
    }
    
    @Override
    @Transactional
    public void handleComplaint(Long complaintId, String handleResult, String adminNote) {
        // 简化实现
        log.info("管理员处理了投诉: complaintId={}, handleResult={}", complaintId, handleResult);
    }
    
    // ========== 私有方法：数据转换 ==========
    
    private HeartSphereShareConfigDTO convertToShareConfigDTO(HeartSphereShareConfig config) {
        User user = userRepository.findById(config.getUserId())
            .orElse(null);
        
        // 获取共享范围
        List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(config.getId());
        List<HeartSphereShareConfigDTO.ShareScopeDTO> scopeDTOs = scopes.stream()
            .map(scope -> {
                // 根据scopeType获取对应的ID和名称
                Long worldId = null;
                String worldName = null;
                Long eraId = null;
                String eraName = null;
                
                if (scope.getScopeType() == HeartSphereShareScope.ScopeType.WORLD) {
                    worldId = scope.getScopeId();
                    worldName = null; // HeartSphereShareScope实体没有scopeName字段，需要从world表查询
                } else if (scope.getScopeType() == HeartSphereShareScope.ScopeType.ERA) {
                    eraId = scope.getScopeId();
                    eraName = null; // HeartSphereShareScope实体没有scopeName字段，需要从era表查询
                }
                
                return HeartSphereShareConfigDTO.ShareScopeDTO.builder()
                    .worldId(worldId)
                    .worldName(worldName)
                    .eraId(eraId)
                    .eraName(eraName)
                    .build();
            })
            .collect(Collectors.toList());
        
        return HeartSphereShareConfigDTO.builder()
            .id(config.getId())
            .userId(config.getUserId())
            .username(user != null ? user.getUsername() : null)
            .userEmail(user != null ? user.getEmail() : null)
            .shareType(config.getShareType() != null ? config.getShareType().name() : null)
            .accessType(config.getAccessPermission() != null ? config.getAccessPermission().name() : null)
            .shareCode(config.getShareCode())
            .qrCodeUrl(null) // 需要生成或从其他地方获取
            .status(config.getShareStatus() != null ? config.getShareStatus().name() : null)
            .shareScopes(scopeDTOs)
            .createdAt(config.getCreatedAt() != null ? config.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .updatedAt(config.getUpdatedAt() != null ? config.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .lastAccessedAt(null) // HeartSphereShareConfig实体没有lastAccessedAt字段
            .build();
    }
    
    private ConnectionRequestDTO convertToConnectionRequestDTO(HeartSphereConnectionRequest request) {
        User requester = userRepository.findById(request.getRequesterId()).orElse(null);
        
        // 从共享配置获取目标用户
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(request.getShareConfigId())
            .orElse(null);
        User target = shareConfig != null ? userRepository.findById(shareConfig.getUserId()).orElse(null) : null;
        
        return ConnectionRequestDTO.builder()
            .id(request.getId())
            .requesterId(request.getRequesterId())
            .requesterUsername(requester != null ? requester.getUsername() : null)
            .requesterEmail(requester != null ? requester.getEmail() : null)
            .targetUserId(shareConfig != null ? shareConfig.getUserId() : null)
            .targetUsername(target != null ? target.getUsername() : null)
            .targetUserEmail(target != null ? target.getEmail() : null)
            .shareConfigId(request.getShareConfigId())
            .shareCode(shareConfig != null ? shareConfig.getShareCode() : null)
            .status(request.getRequestStatus() != null ? request.getRequestStatus().name() : null)
            .message(request.getRequestMessage())
            .requestTime(request.getRequestedAt() != null ? request.getRequestedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .processedTime(request.getRespondedAt() != null ? request.getRespondedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .connectionId(null) // 需要从连接表查询
            .build();
    }
    
    private WarmMessageDTO convertToWarmMessageDTO(WarmMessage message) {
        User sender = userRepository.findById(message.getVisitorId()).orElse(null);
        
        // 从共享配置获取接收者
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(message.getShareConfigId())
            .orElse(null);
        User receiver = shareConfig != null ? userRepository.findById(shareConfig.getUserId()).orElse(null) : null;
        
        return WarmMessageDTO.builder()
            .id(message.getId())
            .senderId(message.getVisitorId())
            .senderUsername(message.getVisitorName() != null ? message.getVisitorName() : 
                (sender != null ? sender.getUsername() : null))
            .senderEmail(sender != null ? sender.getEmail() : null)
            .receiverId(shareConfig != null ? shareConfig.getUserId() : null)
            .receiverUsername(receiver != null ? receiver.getUsername() : null)
            .receiverEmail(receiver != null ? receiver.getEmail() : null)
            .messageType("WARM_MESSAGE") // WarmMessage实体没有messageType字段
            .content(message.getMessage()) // 注意：实际应该脱敏
            .status("APPROVED") // WarmMessage实体没有status字段，默认已审核
            .createdAt(message.getCreatedAt() != null ? message.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .updatedAt(message.getCreatedAt() != null ? message.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .connectionId(null) // WarmMessage实体没有connectionId字段
            .replyToId(null) // WarmMessage实体没有replyToId字段
            .build();
    }
    
    // ========== 私有方法：统计计算 ==========
    
    private Long getAccessCount(Long configId) {
        // 简化实现，实际应该从access_history表统计
        return 0L;
    }
    
    private Long getVisitorCount(Long configId) {
        // 简化实现
        return 0L;
    }
    
    private Long getConnectionRequestCount(Long configId) {
        return (long) connectionRequestRepository.findByShareConfigId(configId).size();
    }
    
    private Long getApprovedRequestCount(Long configId) {
        return connectionRequestRepository.countByShareConfigIdAndRequestStatus(
            configId, HeartSphereConnectionRequest.RequestStatus.APPROVED);
    }
    
    private Long getTotalShareUsers() {
        // 简化实现，统计有共享配置的用户数
        return (long) shareConfigRepository.findAll().stream()
            .map(HeartSphereShareConfig::getUserId)
            .distinct()
            .count();
    }
    
    private Long getTotalConnectionUsers() {
        // 简化实现，统计有连接请求的用户数
        return (long) connectionRequestRepository.findAll().stream()
            .map(HeartSphereConnectionRequest::getRequesterId)
            .distinct()
            .count();
    }
    
    private Long getTotalAccessUsers() {
        // 简化实现
        return 0L;
    }
    
    private Long getActiveShareUsers() {
        // 简化实现，统计有活跃共享配置的用户数
        return (long) shareConfigRepository.findByShareStatus(
            HeartSphereShareConfig.ShareStatus.ACTIVE).stream()
            .map(HeartSphereShareConfig::getUserId)
            .distinct()
            .count();
    }
    
    private Long getTotalShareConfigs() {
        return shareConfigRepository.count();
    }
    
    private Long getActiveShareConfigs() {
        return (long) shareConfigRepository.findByShareStatus(
            HeartSphereShareConfig.ShareStatus.ACTIVE).size();
    }
    
    private Map<String, Long> getShareTypeDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        // 简化实现，实际应该统计
        return distribution;
    }
    
    private Map<String, Long> getAccessTypeDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        // 简化实现
        return distribution;
    }
    
    private Long getTotalConnectionRequests() {
        return connectionRequestRepository.count();
    }
    
    private Long getApprovedRequests() {
        return (long) connectionRequestRepository.findAll().stream()
            .filter(r -> r.getRequestStatus() == HeartSphereConnectionRequest.RequestStatus.APPROVED)
            .count();
    }
    
    private Long getRejectedRequests() {
        return (long) connectionRequestRepository.findAll().stream()
            .filter(r -> r.getRequestStatus() == HeartSphereConnectionRequest.RequestStatus.REJECTED)
            .count();
    }
    
    private Long getPendingRequests() {
        return (long) connectionRequestRepository.findAll().stream()
            .filter(r -> r.getRequestStatus() == HeartSphereConnectionRequest.RequestStatus.PENDING)
            .count();
    }
    
    private Double calculateConnectionSuccessRate() {
        long total = getTotalConnectionRequests();
        if (total == 0) {
            return 0.0;
        }
        long approved = getApprovedRequests();
        return (double) approved / total * 100;
    }
    
    private Long getTotalAccessCount() {
        // 简化实现
        return 0L;
    }
    
    private Long getTotalAccessDuration() {
        // 简化实现
        return 0L;
    }
    
    private Double calculateAverageAccessDuration() {
        // 简化实现
        return 0.0;
    }
    
    private Long getUniqueVisitors() {
        // 简化实现
        return 0L;
    }
    
    private Long getTotalMessages() {
        return warmMessageRepository.count();
    }
    
    private Long getApprovedMessages() {
        // WarmMessage实体没有status字段，简化实现
        return warmMessageRepository.count();
    }
    
    private Long getRejectedMessages() {
        // WarmMessage实体没有status字段，简化实现
        return 0L;
    }
    
    // 修复编译错误：移除不存在的方法调用
    
    private Map<String, Long> getMessageTypeDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        // 简化实现
        return distribution;
    }
    
    private Double calculateReplyRate() {
        // 简化实现
        return 0.0;
    }
}

