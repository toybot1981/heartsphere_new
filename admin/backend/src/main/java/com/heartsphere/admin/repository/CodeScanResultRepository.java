package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.CodeScanResult;
import com.heartsphere.admin.entity.PipelineExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 代码扫描结果Repository
 */
@Repository
public interface CodeScanResultRepository extends JpaRepository<CodeScanResult, Long> {
    
    List<CodeScanResult> findByPipelineExecution(PipelineExecution execution);
    
    List<CodeScanResult> findByPipelineExecutionAndScanTool(
            PipelineExecution execution, 
            CodeScanResult.ScanTool scanTool);
}
