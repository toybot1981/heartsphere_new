package com.heartsphere.ai.skill.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.repository.SkillExecutionRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 技能-记忆关联追踪服务
 * 建立技能执行与内存的双向引用关系
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillMemoryCorrelationService {

    private final SkillExecutionRecordRepository recordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 解析 relatedMemoryIds JSON 字符串为 List<Long>
     */
    private List<Long> parseRelatedMemoryIds(String jsonStr) {
        if (jsonStr == null || jsonStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(jsonStr, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            log.warn("解析 relatedMemoryIds 失败: {}", jsonStr, e);
            return new ArrayList<>();
        }
    }

    /**
     * 根据记忆ID查询相关的技能执行记录
     * 
     * @param memoryId 记忆ID
     * @return 相关的技能执行记录列表
     */
    public List<SkillExecutionRecord> getSkillsByMemoryId(Long memoryId) {
        return recordRepository.findAll().stream()
            .filter(record -> {
                List<Long> memoryIds = parseRelatedMemoryIds(record.getRelatedMemoryIds());
                return memoryIds != null && memoryIds.contains(memoryId);
            })
            .collect(Collectors.toList());
    }

    /**
     * 根据技能ID查询相关的记忆ID列表
     * 
     * @param skillId 技能ID
     * @return 相关的记忆ID列表
     */
    public List<Long> getMemoryIdsBySkillId(Long skillId) {
        return recordRepository.findBySkillId(skillId).stream()
            .map(record -> parseRelatedMemoryIds(record.getRelatedMemoryIds()))
            .filter(memoryIds -> memoryIds != null && !memoryIds.isEmpty())
            .flatMap(List::stream)
            .distinct()
            .collect(Collectors.toList());
    }

    /**
     * 获取技能和记忆的关联统计
     * 
     * @param skillId 技能ID
     * @return 关联统计信息
     */
    public CorrelationStats getCorrelationStats(Long skillId) {
        List<SkillExecutionRecord> records = recordRepository.findBySkillId(skillId);
        
        long totalRecords = records.size();
        long recordsWithMemory = records.stream()
            .filter(r -> {
                List<Long> memoryIds = parseRelatedMemoryIds(r.getRelatedMemoryIds());
                return memoryIds != null && !memoryIds.isEmpty();
            })
            .count();
        
        List<Long> uniqueMemoryIds = records.stream()
            .map(r -> parseRelatedMemoryIds(r.getRelatedMemoryIds()))
            .filter(memoryIds -> memoryIds != null && !memoryIds.isEmpty())
            .flatMap(List::stream)
            .distinct()
            .collect(Collectors.toList());

        return CorrelationStats.builder()
            .skillId(skillId)
            .totalRecords(totalRecords)
            .recordsWithMemory(recordsWithMemory)
            .uniqueMemoryCount(uniqueMemoryIds.size())
            .memoryIds(uniqueMemoryIds)
            .correlationRate(totalRecords > 0 ? (double) recordsWithMemory / totalRecords : 0.0)
            .build();
    }

    /**
     * 关联统计信息
     */
    @lombok.Data
    @lombok.Builder
    public static class CorrelationStats {
        private Long skillId;
        private long totalRecords;
        private long recordsWithMemory;
        private long uniqueMemoryCount;
        private List<Long> memoryIds;
        private double correlationRate;
    }
}
