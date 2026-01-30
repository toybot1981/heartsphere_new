package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.MultiAgentAgentDTO;
import com.heartsphere.admin.dto.MultiAgentAgentMetricsDTO;
import com.heartsphere.admin.entity.MultiAgentCollaborationLog;
import com.heartsphere.admin.repository.MultiAgentCollaborationLogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 多智能体 Agent 管理服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MultiAgentAgentAdminService {
    
    private final ApplicationContext applicationContext;
    private final MultiAgentCollaborationLogRepository logRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取所有 Agent 列表
     */
    @SuppressWarnings("unchecked")
    public List<MultiAgentAgentDTO> getAllAgents() {
        try {
            Object agentRegistry = applicationContext.getBean("agentRegistryImpl");
            
            // 使用反射调用 getAllAgents 方法
            java.lang.reflect.Method getAllAgentsMethod = agentRegistry.getClass()
                .getMethod("getAllAgents");
            List<Object> agents = (List<Object>) getAllAgentsMethod.invoke(agentRegistry);
            
            return agents.stream()
                .map(this::convertAgentToDTO)
                .collect(Collectors.toList());
        } catch (org.springframework.beans.factory.NoSuchBeanDefinitionException e) {
            log.warn("AgentRegistry not found in application context: {}", e.getMessage());
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get agents", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 获取 Agent 详情
     */
    @SuppressWarnings("unchecked")
    public MultiAgentAgentDTO getAgentById(String agentId) {
        try {
            Object agentRegistry = applicationContext.getBean("agentRegistryImpl");
            java.lang.reflect.Method getAgentMethod = agentRegistry.getClass()
                .getMethod("getAgent", String.class);
            Optional<Object> agentOpt = (Optional<Object>) getAgentMethod.invoke(agentRegistry, agentId);
            
            if (agentOpt.isPresent()) {
                return convertAgentToDTO(agentOpt.get());
            } else {
                throw new RuntimeException("Agent not found: " + agentId);
            }
        } catch (Exception e) {
            log.error("Failed to get agent: {}", agentId);
            throw new RuntimeException("Failed to get agent: " + agentId, e);
        }
    }
    
    /**
     * 获取 Agent 性能指标
     */
    public MultiAgentAgentMetricsDTO getAgentMetrics(String agentId, LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(30);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<MultiAgentCollaborationLog> logs = logRepository.findByCreatedAtBetween(
            startTime, endTime, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        long totalCalls = 0;
        long successfulCalls = 0;
        long failedCalls = 0;
        List<Long> responseTimes = new ArrayList<>();
        
        for (MultiAgentCollaborationLog logEntry : logs) {
            try {
                List<String> agentIds = parseJsonList(logEntry.getAgentIds());
                if (agentIds.contains(agentId)) {
                    totalCalls++;
                    if (Boolean.TRUE.equals(logEntry.getSuccess())) {
                        successfulCalls++;
                    } else {
                        failedCalls++;
                    }
                    if (logEntry.getExecutionTimeMs() != null) {
                        responseTimes.add(logEntry.getExecutionTimeMs());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse agent IDs from log entry");
            }
        }
        
        double successRate = totalCalls > 0 ? (successfulCalls * 100.0 / totalCalls) : 0.0;
        double avgResponseTime = responseTimes.isEmpty() ? 0.0 : 
            responseTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
        long minResponseTime = responseTimes.isEmpty() ? 0 : 
            responseTimes.stream().mapToLong(Long::longValue).min().orElse(0);
        long maxResponseTime = responseTimes.isEmpty() ? 0 : 
            responseTimes.stream().mapToLong(Long::longValue).max().orElse(0);
        
        // 获取 Agent 信息
        MultiAgentAgentDTO agentDTO = getAgentById(agentId);
        
        return MultiAgentAgentMetricsDTO.builder()
            .agentId(agentId)
            .agentName(agentDTO.getName())
            .totalCalls(totalCalls)
            .successfulCalls(successfulCalls)
            .failedCalls(failedCalls)
            .successRate(successRate)
            .averageResponseTimeMs(avgResponseTime)
            .minResponseTimeMs(minResponseTime)
            .maxResponseTimeMs(maxResponseTime)
            .recentResponseTimes(responseTimes.stream().limit(10).collect(Collectors.toList()))
            .build();
    }
    
    /**
     * 转换 Agent 为 DTO
     */
    @SuppressWarnings("unchecked")
    private MultiAgentAgentDTO convertAgentToDTO(Object agent) {
        try {
            String agentId = (String) agent.getClass().getMethod("getId").invoke(agent);
            String name = (String) agent.getClass().getMethod("getName").invoke(agent);
            String description = (String) agent.getClass().getMethod("getDescription").invoke(agent);
            Set<String> capabilities = (Set<String>) agent.getClass().getMethod("getCapabilities").invoke(agent);
            Object statusObj = agent.getClass().getMethod("getStatus").invoke(agent);
            String status = statusObj != null ? statusObj.toString() : "IDLE";
            
            // 从日志中获取执行统计
            List<MultiAgentCollaborationLog> logs = logRepository.findByCreatedAtBetween(
                LocalDateTime.now().minusDays(30), LocalDateTime.now(), 
                org.springframework.data.domain.Pageable.unpaged()).getContent();
            
            long totalExecutions = 0;
            long successfulExecutions = 0;
            LocalDateTime lastExecutionTime = null;
            
            for (MultiAgentCollaborationLog logEntry : logs) {
                try {
                    List<String> agentIds = parseJsonList(logEntry.getAgentIds());
                    if (agentIds.contains(agentId)) {
                        totalExecutions++;
                        if (Boolean.TRUE.equals(logEntry.getSuccess())) {
                            successfulExecutions++;
                        }
                        if (logEntry.getStartedAt() != null && 
                            (lastExecutionTime == null || logEntry.getStartedAt().isAfter(lastExecutionTime))) {
                            lastExecutionTime = logEntry.getStartedAt();
                        }
                    }
                } catch (Exception e) {
                    // 忽略解析错误
                }
            }
            
            double successRate = totalExecutions > 0 ? (successfulExecutions * 100.0 / totalExecutions) : 0.0;
            
            return MultiAgentAgentDTO.builder()
                .agentId(agentId)
                .name(name)
                .description(description)
                .capabilities(capabilities)
                .status(status)
                .lastExecutionTime(lastExecutionTime)
                .totalExecutions(totalExecutions)
                .successfulExecutions(successfulExecutions)
                .successRate(successRate)
                .enabled(true) // 默认启用
                .build();
        } catch (Exception e) {
            log.error("Failed to convert agent to DTO: {}", e.getMessage());
            throw new RuntimeException("Failed to convert agent to DTO", e);
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
            return Collections.emptyList();
        }
    }
}
