package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MultiAgentCollaborationDTO;
import com.heartsphere.admin.entity.MultiAgentCollaborationLog;
import com.heartsphere.admin.repository.MultiAgentCollaborationLogRepository;
import com.heartsphere.admin.service.MultiAgentCollaborationAdminService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 多智能体日志管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/multi-agent/logs")
@RequiredArgsConstructor
@Tag(name = "Multi-Agent Log Admin", description = "多智能体日志管理 API")
public class MultiAgentLogAdminController extends BaseAdminController {
    
    private final MultiAgentCollaborationAdminService collaborationService;
    private final MultiAgentCollaborationLogRepository logRepository;
    
    /**
     * 获取日志列表
     */
    @Operation(summary = "获取日志列表")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MultiAgentCollaborationDTO>>> getLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MultiAgentCollaborationDTO> logs = collaborationService.getCollaborations(
            status, userId, startTime, endTime, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
    
    /**
     * 获取日志详情
     */
    @Operation(summary = "获取日志详情")
    @GetMapping("/{collaborationId}")
    public ResponseEntity<ApiResponse<MultiAgentCollaborationDTO>> getLogById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String collaborationId) {
        
        validateAdmin(authHeader);
        
        MultiAgentCollaborationDTO log = collaborationService.getCollaborationById(collaborationId);
        return ResponseEntity.ok(ApiResponse.success(log));
    }
    
    /**
     * 获取错误日志
     */
    @Operation(summary = "获取错误日志")
    @GetMapping("/errors")
    public ResponseEntity<ApiResponse<List<MultiAgentCollaborationDTO>>> getErrorLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "100") int limit) {
        
        validateAdmin(authHeader);
        
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(7);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<MultiAgentCollaborationLog> errorLogs = logRepository.findByStatusAndCreatedAtBetween(
            "FAILED", startTime, endTime, PageRequest.of(0, limit)).getContent();
        
        List<MultiAgentCollaborationDTO> logs = errorLogs.stream()
            .map(log -> collaborationService.getCollaborationById(log.getCollaborationId()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
