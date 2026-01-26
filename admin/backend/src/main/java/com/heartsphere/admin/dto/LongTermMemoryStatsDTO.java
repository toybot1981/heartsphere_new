package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 长时记忆统计DTO
 * 
 * @author HeartSphere
 * @date 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongTermMemoryStatsDTO {
    
    private Long totalMemories;
    private Map<String, Long> typeCounts; // 按类型统计
    private Map<String, Long> distribution; // 分布统计
    private java.util.List<Map<String, Object>> trends; // 趋势数据
}
