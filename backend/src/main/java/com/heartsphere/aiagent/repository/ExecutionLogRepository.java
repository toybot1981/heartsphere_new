package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.ExecutionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Graph执行日志Repository
 */
@Repository
public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, Long> {
    
    /**
     * 根据执行ID查找所有日志
     */
    List<ExecutionLog> findByExecutionIdOrderByStepNumberAscCreatedAtAsc(String executionId);
    
    /**
     * 根据执行ID和节点ID查找日志
     */
    List<ExecutionLog> findByExecutionIdAndNodeIdOrderByCreatedAtAsc(String executionId, String nodeId);
    
    /**
     * 根据执行ID和日志类型查找日志
     */
    List<ExecutionLog> findByExecutionIdAndLogTypeOrderByCreatedAtAsc(String executionId, String logType);
    
    /**
     * 根据执行ID分页查询日志
     */
    Page<ExecutionLog> findByExecutionIdOrderByStepNumberAscCreatedAtAsc(String executionId, Pageable pageable);
    
    /**
     * 根据Graph ID查找日志（分页）
     */
    Page<ExecutionLog> findByGraphIdOrderByCreatedAtDesc(Long graphId, Pageable pageable);
    
    /**
     * 根据时间范围查找日志
     */
    Page<ExecutionLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startTime, 
            LocalDateTime endTime, 
            Pageable pageable
    );
    
    /**
     * 复杂查询：根据多个条件查询日志
     */
    @Query("SELECT e FROM ExecutionLog e WHERE " +
           "(:executionId IS NULL OR e.executionId = :executionId) AND " +
           "(:graphId IS NULL OR e.graphId = :graphId) AND " +
           "(:nodeId IS NULL OR e.nodeId = :nodeId) AND " +
           "(:logType IS NULL OR e.logType = :logType) AND " +
           "(:startTime IS NULL OR e.createdAt >= :startTime) AND " +
           "(:endTime IS NULL OR e.createdAt <= :endTime) " +
           "ORDER BY e.stepNumber ASC, e.createdAt ASC")
    Page<ExecutionLog> findByConditions(
            @Param("executionId") String executionId,
            @Param("graphId") Long graphId,
            @Param("nodeId") String nodeId,
            @Param("logType") String logType,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );
    
    /**
     * 删除指定执行ID的所有日志
     */
    void deleteByExecutionId(String executionId);
    
    /**
     * 删除指定时间之前的日志
     */
    void deleteByCreatedAtBefore(LocalDateTime beforeTime);
}
