package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.ScriptExecution;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.ScriptExecutionRepository;
import com.heartsphere.admin.service.DevOpsWorkbenchService;
import com.heartsphere.admin.service.LogStreamService;
import com.heartsphere.admin.service.ScheduledTaskService;
import com.heartsphere.shared.sse.SseEmitterManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * DevOps 工作台 Controller
 */
@RestController
@RequestMapping("/api/admin/devops")
public class DevOpsWorkbenchController extends BaseAdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(DevOpsWorkbenchController.class);
    
    @Autowired
    private DevOpsWorkbenchService devOpsWorkbenchService;
    
    @Autowired
    private ScheduledTaskService scheduledTaskService;
    
    @Autowired
    private LogStreamService logStreamService;
    
    @Autowired
    private SseEmitterManager sseEmitterManager;
    
    @Autowired
    private ScriptExecutionRepository scriptExecutionRepository;
    
    /**
     * 获取所有脚本列表
     */
    @GetMapping("/scripts")
    public ResponseEntity<List<ScriptInfoDTO>> getScripts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String category) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        List<ScriptInfoDTO> scripts;
        if (category != null && !category.isEmpty()) {
            scripts = devOpsWorkbenchService.getScriptsByCategory(category);
        } else {
            scripts = devOpsWorkbenchService.getAllScripts();
        }
        
        return ResponseEntity.ok(scripts);
    }
    
    /**
     * 获取脚本详情
     */
    @GetMapping("/scripts/{scriptId}")
    public ResponseEntity<ScriptInfoDTO> getScript(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String scriptId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScriptInfoDTO script = devOpsWorkbenchService.getScript(scriptId);
        if (script == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(script);
    }
    
    /**
     * 执行脚本
     */
    @PostMapping("/scripts/{scriptId}/execute")
    public ResponseEntity<ScriptExecutionResponse> executeScript(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String scriptId,
            @RequestBody(required = false) Map<String, Object> parameters) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScriptExecutionRequest request = new ScriptExecutionRequest();
        request.setScriptId(scriptId);
        request.setParameters(parameters != null ? parameters : java.util.Collections.emptyMap());
        
        ScriptExecutionResponse response = devOpsWorkbenchService.executeScript(request, admin);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取执行状态
     */
    @GetMapping("/executions/{executionId}")
    public ResponseEntity<ScriptExecutionResponse> getExecutionStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScriptExecutionResponse response = devOpsWorkbenchService.getExecutionStatus(executionId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取执行历史
     */
    @GetMapping("/executions")
    public ResponseEntity<Page<ScriptExecutionResponse>> getExecutionHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String scriptId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long executedById,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        
        // 解析时间参数
        java.time.LocalDateTime start = null;
        java.time.LocalDateTime end = null;
        try {
            if (startTime != null && !startTime.isEmpty()) {
                start = java.time.LocalDateTime.parse(startTime, 
                    java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
            if (endTime != null && !endTime.isEmpty()) {
                end = java.time.LocalDateTime.parse(endTime, 
                    java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (Exception e) {
            logger.warn("Failed to parse time parameters: startTime={}, endTime={}", startTime, endTime, e);
        }
        
        Page<ScriptExecutionResponse> history = devOpsWorkbenchService.getExecutionHistory(
            pageable, scriptId, status, executedById, start, end);
        return ResponseEntity.ok(history);
    }
    
    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<DevOpsStatisticsDTO> getStatistics(
            @RequestHeader("Authorization") String authHeader) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        DevOpsStatisticsDTO statistics = devOpsWorkbenchService.getStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * 获取执行详情（包含日志内容）
     */
    @GetMapping("/executions/{executionId}/detail")
    public ResponseEntity<com.heartsphere.admin.dto.ScriptExecutionDetailResponse> getExecutionDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        com.heartsphere.admin.dto.ScriptExecutionDetailResponse detail = 
            devOpsWorkbenchService.getExecutionDetail(executionId);
        return ResponseEntity.ok(detail);
    }
    
    /**
     * 下载执行日志文件
     */
    @GetMapping("/executions/{executionId}/log/download")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadLog(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        com.heartsphere.admin.entity.ScriptExecution execution = 
            devOpsWorkbenchService.getExecutionEntity(executionId);
        
        if (execution.getLogFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            java.nio.file.Path logPath = java.nio.file.Paths.get(execution.getLogFilePath());
            if (!java.nio.file.Files.exists(logPath)) {
                return ResponseEntity.notFound().build();
            }
            
            org.springframework.core.io.Resource resource = 
                new org.springframework.core.io.FileSystemResource(logPath.toFile());
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"execution-" + executionId + ".log\"")
                    .contentType(org.springframework.http.MediaType.TEXT_PLAIN)
                    .body(resource);
        } catch (Exception e) {
            logger.error("Failed to download log file", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 取消执行
     */
    @PostMapping("/executions/{executionId}/cancel")
    public ResponseEntity<Map<String, String>> cancelExecution(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        devOpsWorkbenchService.cancelExecution(executionId, admin);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "执行已取消");
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取所有定时任务
     */
    @GetMapping("/scheduled-tasks")
    public ResponseEntity<List<ScheduledTaskDTO>> getScheduledTasks(
            @RequestHeader("Authorization") String authHeader) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        List<ScheduledTaskDTO> tasks = scheduledTaskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * 获取定时任务详情
     */
    @GetMapping("/scheduled-tasks/{taskId}")
    public ResponseEntity<ScheduledTaskDTO> getScheduledTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long taskId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScheduledTaskDTO task = scheduledTaskService.getTask(taskId);
        return ResponseEntity.ok(task);
    }
    
    /**
     * 创建定时任务
     */
    @PostMapping("/scheduled-tasks")
    public ResponseEntity<ScheduledTaskDTO> createScheduledTask(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ScheduledTaskDTO request) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScheduledTaskDTO task = scheduledTaskService.createTask(request, admin);
        return ResponseEntity.ok(task);
    }
    
    /**
     * 更新定时任务
     */
    @PutMapping("/scheduled-tasks/{taskId}")
    public ResponseEntity<ScheduledTaskDTO> updateScheduledTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long taskId,
            @RequestBody ScheduledTaskDTO request) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScheduledTaskDTO task = scheduledTaskService.updateTask(taskId, request, admin);
        return ResponseEntity.ok(task);
    }
    
    /**
     * 删除定时任务
     */
    @DeleteMapping("/scheduled-tasks/{taskId}")
    public ResponseEntity<Map<String, String>> deleteScheduledTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long taskId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        scheduledTaskService.deleteTask(taskId);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "定时任务已删除");
        return ResponseEntity.ok(response);
    }
    
    /**
     * 启用定时任务
     */
    @PostMapping("/scheduled-tasks/{taskId}/enable")
    public ResponseEntity<ScheduledTaskDTO> enableScheduledTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long taskId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScheduledTaskDTO task = scheduledTaskService.toggleTask(taskId, true);
        return ResponseEntity.ok(task);
    }
    
    /**
     * 禁用定时任务
     */
    @PostMapping("/scheduled-tasks/{taskId}/disable")
    public ResponseEntity<ScheduledTaskDTO> disableScheduledTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long taskId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        ScheduledTaskDTO task = scheduledTaskService.toggleTask(taskId, false);
        return ResponseEntity.ok(task);
    }
    
    /**
     * SSE 日志流端点
     */
    @GetMapping(value = "/executions/{executionId}/logs/stream", 
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        // 验证执行任务是否存在
        ScriptExecution execution = scriptExecutionRepository.findById(executionId)
            .orElseThrow(() -> new RuntimeException("执行记录不存在"));
        
        // 创建 SSE 连接（使用统一的 SseEmitterManager）
        SseEmitter emitter = sseEmitterManager.createEmitter(Long.MAX_VALUE);
        logStreamService.addEmitter(executionId, emitter);
        
        // 如果执行已完成，推送历史日志
        if (execution.getStatus() != ScriptExecution.ExecutionStatus.RUNNING) {
            try {
                // 推送已保存的日志内容
                String logContent = "";
                if (execution.getOutput() != null) {
                    logContent += execution.getOutput();
                }
                if (execution.getError() != null && !execution.getError().isEmpty()) {
                    logContent += "\n[ERROR] " + execution.getError();
                }
                
                // 如果日志文件存在，读取文件内容
                if (execution.getLogFilePath() != null) {
                    try {
                        String fileContent = Files.readString(Paths.get(execution.getLogFilePath()));
                        if (!fileContent.isEmpty()) {
                            logContent = fileContent;
                        }
                    } catch (IOException e) {
                        logger.info("Failed to read log file: {}", e.getMessage());
                    }
                }
                
                // 分批推送历史日志（每行一条）
                if (!logContent.isEmpty()) {
                    String[] lines = logContent.split("\n");
                    for (String line : lines) {
                        if (!line.trim().isEmpty()) {
                            String level = line.startsWith("[ERROR]") ? "ERROR" : "INFO";
                            String message = line.startsWith("[ERROR]") ? line.substring(7).trim() : line;
                            logStreamService.pushLog(executionId, message, level);
                        }
                    }
                }
                
                // 推送最终状态
                logStreamService.pushStatus(executionId, execution.getStatus().name());
                
                // 延迟清理，给客户端时间接收数据
                new Thread(() -> {
                    try {
                        Thread.sleep(1000);
                        logStreamService.cleanup(executionId);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }).start();
                
            } catch (Exception e) {
                logger.error("Failed to push historical logs", e);
            }
        }
        
        return emitter;
    }
}
