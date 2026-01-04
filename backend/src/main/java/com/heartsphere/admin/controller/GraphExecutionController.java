package com.heartsphere.admin.controller;

import com.heartsphere.aiagent.dto.*;
import com.heartsphere.aiagent.service.GraphExecutionService;
import com.heartsphere.aiagent.service.GraphExecutionManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Graph执行控制器
 * 提供Graph执行的REST API
 */
@RestController
@RequestMapping("/api/admin/graph")
@CrossOrigin(origins = "*")
public class GraphExecutionController extends BaseAdminController {
    
    @Autowired
    private GraphExecutionService executionService;
    
    @Autowired
    private GraphExecutionManagementService executionManagementService;
    
    /**
     * 执行Graph
     * POST /api/admin/graph/{id}/execute
     */
    @PostMapping("/{id}/execute")
    public ResponseEntity<GraphExecutionDTO> executeGraph(
            @PathVariable Long id,
            @RequestBody(required = false) GraphExecutionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        if (request == null) {
            request = new GraphExecutionRequest();
        }
        
        GraphExecutionDTO result = executionService.executeGraph(id, request, admin.getId());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 获取执行状态
     * GET /api/admin/graph/{id}/execution/{executionId}
     */
    @GetMapping("/{id}/execution/{executionId}")
    public ResponseEntity<GraphExecutionDTO> getExecutionStatus(
            @PathVariable Long id,
            @PathVariable String executionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        GraphExecutionDTO result = executionService.getExecutionStatus(id, executionId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 继续执行（用于WaitNode）
     * POST /api/admin/graph/{id}/execution/{executionId}/continue
     */
    @PostMapping("/{id}/execution/{executionId}/continue")
    public ResponseEntity<GraphExecutionDTO> continueExecution(
            @PathVariable Long id,
            @PathVariable String executionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        GraphExecutionDTO result = executionService.continueExecution(id, executionId, admin.getId());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 用户选择（用于ChoiceNode）
     * POST /api/admin/graph/{id}/execution/{executionId}/choice
     */
    @PostMapping("/{id}/execution/{executionId}/choice")
    public ResponseEntity<GraphExecutionDTO> makeChoice(
            @PathVariable Long id,
            @PathVariable String executionId,
            @RequestBody GraphExecutionChoiceRequest choiceRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        GraphExecutionDTO result = executionService.makeChoice(id, executionId, choiceRequest, admin.getId());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 暂停执行
     * POST /api/admin/graph/{id}/execution/{executionId}/pause
     */
    @PostMapping("/{id}/execution/{executionId}/pause")
    public ResponseEntity<GraphExecutionDTO> pauseExecution(
            @PathVariable Long id,
            @PathVariable String executionId,
            @RequestBody(required = false) GraphExecutionPauseRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        String reason = request != null ? request.getReason() : null;
        GraphExecutionDTO result = executionManagementService.pauseExecution(id, executionId, reason, admin.getId());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 恢复执行
     * POST /api/admin/graph/{id}/execution/{executionId}/resume
     */
    @PostMapping("/{id}/execution/{executionId}/resume")
    public ResponseEntity<GraphExecutionDTO> resumeExecution(
            @PathVariable Long id,
            @PathVariable String executionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        GraphExecutionDTO result = executionManagementService.resumeExecution(id, executionId, admin.getId());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 取消执行
     * POST /api/admin/graph/{id}/execution/{executionId}/cancel
     */
    @PostMapping("/{id}/execution/{executionId}/cancel")
    public ResponseEntity<GraphExecutionDTO> cancelExecution(
            @PathVariable Long id,
            @PathVariable String executionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        GraphExecutionDTO result = executionManagementService.cancelExecution(id, executionId, admin.getId());
        return ResponseEntity.ok(result);
    }
}
