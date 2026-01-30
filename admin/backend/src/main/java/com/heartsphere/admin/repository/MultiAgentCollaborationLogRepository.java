package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.MultiAgentCollaborationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 多智能体协作日志 Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface MultiAgentCollaborationLogRepository extends JpaRepository<MultiAgentCollaborationLog, Long> {

    /**
     * 根据协作ID查找
     */
    Optional<MultiAgentCollaborationLog> findByCollaborationId(String collaborationId);

    /**
     * 根据用户ID查找
     */
    List<MultiAgentCollaborationLog> findByUserId(String userId);

    /**
     * 根据状态查找
     */
    List<MultiAgentCollaborationLog> findByStatus(String status);

    /**
     * 根据状态和时间范围查找（分页）
     */
    Page<MultiAgentCollaborationLog> findByStatusAndCreatedAtBetween(
        String status,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Pageable pageable
    );

    /**
     * 根据时间范围查找（分页）
     */
    Page<MultiAgentCollaborationLog> findByCreatedAtBetween(
        LocalDateTime startTime,
        LocalDateTime endTime,
        Pageable pageable
    );

    /**
     * 统计指定时间范围内的协作数量
     */
    @Query("SELECT COUNT(l) FROM MultiAgentCollaborationLog l WHERE l.createdAt BETWEEN :startTime AND :endTime")
    Long countByCreatedAtBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 统计指定状态和时间范围内的协作数量
     */
    @Query("SELECT COUNT(l) FROM MultiAgentCollaborationLog l WHERE l.status = :status AND l.createdAt BETWEEN :startTime AND :endTime")
    Long countByStatusAndCreatedAtBetween(
        @Param("status") String status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * 统计成功率
     */
    @Query("SELECT COUNT(l) FROM MultiAgentCollaborationLog l WHERE l.success = true AND l.createdAt BETWEEN :startTime AND :endTime")
    Long countSuccessfulByCreatedAtBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 计算平均执行时间
     */
    @Query("SELECT AVG(l.executionTimeMs) FROM MultiAgentCollaborationLog l WHERE l.executionTimeMs IS NOT NULL AND l.createdAt BETWEEN :startTime AND :endTime")
    Double calculateAverageExecutionTime(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
