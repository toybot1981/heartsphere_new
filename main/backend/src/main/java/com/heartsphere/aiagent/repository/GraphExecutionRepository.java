package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.GraphExecution;
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
 * Graph执行Repository
 */
@Repository
public interface GraphExecutionRepository extends JpaRepository<GraphExecution, Long> {
    
    /**
     * 根据执行ID查找
     */
    Optional<GraphExecution> findByExecutionId(String executionId);
    
    /**
     * 根据Graph ID查找所有执行记录
     */
    List<GraphExecution> findByGraphId(Long graphId);
    
    /**
     * 根据状态查找执行记录
     */
    List<GraphExecution> findByStatus(String status);
    
    /**
     * 根据Graph ID和状态查找执行记录
     */
    List<GraphExecution> findByGraphIdAndStatus(Long graphId, String status);
    
    /**
     * 分页查询执行记录（根据Graph ID）
     */
    Page<GraphExecution> findByGraphId(Long graphId, Pageable pageable);
    
    /**
     * 分页查询执行记录（根据状态）
     */
    Page<GraphExecution> findByStatus(String status, Pageable pageable);
    
    /**
     * 分页查询执行记录（根据Graph ID和状态）
     */
    Page<GraphExecution> findByGraphIdAndStatus(Long graphId, String status, Pageable pageable);
    
    /**
     * 分页查询执行记录（根据创建者）
     */
    Page<GraphExecution> findByCreatedBy(Long createdBy, Pageable pageable);
    
    /**
     * 分页查询执行记录（根据时间范围）
     */
    Page<GraphExecution> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 复杂查询：根据多个条件查询执行记录
     */
    @Query("SELECT e FROM GraphExecution e WHERE " +
           "(:graphId IS NULL OR e.graphId = :graphId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:createdBy IS NULL OR e.createdBy = :createdBy) AND " +
           "(:startTime IS NULL OR e.createdAt >= :startTime) AND " +
           "(:endTime IS NULL OR e.createdAt <= :endTime) " +
           "ORDER BY e.createdAt DESC")
    Page<GraphExecution> findByConditions(
            @Param("graphId") Long graphId,
            @Param("status") String status,
            @Param("createdBy") Long createdBy,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );
    
    /**
     * 删除指定时间之前的已完成或失败或取消的执行记录
     */
    void deleteByStatusInAndCompletedAtBefore(List<String> statuses, LocalDateTime beforeTime);
    
    /**
     * 统计指定Graph的执行记录数
     */
    long countByGraphId(Long graphId);
    
    /**
     * 统计指定状态的执行记录数
     */
    long countByStatus(String status);
}
