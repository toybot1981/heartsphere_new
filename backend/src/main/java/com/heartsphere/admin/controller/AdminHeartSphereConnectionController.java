package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.service.AdminHeartSphereConnectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 心域连接管理控制器
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@RestController
@RequestMapping("/api/admin/heartsphere-connection")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AdminHeartSphereConnectionController extends BaseAdminController {
    
    private final AdminHeartSphereConnectionService adminHeartSphereConnectionService;
    
    // ========== 共享配置管理 ==========
    
    /**
     * 获取共享配置列表
     */
    @GetMapping("/share-configs")
    public ResponseEntity<Map<String, Object>> getShareConfigs(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String shareType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        validateAdmin(authHeader);
        
        Page<HeartSphereShareConfigDTO> configs = adminHeartSphereConnectionService.getShareConfigs(
            userId, shareType, status, search, pageable);
        
        return ResponseEntity.ok(Map.of(
            "content", configs.getContent(),
            "total", configs.getTotalElements(),
            "page", configs.getNumber(),
            "size", configs.getSize()
        ));
    }
    
    /**
     * 获取共享配置详情
     */
    @GetMapping("/share-configs/{id}")
    public ResponseEntity<HeartSphereShareConfigDTO> getShareConfigDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        
        validateAdmin(authHeader);
        
        HeartSphereShareConfigDTO config = adminHeartSphereConnectionService.getShareConfigDetail(id);
        return ResponseEntity.ok(config);
    }
    
    /**
     * 禁用共享配置
     */
    @PostMapping("/share-configs/{id}/disable")
    public ResponseEntity<Map<String, Object>> disableShareConfig(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String reason = request != null ? request.get("reason") : null;
        adminHeartSphereConnectionService.disableShareConfig(id, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 启用共享配置
     */
    @PostMapping("/share-configs/{id}/enable")
    public ResponseEntity<Map<String, Object>> enableShareConfig(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        
        validateAdmin(authHeader);
        
        adminHeartSphereConnectionService.enableShareConfig(id);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 暂停共享配置
     */
    @PostMapping("/share-configs/{id}/pause")
    public ResponseEntity<Map<String, Object>> pauseShareConfig(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String reason = request != null ? request.get("reason") : null;
        adminHeartSphereConnectionService.pauseShareConfig(id, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 删除共享配置
     */
    @DeleteMapping("/share-configs/{id}")
    public ResponseEntity<Map<String, Object>> deleteShareConfig(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String reason = request != null ? request.get("reason") : null;
        adminHeartSphereConnectionService.deleteShareConfig(id, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 批量禁用共享配置
     */
    @PostMapping("/share-configs/batch-disable")
    public ResponseEntity<Map<String, Object>> batchDisableShareConfigs(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Long> configIds = (List<Long>) request.get("configIds");
        String reason = (String) request.get("reason");
        
        adminHeartSphereConnectionService.batchDisableShareConfigs(configIds, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 批量删除共享配置
     */
    @PostMapping("/share-configs/batch-delete")
    public ResponseEntity<Map<String, Object>> batchDeleteShareConfigs(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Long> configIds = (List<Long>) request.get("configIds");
        String reason = (String) request.get("reason");
        
        adminHeartSphereConnectionService.batchDeleteShareConfigs(configIds, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    // ========== 连接请求管理 ==========
    
    /**
     * 获取连接请求列表
     */
    @GetMapping("/connection-requests")
    public ResponseEntity<Map<String, Object>> getConnectionRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) Long targetUserId,
            @PageableDefault(size = 20, sort = "requestTime", direction = Sort.Direction.DESC) Pageable pageable) {
        
        validateAdmin(authHeader);
        
        Instant start = startDate != null ? Instant.parse(startDate) : null;
        Instant end = endDate != null ? Instant.parse(endDate) : null;
        
        Page<ConnectionRequestDTO> requests = adminHeartSphereConnectionService.getConnectionRequests(
            status, start, end, requesterId, targetUserId, pageable);
        
        return ResponseEntity.ok(Map.of(
            "requests", requests.getContent(),
            "total", requests.getTotalElements(),
            "page", requests.getNumber(),
            "size", requests.getSize()
        ));
    }
    
    /**
     * 获取连接请求详情
     */
    @GetMapping("/connection-requests/{id}")
    public ResponseEntity<ConnectionRequestDTO> getConnectionRequestDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        
        validateAdmin(authHeader);
        
        ConnectionRequestDTO request = adminHeartSphereConnectionService.getConnectionRequestDetail(id);
        return ResponseEntity.ok(request);
    }
    
    /**
     * 审核通过连接请求
     */
    @PostMapping("/connection-requests/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveConnectionRequest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String adminNote = request != null ? request.get("adminNote") : null;
        adminHeartSphereConnectionService.approveConnectionRequest(id, adminNote);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 拒绝连接请求
     */
    @PostMapping("/connection-requests/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectConnectionRequest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String reason = request.get("reason");
        adminHeartSphereConnectionService.rejectConnectionRequest(id, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 批量审核连接请求
     */
    @PostMapping("/connection-requests/batch-approve")
    public ResponseEntity<Map<String, Object>> batchApproveConnectionRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Long> requestIds = (List<Long>) request.get("requestIds");
        String adminNote = (String) request.get("adminNote");
        
        adminHeartSphereConnectionService.batchApproveConnectionRequests(requestIds, adminNote);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 批量拒绝连接请求
     */
    @PostMapping("/connection-requests/batch-reject")
    public ResponseEntity<Map<String, Object>> batchRejectConnectionRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Long> requestIds = (List<Long>) request.get("requestIds");
        String reason = (String) request.get("reason");
        
        adminHeartSphereConnectionService.batchRejectConnectionRequests(requestIds, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    // ========== 访问记录管理 ==========
    
    /**
     * 获取访问记录列表
     */
    @GetMapping("/access-records")
    public ResponseEntity<Map<String, Object>> getAccessRecords(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long visitorId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @PageableDefault(size = 20, sort = "accessTime", direction = Sort.Direction.DESC) Pageable pageable) {
        
        validateAdmin(authHeader);
        
        Instant start = startDate != null ? Instant.parse(startDate) : null;
        Instant end = endDate != null ? Instant.parse(endDate) : null;
        
        Page<AccessRecordDTO> records = adminHeartSphereConnectionService.getAccessRecords(
            visitorId, ownerId, start, end, pageable);
        
        return ResponseEntity.ok(Map.of(
            "records", records.getContent(),
            "total", records.getTotalElements(),
            "page", records.getNumber(),
            "size", records.getSize()
        ));
    }
    
    /**
     * 获取访问记录详情
     */
    @GetMapping("/access-records/{id}")
    public ResponseEntity<AccessRecordDTO> getAccessRecordDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        
        validateAdmin(authHeader);
        
        AccessRecordDTO record = adminHeartSphereConnectionService.getAccessRecordDetail(id);
        return ResponseEntity.ok(record);
    }
    
    /**
     * 导出访问记录
     */
    @GetMapping("/access-records/export")
    public ResponseEntity<List<AccessRecordDTO>> exportAccessRecords(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long visitorId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        validateAdmin(authHeader);
        
        Instant start = startDate != null ? Instant.parse(startDate) : null;
        Instant end = endDate != null ? Instant.parse(endDate) : null;
        
        List<AccessRecordDTO> records = adminHeartSphereConnectionService.exportAccessRecords(
            visitorId, ownerId, start, end);
        
        return ResponseEntity.ok(records);
    }
    
    // ========== 留言管理 ==========
    
    /**
     * 获取留言列表
     */
    @GetMapping("/warm-messages")
    public ResponseEntity<Map<String, Object>> getWarmMessages(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long senderId,
            @RequestParam(required = false) Long receiverId,
            @RequestParam(required = false) String messageType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        validateAdmin(authHeader);
        
        Page<WarmMessageDTO> messages = adminHeartSphereConnectionService.getWarmMessages(
            senderId, receiverId, messageType, status, search, pageable);
        
        return ResponseEntity.ok(Map.of(
            "messages", messages.getContent(),
            "total", messages.getTotalElements(),
            "page", messages.getNumber(),
            "size", messages.getSize()
        ));
    }
    
    /**
     * 获取留言详情
     */
    @GetMapping("/warm-messages/{id}")
    public ResponseEntity<WarmMessageDTO> getWarmMessageDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        
        validateAdmin(authHeader);
        
        WarmMessageDTO message = adminHeartSphereConnectionService.getWarmMessageDetail(id);
        return ResponseEntity.ok(message);
    }
    
    /**
     * 审核留言
     */
    @PostMapping("/warm-messages/{id}/review")
    public ResponseEntity<Map<String, Object>> reviewWarmMessage(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String status = request.get("status");
        String reason = request.get("reason");
        adminHeartSphereConnectionService.reviewWarmMessage(id, status, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 删除留言
     */
    @DeleteMapping("/warm-messages/{id}")
    public ResponseEntity<Map<String, Object>> deleteWarmMessage(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String reason = request != null ? request.get("reason") : null;
        adminHeartSphereConnectionService.deleteWarmMessage(id, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 批量审核留言
     */
    @PostMapping("/warm-messages/batch-review")
    public ResponseEntity<Map<String, Object>> batchReviewWarmMessages(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Long> messageIds = (List<Long>) request.get("messageIds");
        String status = (String) request.get("status");
        String reason = (String) request.get("reason");
        
        adminHeartSphereConnectionService.batchReviewWarmMessages(messageIds, status, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 批量删除留言
     */
    @PostMapping("/warm-messages/batch-delete")
    public ResponseEntity<Map<String, Object>> batchDeleteWarmMessages(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Long> messageIds = (List<Long>) request.get("messageIds");
        String reason = (String) request.get("reason");
        
        adminHeartSphereConnectionService.batchDeleteWarmMessages(messageIds, reason);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    // ========== 数据统计 ==========
    
    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<HeartSphereConnectionStatisticsDTO> getStatistics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        validateAdmin(authHeader);
        
        Instant start = startDate != null ? Instant.parse(startDate) : null;
        Instant end = endDate != null ? Instant.parse(endDate) : null;
        
        HeartSphereConnectionStatisticsDTO statistics = 
            adminHeartSphereConnectionService.getStatistics(start, end);
        
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * 获取趋势数据
     */
    @GetMapping("/trend-data")
    public ResponseEntity<Map<String, Object>> getTrendData(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        validateAdmin(authHeader);
        
        Instant start = startDate != null ? Instant.parse(startDate) : null;
        Instant end = endDate != null ? Instant.parse(endDate) : null;
        
        Map<String, Object> trendData = adminHeartSphereConnectionService.getTrendData(period, start, end);
        
        return ResponseEntity.ok(trendData);
    }
    
    // ========== 异常处理 ==========
    
    /**
     * 获取异常情况列表
     */
    @GetMapping("/exceptions")
    public ResponseEntity<Map<String, Object>> getExceptionRecords(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String exceptionType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        validateAdmin(authHeader);
        
        Page<ExceptionHandlingRecordDTO> records = adminHeartSphereConnectionService.getExceptionRecords(
            exceptionType, status, severity, pageable);
        
        return ResponseEntity.ok(Map.of(
            "records", records.getContent(),
            "total", records.getTotalElements(),
            "page", records.getNumber(),
            "size", records.getSize()
        ));
    }
    
    /**
     * 处理异常情况
     */
    @PostMapping("/exceptions/{id}/handle")
    public ResponseEntity<Map<String, Object>> handleException(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String handleResult = request.get("handleResult");
        String adminNote = request.get("adminNote");
        adminHeartSphereConnectionService.handleException(id, handleResult, adminNote);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 获取投诉列表
     */
    @GetMapping("/complaints")
    public ResponseEntity<Map<String, Object>> getComplaints(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        validateAdmin(authHeader);
        
        Page<ComplaintDTO> complaints = adminHeartSphereConnectionService.getComplaints(
            status, userId, pageable);
        
        return ResponseEntity.ok(Map.of(
            "complaints", complaints.getContent(),
            "total", complaints.getTotalElements(),
            "page", complaints.getNumber(),
            "size", complaints.getSize()
        ));
    }
    
    /**
     * 处理投诉
     */
    @PostMapping("/complaints/{id}/handle")
    public ResponseEntity<Map<String, Object>> handleComplaint(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        String handleResult = request.get("handleResult");
        String adminNote = request.get("adminNote");
        adminHeartSphereConnectionService.handleComplaint(id, handleResult, adminNote);
        
        return ResponseEntity.ok(Map.of("success", true));
    }
}

