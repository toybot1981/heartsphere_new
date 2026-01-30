package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PipelineStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 流程步骤Repository
 */
@Repository
public interface PipelineStepRepository extends JpaRepository<PipelineStep, Long> {
    
    /**
     * 根据流程ID查询所有步骤
     */
    List<PipelineStep> findByPipelineIdOrderByOrderAsc(Long pipelineId);
    
    /**
     * 删除流程的所有步骤
     */
    void deleteByPipelineId(Long pipelineId);
}
