package com.heartsphere.mentis.demo.repository;

import com.heartsphere.mentis.demo.model.ToolCallLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工具调用日志 Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface ToolCallLogRepository extends JpaRepository<ToolCallLog, Long> {
    
    /**
     * 根据会话ID查询工具调用日志
     */
    List<ToolCallLog> findBySessionIdOrderByStartTimeDesc(String sessionId);
    
    /**
     * 根据会话ID和时间范围查询工具调用日志
     */
    @Query("SELECT t FROM ToolCallLog t WHERE t.sessionId = :sessionId " +
           "AND t.startTime >= :startTime AND t.startTime <= :endTime " +
           "ORDER BY t.startTime DESC")
    List<ToolCallLog> findBySessionIdAndTimeRange(
        @Param("sessionId") String sessionId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    /**
     * 根据工具名称查询工具调用日志
     */
    Page<ToolCallLog> findByToolNameOrderByStartTimeDesc(String toolName, Pageable pageable);
    
    /**
     * 根据状态查询工具调用日志
     */
    List<ToolCallLog> findByStatusOrderByStartTimeDesc(ToolCallLog.ToolCallStatus status);
    
    /**
     * 根据会话ID和工具名称查询
     */
    List<ToolCallLog> findBySessionIdAndToolNameOrderByStartTimeDesc(
        String sessionId, 
        String toolName
    );
    
    /**
     * 统计工具调用次数
     */
    @Query("SELECT COUNT(t) FROM ToolCallLog t WHERE t.sessionId = :sessionId")
    long countBySessionId(@Param("sessionId") String sessionId);
    
    /**
     * 统计成功/失败的次数
     */
    @Query("SELECT COUNT(t) FROM ToolCallLog t WHERE t.sessionId = :sessionId AND t.status = :status")
    long countBySessionIdAndStatus(
        @Param("sessionId") String sessionId,
        @Param("status") ToolCallLog.ToolCallStatus status
    );
    
    /**
     * 计算平均执行时间
     */
    @Query("SELECT AVG(t.duration) FROM ToolCallLog t WHERE t.sessionId = :sessionId AND t.duration IS NOT NULL")
    Double averageDurationBySessionId(@Param("sessionId") String sessionId);
}
