package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.ScriptExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 脚本执行记录 Repository
 */
@Repository
public interface ScriptExecutionRepository extends JpaRepository<ScriptExecution, Long> {
    
    /**
     * 根据脚本ID查询执行记录
     */
    Page<ScriptExecution> findByScriptIdOrderByStartedAtDesc(String scriptId, Pageable pageable);
    
    /**
     * 根据执行者查询执行记录
     */
    Page<ScriptExecution> findByExecutedByIdOrderByStartedAtDesc(Long executedById, Pageable pageable);
    
    /**
     * 根据状态查询执行记录
     */
    Page<ScriptExecution> findByStatusOrderByStartedAtDesc(ScriptExecution.ExecutionStatus status, Pageable pageable);
    
    /**
     * 根据时间范围查询执行记录
     */
    @Query("SELECT se FROM ScriptExecution se WHERE se.startedAt >= :startTime AND se.startedAt <= :endTime ORDER BY se.startedAt DESC")
    Page<ScriptExecution> findByTimeRange(@Param("startTime") LocalDateTime startTime, 
                                         @Param("endTime") LocalDateTime endTime, 
                                         Pageable pageable);
    
    /**
     * 查询运行中的执行记录
     */
    List<ScriptExecution> findByStatus(ScriptExecution.ExecutionStatus status);
    
    /**
     * 根据定时任务查询执行记录
     */
    Page<ScriptExecution> findByScheduledTaskIdOrderByStartedAtDesc(Long scheduledTaskId, Pageable pageable);
    
    /**
     * 统计今日执行数量
     */
    @Query("SELECT COUNT(se) FROM ScriptExecution se WHERE DATE(se.startedAt) = CURRENT_DATE")
    Long countTodayExecutions();
    
    /**
     * 统计今日成功执行数量
     */
    @Query("SELECT COUNT(se) FROM ScriptExecution se WHERE DATE(se.startedAt) = CURRENT_DATE AND se.status = 'SUCCESS'")
    Long countTodaySuccessExecutions();
    
    /**
     * 统计今日失败执行数量
     */
    @Query("SELECT COUNT(se) FROM ScriptExecution se WHERE DATE(se.startedAt) = CURRENT_DATE AND se.status = 'FAILED'")
    Long countTodayFailedExecutions();
    
    /**
     * 组合查询：根据多个条件查询执行记录
     * 使用原生 SQL 查询以支持 NULL 参数检查
     */
    @Query(value = "SELECT * FROM script_executions se WHERE " +
           "(:scriptId IS NULL OR se.script_id = :scriptId) AND " +
           "(:statusStr IS NULL OR se.status = :statusStr) AND " +
           "(:executedById IS NULL OR se.executed_by = :executedById) AND " +
           "(:startTime IS NULL OR se.started_at >= :startTime) AND " +
           "(:endTime IS NULL OR se.started_at <= :endTime) " +
           "ORDER BY se.started_at DESC",
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM script_executions se WHERE " +
           "(:scriptId IS NULL OR se.script_id = :scriptId) AND " +
           "(:statusStr IS NULL OR se.status = :statusStr) AND " +
           "(:executedById IS NULL OR se.executed_by = :executedById) AND " +
           "(:startTime IS NULL OR se.started_at >= :startTime) AND " +
           "(:endTime IS NULL OR se.started_at <= :endTime)")
    Page<ScriptExecution> findByConditions(
            @Param("scriptId") String scriptId,
            @Param("statusStr") String statusStr,
            @Param("executedById") Long executedById,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );
}
