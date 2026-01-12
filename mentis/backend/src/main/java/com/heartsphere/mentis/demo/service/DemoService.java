package com.heartsphere.mentis.demo.service;

import com.heartsphere.mentis.demo.model.ToolCallLog;
import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmManager;
import com.heartsphere.mentis.vm.VmProvider;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 演示服务
 * 提供演示相关的业务逻辑
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {
    
    private final ToolCallLogService toolCallLogService;
    private final VmManager vmManager;
    
    /**
     * 获取工具调用统计信息
     */
    public ToolCallStatistics getToolCallStatistics(String sessionId) {
        long totalCalls = toolCallLogService.countToolCallsBySession(sessionId);
        long successCalls = toolCallLogService.countToolCallsBySessionAndStatus(
            sessionId, ToolCallLog.ToolCallStatus.SUCCESS);
        long errorCalls = toolCallLogService.countToolCallsBySessionAndStatus(
            sessionId, ToolCallLog.ToolCallStatus.ERROR);
        Double avgDuration = toolCallLogService.getAverageDurationBySession(sessionId);
        
        ToolCallStatistics stats = new ToolCallStatistics();
        stats.setTotalCalls(totalCalls);
        stats.setSuccessCalls(successCalls);
        stats.setErrorCalls(errorCalls);
        stats.setSuccessRate(totalCalls > 0 ? (double) successCalls / totalCalls * 100 : 0.0);
        stats.setAverageDuration(avgDuration != null ? avgDuration : 0.0);
        
        return stats;
    }
    
    /**
     * 获取虚拟机状态信息
     */
    public VmStatusInfo getVmStatusInfo(String sessionId) {
        VmStatusInfo info = new VmStatusInfo();
        info.setSessionId(sessionId);
        
        try {
            VmProvider.VmInstance vm = vmManager.getVmForSession(sessionId);
            if (vm != null) {
                info.setVmId(vm.getVmId());
                info.setVmExists(true);
                
                MentisVmService.VmStatus status = vmManager.getVmStatus(vm.getVmId());
                if (status != null) {
                    info.setStatus(status.getStatus());
                    // TODO: 如果 VmStatus 有 createdAt 字段，可以设置
                    // info.setCreatedAt(status.getCreatedAt());
                }
            } else {
                info.setVmExists(false);
                info.setStatus("NOT_FOUND");
            }
        } catch (Exception e) {
            log.error("Failed to get VM status for session: {}", sessionId, e);
            info.setVmExists(false);
            info.setStatus("ERROR");
            info.setErrorMessage(e.getMessage());
        }
        
        return info;
    }
    
    /**
     * 获取工具调用统计信息（按工具名称分组）
     */
    public Map<String, ToolCallStatistics> getToolCallStatisticsByTool(String sessionId) {
        List<ToolCallLog> logs = toolCallLogService.getToolCallsBySession(sessionId);
        
        Map<String, List<ToolCallLog>> groupedByTool = logs.stream()
            .collect(Collectors.groupingBy(ToolCallLog::getToolName));
        
        Map<String, ToolCallStatistics> result = new HashMap<>();
        
        for (Map.Entry<String, List<ToolCallLog>> entry : groupedByTool.entrySet()) {
            String toolName = entry.getKey();
            List<ToolCallLog> toolLogs = entry.getValue();
            
            long total = toolLogs.size();
            long success = toolLogs.stream()
                .filter(log -> log.getStatus() == ToolCallLog.ToolCallStatus.SUCCESS)
                .count();
            long error = toolLogs.stream()
                .filter(log -> log.getStatus() == ToolCallLog.ToolCallStatus.ERROR)
                .count();
            
            double avgDuration = toolLogs.stream()
                .filter(log -> log.getDuration() != null)
                .mapToLong(ToolCallLog::getDuration)
                .average()
                .orElse(0.0);
            
            ToolCallStatistics stats = new ToolCallStatistics();
            stats.setTotalCalls(total);
            stats.setSuccessCalls(success);
            stats.setErrorCalls(error);
            stats.setSuccessRate(total > 0 ? (double) success / total * 100 : 0.0);
            stats.setAverageDuration(avgDuration);
            
            result.put(toolName, stats);
        }
        
        return result;
    }
    
    /**
     * 工具调用统计信息
     */
    @Data
    public static class ToolCallStatistics {
        private long totalCalls;
        private long successCalls;
        private long errorCalls;
        private double successRate; // 百分比
        private double averageDuration; // 毫秒
    }
    
    /**
     * 虚拟机状态信息
     */
    @Data
    public static class VmStatusInfo {
        private String sessionId;
        private String vmId;
        private boolean vmExists;
        private String status;
        private LocalDateTime createdAt;
        private String errorMessage;
    }
}
