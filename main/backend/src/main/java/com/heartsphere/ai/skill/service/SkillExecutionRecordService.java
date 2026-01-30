package com.heartsphere.ai.skill.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.ai.skill.dto.SkillStatistics;
import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.enums.ExecutionStatus;
import com.heartsphere.ai.skill.repository.SkillExecutionRecordRepository;
import com.heartsphere.ai.skill.service.SkillRecordMonitor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 技能执行记录服务
 * 处理技能执行记录的业务逻辑
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillExecutionRecordService {

    private final SkillExecutionRecordRepository repository;
    private final ObjectMapper objectMapper;
    
    @Autowired(required = false)
    @Lazy
    private SkillRecordMonitor monitor;

    // ==================== 创建和更新 ====================

    /**
     * 创建新的执行记录
     */
    @Transactional
    public SkillExecutionRecord createRecord(SkillExecutionRecordDTO dto) {
        long writeStartTime = System.currentTimeMillis();
        try {
            SkillExecutionRecord record = SkillExecutionRecord.builder()
                .conversationId(dto.getConversationId())
                .skillId(dto.getSkillId())
                .userId(dto.getUserId())
                .roleId(dto.getRoleId())
                .evaluationTimestamp(LocalDateTime.now())
                .semanticScore(dto.getSemanticScore())
                .contextScore(dto.getContextScore())
                .memoryScore(dto.getMemoryScore())
                .compositeScore(dto.getCompositeScore())
                .decision(dto.getDecision())
                .rejectionReason(dto.getRejectionReason())
                .keywordMatches(serializeList(dto.getKeywordMatches()))
                .executionStatus(ExecutionStatus.PENDING)
                .relatedMemoryIds(serializeList(dto.getRelatedMemoryIds()))
                .relatedConversationTurnId(dto.getRelatedConversationTurnId())
                .build();

            SkillExecutionRecord saved = repository.save(record);
            log.info("创建技能执行记录: skillId={}, conversationId={}, score={}", 
                dto.getSkillId(), dto.getConversationId(), dto.getCompositeScore());
            return saved;
        } catch (Exception e) {
            log.error("创建技能执行记录失败", e);
            throw new RuntimeException("创建执行记录失败: " + e.getMessage(), e);
        }
    }

    /**
     * 更新执行结果
     */
    @Transactional
    public void updateExecutionResult(
        Long recordId,
        String status,
        String result,
        Integer durationMs,
        String error) {
        try {
            SkillExecutionRecord record = repository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + recordId));

            record.setExecutionStatus(ExecutionStatus.valueOf(status));
            record.setExecutionResult(result);
            record.setExecutionDurationMs(durationMs);
            record.setErrorMessage(error);
            record.setExecutionTimestamp(LocalDateTime.now());

            repository.save(record);
            log.info("更新技能执行结果: recordId={}, status={}", recordId, status);
        } catch (Exception e) {
            log.error("更新执行结果失败: recordId={}", recordId, e);
            throw new RuntimeException("更新执行结果失败", e);
        }
    }

    /**
     * 标记为执行中
     */
    @Transactional
    public void markAsExecuting(Long recordId) {
        try {
            SkillExecutionRecord record = repository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("执行记录不存在: " + recordId));

            record.setExecutionStatus(ExecutionStatus.EXECUTING);
            record.setExecutionTimestamp(LocalDateTime.now());
            repository.save(record);
        } catch (Exception e) {
            log.error("标记为执行中失败: recordId={}", recordId, e);
        }
    }

    /**
     * 标记为完成
     */
    @Transactional
    public void markAsCompleted(Long recordId, String result, Integer durationMs) {
        updateExecutionResult(recordId, ExecutionStatus.COMPLETED.name(), result, durationMs, null);
    }

    /**
     * 标记为失败
     */
    @Transactional
    public void markAsFailed(Long recordId, String errorMessage, Integer durationMs) {
        updateExecutionResult(recordId, ExecutionStatus.FAILED.name(), null, durationMs, errorMessage);
    }

    // ==================== 查询操作 ====================

    /**
     * 获取对话的执行历史
     */
    public List<SkillExecutionRecordDTO> getConversationHistory(Long conversationId, int limit) {
        try {
            List<SkillExecutionRecord> records = repository
                .findTop100ByConversationIdOrderByCreatedAtDesc(conversationId);

            return records.stream()
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("查询对话历史失败: conversationId={}", conversationId, e);
            return new ArrayList<>();
        }
    }

    /**
     * 分页查询对话的执行记录
     */
    public Page<SkillExecutionRecordDTO> getConversationHistoryPaged(
        Long conversationId,
        int pageNo,
        int pageSize) {
        try {
            Pageable pageable = PageRequest.of(pageNo, pageSize);
            Page<SkillExecutionRecord> page = repository
                .findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

            return page.map(this::toDTO);
        } catch (Exception e) {
            log.error("分页查询对话历史失败: conversationId={}", conversationId, e);
            throw new RuntimeException("查询失败", e);
        }
    }

    /**
     * 查询用户的技能使用统计
     */
    public SkillStatistics getUserStatistics(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            long totalCount = repository.countByUserIdAndDecisionAndCreatedAtBetween(
                userId, "APPLIED", startTime, endTime);

            List<SkillExecutionRecord> records = repository
                .findByUserIdAndCreatedAtBetween(userId, startTime, endTime);

            long completedCount = records.stream()
                .filter(r -> ExecutionStatus.COMPLETED == r.getExecutionStatus())
                .count();

            double successRate = completedCount > 0 ? (double) completedCount / totalCount : 0;

            return SkillStatistics.builder()
                .totalCount(totalCount)
                .completedCount(completedCount)
                .failedCount(records.stream()
                    .filter(r -> ExecutionStatus.FAILED == r.getExecutionStatus())
                    .count())
                .successRate(successRate)
                .build();
        } catch (Exception e) {
            log.error("查询用户统计失败: userId={}", userId, e);
            return SkillStatistics.builder().totalCount(0L).build();
        }
    }

    /**
     * 查询技能的统计数据
     */
    public SkillStatistics getSkillStatistics(Long skillId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            long appliedCount = repository.countBySkillIdAndDecision(skillId, "APPLIED");
            long completedCount = repository.countBySkillIdAndExecutionStatus(skillId, "COMPLETED");
            long failedCount = repository.countBySkillIdAndExecutionStatus(skillId, "FAILED");

            Double averageScore = repository.getAverageScoreForSkill(skillId, startTime, endTime);
            Double successRate = repository.getSuccessRateForSkill(skillId, startTime, endTime);
            Double averageDuration = repository.getAverageDurationForSkill(skillId, startTime, endTime);

            return SkillStatistics.builder()
                .totalCount(appliedCount + failedCount)
                .appliedCount(appliedCount)
                .completedCount(completedCount)
                .failedCount(failedCount)
                .successRate(successRate != null ? successRate / 100 : 0)
                .averageScore(averageScore != null ? averageScore : 0)
                .averageDurationMs(averageDuration != null ? averageDuration.intValue() : 0)
                .build();
        } catch (Exception e) {
            log.error("查询技能统计失败: skillId={}", skillId, e);
            return SkillStatistics.builder().totalCount(0L).build();
        }
    }

    /**
     * 查询最近失败的记录
     */
    public List<SkillExecutionRecordDTO> getRecentFailures(int limit, LocalDateTime sinceTime) {
        try {
            List<SkillExecutionRecord> records = repository
                .findByExecutionStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                    ExecutionStatus.FAILED.name(),
                    sinceTime,
                    LocalDateTime.now()
                );

            return records.stream()
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("查询失败记录失败", e);
            return new ArrayList<>();
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 将实体转换为 DTO
     */
    private SkillExecutionRecordDTO toDTO(SkillExecutionRecord record) {
        return SkillExecutionRecordDTO.builder()
            .id(record.getId())
            .conversationId(record.getConversationId())
            .skillId(record.getSkillId())
            .userId(record.getUserId())
            .roleId(record.getRoleId())
            .semanticScore(record.getSemanticScore())
            .contextScore(record.getContextScore())
            .memoryScore(record.getMemoryScore())
            .compositeScore(record.getCompositeScore())
            .decision(record.getDecision())
            .rejectionReason(record.getRejectionReason())
            .evaluationTimestamp(record.getEvaluationTimestamp())
            .keywordMatches(deserializeList(record.getKeywordMatches()))
            .executionStatus(record.getExecutionStatus() != null ? 
                record.getExecutionStatus().name() : null)
            .executionTimestamp(record.getExecutionTimestamp())
            .executionDurationMs(record.getExecutionDurationMs())
            .executionResult(record.getExecutionResult())
            .errorMessage(record.getErrorMessage())
            .relatedMemoryIds(deserializeLongList(record.getRelatedMemoryIds()))
            .relatedConversationTurnId(record.getRelatedConversationTurnId())
            .createdAt(record.getCreatedAt())
            .updatedAt(record.getUpdatedAt())
            .build();
    }

    /**
     * 序列化字符串列表为 JSON
     */
    private String serializeList(List<? extends Object> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.error("序列化列表失败", e);
            return "[]";
        }
    }

    /**
     * 反序列化字符串列表
     */
    private List<String> deserializeList(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("反序列化字符串列表失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 反序列化 Long 列表
     */
    private List<Long> deserializeLongList(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            log.error("反序列化 Long 列表失败", e);
            return new ArrayList<>();
        }
    }
}
