package com.heartsphere.admin.controller;

import com.heartsphere.aiagent.dto.*;
import com.heartsphere.aiagent.service.ExecutionLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Graph执行日志控制器
 * 提供日志查询API
 */
@RestController
@RequestMapping("/api/admin/graph")
public class ExecutionLogController extends BaseAdminController {
    
    @Autowired
    private ExecutionLogService logService;
    
    /**
     * 查询执行日志
     * POST /api/admin/graph/executions/logs/query
     */
    @PostMapping("/executions/logs/query")
    public ResponseEntity<ExecutionLogListResponse> queryLogs(
            @RequestBody ExecutionLogQueryRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        ExecutionLogListResponse result = logService.queryLogs(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 根据执行ID查询所有日志
     * GET /api/admin/graph/executions/{executionId}/logs
     */
    @GetMapping("/executions/{executionId}/logs")
    public ResponseEntity<List<ExecutionLogDTO>> getLogsByExecutionId(
            @PathVariable String executionId,
            @RequestParam(required = false) Boolean all,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (Boolean.TRUE.equals(all)) {
            // 返回所有日志（不分页）
            List<ExecutionLogDTO> logs = logService.getLogsByExecutionId(executionId);
            return ResponseEntity.ok(logs);
        } else {
            // 分页返回
            ExecutionLogListResponse result = logService.getLogsByExecutionId(executionId, page, size);
            return ResponseEntity.ok(result.getLogs());
        }
    }
    
    /**
     * 根据执行ID分页查询日志
     * GET /api/admin/graph/executions/{executionId}/logs/page
     */
    @GetMapping("/executions/{executionId}/logs/page")
    public ResponseEntity<ExecutionLogListResponse> getLogsByExecutionIdPage(
            @PathVariable String executionId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        ExecutionLogListResponse result = logService.getLogsByExecutionId(executionId, page, size);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 删除执行日志
     * DELETE /api/admin/graph/executions/{executionId}/logs
     */
    @DeleteMapping("/executions/{executionId}/logs")
    public ResponseEntity<Map<String, Object>> deleteLogsByExecutionId(
            @PathVariable String executionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        logService.deleteLogsByExecutionId(executionId);
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("message", "成功删除执行日志");
        result.put("executionId", executionId);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 清理旧的日志
     * POST /api/admin/graph/executions/logs/cleanup?daysBefore={daysBefore}
     */
    @PostMapping("/executions/logs/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldLogs(
            @RequestParam(defaultValue = "30") Integer daysBefore,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        int deletedCount = logService.cleanupOldLogs(daysBefore);
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("deletedCount", deletedCount);
        result.put("daysBefore", daysBefore);
        result.put("message", "成功清理了" + deletedCount + "条日志记录");
        
        return ResponseEntity.ok(result);
    }
}
