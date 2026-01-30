package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MultiAgentCollaborationDTO;
import com.heartsphere.admin.dto.MultiAgentCollaborationStatisticsDTO;
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

/**
 * 多智能体协作管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/multi-agent/collaborations")
@RequiredArgsConstructor
@Tag(name = "Multi-Agent Collaboration Admin", description = "多智能体协作管理 API")
public class MultiAgentCollaborationAdminController extends BaseAdminController {
    
    private final MultiAgentCollaborationAdminService collaborationService;
    
    /**
     * 获取协作列表
     */
    @Operation(summary = "获取协作列表", description = "支持分页、搜索、筛选")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MultiAgentCollaborationDTO>>> getCollaborations(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MultiAgentCollaborationDTO> collaborations = collaborationService.getCollaborations(
            status, userId, startTime, endTime, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(collaborations));
    }
    
    /**
     * 获取协作详情
     */
    @Operation(summary = "获取协作详情")
    @GetMapping("/{collaborationId}")
    public ResponseEntity<ApiResponse<MultiAgentCollaborationDTO>> getCollaborationById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String collaborationId) {
        
        validateAdmin(authHeader);
        
        MultiAgentCollaborationDTO collaboration = collaborationService.getCollaborationById(collaborationId);
        return ResponseEntity.ok(ApiResponse.success(collaboration));
    }
    
    /**
     * 取消协作
     */
    @Operation(summary = "取消协作")
    @PostMapping("/{collaborationId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelCollaboration(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String collaborationId) {
        
        validateAdmin(authHeader);
        
        collaborationService.cancelCollaboration(collaborationId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 获取协作统计信息
     */
    @Operation(summary = "获取协作统计信息")
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<MultiAgentCollaborationStatisticsDTO>> getStatistics(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        validateAdmin(authHeader);
        
        MultiAgentCollaborationStatisticsDTO statistics = collaborationService.getStatistics(startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}
