package com.heartsphere.admin.service;

import com.heartsphere.admin.config.ScriptConfigLoader;
import com.heartsphere.admin.dto.ScriptInfoDTO;
import com.heartsphere.admin.dto.ScheduledTaskDTO;
import com.heartsphere.admin.dto.ScriptExecutionRequest;
import com.heartsphere.admin.dto.ScriptExecutionResponse;
import com.heartsphere.admin.entity.ScheduledTask;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.ScheduledTaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 定时任务服务
 */
@Service
public class ScheduledTaskService {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);
    
    @Autowired
    private ScheduledTaskRepository scheduledTaskRepository;
    
    @Autowired
    private ScriptConfigLoader scriptConfigLoader;
    
    @Autowired
    private DevOpsWorkbenchService devOpsWorkbenchService;
    
    @Autowired(required = false)
    @org.springframework.context.annotation.Lazy
    private ScheduledTaskScheduler taskScheduler;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 创建定时任务
     */
    @Transactional
    public ScheduledTaskDTO createTask(ScheduledTaskDTO request, SystemAdmin admin) {
        // 验证脚本是否存在
        ScriptInfoDTO script = scriptConfigLoader.getScript(request.getScriptId());
        if (script == null) {
            throw new RuntimeException("脚本不存在: " + request.getScriptId());
        }
        
        // 验证 Cron 表达式
        if (!isValidCronExpression(request.getCronExpression())) {
            throw new RuntimeException("无效的 Cron 表达式: " + request.getCronExpression());
        }
        
        ScheduledTask task = new ScheduledTask();
        task.setName(request.getName());
        task.setScriptId(request.getScriptId());
        task.setScriptName(script.getName());
        task.setCronExpression(request.getCronExpression());
        task.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        task.setCreatedBy(admin);
        
        try {
            if (request.getParameters() != null) {
                task.setParameters(objectMapper.writeValueAsString(
                    objectMapper.readValue(request.getParameters(), Map.class)));
            }
        } catch (Exception e) {
            logger.warn("Failed to parse parameters", e);
        }
        
        // 计算下次执行时间
        task.setNextExecutionTime(calculateNextExecutionTime(request.getCronExpression()));
        
        task = scheduledTaskRepository.save(task);
        
        // 注册到调度器
        if (task.getEnabled() && taskScheduler != null) {
            taskScheduler.scheduleTask(task);
        }
        
        return toDTO(task);
    }
    
    /**
     * 更新定时任务
     */
    @Transactional
    public ScheduledTaskDTO updateTask(Long taskId, ScheduledTaskDTO request, SystemAdmin admin) {
        ScheduledTask task = scheduledTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("定时任务不存在"));
        
        // 验证 Cron 表达式
        if (request.getCronExpression() != null && !isValidCronExpression(request.getCronExpression())) {
            throw new RuntimeException("无效的 Cron 表达式: " + request.getCronExpression());
        }
        
        boolean wasEnabled = task.getEnabled();
        
        if (request.getName() != null) {
            task.setName(request.getName());
        }
        if (request.getCronExpression() != null) {
            task.setCronExpression(request.getCronExpression());
            task.setNextExecutionTime(calculateNextExecutionTime(request.getCronExpression()));
        }
        if (request.getEnabled() != null) {
            task.setEnabled(request.getEnabled());
        }
        if (request.getParameters() != null) {
            try {
                task.setParameters(objectMapper.writeValueAsString(
                    objectMapper.readValue(request.getParameters(), Map.class)));
            } catch (Exception e) {
                logger.warn("Failed to parse parameters", e);
            }
        }
        
        task = scheduledTaskRepository.save(task);
        
        // 更新调度器
        if (taskScheduler != null) {
            taskScheduler.unscheduleTask(taskId);
            if (task.getEnabled()) {
                taskScheduler.scheduleTask(task);
            }
        }
        
        return toDTO(task);
    }
    
    /**
     * 删除定时任务
     */
    @Transactional
    public void deleteTask(Long taskId) {
        ScheduledTask task = scheduledTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("定时任务不存在"));
        
        // 从调度器移除
        if (taskScheduler != null) {
            taskScheduler.unscheduleTask(taskId);
        }
        
        scheduledTaskRepository.delete(task);
    }
    
    /**
     * 启用/禁用定时任务
     */
    @Transactional
    public ScheduledTaskDTO toggleTask(Long taskId, boolean enabled) {
        ScheduledTask task = scheduledTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("定时任务不存在"));
        
        task.setEnabled(enabled);
        task = scheduledTaskRepository.save(task);
        
        // 更新调度器
        if (taskScheduler != null) {
            taskScheduler.unscheduleTask(taskId);
            if (enabled) {
                taskScheduler.scheduleTask(task);
            }
        }
        
        return toDTO(task);
    }
    
    /**
     * 获取所有定时任务
     */
    public List<ScheduledTaskDTO> getAllTasks() {
        return scheduledTaskRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 获取定时任务详情
     */
    public ScheduledTaskDTO getTask(Long taskId) {
        ScheduledTask task = scheduledTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("定时任务不存在"));
        return toDTO(task);
    }
    
    /**
     * 执行定时任务
     */
    @Transactional
    public void executeTask(ScheduledTask task) {
        try {
            logger.info("Executing scheduled task: {}", task.getName());
            
            // 更新执行时间
            task.setLastExecutedAt(LocalDateTime.now());
            task.setExecutionCount(task.getExecutionCount() + 1);
            
            // 计算下次执行时间
            task.setNextExecutionTime(calculateNextExecutionTime(task.getCronExpression()));
            scheduledTaskRepository.save(task);
            
            // 执行脚本
            ScriptExecutionRequest request = new ScriptExecutionRequest();
            request.setScriptId(task.getScriptId());
            
            try {
                Map<String, Object> parameters = null;
                if (task.getParameters() != null) {
                    parameters = objectMapper.readValue(task.getParameters(), Map.class);
                }
                request.setParameters(parameters);
            } catch (Exception e) {
                logger.warn("Failed to parse task parameters", e);
            }
            
            // 使用系统管理员执行（或创建一个系统用户）
            SystemAdmin systemAdmin = task.getCreatedBy();
            ScriptExecutionResponse response = devOpsWorkbenchService.executeScript(request, systemAdmin);
            
            // 更新执行记录关联
            // 这里可以更新 ScriptExecution 的 scheduledTask 字段
            
            // 更新成功/失败计数
            // 注意：这里需要异步检查执行结果，暂时不更新
            
        } catch (Exception e) {
            logger.error("Failed to execute scheduled task: " + task.getId(), e);
            task.setFailureCount(task.getFailureCount() + 1);
            scheduledTaskRepository.save(task);
        }
    }
    
    /**
     * 转换为 DTO
     */
    private ScheduledTaskDTO toDTO(ScheduledTask task) {
        ScheduledTaskDTO dto = new ScheduledTaskDTO();
        dto.setId(task.getId());
        dto.setName(task.getName());
        dto.setScriptId(task.getScriptId());
        dto.setScriptName(task.getScriptName());
        dto.setCronExpression(task.getCronExpression());
        dto.setEnabled(task.getEnabled());
        dto.setParameters(task.getParameters());
        dto.setLastExecutedAt(task.getLastExecutedAt());
        dto.setNextExecutionTime(task.getNextExecutionTime());
        dto.setExecutionCount(task.getExecutionCount());
        dto.setSuccessCount(task.getSuccessCount());
        dto.setFailureCount(task.getFailureCount());
        return dto;
    }
    
    /**
     * 验证 Cron 表达式（简单验证）
     */
    private boolean isValidCronExpression(String cronExpression) {
        if (cronExpression == null || cronExpression.trim().isEmpty()) {
            return false;
        }
        // Cron 表达式应该有 5 或 6 个字段（秒 分 时 日 月 周）
        String[] parts = cronExpression.trim().split("\\s+");
        return parts.length >= 5 && parts.length <= 6;
    }
    
    /**
     * 计算下次执行时间
     */
    private LocalDateTime calculateNextExecutionTime(String cronExpression) {
        try {
            org.springframework.scheduling.support.CronExpression cron = 
                org.springframework.scheduling.support.CronExpression.parse(cronExpression);
            LocalDateTime next = cron.next(LocalDateTime.now());
            return next != null ? next : LocalDateTime.now().plusHours(1);
        } catch (Exception e) {
            logger.warn("Failed to parse cron expression: {}", cronExpression, e);
            return LocalDateTime.now().plusHours(1);
        }
    }
}
