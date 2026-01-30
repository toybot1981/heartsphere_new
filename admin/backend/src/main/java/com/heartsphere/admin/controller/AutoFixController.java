package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.AutoFixRecord;
import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.PipelineExecutionRepository;
import com.heartsphere.admin.service.AutoFixService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 自动修复控制器
 */
@RestController
@RequestMapping("/api/admin/devops/auto-fix")
public class AutoFixController extends BaseAdminController {
    
    @Autowired
    private AutoFixService autoFixService;
    
    @Autowired
    private PipelineExecutionRepository pipelineExecutionRepository;
    
    /**
     * 检测并修复流程执行中的问题
     */
    @PostMapping("/detect-and-fix/{executionId}")
    public ResponseEntity<List<AutoFixRecord>> detectAndFix(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        PipelineExecution execution = pipelineExecutionRepository.findById(executionId)
            .orElseThrow(() -> new RuntimeException("流程执行不存在: " + executionId));
        
        List<AutoFixRecord> fixRecords = autoFixService.detectAndFix(execution);
        return ResponseEntity.ok(fixRecords);
    }
    
    /**
     * 获取修复记录列表
     */
    @GetMapping("/records")
    public ResponseEntity<List<AutoFixRecord>> getFixRecords(
            @RequestParam(required = false) Long executionId,
            @RequestParam(required = false) String status) {
        // TODO: 实现查询逻辑
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * 获取修复记录详情
     */
    @GetMapping("/records/{id}")
    public ResponseEntity<AutoFixRecord> getFixRecord(@PathVariable Long id) {
        // TODO: 实现查询逻辑
        return ResponseEntity.notFound().build();
    }
    
    /**
     * 批准修复
     */
    @PostMapping("/records/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveFix(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Long approvedBy = Long.valueOf(request.get("approvedBy").toString());
        autoFixService.approveFix(id, approvedBy);
        return ResponseEntity.ok(Map.of("success", true, "message", "修复已批准"));
    }
    
    /**
     * 拒绝修复
     */
    @PostMapping("/records/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectFix(@PathVariable Long id) {
        autoFixService.rejectFix(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "修复已拒绝"));
    }
    
    /**
     * 验证修复
     */
    @PostMapping("/records/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyFix(@PathVariable Long id) {
        autoFixService.verifyFix(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "修复验证完成"));
    }
    
    /**
     * 回滚修复
     */
    @PostMapping("/records/{id}/rollback")
    public ResponseEntity<Map<String, Object>> rollbackFix(@PathVariable Long id) {
        autoFixService.rollbackFix(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "修复已回滚"));
    }
}
