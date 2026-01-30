package com.heartsphere.admin.dto.agentmind;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 智能体状态统计DTO
 */
@Data
public class AgentStateStatisticsDTO {
    
    private Long characterId;
    private String characterName;
    
    // 各状态类型的出现次数
    private List<Map<String, Object>> stateTypeCounts;
    
    // 各状态类型的平均持续时间（毫秒）
    private List<Map<String, Object>> stateTypeAvgDurations;
    
    // 总状态记录数
    private Long totalRecords;
    
    // 最早的状态记录时间
    private java.time.LocalDateTime earliestStateTime;
    
    // 最新的状态记录时间
    private java.time.LocalDateTime latestStateTime;
}
