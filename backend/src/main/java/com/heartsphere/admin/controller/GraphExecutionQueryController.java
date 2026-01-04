package com.heartsphere.admin.controller;

import com.heartsphere.aiagent.dto.*;
import com.heartsphere.aiagent.service.GraphExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Graph执行查询控制器
 * 提供执行历史查询、统计等功能
 */
@RestController
@RequestMapping("/api/admin/graph")
@CrossOrigin(origins = "*")
public class GraphExecutionQueryController extends BaseAdminController {
    
    @Autowired
    private GraphExecutionService executionService;
    
    /**
     * 查询执行历史
     * POST /api/admin/graph/executions/query
     */
    @PostMapping("/executions/query")
    public ResponseEntity<GraphExecutionListResponse> queryExecutions(
            @RequestBody GraphExecutionQueryRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        GraphExecutionListResponse result = executionService.queryExecutions(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 获取所有运行中的执行
     * GET /api/admin/graph/executions/running
     */
    @GetMapping("/executions/running")
    public ResponseEntity<GraphExecutionListResponse> getRunningExecutions(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        GraphExecutionQueryRequest request = GraphExecutionQueryRequest.builder()
                .status("RUNNING")
                .page(page)
                .size(size)
                .build();
        
        GraphExecutionListResponse result = executionService.queryExecutions(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 根据Graph ID查询执行历史
     * GET /api/admin/graph/{id}/executions
     */
    @GetMapping("/{id}/executions")
    public ResponseEntity<GraphExecutionListResponse> getExecutionsByGraphId(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        GraphExecutionListResponse result = executionService.getExecutionsByGraphId(id, page, size);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 获取执行统计信息
     * GET /api/admin/graph/executions/statistics?graphId={graphId}
     */
    @GetMapping("/executions/statistics")
    public ResponseEntity<Map<String, Object>> getExecutionStatistics(
            @RequestParam(required = false) Long graphId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Map<String, Object> stats = executionService.getExecutionStatistics(graphId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 清理旧的执行记录
     * POST /api/admin/graph/executions/cleanup?daysBefore={daysBefore}
     */
    @PostMapping("/executions/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldExecutions(
            @RequestParam(defaultValue = "30") Integer daysBefore,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        int deletedCount = executionService.cleanupOldExecutions(daysBefore);
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("deletedCount", deletedCount);
        result.put("daysBefore", daysBefore);
        result.put("message", "成功清理了" + deletedCount + "条执行记录");
        
        return ResponseEntity.ok(result);
    }
}
