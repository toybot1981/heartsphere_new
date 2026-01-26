package com.heartsphere.aiagent.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.*;
import com.heartsphere.aiagent.entity.ExecutionLog;
import com.heartsphere.aiagent.graph.core.GraphEngine;
import com.heartsphere.aiagent.repository.ExecutionLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Graph执行日志服务
 * 提供日志记录和查询功能
 */
@Slf4j
@Service
public class ExecutionLogService {
    
    @Autowired
    private ExecutionLogRepository logRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ExecutionLogService.class);
    
    /**
     * 记录节点开始执行日志
     */
    @Transactional
    public void logNodeStart(String executionId, Long graphId, String nodeId, String nodeType, 
                             GraphEngine.GraphState state, Integer stepNumber) {
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setExecutionId(executionId);
        executionLog.setGraphId(graphId);
        executionLog.setNodeId(nodeId);
        executionLog.setNodeType(nodeType);
        executionLog.setLogType(ExecutionLog.LogType.NODE_START.name());
        executionLog.setMessage("节点开始执行: " + nodeId);
        executionLog.setStepNumber(stepNumber);
        
        try {
            // 记录状态快照
            if (state != null) {
                executionLog.setStateSnapshot(objectMapper.writeValueAsString(state.getData()));
            }
        } catch (Exception e) {
            log.warn("记录状态快照失败", e);
        }
        
        logRepository.save(executionLog);
        log.info("记录节点开始执行日志: executionId={}, nodeId={}", executionId, nodeId);
    }
    
    /**
     * 记录节点执行结束日志
     */
    @Transactional
    public void logNodeEnd(String executionId, Long graphId, String nodeId, String nodeType,
                           GraphEngine.GraphState state, Integer stepNumber, Long executionTimeMs) {
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setExecutionId(executionId);
        executionLog.setGraphId(graphId);
        executionLog.setNodeId(nodeId);
        executionLog.setNodeType(nodeType);
        executionLog.setLogType(ExecutionLog.LogType.NODE_END.name());
        executionLog.setMessage("节点执行完成: " + nodeId);
        executionLog.setStepNumber(stepNumber);
        executionLog.setExecutionTimeMs(executionTimeMs);
        
        try {
            // 记录状态快照
            if (state != null) {
                executionLog.setStateSnapshot(objectMapper.writeValueAsString(state.getData()));
            }
        } catch (Exception e) {
            log.warn("记录状态快照失败", e);
        }
        
        logRepository.save(executionLog);
        logger.info("记录节点执行结束日志: executionId={}, nodeId={}, time={}ms", executionId, nodeId, executionTimeMs);
    }
    
    /**
     * 记录节点执行错误日志
     */
    @Transactional
    public void logNodeError(String executionId, Long graphId, String nodeId, String nodeType,
                            String errorMessage, GraphEngine.GraphState state, Integer stepNumber) {
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setExecutionId(executionId);
        executionLog.setGraphId(graphId);
        executionLog.setNodeId(nodeId);
        executionLog.setNodeType(nodeType);
        executionLog.setLogType(ExecutionLog.LogType.NODE_ERROR.name());
        executionLog.setMessage("节点执行错误: " + nodeId);
        executionLog.setErrorMessage(errorMessage);
        executionLog.setStepNumber(stepNumber);
        
        try {
            // 记录状态快照
            if (state != null) {
                executionLog.setStateSnapshot(objectMapper.writeValueAsString(state.getData()));
            }
        } catch (Exception e) {
            log.warn("记录状态快照失败", e);
        }
        
        logRepository.save(executionLog);
        log.error("记录节点执行错误日志: executionId={}, nodeId={}, error={}", executionId, nodeId, errorMessage);
    }
    
    /**
     * 记录状态变更日志
     */
    @Transactional
    public void logStateChange(String executionId, Long graphId, String nodeId, String nodeType,
                              String message, GraphEngine.GraphState state, Integer stepNumber) {
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setExecutionId(executionId);
        executionLog.setGraphId(graphId);
        executionLog.setNodeId(nodeId);
        executionLog.setNodeType(nodeType);
        executionLog.setLogType(ExecutionLog.LogType.STATE_CHANGE.name());
        executionLog.setMessage(message);
        executionLog.setStepNumber(stepNumber);
        
        try {
            // 记录状态快照
            if (state != null) {
                executionLog.setStateSnapshot(objectMapper.writeValueAsString(state.getData()));
            }
        } catch (Exception e) {
            log.warn("记录状态快照失败", e);
        }
        
        logRepository.save(executionLog);
        logger.info("记录状态变更日志: executionId={}, nodeId={}, message={}", executionId, nodeId, message);
    }
    
    /**
     * 记录用户操作日志
     */
    @Transactional
    public void logUserAction(String executionId, Long graphId, String nodeId, String nodeType,
                             String action, String actionDetails, Integer stepNumber) {
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setExecutionId(executionId);
        executionLog.setGraphId(graphId);
        executionLog.setNodeId(nodeId);
        executionLog.setNodeType(nodeType);
        executionLog.setLogType(ExecutionLog.LogType.USER_ACTION.name());
        executionLog.setMessage("用户操作: " + action + (actionDetails != null ? " - " + actionDetails : ""));
        executionLog.setStepNumber(stepNumber);
        
        logRepository.save(executionLog);
        logger.info("记录用户操作日志: executionId={}, nodeId={}, action={}", executionId, nodeId, action);
    }
    
    /**
     * 记录执行控制日志（暂停、恢复、取消等）
     */
    @Transactional
    public void logExecutionControl(String executionId, Long graphId, ExecutionLog.LogType logType, String message) {
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setExecutionId(executionId);
        executionLog.setGraphId(graphId);
        executionLog.setNodeId("SYSTEM");
        executionLog.setNodeType("SYSTEM");
        executionLog.setLogType(logType.name());
        executionLog.setMessage(message);
        
        logRepository.save(executionLog);
        logger.info("记录执行控制日志: executionId={}, type={}, message={}", executionId, logType, message);
    }
    
    /**
     * 查询执行日志
     */
    public ExecutionLogListResponse queryLogs(ExecutionLogQueryRequest request) {
        log.info("查询执行日志: {}", request);
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        // 使用复杂查询方法
        Page<ExecutionLog> page = logRepository.findByConditions(
                request.getExecutionId(),
                request.getGraphId(),
                request.getNodeId(),
                request.getLogType(),
                request.getStartTime(),
                request.getEndTime(),
                pageable
        );
        
        List<ExecutionLogDTO> logDTOs = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ExecutionLogListResponse.builder()
                .logs(logDTOs)
                .total(page.getTotalElements())
                .page(request.getPage())
                .size(request.getSize())
                .totalPages(page.getTotalPages())
                .build();
    }
    
    /**
     * 根据执行ID查询所有日志
     */
    public List<ExecutionLogDTO> getLogsByExecutionId(String executionId) {
        List<ExecutionLog> logs = logRepository.findByExecutionIdOrderByStepNumberAscCreatedAtAsc(executionId);
        return logs.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据执行ID分页查询日志
     */
    public ExecutionLogListResponse getLogsByExecutionId(String executionId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 50);
        Page<ExecutionLog> logPage = logRepository.findByExecutionIdOrderByStepNumberAscCreatedAtAsc(executionId, pageable);
        
        List<ExecutionLogDTO> logDTOs = logPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ExecutionLogListResponse.builder()
                .logs(logDTOs)
                .total(logPage.getTotalElements())
                .page(page != null ? page : 0)
                .size(size != null ? size : 50)
                .totalPages(logPage.getTotalPages())
                .build();
    }
    
    /**
     * 删除执行日志
     */
    @Transactional
    public void deleteLogsByExecutionId(String executionId) {
        logRepository.deleteByExecutionId(executionId);
        log.info("删除执行日志: executionId={}", executionId);
    }
    
    /**
     * 清理旧的日志
     */
    @Transactional
    public int cleanupOldLogs(int daysBefore) {
        LocalDateTime beforeTime = LocalDateTime.now().minusDays(daysBefore);
        long countBefore = logRepository.count();
        logRepository.deleteByCreatedAtBefore(beforeTime);
        long countAfter = logRepository.count();
        int deletedCount = (int) (countBefore - countAfter);
        log.info("清理{}天前的日志，删除了{}条记录", daysBefore, deletedCount);
        return deletedCount;
    }
    
    /**
     * 转换为DTO
     */
    private ExecutionLogDTO toDTO(ExecutionLog executionLog) {
        try {
            Map<String, Object> stateSnapshot = executionLog.getStateSnapshot() != null ?
                    objectMapper.readValue(executionLog.getStateSnapshot(), new TypeReference<Map<String, Object>>() {}) :
                    null;
            
            return ExecutionLogDTO.builder()
                    .id(executionLog.getId())
                    .executionId(executionLog.getExecutionId())
                    .graphId(executionLog.getGraphId())
                    .nodeId(executionLog.getNodeId())
                    .nodeType(executionLog.getNodeType())
                    .logType(executionLog.getLogType())
                    .message(executionLog.getMessage())
                    .stateSnapshot(stateSnapshot)
                    .errorMessage(executionLog.getErrorMessage())
                    .executionTimeMs(executionLog.getExecutionTimeMs())
                    .stepNumber(executionLog.getStepNumber())
                    .createdAt(executionLog.getCreatedAt())
                    .build();
        } catch (Exception e) {
            log.error("转换为DTO失败", e);
            throw new RuntimeException("转换为DTO失败", e);
        }
    }
}
