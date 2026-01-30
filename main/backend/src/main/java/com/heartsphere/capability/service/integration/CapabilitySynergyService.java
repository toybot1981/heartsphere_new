package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.entity.CapabilitySynergyLog;
import com.heartsphere.capability.repository.CapabilitySynergyLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 能力协同服务
 * 提供能力协同查询和统计功能
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilitySynergyService {
    
    private final CapabilitySynergyLogRepository synergyLogRepository;
    
    /**
     * 查询角色的能力协同历史
     * 
     * @param characterId 角色ID
     * @param pageable 分页参数
     * @return 协同日志分页
     */
    public Page<CapabilitySynergyLog> getSynergyHistory(Long characterId, Pageable pageable) {
        return synergyLogRepository.findByCharacterIdOrderByCreatedAtDesc(characterId, pageable);
    }
    
    /**
     * 查询指定类型的协同日志
     * 
     * @param characterId 角色ID
     * @param synergyType 协同类型
     * @return 协同日志列表
     */
    public List<CapabilitySynergyLog> getSynergyByType(Long characterId, String synergyType) {
        return synergyLogRepository.findByCharacterIdAndSynergyTypeOrderByCreatedAtDesc(characterId, synergyType);
    }
    
    /**
     * 查询指定时间范围内的协同日志
     * 
     * @param characterId 角色ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 协同日志列表
     */
    public List<CapabilitySynergyLog> getSynergyByTimeRange(
            Long characterId, LocalDateTime startTime, LocalDateTime endTime) {
        return synergyLogRepository.findByCharacterIdAndTimeRange(characterId, startTime, endTime);
    }
    
    /**
     * 统计能力协同效果
     * 
     * @param characterId 角色ID
     * @return 协同统计信息
     */
    public SynergyStatisticsDTO getSynergyStatistics(Long characterId) {
        List<CapabilitySynergyLog> allLogs = synergyLogRepository.findByCharacterIdOrderByCreatedAtDesc(characterId);
        
        if (allLogs.isEmpty()) {
            return SynergyStatisticsDTO.builder()
                .characterId(characterId)
                .totalSynergies(0)
                .averageEffect(0.0)
                .synergyTypeStats(new HashMap<>())
                .build();
        }
        
        // 统计各类型协同效果
        Map<String, SynergyTypeStats> typeStats = new HashMap<>();
        double totalEffect = 0.0;
        
        for (CapabilitySynergyLog log : allLogs) {
            String type = log.getSynergyType();
            SynergyTypeStats stats = typeStats.computeIfAbsent(type, k -> new SynergyTypeStats(type, 0, 0.0));
            stats.count++;
            double effect = log.getSynergyEffect().doubleValue();
            stats.totalEffect += effect;
            totalEffect += effect;
        }
        
        // 计算平均效果
        double averageEffect = totalEffect / allLogs.size();
        
        // 计算各类型平均效果
        Map<String, Double> typeStatsMap = new HashMap<>();
        for (Map.Entry<String, SynergyTypeStats> entry : typeStats.entrySet()) {
            SynergyTypeStats stats = entry.getValue();
            typeStatsMap.put(entry.getKey(), stats.totalEffect / stats.count);
        }
        
        return SynergyStatisticsDTO.builder()
            .characterId(characterId)
            .totalSynergies(allLogs.size())
            .averageEffect(averageEffect)
            .synergyTypeStats(typeStatsMap)
            .build();
    }
    
    /**
     * 协同统计DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class SynergyStatisticsDTO {
        private Long characterId;
        private Integer totalSynergies;
        private Double averageEffect;
        private Map<String, Double> synergyTypeStats;
    }
    
    /**
     * 协同类型统计
     */
    private static class SynergyTypeStats {
        String type;
        int count;
        double totalEffect;
        
        SynergyTypeStats(String type, int count, double totalEffect) {
            this.type = type;
            this.count = count;
            this.totalEffect = totalEffect;
        }
    }
}
