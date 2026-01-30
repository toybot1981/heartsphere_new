package com.heartsphere.multiagent.orchestrator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 协作日志记录服务
 * 
 * 异步记录协作执行日志到数据库
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnClass(name = "com.heartsphere.admin.entity.MultiAgentCollaborationLog")
public class CollaborationLoggingService {
    
    private final ApplicationContext applicationContext;
    
    /**
     * 记录协作创建事件
     */
    @Async
    public CompletableFuture<Void> logCollaborationCreated(
            String collaborationId,
            String userId,
            String sessionId,
            String taskDescription,
            List<String> agentIds,
            String workflowMode) {
        
        try {
            Object logEntity = createLogEntity();
            if (logEntity == null) {
                return CompletableFuture.completedFuture(null);
            }
            
            setLogField(logEntity, "collaborationId", collaborationId);
            setLogField(logEntity, "userId", userId);
            setLogField(logEntity, "sessionId", sessionId);
            setLogField(logEntity, "taskDescription", taskDescription);
            setLogField(logEntity, "agentIds", serializeList(agentIds));
            setLogField(logEntity, "status", "PENDING");
            setLogField(logEntity, "workflowMode", workflowMode);
            setLogField(logEntity, "success", false);
            setLogField(logEntity, "createdAt", LocalDateTime.now());
            
            saveLogEntity(logEntity);
            
            log.info("Collaboration created logged: {}", collaborationId);
        } catch (Exception e) {
            log.error("Failed to log collaboration created: {}", collaborationId, e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 记录协作执行开始
     */
    @Async
    public CompletableFuture<Void> logCollaborationStarted(String collaborationId) {
        try {
            updateLogStatus(collaborationId, "RUNNING", null);
            updateLogField(collaborationId, "startedAt", LocalDateTime.now());
            log.info("Collaboration started logged: {}", collaborationId);
        } catch (Exception e) {
            log.error("Failed to log collaboration started: {}", collaborationId, e);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 记录协作执行完成
     */
    @Async
    public CompletableFuture<Void> logCollaborationCompleted(
            String collaborationId,
            boolean success,
            String result,
            Map<String, Object> agentResults,
            List<String> errors,
            Long executionTimeMs) {
        
        try {
            updateLogStatus(collaborationId, success ? "COMPLETED" : "FAILED", result);
            updateLogField(collaborationId, "completedAt", LocalDateTime.now());
            updateLogField(collaborationId, "success", success);
            updateLogField(collaborationId, "agentResults", serializeMap(agentResults));
            updateLogField(collaborationId, "errors", serializeList(errors));
            updateLogField(collaborationId, "executionTimeMs", executionTimeMs);
            
            log.info("Collaboration completed logged: {}, success={}", collaborationId, success);
        } catch (Exception e) {
            log.error("Failed to log collaboration completed: {}", collaborationId, e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 创建日志实体
     */
    @SuppressWarnings("unchecked")
    private Object createLogEntity() {
        try {
            Class<?> logClass = Class.forName("com.heartsphere.admin.entity.MultiAgentCollaborationLog");
            return logClass.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            log.info("MultiAgentCollaborationLog not available, skipping logging");
            return null;
        }
    }
    
    /**
     * 设置日志字段
     */
    private void setLogField(Object logEntity, String fieldName, Object value) {
        try {
            String setterName = "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
            java.lang.reflect.Method setter = logEntity.getClass().getMethod(setterName, value.getClass());
            setter.invoke(logEntity, value);
        } catch (Exception e) {
            log.warn("Failed to set log field: {}={}", fieldName, value, e);
        }
    }
    
    /**
     * 更新日志状态
     */
    private void updateLogStatus(String collaborationId, String status, String result) {
        try {
            Object repository = applicationContext.getBean("multiAgentCollaborationLogRepository");
            java.lang.reflect.Method findByMethod = repository.getClass()
                .getMethod("findByCollaborationId", String.class);
            java.util.Optional<Object> logOpt = (java.util.Optional<Object>) findByMethod.invoke(repository, collaborationId);
            
            if (logOpt.isPresent()) {
                Object logEntity = logOpt.get();
                setLogField(logEntity, "status", status);
                if (result != null) {
                    setLogField(logEntity, "result", result);
                }
                setLogField(logEntity, "updatedAt", LocalDateTime.now());
                
                java.lang.reflect.Method saveMethod = repository.getClass().getMethod("save", Object.class);
                saveMethod.invoke(repository, logEntity);
            }
        } catch (Exception e) {
            log.warn("Failed to update log status: collaborationId={}, status={}", collaborationId, status, e);
        }
    }
    
    /**
     * 更新日志字段
     */
    private void updateLogField(String collaborationId, String fieldName, Object value) {
        try {
            Object repository = applicationContext.getBean("multiAgentCollaborationLogRepository");
            java.lang.reflect.Method findByMethod = repository.getClass()
                .getMethod("findByCollaborationId", String.class);
            java.util.Optional<Object> logOpt = (java.util.Optional<Object>) findByMethod.invoke(repository, collaborationId);
            
            if (logOpt.isPresent()) {
                Object logEntity = logOpt.get();
                setLogField(logEntity, fieldName, value);
                setLogField(logEntity, "updatedAt", LocalDateTime.now());
                
                java.lang.reflect.Method saveMethod = repository.getClass().getMethod("save", Object.class);
                saveMethod.invoke(repository, logEntity);
            }
        } catch (Exception e) {
            log.warn("Failed to update log field: collaborationId={}, field={}", collaborationId, fieldName, e);
        }
    }
    
    /**
     * 保存日志实体
     */
    private void saveLogEntity(Object logEntity) {
        try {
            Object repository = applicationContext.getBean("multiAgentCollaborationLogRepository");
            java.lang.reflect.Method saveMethod = repository.getClass().getMethod("save", Object.class);
            saveMethod.invoke(repository, logEntity);
        } catch (Exception e) {
            log.warn("Failed to save log entity", e);
        }
    }
    
    /**
     * 序列化列表为 JSON
     */
    private String serializeList(List<?> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = 
                applicationContext.getBean(com.fasterxml.jackson.databind.ObjectMapper.class);
            return mapper.writeValueAsString(list);
        } catch (Exception e) {
            log.warn("Failed to serialize list", e);
            return "[]";
        }
    }
    
    /**
     * 序列化 Map 为 JSON
     */
    private String serializeMap(Map<String, Object> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = 
                applicationContext.getBean(com.fasterxml.jackson.databind.ObjectMapper.class);
            return mapper.writeValueAsString(map);
        } catch (Exception e) {
            log.warn("Failed to serialize map", e);
            return "{}";
        }
    }
}
