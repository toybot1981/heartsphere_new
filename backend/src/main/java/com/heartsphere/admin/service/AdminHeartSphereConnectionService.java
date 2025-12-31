package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

/**
 * 心域连接管理服务接口（管理端）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
public interface AdminHeartSphereConnectionService {
    
    // ========== 共享配置管理 ==========
    
    /**
     * 获取共享配置列表
     */
    Page<HeartSphereShareConfigDTO> getShareConfigs(
        Long userId, String shareType, String status, String search,
        Pageable pageable);
    
    /**
     * 获取共享配置详情
     */
    HeartSphereShareConfigDTO getShareConfigDetail(Long configId);
    
    /**
     * 禁用共享配置
     */
    void disableShareConfig(Long configId, String reason);
    
    /**
     * 启用共享配置
     */
    void enableShareConfig(Long configId);
    
    /**
     * 暂停共享配置
     */
    void pauseShareConfig(Long configId, String reason);
    
    /**
     * 删除共享配置
     */
    void deleteShareConfig(Long configId, String reason);
    
    /**
     * 批量禁用共享配置
     */
    void batchDisableShareConfigs(List<Long> configIds, String reason);
    
    /**
     * 批量删除共享配置
     */
    void batchDeleteShareConfigs(List<Long> configIds, String reason);
    
    // ========== 连接请求管理 ==========
    
    /**
     * 获取连接请求列表
     */
    Page<ConnectionRequestDTO> getConnectionRequests(
        String status, Instant startDate, Instant endDate,
        Long requesterId, Long targetUserId, Pageable pageable);
    
    /**
     * 获取连接请求详情
     */
    ConnectionRequestDTO getConnectionRequestDetail(Long requestId);
    
    /**
     * 审核通过连接请求
     */
    void approveConnectionRequest(Long requestId, String adminNote);
    
    /**
     * 拒绝连接请求
     */
    void rejectConnectionRequest(Long requestId, String reason);
    
    /**
     * 批量审核连接请求
     */
    void batchApproveConnectionRequests(List<Long> requestIds, String adminNote);
    
    /**
     * 批量拒绝连接请求
     */
    void batchRejectConnectionRequests(List<Long> requestIds, String reason);
    
    // ========== 访问记录管理 ==========
    
    /**
     * 获取访问记录列表
     */
    Page<AccessRecordDTO> getAccessRecords(
        Long visitorId, Long ownerId, Instant startDate, Instant endDate,
        Pageable pageable);
    
    /**
     * 获取访问记录详情
     */
    AccessRecordDTO getAccessRecordDetail(Long recordId);
    
    /**
     * 导出访问记录
     */
    List<AccessRecordDTO> exportAccessRecords(
        Long visitorId, Long ownerId, Instant startDate, Instant endDate);
    
    // ========== 留言管理 ==========
    
    /**
     * 获取留言列表
     */
    Page<WarmMessageDTO> getWarmMessages(
        Long senderId, Long receiverId, String messageType, String status,
        String search, Pageable pageable);
    
    /**
     * 获取留言详情
     */
    WarmMessageDTO getWarmMessageDetail(Long messageId);
    
    /**
     * 审核留言
     */
    void reviewWarmMessage(Long messageId, String status, String reason);
    
    /**
     * 删除留言
     */
    void deleteWarmMessage(Long messageId, String reason);
    
    /**
     * 批量审核留言
     */
    void batchReviewWarmMessages(List<Long> messageIds, String status, String reason);
    
    /**
     * 批量删除留言
     */
    void batchDeleteWarmMessages(List<Long> messageIds, String reason);
    
    // ========== 数据统计 ==========
    
    /**
     * 获取统计数据
     */
    HeartSphereConnectionStatisticsDTO getStatistics(
        Instant startDate, Instant endDate);
    
    /**
     * 获取趋势数据
     */
    java.util.Map<String, Object> getTrendData(String period, Instant startDate, Instant endDate);
    
    // ========== 异常处理 ==========
    
    /**
     * 获取异常情况列表
     */
    Page<ExceptionHandlingRecordDTO> getExceptionRecords(
        String exceptionType, String status, String severity, Pageable pageable);
    
    /**
     * 处理异常情况
     */
    void handleException(Long exceptionId, String handleResult, String adminNote);
    
    /**
     * 获取投诉列表
     */
    Page<ComplaintDTO> getComplaints(
        String status, Long userId, Pageable pageable);
    
    /**
     * 处理投诉
     */
    void handleComplaint(Long complaintId, String handleResult, String adminNote);
}

