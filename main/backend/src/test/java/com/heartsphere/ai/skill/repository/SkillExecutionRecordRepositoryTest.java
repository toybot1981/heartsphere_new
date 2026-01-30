package com.heartsphere.ai.skill.repository;

import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.enums.ExecutionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 技能执行记录 Repository 测试
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("技能执行记录 Repository 测试")
public class SkillExecutionRecordRepositoryTest {

    @Autowired
    private SkillExecutionRecordRepository repository;

    @Autowired
    private TestEntityManager entityManager;

    private SkillExecutionRecord testRecord;

    @BeforeEach
    public void setUp() {
        testRecord = SkillExecutionRecord.builder()
            .conversationId(1L)
            .skillId(100L)
            .userId(1L)
            .roleId(1L)
            .semanticScore(85)
            .contextScore(80)
            .memoryScore(75)
            .compositeScore(80)
            .decision("APPLIED")
            .executionStatus(ExecutionStatus.COMPLETED)
            .executionDurationMs(100)
            .evaluationTimestamp(LocalDateTime.now())
            .build();
    }

    @Test
    @DisplayName("应该保存和查询执行记录")
    public void testSaveAndFindById() {
        SkillExecutionRecord saved = repository.save(testRecord);
        entityManager.flush();

        Optional<SkillExecutionRecord> found = repository.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals(100L, found.get().getSkillId());
        assertEquals(80, found.get().getCompositeScore());
    }

    @Test
    @DisplayName("应该按对话ID查询记录")
    public void testFindByConversationId() {
        repository.save(testRecord);
        repository.save(SkillExecutionRecord.builder()
            .conversationId(1L)
            .skillId(101L)
            .userId(1L)
            .compositeScore(75)
            .decision("APPLIED")
            .executionStatus(ExecutionStatus.COMPLETED)
            .build());
        entityManager.flush();

        List<SkillExecutionRecord> records = repository
            .findTop100ByConversationIdOrderByCreatedAtDesc(1L);

        assertEquals(2, records.size());
    }

    @Test
    @DisplayName("应该统计被应用的次数")
    public void testCountBySkillIdAndDecision() {
        repository.save(testRecord);
        repository.save(SkillExecutionRecord.builder()
            .skillId(100L)
            .userId(1L)
            .conversationId(2L)
            .decision("REJECTED")
            .build());
        entityManager.flush();

        long appliedCount = repository.countBySkillIdAndDecision(100L, "APPLIED");
        long rejectedCount = repository.countBySkillIdAndDecision(100L, "REJECTED");

        assertEquals(1, appliedCount);
        assertEquals(1, rejectedCount);
    }

    @Test
    @DisplayName("应该统计执行状态")
    public void testCountBySkillIdAndExecutionStatus() {
        repository.save(testRecord);
        repository.save(SkillExecutionRecord.builder()
            .skillId(100L)
            .userId(1L)
            .conversationId(2L)
            .executionStatus(ExecutionStatus.FAILED)
            .build());
        entityManager.flush();

        long completedCount = repository.countBySkillIdAndExecutionStatus(100L, "COMPLETED");
        long failedCount = repository.countBySkillIdAndExecutionStatus(100L, "FAILED");

        assertEquals(1, completedCount);
        assertEquals(1, failedCount);
    }

    @Test
    @DisplayName("应该查询最近的记录")
    public void testFindFirstByConversationIdAndSkillId() {
        repository.save(testRecord);
        entityManager.flush();

        Optional<SkillExecutionRecord> latest = repository
            .findFirstByConversationIdAndSkillIdOrderByCreatedAtDesc(1L, 100L);

        assertTrue(latest.isPresent());
        assertEquals(80, latest.get().getCompositeScore());
    }

    @Test
    @DisplayName("应该查询失败的记录")
    public void testFindFailedRecords() {
        testRecord.setExecutionStatus(ExecutionStatus.FAILED);
        testRecord.setErrorMessage("执行超时");
        repository.save(testRecord);
        entityManager.flush();

        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        List<SkillExecutionRecord> failures = repository
            .findByExecutionStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                "FAILED",
                oneDayAgo,
                LocalDateTime.now()
            );

        assertFalse(failures.isEmpty());
        assertTrue(failures.stream()
            .allMatch(r -> r.getExecutionStatus() == ExecutionStatus.FAILED));
    }

    @Test
    @DisplayName("应该删除过期的记录")
    public void testDeleteByCreatedAtBefore() {
        repository.save(testRecord);
        entityManager.flush();

        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        long deletedCount = repository.deleteByCreatedAtBefore(tomorrow);

        assertTrue(deletedCount > 0);
        assertTrue(repository.findAll().isEmpty());
    }

    @Test
    @DisplayName("应该按用户ID查询统计")
    public void testCountByUserIdAndDecision() {
        testRecord.setUserId(1L);
        repository.save(testRecord);
        entityManager.flush();

        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        long count = repository.countByUserIdAndDecisionAndCreatedAtBetween(
            1L,
            "APPLIED",
            oneDayAgo,
            LocalDateTime.now()
        );

        assertEquals(1, count);
    }
}
