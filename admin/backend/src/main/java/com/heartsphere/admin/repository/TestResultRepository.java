package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 测试结果Repository
 */
@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    
    List<TestResult> findByPipelineExecution(PipelineExecution execution);
    
    List<TestResult> findByPipelineExecutionAndTestType(
            PipelineExecution execution, 
            TestResult.TestType testType);
}
