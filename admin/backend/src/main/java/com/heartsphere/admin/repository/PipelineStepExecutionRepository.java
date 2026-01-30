package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PipelineStepExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 步骤执行记录Repository
 */
@Repository
public interface PipelineStepExecutionRepository extends JpaRepository<PipelineStepExecution, Long> {
    
    /**
     * 根据流程执行ID查询所有步骤执行记录
     */
    List<PipelineStepExecution> findByPipelineExecutionIdOrderByStartedAtAsc(Long pipelineExecutionId);
    
    /**
     * 根据步骤ID查询执行记录
     */
    List<PipelineStepExecution> findByStepId(Long stepId);
    
    /**
     * 根据脚本执行ID查询步骤执行记录
     */
    PipelineStepExecution findByScriptExecutionId(Long scriptExecutionId);
}
