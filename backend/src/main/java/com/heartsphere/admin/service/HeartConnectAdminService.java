/**
 * 心域连接后台管理服务
 */
package com.heartsphere.admin.service;

import com.heartsphere.heartconnect.dto.*;
import com.heartsphere.heartconnect.entity.*;
import com.heartsphere.heartconnect.repository.*;
import com.heartsphere.admin.entity.AdminOperationLog;
import com.heartsphere.admin.repository.AdminOperationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 心域连接后台管理服务
 */
@Service
public class HeartConnectAdminService {

    private static final Logger logger = LoggerFactory.getLogger(HeartConnectAdminService.class);

    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;

    @Autowired
    private HeartSphereConnectionRequestRepository connectionRequestRepository;

    @Autowired
    private HeartSphereConnectionRepository connectionRepository;

    @Autowired
    private WarmMessageRepository warmMessageRepository;

    @Autowired
    private AdminOperationLogRepository adminOperationLogRepository;

    // ========== 共享配置管理 ==========

    /**
     * 获取共享配置列表
     */
    public Page<ShareConfigDTO> getShareConfigs(Long userId, String shareType, String status, Pageable pageable) {
        Specification<HeartSphereShareConfig> spec = Specification.where(null);

        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }
        if (shareType != null && !shareType.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("shareType"), shareType));
        }
        if (status != null && !status.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("shareStatus"), status));
        }

        return shareConfigRepository.findAll(spec, pageable)
                .map(this::convertToShareConfigDTO);
    }

    /**
     * 获取共享配置详情
     */
    public Map<String, Object> getShareConfigDetail(Long id) {
        HeartSphereShareConfig config = shareConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("共享配置不存在"));

        ShareConfigDTO dto = convertToShareConfigDTO(config);

        // 获取使用统计
        Map<String, Object> statistics = new HashMap<>();
        List<HeartSphereConnection> connections = connectionRepository.findByShareConfigId(id);
        statistics.put("accessCount", connections != null ? connections.size() : 0);
        statistics.put("messageCount", warmMessageRepository.countByShareConfigId(id));

        Map<String, Object> result = new HashMap<>();
        result.put("config", dto);
        result.put("statistics", statistics);

        return result;
    }

    /**
     * 禁用共享配置
     */
    @Transactional
    public void disableShareConfig(Long id, Long adminId) {
        HeartSphereShareConfig config = shareConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("共享配置不存在"));

        config.setShareStatus(HeartSphereShareConfig.ShareStatus.CLOSED);
        shareConfigRepository.save(config);

        // 记录操作日志
        logOperation(adminId, "edit", "share-config", id, "禁用共享配置", "success");
    }

    /**
     * 启用共享配置
     */
    @Transactional
    public void enableShareConfig(Long id, Long adminId) {
        HeartSphereShareConfig config = shareConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("共享配置不存在"));

        config.setShareStatus(HeartSphereShareConfig.ShareStatus.ACTIVE);
        shareConfigRepository.save(config);

        // 记录操作日志
        logOperation(adminId, "edit", "share-config", id, "启用共享配置", "success");
    }

    // ========== 连接请求管理 ==========

    /**
     * 获取连接请求列表
     */
    public Page<ConnectionRequestDTO> getConnectionRequests(String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        Specification<HeartSphereConnectionRequest> spec = Specification.where(null);

        if (status != null && !status.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requestStatus"), status));
        }
        if (startDate != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("requestedAt"), startDate.atStartOfDay()));
        }
        if (endDate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("requestedAt"), endDate.atTime(23, 59, 59)));
        }

        return connectionRequestRepository.findAll(spec, pageable)
                .map(this::convertToConnectionRequestDTO);
    }

    /**
     * 审核通过连接请求
     */
    @Transactional
    public void approveConnectionRequest(Long id, Long adminId) {
        HeartSphereConnectionRequest request = connectionRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("连接请求不存在"));

        request.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.APPROVED);
        request.setRespondedAt(LocalDateTime.now());
        connectionRequestRepository.save(request);

        // 记录操作日志
        logOperation(adminId, "edit", "connection-request", id, "审核通过连接请求", "success");
    }

    /**
     * 拒绝连接请求
     */
    @Transactional
    public void rejectConnectionRequest(Long id, String reason, Long adminId) {
        HeartSphereConnectionRequest request = connectionRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("连接请求不存在"));

        request.setRequestStatus(HeartSphereConnectionRequest.RequestStatus.REJECTED);
        request.setResponseMessage(reason);
        request.setRespondedAt(LocalDateTime.now());
        connectionRequestRepository.save(request);

        // 记录操作日志
        logOperation(adminId, "edit", "connection-request", id, "拒绝连接请求: " + reason, "success");
    }

    // ========== 访问记录管理 ==========

    /**
     * 获取访问记录列表（使用连接记录）
     */
    public Page<ConnectionRequestDTO> getAccessRecords(Long visitorId, Long ownerId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        Specification<HeartSphereConnection> spec = Specification.where(null);

        if (visitorId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("visitorId"), visitorId));
        }
        if (ownerId != null) {
            // 需要通过 shareConfigId 查找 ownerId
            List<HeartSphereShareConfig> configs = shareConfigRepository.findByUserId(ownerId).stream().collect(Collectors.toList());
            if (!configs.isEmpty()) {
                List<Long> configIds = configs.stream().map(HeartSphereShareConfig::getId).collect(Collectors.toList());
                spec = spec.and((root, query, cb) -> root.get("shareConfigId").in(configIds));
            } else {
                // 如果没有找到配置，返回空结果
                return Page.empty(pageable);
            }
        }
        if (startDate != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("connectedAt"), startDate.atStartOfDay()));
        }
        if (endDate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("connectedAt"), endDate.atTime(23, 59, 59)));
        }

        return connectionRepository.findAll(spec, pageable)
                .map(this::convertToConnectionDTO);
    }

    /**
     * 获取访问记录详情
     */
    public ConnectionRequestDTO getAccessRecordDetail(Long id) {
        HeartSphereConnection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("访问记录不存在"));

        return convertToConnectionDTO(connection);
    }

    // ========== 留言管理 ==========

    /**
     * 获取留言列表
     */
    public Page<WarmMessageDTO> getWarmMessages(Long visitorId, Long ownerId, String contentType, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        // WarmMessageRepository 不支持 Specification，使用简单查询
        List<WarmMessage> allMessages = warmMessageRepository.findAll();
        
        // 手动过滤
        List<WarmMessage> filtered = allMessages.stream()
            .filter(msg -> visitorId == null || msg.getVisitorId().equals(visitorId))
            .filter(msg -> {
                if (ownerId == null) return true;
                // 需要通过 shareConfigId 查找 ownerId
                HeartSphereShareConfig config = shareConfigRepository.findById(msg.getShareConfigId()).orElse(null);
                return config != null && config.getUserId().equals(ownerId);
            })
            .filter(msg -> startDate == null || msg.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)))
            .filter(msg -> endDate == null || msg.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
            .collect(Collectors.toList());
        
        // 手动分页
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<WarmMessage> paged = start < filtered.size() ? filtered.subList(start, end) : new ArrayList<>();
        
        return new org.springframework.data.domain.PageImpl<>(
            paged.stream().map(this::convertToWarmMessageDTO).collect(Collectors.toList()),
            pageable,
            filtered.size()
        );
    }

    /**
     * 获取留言详情
     */
    public WarmMessageDTO getWarmMessageDetail(Long id) {
        WarmMessage message = warmMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("留言不存在"));

        return convertToWarmMessageDTO(message);
    }

    /**
     * 删除留言
     */
    @Transactional
    public void deleteWarmMessage(Long id, String reason, Long adminId) {
        WarmMessage message = warmMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("留言不存在"));

        warmMessageRepository.delete(message);

        // 记录操作日志
        logOperation(adminId, "delete", "warm-message", id, "删除留言: " + reason, "success");
    }

    // ========== 数据统计 ==========

    /**
     * 获取总体统计数据
     */
    public Map<String, Object> getStatisticsOverview(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> statistics = new HashMap<>();

        // 用户统计
        Map<String, Object> userStats = new HashMap<>();
        userStats.put("totalShareUsers", shareConfigRepository.count());
        userStats.put("totalConnectionUsers", connectionRequestRepository.count());
        userStats.put("totalAccessUsers", connectionRepository.count());
        statistics.put("userStats", userStats);

        // 共享统计
        Map<String, Object> shareStats = new HashMap<>();
        shareStats.put("totalConfigs", shareConfigRepository.count());
        shareStats.put("activeConfigs", shareConfigRepository.count());
        statistics.put("shareStats", shareStats);

        // 连接统计
        Map<String, Object> connectionStats = new HashMap<>();
        long totalRequests = connectionRequestRepository.count();
        List<HeartSphereConnectionRequest> approvedList = connectionRequestRepository.findByRequestStatus(HeartSphereConnectionRequest.RequestStatus.APPROVED);
        long approvedRequests = approvedList != null ? approvedList.size() : 0;
        connectionStats.put("totalRequests", totalRequests);
        connectionStats.put("approvedRequests", approvedRequests);
        connectionStats.put("approvalRate", totalRequests > 0 ? (double) approvedRequests / totalRequests : 0);
        statistics.put("connectionStats", connectionStats);

        // 访问统计
        Map<String, Object> accessStats = new HashMap<>();
        accessStats.put("totalAccesses", connectionRepository.count());
        statistics.put("accessStats", accessStats);

        // 留言统计
        Map<String, Object> messageStats = new HashMap<>();
        messageStats.put("totalMessages", warmMessageRepository.count());
        statistics.put("messageStats", messageStats);

        return statistics;
    }

    /**
     * 获取趋势分析数据
     */
    public Map<String, Object> getStatisticsTrends(String metric, LocalDate startDate, LocalDate endDate, String granularity) {
        Map<String, Object> trends = new HashMap<>();
        List<Map<String, Object>> dataPoints = new ArrayList<>();

        // 根据指标类型和时间粒度生成趋势数据
        // 这里简化实现，实际应该根据metric和granularity查询数据库

        trends.put("metric", metric);
        trends.put("granularity", granularity);
        trends.put("dataPoints", dataPoints);

        return trends;
    }

    // ========== 异常处理 ==========

    /**
     * 获取异常情况列表
     */
    public Page<Map<String, Object>> getExceptions(String exceptionType, String severity, String status, Pageable pageable) {
        // 这里应该从异常处理记录表查询
        // 暂时返回空列表
        return Page.empty(pageable);
    }

    /**
     * 处理异常情况
     */
    @Transactional
    public void handleException(Long id, String handleAction, String handleResult, String notes, Long adminId) {
        // 这里应该更新异常处理记录
        // 记录操作日志
        logOperation(adminId, "edit", "exception", id, "处理异常: " + handleResult, "success");
    }

    // ========== 工具方法 ==========

    private ShareConfigDTO convertToShareConfigDTO(HeartSphereShareConfig config) {
        ShareConfigDTO dto = new ShareConfigDTO();
        dto.setId(config.getId());
        dto.setUserId(config.getUserId());
        dto.setShareType(config.getShareType() != null ? config.getShareType().name() : null);
        dto.setShareStatus(config.getShareStatus() != null ? config.getShareStatus().name() : null);
        if (config.getCreatedAt() != null) {
            dto.setCreatedAt(config.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        }
        if (config.getUpdatedAt() != null) {
            dto.setUpdatedAt(config.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        }
        return dto;
    }

    private ConnectionRequestDTO convertToConnectionRequestDTO(HeartSphereConnectionRequest request) {
        ConnectionRequestDTO dto = new ConnectionRequestDTO();
        dto.setId(request.getId());
        dto.setShareConfigId(request.getShareConfigId());
        dto.setRequesterId(request.getRequesterId());
        dto.setRequestStatus(request.getRequestStatus() != null ? request.getRequestStatus().name() : null);
        if (request.getRequestedAt() != null) {
            dto.setRequestedAt(request.getRequestedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        }
        if (request.getRespondedAt() != null) {
            dto.setRespondedAt(request.getRespondedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        }
        return dto;
    }

    private ConnectionRequestDTO convertToConnectionDTO(HeartSphereConnection connection) {
        ConnectionRequestDTO dto = new ConnectionRequestDTO();
        dto.setId(connection.getId());
        dto.setShareConfigId(connection.getShareConfigId());
        dto.setRequesterId(connection.getVisitorId());
        if (connection.getConnectedAt() != null) {
            dto.setRequestedAt(connection.getConnectedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        }
        return dto;
    }

    private WarmMessageDTO convertToWarmMessageDTO(WarmMessage message) {
        WarmMessageDTO dto = new WarmMessageDTO();
        dto.setId(message.getId());
        dto.setShareConfigId(message.getShareConfigId());
        dto.setVisitorId(message.getVisitorId());
        dto.setVisitorName(message.getVisitorName());
        // 内容脱敏处理
        String content = message.getMessage();
        if (content != null && content.length() > 10) {
            dto.setMessage(content.substring(0, 5) + "***" + content.substring(content.length() - 5));
        } else {
            dto.setMessage("***");
        }
        if (message.getCreatedAt() != null) {
            dto.setCreatedAt(message.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        }
        return dto;
    }

    private void logOperation(Long adminId, String operationType, String module, Long targetId, String content, String result) {
        AdminOperationLog log = new AdminOperationLog();
        log.setAdminId(adminId);
        log.setOperationType(operationType);
        log.setModule(module);
        log.setTargetId(targetId);
        log.setOperationContent(content);
        log.setOperationResult(result);
        log.setCreatedAt(LocalDateTime.now());
        adminOperationLogRepository.save(log);
    }
}

