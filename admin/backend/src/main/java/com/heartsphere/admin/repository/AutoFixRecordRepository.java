package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.AutoFixRecord;
import com.heartsphere.admin.entity.PipelineExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 自动修复记录Repository
 */
@Repository
public interface AutoFixRecordRepository extends JpaRepository<AutoFixRecord, Long> {
    
    /**
     * 根据流程执行ID查找修复记录
     */
    List<AutoFixRecord> findByPipelineExecutionOrderByCreatedAtDesc(PipelineExecution execution);
    
    /**
     * 根据状态查找修复记录
     */
    List<AutoFixRecord> findByStatusOrderByCreatedAtDesc(AutoFixRecord.FixStatus status);
    
    /**
     * 根据问题类型查找修复记录
     */
    List<AutoFixRecord> findByProblemTypeOrderByCreatedAtDesc(AutoFixRecord.ProblemType problemType);
}
