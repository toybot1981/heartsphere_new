package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PipelineExecution;
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
 * 流程执行记录Repository
 */
@Repository
public interface PipelineExecutionRepository extends JpaRepository<PipelineExecution, Long> {
    
    /**
     * 根据流程ID查询执行记录
     */
    List<PipelineExecution> findByPipelineIdOrderByStartedAtDesc(Long pipelineId);
    
    /**
     * 根据流程ID分页查询执行记录
     */
    Page<PipelineExecution> findByPipelineIdOrderByStartedAtDesc(Long pipelineId, Pageable pageable);
    
    /**
     * 根据流程ID分页查询执行记录（立即加载 stepExecutions）
     */
    @Query("SELECT DISTINCT pe FROM PipelineExecution pe " +
           "LEFT JOIN FETCH pe.stepExecutions se " +
           "LEFT JOIN FETCH se.step " +
           "LEFT JOIN FETCH se.scriptExecution " +
           "LEFT JOIN FETCH pe.pipeline " +
           "LEFT JOIN FETCH pe.executedBy " +
           "WHERE pe.pipeline.id = :pipelineId " +
           "ORDER BY pe.startedAt DESC")
    List<PipelineExecution> findByPipelineIdWithStepExecutions(@Param("pipelineId") Long pipelineId);
    
    /**
     * 根据执行者分页查询执行记录（立即加载 stepExecutions）
     */
    @Query("SELECT DISTINCT pe FROM PipelineExecution pe " +
           "LEFT JOIN FETCH pe.stepExecutions se " +
           "LEFT JOIN FETCH se.step " +
           "LEFT JOIN FETCH se.scriptExecution " +
           "LEFT JOIN FETCH pe.pipeline " +
           "LEFT JOIN FETCH pe.executedBy " +
           "WHERE pe.executedBy.id = :executedById " +
           "ORDER BY pe.startedAt DESC")
    List<PipelineExecution> findByExecutedByIdWithStepExecutions(@Param("executedById") Long executedById);
    
    /**
     * 分页查询所有执行记录（立即加载 stepExecutions）
     */
    @Query("SELECT DISTINCT pe FROM PipelineExecution pe " +
           "LEFT JOIN FETCH pe.stepExecutions se " +
           "LEFT JOIN FETCH se.step " +
           "LEFT JOIN FETCH se.scriptExecution " +
           "LEFT JOIN FETCH pe.pipeline " +
           "LEFT JOIN FETCH pe.executedBy " +
           "ORDER BY pe.startedAt DESC")
    List<PipelineExecution> findAllWithStepExecutions();
    
    /**
     * 根据执行者查询执行记录
     */
    Page<PipelineExecution> findByExecutedByIdOrderByStartedAtDesc(Long executedById, Pageable pageable);
    
    /**
     * 根据状态查询执行记录
     */
    List<PipelineExecution> findByStatus(PipelineExecution.ExecutionStatus status);
    
    /**
     * 查询指定时间范围内的执行记录
     */
    @Query("SELECT pe FROM PipelineExecution pe WHERE pe.startedAt BETWEEN :startTime AND :endTime ORDER BY pe.startedAt DESC")
    List<PipelineExecution> findByStartedAtBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    
    /**
     * 分页查询所有执行记录
     */
    Page<PipelineExecution> findAllByOrderByStartedAtDesc(Pageable pageable);
    
    /**
     * 根据ID查询流程执行记录（立即加载 stepExecutions 及其关联关系）
     * 注意：不能同时 JOIN FETCH 多个集合（bags），所以不加载 pipeline
     * pipeline 使用延迟加载，在需要时单独查询，且只访问基本属性（id, name），不访问 steps
     */
    @Query("SELECT DISTINCT pe FROM PipelineExecution pe " +
           "LEFT JOIN FETCH pe.stepExecutions se " +
           "LEFT JOIN FETCH se.step " +
           "LEFT JOIN FETCH se.scriptExecution " +
           "LEFT JOIN FETCH pe.executedBy " +
           "LEFT JOIN FETCH pe.pipeline " +
           "WHERE pe.id = :id")
    Optional<PipelineExecution> findByIdWithStepExecutions(@Param("id") Long id);
}
