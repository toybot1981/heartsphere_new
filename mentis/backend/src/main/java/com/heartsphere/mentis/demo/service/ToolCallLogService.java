package com.heartsphere.mentis.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mentis.demo.model.ToolCallLog;
import com.heartsphere.mentis.demo.repository.ToolCallLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 工具调用日志服务
 * 用于记录和查询 AgentScope 工具调用的日志
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class ToolCallLogService {
    
    private final ToolCallLogRepository repository;
    private final ObjectMapper objectMapper;
    private DemoEventService eventService; // Optional, to avoid circular dependency
    
    @Autowired
    public ToolCallLogService(ToolCallLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }
    
    /**
     * 设置事件服务（通过 setter 注入避免循环依赖）
     */
    @Autowired(required = false)
    public void setEventService(DemoEventService eventService) {
        this.eventService = eventService;
    }
    
    /**
     * 异步记录工具调用开始
     * 
     * @param sessionId 会话ID
     * @param toolName 工具名称
     * @param parameters 工具参数
     * @return 日志ID
     */
    @Async
    @Transactional
    public Long logToolCallStart(String sessionId, String toolName, Map<String, Object> parameters) {
        try {
            ToolCallLog logEntry = new ToolCallLog();
            logEntry.setSessionId(sessionId);
            logEntry.setToolName(toolName);
            logEntry.setParameters(toJson(parameters));
            logEntry.setStatus(ToolCallLog.ToolCallStatus.PENDING);
            logEntry.setStartTime(LocalDateTime.now());
            logEntry.setCreatedAt(LocalDateTime.now());
            
            ToolCallLog saved = repository.save(logEntry);
            log.info("Tool call log created: sessionId={}, toolName={}, logId={}", 
                sessionId, toolName, saved.getId());
            
            // 推送工具调用开始事件
            if (eventService != null) {
                try {
                    DemoEventService.ToolCallEvent event = new DemoEventService.ToolCallEvent();
                    event.setSessionId(sessionId);
                    event.setLogId(saved.getId());
                    event.setToolName(toolName);
                    event.setParameters(parameters);
                    event.setStatus("PENDING");
                    eventService.pushToolCallStart(sessionId, event);
                } catch (Exception e) {
                    log.warn("Failed to push tool call start event", e);
                }
            }
            
            return saved.getId();
        } catch (Exception e) {
            log.error("Failed to log tool call start: sessionId={}, toolName={}", sessionId, toolName, e);
            return null;
        }
    }
    
    /**
     * 异步更新工具调用状态为运行中
     */
    @Async
    @Transactional
    public void logToolCallRunning(Long logId) {
        try {
            repository.findById(logId).ifPresent(logEntry -> {
                logEntry.setStatus(ToolCallLog.ToolCallStatus.RUNNING);
                repository.save(logEntry);
                
                // 推送工具调用运行中事件
                if (eventService != null) {
                    try {
                        DemoEventService.ToolCallEvent event = new DemoEventService.ToolCallEvent();
                        event.setSessionId(logEntry.getSessionId());
                        event.setLogId(logId);
                        event.setToolName(logEntry.getToolName());
                        event.setStatus("RUNNING");
                        eventService.pushToolCallStart(logEntry.getSessionId(), event);
                    } catch (Exception e) {
                        log.warn("Failed to push tool call running event", e);
                    }
                }
            });
        } catch (Exception e) {
            log.error("Failed to update tool call log to running: logId={}", logId, e);
        }
    }
    
    /**
     * 异步记录工具调用成功
     */
    @Async
    @Transactional
    public void logToolCallSuccess(Long logId, Object result) {
        try {
            repository.findById(logId).ifPresent(logEntry -> {
                logEntry.setStatus(ToolCallLog.ToolCallStatus.SUCCESS);
                logEntry.setResult(toJson(result));
                logEntry.setEndTime(LocalDateTime.now());
                
                if (logEntry.getStartTime() != null && logEntry.getEndTime() != null) {
                    long duration = java.time.Duration.between(
                        logEntry.getStartTime(), 
                        logEntry.getEndTime()
                    ).toMillis();
                    logEntry.setDuration(duration);
                }
                
                repository.save(logEntry);
                log.info("Tool call log updated to success: logId={}, duration={}ms", 
                    logId, logEntry.getDuration());
                
                // 推送工具调用成功事件
                if (eventService != null) {
                    try {
                        DemoEventService.ToolCallEvent event = new DemoEventService.ToolCallEvent();
                        event.setSessionId(logEntry.getSessionId());
                        event.setLogId(logId);
                        event.setToolName(logEntry.getToolName());
                        event.setResult(result);
                        event.setStatus("SUCCESS");
                        event.setDuration(logEntry.getDuration());
                        eventService.pushToolCallEnd(logEntry.getSessionId(), event);
                    } catch (Exception e) {
                        log.warn("Failed to push tool call success event", e);
                    }
                }
            });
        } catch (Exception e) {
            log.error("Failed to log tool call success: logId={}", logId, e);
        }
    }
    
    /**
     * 异步记录工具调用失败
     */
    @Async
    @Transactional
    public void logToolCallError(Long logId, String errorMessage) {
        try {
            repository.findById(logId).ifPresent(logEntry -> {
                logEntry.setStatus(ToolCallLog.ToolCallStatus.ERROR);
                logEntry.setErrorMessage(errorMessage);
                logEntry.setEndTime(LocalDateTime.now());
                
                if (logEntry.getStartTime() != null && logEntry.getEndTime() != null) {
                    long duration = java.time.Duration.between(
                        logEntry.getStartTime(), 
                        logEntry.getEndTime()
                    ).toMillis();
                    logEntry.setDuration(duration);
                }
                
                repository.save(logEntry);
                log.info("Tool call log updated to error: logId={}, error={}", logId, errorMessage);
                
                // 推送工具调用错误事件
                if (eventService != null) {
                    try {
                        DemoEventService.ToolCallEvent event = new DemoEventService.ToolCallEvent();
                        event.setSessionId(logEntry.getSessionId());
                        event.setLogId(logId);
                        event.setToolName(logEntry.getToolName());
                        event.setStatus("ERROR");
                        event.setErrorMessage(errorMessage);
                        event.setDuration(logEntry.getDuration());
                        eventService.pushToolCallError(logEntry.getSessionId(), event);
                    } catch (Exception e) {
                        log.warn("Failed to push tool call error event", e);
                    }
                }
            });
        } catch (Exception e) {
            log.error("Failed to log tool call error: logId={}", logId, e);
        }
    }
    
    /**
     * 查询会话的工具调用日志
     */
    @Transactional(readOnly = true)
    public List<ToolCallLog> getToolCallsBySession(String sessionId) {
        return repository.findBySessionIdOrderByStartTimeDesc(sessionId);
    }
    
    /**
     * 查询会话在指定时间范围内的工具调用日志
     */
    @Transactional(readOnly = true)
    public List<ToolCallLog> getToolCallsBySessionAndTimeRange(
        String sessionId, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    ) {
        return repository.findBySessionIdAndTimeRange(sessionId, startTime, endTime);
    }
    
    /**
     * 查询指定工具名称的调用日志
     */
    @Transactional(readOnly = true)
    public List<ToolCallLog> getToolCallsByToolName(String toolName) {
        return repository.findByToolNameOrderByStartTimeDesc(toolName, 
            org.springframework.data.domain.Pageable.unpaged()).getContent();
    }
    
    /**
     * 查询指定状态的工具调用日志
     */
    @Transactional(readOnly = true)
    public List<ToolCallLog> getToolCallsByStatus(ToolCallLog.ToolCallStatus status) {
        return repository.findByStatusOrderByStartTimeDesc(status);
    }
    
    /**
     * 统计会话的工具调用次数
     */
    @Transactional(readOnly = true)
    public long countToolCallsBySession(String sessionId) {
        return repository.countBySessionId(sessionId);
    }
    
    /**
     * 统计会话的成功/失败次数
     */
    @Transactional(readOnly = true)
    public long countToolCallsBySessionAndStatus(
        String sessionId, 
        ToolCallLog.ToolCallStatus status
    ) {
        return repository.countBySessionIdAndStatus(sessionId, status);
    }
    
    /**
     * 计算会话的平均执行时间
     */
    @Transactional(readOnly = true)
    public Double getAverageDurationBySession(String sessionId) {
        return repository.averageDurationBySessionId(sessionId);
    }
    
    /**
     * 将对象转换为JSON字符串
     */
    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize object to JSON: {}", obj, e);
            return obj.toString();
        }
    }
}
