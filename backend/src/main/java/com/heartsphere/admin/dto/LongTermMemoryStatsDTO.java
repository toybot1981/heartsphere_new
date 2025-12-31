package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 长时记忆统计DTO
 * 
 * @author HeartSphere
 * @date 2025-12-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongTermMemoryStatsDTO {
    private Long totalMemories;
    private Map<String, Long> typeCounts;
    private Map<String, Long> distribution;
    private List<Map<String, Object>> trends;
}


