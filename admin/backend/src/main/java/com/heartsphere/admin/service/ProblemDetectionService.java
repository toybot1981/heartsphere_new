package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.*;
import com.heartsphere.admin.entity.AutoFixRecord.ProblemType;
import com.heartsphere.admin.entity.AutoFixRecord.RiskLevel;
import com.heartsphere.admin.repository.CodeScanResultRepository;
import com.heartsphere.admin.repository.TestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 问题检测服务
 */
@Service
public class ProblemDetectionService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProblemDetectionService.class);
    
    @Autowired
    private CodeScanResultRepository codeScanResultRepository;
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    /**
     * 检测流程执行中的问题
     */
    public List<DetectedProblem> detectProblems(PipelineExecution execution) {
        List<DetectedProblem> problems = new ArrayList<>();
        
        // 检测代码质量问题
        problems.addAll(detectCodeQualityProblems(execution));
        
        // 检测测试失败问题
        problems.addAll(detectTestFailures(execution));
        
        // 检测构建失败问题
        problems.addAll(detectBuildFailures(execution));
        
        // 检测部署失败问题
        problems.addAll(detectDeploymentFailures(execution));
        
        return problems;
    }
    
    /**
     * 检测代码质量问题
     */
    private List<DetectedProblem> detectCodeQualityProblems(PipelineExecution execution) {
        List<DetectedProblem> problems = new ArrayList<>();
        
        List<CodeScanResult> scanResults = codeScanResultRepository.findByPipelineExecution(execution);
        for (CodeScanResult result : scanResults) {
            // 检测严重问题
            if (result.getCriticalIssues() != null && result.getCriticalIssues() > 0) {
                DetectedProblem problem = new DetectedProblem();
                problem.setProblemType(ProblemType.CODE_QUALITY);
                problem.setRiskLevel(RiskLevel.HIGH);
                problem.setDescription(String.format("发现 %d 个严重代码质量问题", result.getCriticalIssues()));
                problem.setDetails(Map.of(
                    "scanTool", result.getScanTool().name(),
                    "criticalIssues", result.getCriticalIssues(),
                    "majorIssues", result.getMajorIssues() != null ? result.getMajorIssues() : 0,
                    "minorIssues", result.getMinorIssues() != null ? result.getMinorIssues() : 0
                ));
                problems.add(problem);
            }
            
            // 检测扫描分数过低
            if (result.getScore() != null && result.getScore() < 80.0) {
                DetectedProblem problem = new DetectedProblem();
                problem.setProblemType(ProblemType.CODE_QUALITY);
                problem.setRiskLevel(RiskLevel.MEDIUM);
                problem.setDescription(String.format("代码扫描分数 %.2f 低于阈值 80.0", result.getScore()));
                problem.setDetails(Map.of(
                    "scanTool", result.getScanTool().name(),
                    "score", result.getScore(),
                    "threshold", 80.0
                ));
                problems.add(problem);
            }
        }
        
        return problems;
    }
    
    /**
     * 检测测试失败问题
     */
    private List<DetectedProblem> detectTestFailures(PipelineExecution execution) {
        List<DetectedProblem> problems = new ArrayList<>();
        
        List<TestResult> testResults = testResultRepository.findByPipelineExecution(execution);
        for (TestResult result : testResults) {
            // 检测测试失败
            if (result.getFailedTests() != null && result.getFailedTests() > 0) {
                DetectedProblem problem = new DetectedProblem();
                problem.setProblemType(ProblemType.TEST_FAILURE);
                problem.setRiskLevel(RiskLevel.HIGH);
                problem.setDescription(String.format("%s 测试失败: %d 个测试用例失败", 
                    result.getTestType(), result.getFailedTests()));
                problem.setDetails(Map.of(
                    "testType", result.getTestType().name(),
                    "totalTests", result.getTotalTests() != null ? result.getTotalTests() : 0,
                    "passedTests", result.getPassedTests() != null ? result.getPassedTests() : 0,
                    "failedTests", result.getFailedTests(),
                    "skippedTests", result.getSkippedTests() != null ? result.getSkippedTests() : 0
                ));
                problems.add(problem);
            }
            
            // 检测测试覆盖率过低
            if (result.getCoveragePercentage() != null && result.getCoveragePercentage() < 80.0) {
                DetectedProblem problem = new DetectedProblem();
                problem.setProblemType(ProblemType.TEST_FAILURE);
                problem.setRiskLevel(RiskLevel.MEDIUM);
                problem.setDescription(String.format("%s 测试覆盖率 %.2f%% 低于阈值 80.0%%", 
                    result.getTestType(), result.getCoveragePercentage()));
                problem.setDetails(Map.of(
                    "testType", result.getTestType().name(),
                    "coverage", result.getCoveragePercentage(),
                    "threshold", 80.0
                ));
                problems.add(problem);
            }
        }
        
        return problems;
    }
    
    /**
     * 检测构建失败问题
     */
    private List<DetectedProblem> detectBuildFailures(PipelineExecution execution) {
        List<DetectedProblem> problems = new ArrayList<>();
        
        // 检查流程执行状态
        if (execution.getStatus() == PipelineExecution.ExecutionStatus.FAILED) {
            // 检查步骤执行记录，找出失败的构建步骤
            // TODO: 从 PipelineStepExecution 中分析构建失败原因
            DetectedProblem problem = new DetectedProblem();
            problem.setProblemType(ProblemType.BUILD_FAILURE);
            problem.setRiskLevel(RiskLevel.HIGH);
            problem.setDescription("构建失败");
            problem.setDetails(Map.of(
                "executionId", execution.getId(),
                "status", execution.getStatus().name()
            ));
            problems.add(problem);
        }
        
        return problems;
    }
    
    /**
     * 检测部署失败问题
     */
    private List<DetectedProblem> detectDeploymentFailures(PipelineExecution execution) {
        List<DetectedProblem> problems = new ArrayList<>();
        
        // 检查流程执行状态
        if (execution.getStatus() == PipelineExecution.ExecutionStatus.FAILED) {
            // TODO: 从 PipelineStepExecution 中分析部署失败原因
            DetectedProblem problem = new DetectedProblem();
            problem.setProblemType(ProblemType.DEPLOYMENT_FAILURE);
            problem.setRiskLevel(RiskLevel.HIGH);
            problem.setDescription("部署失败");
            problem.setDetails(Map.of(
                "executionId", execution.getId(),
                "status", execution.getStatus().name()
            ));
            problems.add(problem);
        }
        
        return problems;
    }
    
    /**
     * 检测到的问题
     */
    public static class DetectedProblem {
        private ProblemType problemType;
        private RiskLevel riskLevel;
        private String description;
        private Map<String, Object> details;
        private boolean fixable;
        private String fixStrategy;
        
        public ProblemType getProblemType() {
            return problemType;
        }
        
        public void setProblemType(ProblemType problemType) {
            this.problemType = problemType;
        }
        
        public RiskLevel getRiskLevel() {
            return riskLevel;
        }
        
        public void setRiskLevel(RiskLevel riskLevel) {
            this.riskLevel = riskLevel;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public Map<String, Object> getDetails() {
            return details;
        }
        
        public void setDetails(Map<String, Object> details) {
            this.details = details;
        }
        
        public boolean isFixable() {
            return fixable;
        }
        
        public void setFixable(boolean fixable) {
            this.fixable = fixable;
        }
        
        public String getFixStrategy() {
            return fixStrategy;
        }
        
        public void setFixStrategy(String fixStrategy) {
            this.fixStrategy = fixStrategy;
        }
    }
}
