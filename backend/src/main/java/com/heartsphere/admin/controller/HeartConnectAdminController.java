/**
 * 心域连接后台管理控制器
 */
package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.admin.service.HeartConnectAdminService;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.heartconnect.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * 心域连接后台管理控制器
 * @deprecated 使用 AdminHeartSphereConnectionController 代替
 */
@Deprecated
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/heartconnect-legacy")
public class HeartConnectAdminController extends BaseAdminController {

    private static final Logger logger = LoggerFactory.getLogger(HeartConnectAdminController.class);

    @Autowired
    private HeartConnectAdminService heartConnectAdminService;

    @Autowired
    private AdminAuthService adminAuthService;

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
            Pageable pageable) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询共享配置列表", admin.getUsername());

            Page<ShareConfigDTO> configs = heartConnectAdminService.getShareConfigs(
                    userId, shareType, status, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", configs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询共享配置列表失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 获取共享配置详情
     */
    @GetMapping("/share-configs/{id}")
    public ResponseEntity<Map<String, Object>> getShareConfigDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询共享配置详情: {}", admin.getUsername(), id);

            Map<String, Object> result = heartConnectAdminService.getShareConfigDetail(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询共享配置详情失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 禁用共享配置
     */
    @PostMapping("/share-configs/{id}/disable")
    public ResponseEntity<Map<String, Object>> disableShareConfig(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 禁用共享配置: {}", admin.getUsername(), id);

            heartConnectAdminService.disableShareConfig(id, admin.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("禁用共享配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 启用共享配置
     */
    @PostMapping("/share-configs/{id}/enable")
    public ResponseEntity<Map<String, Object>> enableShareConfig(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 启用共享配置: {}", admin.getUsername(), id);

            heartConnectAdminService.enableShareConfig(id, admin.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("启用共享配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // ========== 连接请求管理 ==========

    /**
     * 获取连接请求列表
     */
    @GetMapping("/connection-requests")
    public ResponseEntity<Map<String, Object>> getConnectionRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询连接请求列表", admin.getUsername());

            Page<ConnectionRequestDTO> requests = heartConnectAdminService.getConnectionRequests(
                    status, startDate, endDate, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", requests);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询连接请求列表失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 审核通过连接请求
     */
    @PostMapping("/connection-requests/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveConnectionRequest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 审核通过连接请求: {}", admin.getUsername(), id);

            heartConnectAdminService.approveConnectionRequest(id, admin.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("审核通过连接请求失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 拒绝连接请求
     */
    @PostMapping("/connection-requests/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectConnectionRequest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            String reason = request != null ? request.get("reason") : null;
            logger.info("管理员 {} 拒绝连接请求: {}, 原因: {}", admin.getUsername(), id, reason);

            heartConnectAdminService.rejectConnectionRequest(id, reason, admin.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("拒绝连接请求失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询访问记录列表", admin.getUsername());

            Page<ConnectionRequestDTO> records = heartConnectAdminService.getAccessRecords(
                    visitorId, ownerId, startDate, endDate, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", records);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询访问记录列表失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 获取访问记录详情
     */
    @GetMapping("/access-records/{id}")
    public ResponseEntity<Map<String, Object>> getAccessRecordDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询访问记录详情: {}", admin.getUsername(), id);

            ConnectionRequestDTO record = heartConnectAdminService.getAccessRecordDetail(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", record);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询访问记录详情失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // ========== 留言管理 ==========

    /**
     * 获取留言列表
     */
    @GetMapping("/warm-messages")
    public ResponseEntity<Map<String, Object>> getWarmMessages(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long visitorId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询留言列表", admin.getUsername());

            Page<WarmMessageDTO> messages = heartConnectAdminService.getWarmMessages(
                    visitorId, ownerId, contentType, startDate, endDate, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询留言列表失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 获取留言详情
     */
    @GetMapping("/warm-messages/{id}")
    public ResponseEntity<Map<String, Object>> getWarmMessageDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询留言详情: {}", admin.getUsername(), id);

            WarmMessageDTO message = heartConnectAdminService.getWarmMessageDetail(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询留言详情失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 删除留言
     */
    @DeleteMapping("/warm-messages/{id}")
    public ResponseEntity<Map<String, Object>> deleteWarmMessage(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            String reason = request != null ? request.get("reason") : null;
            logger.info("管理员 {} 删除留言: {}, 原因: {}", admin.getUsername(), id, reason);

            heartConnectAdminService.deleteWarmMessage(id, reason, admin.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("删除留言失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // ========== 数据统计 ==========

    /**
     * 获取总体统计数据
     */
    @GetMapping("/statistics/overview")
    public ResponseEntity<Map<String, Object>> getStatisticsOverview(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询总体统计数据", admin.getUsername());

            Map<String, Object> statistics = heartConnectAdminService.getStatisticsOverview(startDate, endDate);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询总体统计数据失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 获取趋势分析数据
     */
    @GetMapping("/statistics/trends")
    public ResponseEntity<Map<String, Object>> getStatisticsTrends(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String metric,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String granularity) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询趋势分析数据: {}", admin.getUsername(), metric);

            Map<String, Object> trends = heartConnectAdminService.getStatisticsTrends(
                    metric, startDate, endDate, granularity);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", trends);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询趋势分析数据失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    // ========== 异常处理 ==========

    /**
     * 获取异常情况列表
     */
    @GetMapping("/exceptions")
    public ResponseEntity<Map<String, Object>> getExceptions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String exceptionType,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            logger.info("管理员 {} 查询异常情况列表", admin.getUsername());

            Page<Map<String, Object>> exceptions = heartConnectAdminService.getExceptions(
                    exceptionType, severity, status, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", exceptions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("查询异常情况列表失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 处理异常情况
     */
    @PostMapping("/exceptions/{id}/handle")
    public ResponseEntity<Map<String, Object>> handleException(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            SystemAdmin admin = validateAdmin(authHeader);
            String handleAction = request.get("handleAction");
            String handleResult = request.get("handleResult");
            String notes = request.get("notes");
            logger.info("管理员 {} 处理异常情况: {}", admin.getUsername(), id);

            heartConnectAdminService.handleException(id, handleAction, handleResult, notes, admin.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("处理异常情况失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}

