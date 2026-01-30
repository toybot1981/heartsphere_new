package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.MultiAgentCollaborationDTO;
import com.heartsphere.admin.dto.MultiAgentCollaborationStatisticsDTO;
import com.heartsphere.admin.entity.MultiAgentCollaborationLog;
import com.heartsphere.admin.repository.MultiAgentCollaborationLogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageImpl;

/**
 * 多智能体协作管理服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MultiAgentCollaborationAdminService {
    
    private final MultiAgentCollaborationLogRepository logRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取协作列表（分页、搜索、筛选）
     */
    public Page<MultiAgentCollaborationDTO> getCollaborations(
            String status,
            String userId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Pageable pageable) {
        
        Page<MultiAgentCollaborationLog> logs;
        
        if (status != null && startTime != null && endTime != null) {
            logs = logRepository.findByStatusAndCreatedAtBetween(status, startTime, endTime, pageable);
        } else if (startTime != null && endTime != null) {
            logs = logRepository.findByCreatedAtBetween(startTime, endTime, pageable);
        } else if (status != null) {
            // findByStatus 不支持 Pageable，需要手动分页
            List<MultiAgentCollaborationLog> allLogs = logRepository.findByStatus(status);
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), allLogs.size());
            List<MultiAgentCollaborationLog> pageContent = allLogs.subList(start, end);
            logs = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, allLogs.size());
        } else {
            logs = logRepository.findAll(pageable);
        }
        
        // 如果指定了用户ID，需要进一步过滤
        if (userId != null) {
            List<MultiAgentCollaborationLog> filtered = logs.getContent().stream()
                .filter(log -> userId.equals(log.getUserId()))
                .collect(Collectors.toList());
            logs = new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
        }
        
        return logs.map(this::convertToDTO);
    }
    
    /**
     * 获取协作详情
     */
    public MultiAgentCollaborationDTO getCollaborationById(String collaborationId) {
        return logRepository.findByCollaborationId(collaborationId)
            .map(this::convertToDTO)
            .orElseThrow(() -> new RuntimeException("Collaboration not found: " + collaborationId));
    }
    
    /**
     * 获取协作统计信息
     */
    public MultiAgentCollaborationStatisticsDTO getStatistics(
            LocalDateTime startTime,
            LocalDateTime endTime) {
        
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(30); // 默认最近30天
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        Long total = logRepository.countByCreatedAtBetween(startTime, endTime);
        Long successful = logRepository.countSuccessfulByCreatedAtBetween(startTime, endTime);
        Long failed = logRepository.countByStatusAndCreatedAtBetween("FAILED", startTime, endTime);
        Long running = logRepository.countByStatusAndCreatedAtBetween("RUNNING", startTime, endTime);
        
        Double successRate = total > 0 ? (successful.doubleValue() / total.doubleValue()) * 100 : 0.0;
        Double avgExecutionTime = logRepository.calculateAverageExecutionTime(startTime, endTime);
        
        // 统计各智能体的调用次数和成功率
        Map<String, Long> agentCallCounts = new HashMap<>();
        Map<String, Long> agentSuccessCounts = new HashMap<>();
        
        List<MultiAgentCollaborationLog> logs = logRepository.findByCreatedAtBetween(startTime, endTime, Pageable.unpaged()).getContent();
        for (MultiAgentCollaborationLog logEntry : logs) {
            try {
                List<String> agentIds = parseJsonList(logEntry.getAgentIds());
                for (String agentId : agentIds) {
                    agentCallCounts.merge(agentId, 1L, Long::sum);
                    if (Boolean.TRUE.equals(logEntry.getSuccess())) {
                        agentSuccessCounts.merge(agentId, 1L, Long::sum);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse agent IDs: {}", logEntry.getAgentIds());
            }
        }
        
        Map<String, Double> agentSuccessRates = agentCallCounts.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> {
                    Long successCount = agentSuccessCounts.getOrDefault(entry.getKey(), 0L);
                    return entry.getValue() > 0 ? (successCount.doubleValue() / entry.getValue().doubleValue()) * 100 : 0.0;
                }
            ));
        
        return MultiAgentCollaborationStatisticsDTO.builder()
            .totalCollaborations(total)
            .successfulCollaborations(successful)
            .failedCollaborations(failed)
            .runningCollaborations(running)
            .successRate(successRate)
            .averageExecutionTimeMs(avgExecutionTime)
            .agentCallCounts(agentCallCounts)
            .agentSuccessRates(agentSuccessRates)
            .build();
    }
    
    /**
     * 取消协作（通过日志记录）
     */
    @Transactional
    public void cancelCollaboration(String collaborationId) {
        MultiAgentCollaborationLog log = logRepository.findByCollaborationId(collaborationId)
            .orElseThrow(() -> new RuntimeException("Collaboration not found: " + collaborationId));
        
        if ("RUNNING".equals(log.getStatus())) {
            log.setStatus("CANCELLED");
            log.setCompletedAt(LocalDateTime.now());
            logRepository.save(log);
        } else {
            throw new RuntimeException("Cannot cancel collaboration with status: " + log.getStatus());
        }
    }
    
    /**
     * 转换为 DTO
     */
    private MultiAgentCollaborationDTO convertToDTO(MultiAgentCollaborationLog logEntry) {
        try {
            List<String> agentIds = parseJsonList(logEntry.getAgentIds());
            Map<String, Object> agentResults = parseJsonMap(logEntry.getAgentResults());
            List<String> errors = parseJsonList(logEntry.getErrors());
            
            return MultiAgentCollaborationDTO.builder()
                .collaborationId(logEntry.getCollaborationId())
                .userId(logEntry.getUserId())
                .sessionId(logEntry.getSessionId())
                .taskDescription(logEntry.getTaskDescription())
                .agentIds(agentIds)
                .status(logEntry.getStatus())
                .workflowMode(logEntry.getWorkflowMode())
                .startedAt(logEntry.getStartedAt())
                .completedAt(logEntry.getCompletedAt())
                .executionTimeMs(logEntry.getExecutionTimeMs())
                .result(logEntry.getResult())
                .agentResults(agentResults)
                .errors(errors)
                .success(logEntry.getSuccess())
                .createdAt(logEntry.getCreatedAt())
                .notes(logEntry.getNotes())
                .build();
        } catch (Exception e) {
            log.error("Failed to convert log to DTO: {}, error: {}", logEntry.getCollaborationId(), e.getMessage());
            throw new RuntimeException("Failed to convert log to DTO", e);
        }
    }
    
    /**
     * 解析 JSON 列表
     */
    private List<String> parseJsonList(String json) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON list: {}", json);
            return Collections.emptyList();
        }
    }
    
    /**
     * 解析 JSON Map
     */
    private Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON map: {}", json);
            return Collections.emptyMap();
        }
    }
}
