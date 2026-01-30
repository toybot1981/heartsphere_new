package com.heartsphere.ai.skill.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.ai.skill.dto.SkillStatistics;
import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.enums.ExecutionStatus;
import com.heartsphere.ai.skill.repository.SkillExecutionRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 技能执行记录服务测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能执行记录服务测试")
public class SkillExecutionRecordServiceTest {

    @Mock
    private SkillExecutionRecordRepository repository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private SkillExecutionRecordService service;

    private SkillExecutionRecordDTO testDTO;
    private SkillExecutionRecord testRecord;

    @BeforeEach
    public void setUp() {
        testDTO = SkillExecutionRecordDTO.builder()
            .conversationId(1L)
            .skillId(100L)
            .userId(1L)
            .roleId(1L)
            .semanticScore(85)
            .contextScore(80)
            .memoryScore(75)
            .compositeScore(80)
            .decision("APPLIED")
            .keywordMatches(Arrays.asList("skill", "execute"))
            .relatedMemoryIds(Arrays.asList(1L, 2L))
            .build();

        testRecord = SkillExecutionRecord.builder()
            .id(1L)
            .conversationId(1L)
            .skillId(100L)
            .userId(1L)
            .roleId(1L)
            .semanticScore(85)
            .contextScore(80)
            .memoryScore(75)
            .compositeScore(80)
            .decision("APPLIED")
            .executionStatus(ExecutionStatus.PENDING)
            .evaluationTimestamp(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    @Test
    @DisplayName("应该创建新的执行记录")
    public void testCreateRecord() throws Exception {
        doReturn("[]").when(objectMapper).writeValueAsString(any());
        when(repository.save(any(SkillExecutionRecord.class))).thenReturn(testRecord);

        SkillExecutionRecord result = service.createRecord(testDTO);

        assertNotNull(result);
        assertEquals(100L, result.getSkillId());
        assertEquals(80, result.getCompositeScore());
        verify(repository, times(1)).save(any(SkillExecutionRecord.class));
    }

    @Test
    @DisplayName("应该更新执行结果")
    public void testUpdateExecutionResult() {
        when(repository.findById(1L)).thenReturn(Optional.of(testRecord));
        when(repository.save(any(SkillExecutionRecord.class))).thenReturn(testRecord);

        service.updateExecutionResult(1L, "COMPLETED", "success", 100, null);

        verify(repository, times(1)).findById(1L);
        verify(repository, times(1)).save(any(SkillExecutionRecord.class));
    }

    @Test
    @DisplayName("应该标记为执行中")
    public void testMarkAsExecuting() {
        when(repository.findById(1L)).thenReturn(Optional.of(testRecord));
        when(repository.save(any(SkillExecutionRecord.class))).thenReturn(testRecord);

        service.markAsExecuting(1L);

        verify(repository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("应该标记为完成")
    public void testMarkAsCompleted() {
        when(repository.findById(1L)).thenReturn(Optional.of(testRecord));
        when(repository.save(any(SkillExecutionRecord.class))).thenReturn(testRecord);

        service.markAsCompleted(1L, "success", 100);

        verify(repository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("应该标记为失败")
    public void testMarkAsFailed() {
        when(repository.findById(1L)).thenReturn(Optional.of(testRecord));
        when(repository.save(any(SkillExecutionRecord.class))).thenReturn(testRecord);

        service.markAsFailed(1L, "timeout error", 5000);

        verify(repository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("应该查询对话历史")
    public void testGetConversationHistory() throws Exception {
        List<SkillExecutionRecord> records = Arrays.asList(testRecord, testRecord);
        when(repository.findTop100ByConversationIdOrderByCreatedAtDesc(1L))
            .thenReturn(records);
        doReturn(Arrays.asList()).when(objectMapper).readValue(anyString(), any(com.fasterxml.jackson.core.type.TypeReference.class));

        List<SkillExecutionRecordDTO> result = service.getConversationHistory(1L, 100);

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(repository, times(1)).findTop100ByConversationIdOrderByCreatedAtDesc(1L);
    }

    @Test
    @DisplayName("应该分页查询对话历史")
    public void testGetConversationHistoryPaged() throws Exception {
        Page<SkillExecutionRecord> page = new PageImpl<>(
            Arrays.asList(testRecord),
            PageRequest.of(0, 10),
            1
        );
        when(repository.findByConversationIdOrderByCreatedAtDesc(eq(1L), any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);
        doReturn(Arrays.asList()).when(objectMapper).readValue(anyString(), any(com.fasterxml.jackson.core.type.TypeReference.class));

        Page<SkillExecutionRecordDTO> result = service.getConversationHistoryPaged(1L, 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("应该获取用户统计")
    public void testGetUserStatistics() {
        when(repository.countByUserIdAndDecisionAndCreatedAtBetween(
            eq(1L), eq("APPLIED"), any(), any())).thenReturn(5L);
        
        List<SkillExecutionRecord> records = Arrays.asList(testRecord);
        when(repository.findByUserIdAndCreatedAtBetween(eq(1L), any(), any()))
            .thenReturn(records);

        LocalDateTime now = LocalDateTime.now();
        SkillStatistics stats = service.getUserStatistics(1L, now.minusDays(7), now);

        assertNotNull(stats);
        assertEquals(5L, stats.getTotalCount());
    }

    @Test
    @DisplayName("应该获取技能统计")
    public void testGetSkillStatistics() {
        when(repository.countBySkillIdAndDecision(100L, "APPLIED")).thenReturn(10L);
        when(repository.countBySkillIdAndExecutionStatus(100L, "COMPLETED")).thenReturn(8L);
        when(repository.countBySkillIdAndExecutionStatus(100L, "FAILED")).thenReturn(2L);
        when(repository.getAverageScoreForSkill(eq(100L), any(), any())).thenReturn(82.5);
        when(repository.getSuccessRateForSkill(eq(100L), any(), any())).thenReturn(80.0);
        when(repository.getAverageDurationForSkill(eq(100L), any(), any())).thenReturn(150.0);

        LocalDateTime now = LocalDateTime.now();
        SkillStatistics stats = service.getSkillStatistics(100L, now.minusDays(7), now);

        assertNotNull(stats);
        assertEquals(10L, stats.getAppliedCount());
        assertEquals(8L, stats.getCompletedCount());
        assertEquals(82.5, stats.getAverageScore());
    }

    @Test
    @DisplayName("应该查询最近的失败")
    public void testGetRecentFailures() throws Exception {
        testRecord.setExecutionStatus(ExecutionStatus.FAILED);
        List<SkillExecutionRecord> failures = Arrays.asList(testRecord);
        when(repository.findByExecutionStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
            eq("FAILED"), any(), any())).thenReturn(failures);
        doReturn(Arrays.asList()).when(objectMapper).readValue(anyString(), any(com.fasterxml.jackson.core.type.TypeReference.class));

        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        List<SkillExecutionRecordDTO> result = service.getRecentFailures(10, oneDayAgo);

        assertNotNull(result);
        assertFalse(result.isEmpty());
    }
}
