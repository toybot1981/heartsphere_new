package com.heartsphere.ai.skill.repository;

import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.enums.ExecutionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 技能执行记录 Repository
 * 提供数据持久化操作
 */
@Repository
public interface SkillExecutionRecordRepository extends JpaRepository<SkillExecutionRecord, Long> {

    // ==================== 基础查询 ====================

    /**
     * 按对话ID查询记录（分页）
     */
    Page<SkillExecutionRecord> findByConversationIdOrderByCreatedAtDesc(
        Long conversationId,
        Pageable pageable
    );

    /**
     * 按对话ID查询最近的记录
     */
    List<SkillExecutionRecord> findTop100ByConversationIdOrderByCreatedAtDesc(
        Long conversationId
    );

    /**
     * 按技能ID和时间范围查询
     */
    List<SkillExecutionRecord> findBySkillIdAndCreatedAtBetween(
        Long skillId,
        LocalDateTime startTime,
        LocalDateTime endTime
    );

    /**
     * 按用户ID查询（分页）
     */
    Page<SkillExecutionRecord> findByUserIdOrderByCreatedAtDesc(
        Long userId,
        Pageable pageable
    );

    /**
     * 按用户ID和时间范围查询
     */
    List<SkillExecutionRecord> findByUserIdAndCreatedAtBetween(
        Long userId,
        LocalDateTime startTime,
        LocalDateTime endTime
    );

    // ==================== 统计查询 ====================

    /**
     * 统计技能的被应用次数
     */
    long countBySkillIdAndDecision(Long skillId, String decision);

    /**
     * 统计技能的执行成功次数
     */
    long countBySkillIdAndExecutionStatus(Long skillId, String status);

    /**
     * 统计用户的技能使用次数
     */
    long countByUserIdAndDecisionAndCreatedAtBetween(
        Long userId,
        String decision,
        LocalDateTime startTime,
        LocalDateTime endTime
    );

    // ==================== 复杂查询 ====================

    /**
     * 查询特定对话中特定技能的执行记录
     */
    Optional<SkillExecutionRecord> findFirstByConversationIdAndSkillIdOrderByCreatedAtDesc(
        Long conversationId,
        Long skillId
    );

    /**
     * 查询指定时间内失败的执行记录
     */
    List<SkillExecutionRecord> findByExecutionStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
        String status,
        LocalDateTime startTime,
        LocalDateTime endTime
    );

    /**
     * 查询评分高于阈值的记录
     */
    @Query("SELECT r FROM SkillExecutionRecord r " +
           "WHERE r.compositeScore >= :minScore " +
           "AND r.skillId = :skillId " +
           "AND r.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY r.createdAt DESC")
    List<SkillExecutionRecord> findHighScoredRecords(
        @Param("skillId") Long skillId,
        @Param("minScore") Integer minScore,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * 查询技能的平均评分
     */
    @Query("SELECT AVG(r.compositeScore) FROM SkillExecutionRecord r " +
           "WHERE r.skillId = :skillId " +
           "AND r.createdAt BETWEEN :startTime AND :endTime")
    Double getAverageScoreForSkill(
        @Param("skillId") Long skillId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * 查询技能的成功率
     */
    @Query("SELECT " +
           "  COUNT(CASE WHEN r.executionStatus = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*) " +
           "FROM SkillExecutionRecord r " +
           "WHERE r.skillId = :skillId " +
           "AND r.decision = 'APPLIED' " +
           "AND r.createdAt BETWEEN :startTime AND :endTime")
    Double getSuccessRateForSkill(
        @Param("skillId") Long skillId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * 查询平均执行耗时
     */
    @Query("SELECT AVG(r.executionDurationMs) FROM SkillExecutionRecord r " +
           "WHERE r.skillId = :skillId " +
           "AND r.createdAt BETWEEN :startTime AND :endTime " +
           "AND r.executionDurationMs IS NOT NULL")
    Double getAverageDurationForSkill(
        @Param("skillId") Long skillId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    // ==================== 归档相关查询 ====================
    
    /**
     * 查询指定时间前的记录（用于归档）
     */
    List<SkillExecutionRecord> findByCreatedAtBefore(LocalDateTime threshold);
    
    /**
     * 查询指定时间前且指定状态的记录（用于清理）
     */
    List<SkillExecutionRecord> findByCreatedAtBeforeAndExecutionStatus(
        LocalDateTime threshold, ExecutionStatus status);
    
    /**
     * 按技能ID查询
     */
    List<SkillExecutionRecord> findBySkillId(Long skillId);

    // ==================== 删除/归档操作 ====================

    /**
     * 删除指定时间前的记录（用于数据归档）
     */
    long deleteByCreatedAtBefore(LocalDateTime before);

    /**
     * 删除指定对话的所有记录
     */
    long deleteByConversationId(Long conversationId);

    /**
     * 删除指定技能的所有记录
     */
    long deleteBySkillId(Long skillId);
}
