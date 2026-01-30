package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.DeploymentPipelineService;
import com.heartsphere.admin.service.PipelineExecutionService;
import com.heartsphere.admin.service.PipelineStreamService;
import com.heartsphere.shared.sse.SseEmitterManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * 部署流程管理Controller
 */
@RestController
@RequestMapping("/api/admin/devops/pipelines")
public class DeploymentPipelineController extends BaseAdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(DeploymentPipelineController.class);
    
    @Autowired
    private DeploymentPipelineService pipelineService;
    
    @Autowired
    private PipelineExecutionService executionService;
    
    @Autowired
    private PipelineStreamService pipelineStreamService;
    
    @Autowired
    private SseEmitterManager sseEmitterManager;
    
    @Autowired
    private com.heartsphere.admin.repository.PipelineExecutionRepository executionRepository;
    
    /**
     * 获取所有流程模板
     */
    @GetMapping
    public ResponseEntity<List<DeploymentPipelineDTO>> getAllPipelines(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String project) {
        try {
            if (authHeader == null) {
                throw new com.heartsphere.shared.exception.UnauthorizedException("需要管理员认证");
            }
            SystemAdmin admin = validateAdminToken(authHeader);
            
            List<DeploymentPipelineDTO> pipelines;
            if (project != null && !project.isEmpty()) {
                // 如果指定了项目，按项目查询
                if (environment != null && !environment.isEmpty()) {
                    pipelines = pipelineService.getPipelinesByProjectAndEnvironment(project, environment);
                } else {
                    pipelines = pipelineService.getPipelinesByProject(project);
                }
            } else if (environment != null && !environment.isEmpty()) {
                pipelines = pipelineService.getPipelinesByEnvironment(environment);
            } else {
                pipelines = pipelineService.getAllPipelines();
            }
            
            return ResponseEntity.ok(pipelines);
        } catch (Exception e) {
            logger.error("获取流程模板列表失败", e);
            // 返回友好的错误信息
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                throw new RuntimeException("数据库表不存在，请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
            }
            throw e;
        }
    }
    
    /**
     * 获取所有项目列表
     */
    @GetMapping("/projects")
    public ResponseEntity<List<String>> getProjects(
            @RequestHeader("Authorization") String authHeader) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        // 返回所有可用的项目列表
        List<String> projects = java.util.Arrays.asList("main", "admin", "company", "edu", "mentis", "shared");
        return ResponseEntity.ok(projects);
    }
    
    /**
     * 获取流程模板详情
     */
    @GetMapping("/{pipelineId}")
    public ResponseEntity<DeploymentPipelineDTO> getPipeline(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pipelineId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        DeploymentPipelineDTO pipeline = pipelineService.getPipeline(pipelineId);
        return ResponseEntity.ok(pipeline);
    }
    
    /**
     * 创建流程模板
     */
    @PostMapping
    public ResponseEntity<DeploymentPipelineDTO> createPipeline(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody DeploymentPipelineDTO dto) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        DeploymentPipelineDTO created = pipelineService.createPipeline(dto, admin);
        return ResponseEntity.ok(created);
    }
    
    /**
     * 更新流程模板
     */
    @PutMapping("/{pipelineId}")
    public ResponseEntity<DeploymentPipelineDTO> updatePipeline(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pipelineId,
            @RequestBody DeploymentPipelineDTO dto) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        DeploymentPipelineDTO updated = pipelineService.updatePipeline(pipelineId, dto, admin);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * 删除流程模板
     */
    @DeleteMapping("/{pipelineId}")
    public ResponseEntity<Map<String, String>> deletePipeline(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pipelineId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        pipelineService.deletePipeline(pipelineId);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "流程模板已删除");
        return ResponseEntity.ok(response);
    }
    
    /**
     * 执行流程
     */
    @PostMapping("/{pipelineId}/execute")
    public ResponseEntity<PipelineExecutionResponse> executePipeline(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pipelineId,
            @RequestBody(required = false) PipelineExecutionRequest request) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        if (request == null) {
            request = new PipelineExecutionRequest();
        }
        request.setPipelineId(pipelineId);
        
        PipelineExecutionResponse response = executionService.executePipeline(request, admin);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取流程执行状态
     */
    @GetMapping("/executions/{executionId}")
    public ResponseEntity<PipelineExecutionDTO> getExecutionStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        PipelineExecutionDTO execution = executionService.getExecutionStatus(executionId);
        return ResponseEntity.ok(execution);
    }
    
    /**
     * 获取流程执行详情
     */
    @GetMapping("/executions/{executionId}/detail")
    public ResponseEntity<PipelineExecutionDTO> getExecutionDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        PipelineExecutionDTO execution = executionService.getExecutionDetail(executionId);
        return ResponseEntity.ok(execution);
    }
    
    /**
     * 取消流程执行
     */
    @PostMapping("/executions/{executionId}/cancel")
    public ResponseEntity<Map<String, String>> cancelExecution(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        executionService.cancelExecution(executionId, admin);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "流程执行已取消");
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取流程执行历史
     */
    @GetMapping("/executions")
    public ResponseEntity<Page<PipelineExecutionDTO>> getExecutionHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long pipelineId,
            @RequestParam(required = false) Long executedById,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<PipelineExecutionDTO> executions = executionService.getExecutionHistory(pageable, pipelineId, executedById);
        return ResponseEntity.ok(executions);
    }
    
    /**
     * 流程执行状态流（SSE）
     */
    @GetMapping(value = "/executions/{executionId}/stream", 
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamExecutionStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        // 验证执行记录是否存在
        com.heartsphere.admin.entity.PipelineExecution execution = 
                executionService.getExecutionEntity(executionId);
        
        // 创建 SSE 连接（使用统一的 SseEmitterManager）
        SseEmitter emitter = sseEmitterManager.createEmitter(Long.MAX_VALUE);
        pipelineStreamService.addEmitter(executionId, emitter);
        
        // 如果执行已完成，发送最终状态
        if (execution.getStatus() != com.heartsphere.admin.entity.PipelineExecution.ExecutionStatus.RUNNING) {
            try {
                pipelineStreamService.pushStatus(executionId, execution.getStatus().name());
                emitter.complete();
            } catch (Exception e) {
                logger.warn("Failed to send final status", e);
            }
        }
        
        return emitter;
    }
    
    /**
     * 下载流程执行日志文件
     * 合并所有步骤执行的日志
     */
    @GetMapping("/executions/{executionId}/log/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadLog(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        // 使用 findByIdWithStepExecutions 来加载步骤执行记录
        java.util.Optional<com.heartsphere.admin.entity.PipelineExecution> executionOpt = 
                executionRepository.findByIdWithStepExecutions(executionId);
        
        if (!executionOpt.isPresent()) {
            logger.warn("流程执行记录不存在: {}", executionId);
            return ResponseEntity.notFound().build();
        }
        
        com.heartsphere.admin.entity.PipelineExecution execution = executionOpt.get();
        
        try {
            // 获取所有步骤执行的日志并合并
            java.util.List<com.heartsphere.admin.entity.PipelineStepExecution> stepExecutions = 
                    execution.getStepExecutions();
            
            // 创建临时文件来存储合并的日志
            java.io.File tempFile = java.io.File.createTempFile("pipeline-execution-", ".log");
            tempFile.deleteOnExit();
            
            try (java.io.FileWriter writer = new java.io.FileWriter(tempFile, java.nio.charset.StandardCharsets.UTF_8)) {
                writer.write("=== 流程执行日志 ===\n");
                writer.write("执行ID: " + executionId + "\n");
                writer.write("流程名称: " + (execution.getPipeline() != null ? execution.getPipeline().getName() : "未知流程") + "\n");
                writer.write("状态: " + execution.getStatus() + "\n");
                writer.write("开始时间: " + execution.getStartedAt() + "\n");
                if (execution.getFinishedAt() != null) {
                    writer.write("结束时间: " + execution.getFinishedAt() + "\n");
                }
                writer.write("\n");
                
                // 如果没有步骤执行，记录基本信息
                if (stepExecutions == null || stepExecutions.isEmpty()) {
                    writer.write("注意: 此流程执行没有步骤执行记录。\n");
                    writer.write("可能原因:\n");
                    writer.write("  1. 流程执行尚未开始\n");
                    writer.write("  2. 流程执行在初始化阶段失败\n");
                    writer.write("  3. 流程模板没有定义步骤\n");
                } else {
                    // 合并所有步骤的日志
                    for (com.heartsphere.admin.entity.PipelineStepExecution stepExecution : stepExecutions) {
                        writer.write("\n=== 步骤: " + (stepExecution.getStep() != null ? stepExecution.getStep().getName() : "未知步骤") + " ===\n");
                        writer.write("状态: " + stepExecution.getStatus() + "\n");
                        writer.write("开始时间: " + stepExecution.getStartedAt() + "\n");
                        if (stepExecution.getFinishedAt() != null) {
                            writer.write("结束时间: " + stepExecution.getFinishedAt() + "\n");
                        }
                        // 如果步骤关联了脚本执行，尝试从脚本执行获取日志
                        if (stepExecution.getScriptExecution() != null) {
                            com.heartsphere.admin.entity.ScriptExecution scriptExecution = stepExecution.getScriptExecution();
                            if (scriptExecution.getOutput() != null && !scriptExecution.getOutput().isEmpty()) {
                                writer.write("\n输出:\n");
                                writer.write(scriptExecution.getOutput());
                                writer.write("\n");
                            }
                            if (scriptExecution.getError() != null && !scriptExecution.getError().isEmpty()) {
                                writer.write("\n错误:\n");
                                writer.write(scriptExecution.getError());
                                writer.write("\n");
                            }
                            // 如果有日志文件路径，尝试读取文件内容
                            if (scriptExecution.getLogFilePath() != null) {
                                try {
                                    java.nio.file.Path logPath = java.nio.file.Paths.get(scriptExecution.getLogFilePath());
                                    if (java.nio.file.Files.exists(logPath)) {
                                        writer.write("\n日志文件内容:\n");
                                        java.util.List<String> logLines = java.nio.file.Files.readAllLines(logPath, java.nio.charset.StandardCharsets.UTF_8);
                                        for (String line : logLines) {
                                            writer.write(line + "\n");
                                        }
                                    }
                                } catch (Exception e) {
                                    logger.warn("Failed to read log file: " + scriptExecution.getLogFilePath(), e);
                                }
                            }
                        }
                        if (stepExecution.getError() != null && !stepExecution.getError().isEmpty()) {
                            writer.write("\n步骤错误:\n");
                            writer.write(stepExecution.getError());
                            writer.write("\n");
                        }
                        writer.write("\n");
                    }
                }
            }
            
            org.springframework.core.io.Resource resource = 
                    new org.springframework.core.io.FileSystemResource(tempFile);
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"pipeline-execution-" + executionId + ".log\"")
                    .contentType(org.springframework.http.MediaType.TEXT_PLAIN)
                    .body(resource);
        } catch (Exception e) {
            logger.error("Failed to download pipeline execution log file", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
