package com.heartsphere.admin.service;

import com.heartsphere.admin.config.ScriptConfigLoader;
import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.dto.ScriptExecutionDetailResponse;
import com.heartsphere.admin.entity.ScriptExecution;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.ScriptExecutionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DevOps 工作台服务
 */
@Service
public class DevOpsWorkbenchService {
    
    private static final Logger logger = LoggerFactory.getLogger(DevOpsWorkbenchService.class);
    
    @Autowired
    private ScriptConfigLoader scriptConfigLoader;
    
    @Autowired
    private ScriptExecutionRepository scriptExecutionRepository;
    
    @Autowired
    private ScriptExecutionEngine scriptExecutionEngine;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 获取所有脚本列表
     */
    public List<ScriptInfoDTO> getAllScripts() {
        return scriptConfigLoader.getAllScripts();
    }
    
    /**
     * 根据分类获取脚本列表
     */
    public List<ScriptInfoDTO> getScriptsByCategory(String category) {
        return scriptConfigLoader.getScriptsByCategory(category);
    }
    
    /**
     * 获取脚本详情
     */
    public ScriptInfoDTO getScript(String scriptId) {
        return scriptConfigLoader.getScript(scriptId);
    }
    
    /**
     * 执行脚本
     */
    @Transactional
    public ScriptExecutionResponse executeScript(ScriptExecutionRequest request, SystemAdmin admin) {
        // 验证权限
        ScriptInfoDTO script = scriptConfigLoader.getScript(request.getScriptId());
        if (script == null) {
            throw new RuntimeException("脚本不存在: " + request.getScriptId());
        }
        
        if (!hasPermission(script, admin)) {
            throw new RuntimeException("没有权限执行该脚本");
        }
        
        // 创建执行记录
        ScriptExecution execution = new ScriptExecution();
        execution.setScriptId(request.getScriptId());
        execution.setScriptName(script.getName());
        execution.setExecutedBy(admin);
        execution.setStatus(ScriptExecution.ExecutionStatus.RUNNING);
        execution.setStartedAt(LocalDateTime.now());
        
        try {
            execution.setParameters(objectMapper.writeValueAsString(request.getParameters()));
        } catch (Exception e) {
            logger.warn("Failed to serialize parameters", e);
        }
        
        execution = scriptExecutionRepository.save(execution);
        
        // 异步执行脚本（传递环境变量）
        scriptExecutionEngine.executeAsync(execution, script, request.getParameters(), request.getEnvironmentVariables());
        
        return toResponse(execution);
    }
    
    /**
     * 获取执行状态
     */
    public ScriptExecutionResponse getExecutionStatus(Long executionId) {
        ScriptExecution execution = scriptExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在"));
        return toResponse(execution);
    }
    
    /**
     * 获取执行详情（包含日志内容）
     */
    public ScriptExecutionDetailResponse getExecutionDetail(Long executionId) {
        ScriptExecution execution = scriptExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在"));
        
        ScriptExecutionDetailResponse response = new ScriptExecutionDetailResponse();
        response.setId(execution.getId());
        response.setScriptId(execution.getScriptId());
        response.setScriptName(execution.getScriptName());
        response.setStatus(execution.getStatus().name());
        response.setStartedAt(execution.getStartedAt());
        response.setFinishedAt(execution.getFinishedAt());
        response.setDurationSeconds(execution.getDurationSeconds());
        response.setExitCode(execution.getExitCode());
        response.setError(execution.getError());
        response.setParameters(execution.getParameters());
        
        // 读取日志文件内容
        if (execution.getLogFilePath() != null) {
            try {
                String logContent = new String(java.nio.file.Files.readAllBytes(
                    java.nio.file.Paths.get(execution.getLogFilePath())));
                response.setLogContent(logContent);
            } catch (Exception e) {
                logger.warn("Failed to read log file", e);
                response.setLogContent(execution.getOutput()); // 使用数据库中的输出作为后备
            }
        } else {
            response.setLogContent(execution.getOutput());
        }
        
        return response;
    }
    
