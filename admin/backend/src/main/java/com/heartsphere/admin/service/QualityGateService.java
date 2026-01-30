package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.CodeScanResult;
import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.entity.TestResult;
import com.heartsphere.admin.repository.CodeScanResultRepository;
import com.heartsphere.admin.repository.TestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 质量门禁服务
 */
@Service
public class QualityGateService {
    
    private static final Logger logger = LoggerFactory.getLogger(QualityGateService.class);
    
    @Autowired
    private CodeScanResultRepository codeScanResultRepository;
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    // 默认质量门禁阈值
    private static final double DEFAULT_SCAN_SCORE_THRESHOLD = 80.0;
    private static final int DEFAULT_CRITICAL_ISSUES_MAX = 0;
    private static final double DEFAULT_TEST_COVERAGE_THRESHOLD = 80.0;
    private static final double DEFAULT_TEST_PASS_RATE_THRESHOLD = 100.0;
    
    /**
     * 评估质量门禁
     */
    public QualityGateResult evaluateQualityGate(PipelineExecution execution) {
        QualityGateResult result = new QualityGateResult();
        result.setPassed(true);
        result.setMessages(new java.util.ArrayList<>());
        
        // 检查代码扫描结果
        List<CodeScanResult> scanResults = codeScanResultRepository.findByPipelineExecution(execution);
        for (CodeScanResult scanResult : scanResults) {
            if (!evaluateScanResult(scanResult, result)) {
                result.setPassed(false);
            }
        }
        
        // 检查测试结果
        List<TestResult> testResults = testResultRepository.findByPipelineExecution(execution);
        for (TestResult testResult : testResults) {
            if (!evaluateTestResult(testResult, result)) {
                result.setPassed(false);
            }
        }
        
        return result;
    }
    
    /**
     * 评估代码扫描结果
     */
    private boolean evaluateScanResult(CodeScanResult scanResult, QualityGateResult result) {
        boolean passed = true;
        
        // 检查扫描分数
        if (scanResult.getScore() != null && scanResult.getScore() < DEFAULT_SCAN_SCORE_THRESHOLD) {
            result.getMessages().add(String.format(
                "代码扫描分数 %.2f 低于阈值 %.2f", 
                scanResult.getScore(), 
                DEFAULT_SCAN_SCORE_THRESHOLD
            ));
            passed = false;
        }
        
        // 检查严重问题数
        if (scanResult.getCriticalIssues() != null && 
            scanResult.getCriticalIssues() > DEFAULT_CRITICAL_ISSUES_MAX) {
            result.getMessages().add(String.format(
                "发现 %d 个严重问题，超过允许的最大值 %d", 
                scanResult.getCriticalIssues(), 
                DEFAULT_CRITICAL_ISSUES_MAX
            ));
            passed = false;
        }
        
        scanResult.setQualityGatePassed(passed);
        codeScanResultRepository.save(scanResult);
        
        return passed;
    }
    
    /**
     * 评估测试结果
     */
    private boolean evaluateTestResult(TestResult testResult, QualityGateResult result) {
        boolean passed = true;
        
        // 检查测试通过率
        if (testResult.getTotalTests() != null && testResult.getTotalTests() > 0) {
            double passRate = (double) testResult.getPassedTests() / testResult.getTotalTests() * 100;
            if (passRate < DEFAULT_TEST_PASS_RATE_THRESHOLD) {
                result.getMessages().add(String.format(
                    "%s 测试通过率 %.2f%% 低于阈值 %.2f%%", 
                    testResult.getTestType(),
                    passRate,
                    DEFAULT_TEST_PASS_RATE_THRESHOLD
                ));
                passed = false;
            }
        }
        
        // 检查测试覆盖率
        if (testResult.getCoveragePercentage() != null && 
            testResult.getCoveragePercentage() < DEFAULT_TEST_COVERAGE_THRESHOLD) {
            result.getMessages().add(String.format(
                "%s 测试覆盖率 %.2f%% 低于阈值 %.2f%%", 
                testResult.getTestType(),
                testResult.getCoveragePercentage(),
                DEFAULT_TEST_COVERAGE_THRESHOLD
            ));
            passed = false;
        }
        
        testResult.setQualityGatePassed(passed);
        testResultRepository.save(testResult);
        
        return passed;
    }
    
    /**
     * 质量门禁结果
     */
    public static class QualityGateResult {
        private boolean passed;
        private List<String> messages;
        
        public boolean isPassed() {
            return passed;
        }
        
        public void setPassed(boolean passed) {
            this.passed = passed;
        }
        
        public List<String> getMessages() {
            return messages;
        }
        
        public void setMessages(List<String> messages) {
            this.messages = messages;
        }
    }
}