    /**
     * 取消执行
     */
    @Transactional
    public void cancelExecution(Long executionId, SystemAdmin admin) {
        ScriptExecution execution = scriptExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在"));
        
        if (execution.getStatus() != ScriptExecution.ExecutionStatus.RUNNING) {
            throw new RuntimeException("只能取消正在执行的脚本");
        }
        
        // 通过执行引擎取消
        scriptExecutionEngine.cancelExecution(executionId);
        
        // 更新状态
        execution.setStatus(ScriptExecution.ExecutionStatus.CANCELLED);
        execution.setFinishedAt(LocalDateTime.now());
        execution.calculateDuration();
        scriptExecutionRepository.save(execution);
    }
    
    /**
     * 获取执行历史（支持组合筛选）
     */
    public Page<ScriptExecutionResponse> getExecutionHistory(
            Pageable pageable, String scriptId, String status, Long executedById, 
            LocalDateTime startTime, LocalDateTime endTime) {
        String statusStr = null;
        if (status != null && !status.isEmpty()) {
            try {
                // 验证状态是否有效
                ScriptExecution.ExecutionStatus.valueOf(status);
                statusStr = status;
            } catch (IllegalArgumentException e) {
                // 无效的状态，忽略
                logger.warn("Invalid execution status: {}", status);
            }
        }
        
        // 使用组合查询方法（原生 SQL 查询）
        return scriptExecutionRepository.findByConditions(
                (scriptId != null && !scriptId.isEmpty()) ? scriptId : null,
                statusStr,
                executedById,
                startTime,
                endTime,
                pageable
        ).map(this::toResponse);
    }
    
    /**
     * 获取统计数据
     */
    public DevOpsStatisticsDTO getStatistics() {
        DevOpsStatisticsDTO stats = new DevOpsStatisticsDTO();
        stats.setTotalExecutions(scriptExecutionRepository.countTodayExecutions());
        stats.setSuccessExecutions(scriptExecutionRepository.countTodaySuccessExecutions());
        stats.setFailedExecutions(scriptExecutionRepository.countTodayFailedExecutions());
        
        List<ScriptExecution> running = scriptExecutionRepository.findByStatus(ScriptExecution.ExecutionStatus.RUNNING);
        stats.setRunningExecutions((long) running.size());
        
        List<DevOpsStatisticsDTO.RunningTaskInfo> runningTasks = running.stream()
                .map(e -> {
                    DevOpsStatisticsDTO.RunningTaskInfo info = new DevOpsStatisticsDTO.RunningTaskInfo();
                    info.setExecutionId(e.getId());
                    info.setScriptName(e.getScriptName());
                    info.setStatus(e.getStatus().name());
                    return info;
                })
                .collect(Collectors.toList());
        stats.setRunningTasks(runningTasks);
        
        return stats;
    }
    
    /**
     * 验证权限
     */
    private boolean hasPermission(ScriptInfoDTO script, SystemAdmin admin) {
        if (script.getPermissions() == null || script.getPermissions().isEmpty()) {
            return true;
        }
        
        String adminRole = admin.getRole();
        return script.getPermissions().contains(adminRole);
    }
    
    /**
     * 获取执行实体（用于下载日志等操作）
     */
    public ScriptExecution getExecutionEntity(Long executionId) {
        return scriptExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在"));
    }
    
    /**
     * 转换为响应 DTO
     */
    private ScriptExecutionResponse toResponse(ScriptExecution execution) {
        ScriptExecutionResponse response = new ScriptExecutionResponse();
        response.setId(execution.getId());
        response.setScriptId(execution.getScriptId());
        response.setScriptName(execution.getScriptName());
        response.setStatus(execution.getStatus().name());
        response.setStartedAt(execution.getStartedAt());
        response.setFinishedAt(execution.getFinishedAt());
        response.setDurationSeconds(execution.getDurationSeconds());
        response.setExitCode(execution.getExitCode());
        response.setError(execution.getError());
        return response;
    }
}
