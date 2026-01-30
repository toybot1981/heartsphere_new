package com.heartsphere.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.entity.TestResult;
import com.heartsphere.admin.repository.TestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 测试结果解析器
 */
@Component
public class TestResultParser {
    
    private static final Logger logger = LoggerFactory.getLogger(TestResultParser.class);
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 解析 Maven 测试结果（JUnit）
     */
    public TestResult parseMavenTestResult(PipelineExecution execution, String output) {
        TestResult result = new TestResult();
        result.setPipelineExecution(execution);
        result.setTestType(TestResult.TestType.UNIT);
        
        try {
            // 解析 Maven 测试输出
            // 示例模式：Tests run: 100, Failures: 2, Errors: 0, Skipped: 5
            Pattern pattern = Pattern.compile(
                "Tests run: (\\d+), Failures: (\\d+), Errors: (\\d+), Skipped: (\\d+)"
            );
            Matcher matcher = pattern.matcher(output);
            
            if (matcher.find()) {
                int total = Integer.parseInt(matcher.group(1));
                int failures = Integer.parseInt(matcher.group(2));
                int errors = Integer.parseInt(matcher.group(3));
                int skipped = Integer.parseInt(matcher.group(4));
                int passed = total - failures - errors - skipped;
                
                result.setTotalTests(total);
                result.setPassedTests(passed);
                result.setFailedTests(failures + errors);
                result.setSkippedTests(skipped);
            }
            
            // 解析测试覆盖率（如果存在）
            Pattern coveragePattern = Pattern.compile("Total.*?([\\d.]+)%");
            Matcher coverageMatcher = coveragePattern.matcher(output);
            if (coverageMatcher.find()) {
                result.setCoveragePercentage(Double.parseDouble(coverageMatcher.group(1)));
            }
            
            // 解析执行时长
            Pattern durationPattern = Pattern.compile("Time elapsed: ([\\d.]+) s");
            Matcher durationMatcher = durationPattern.matcher(output);
            if (durationMatcher.find()) {
                result.setDurationSeconds((long) Double.parseDouble(durationMatcher.group(1)));
            }
            
        } catch (Exception e) {
            logger.error("Failed to parse Maven test result", e);
        }
        
        return testResultRepository.save(result);
    }
    
    /**
     * 解析 Jest/Vitest 测试结果
     */
    public TestResult parseJestTestResult(PipelineExecution execution, String output) {
        TestResult result = new TestResult();
        result.setPipelineExecution(execution);
        result.setTestType(TestResult.TestType.UNIT);
        
        try {
            // 解析 Jest/Vitest 输出
            // 示例模式：Tests: 50 passed, 2 failed, 3 skipped
            Pattern pattern = Pattern.compile(
                "Tests:\\s*(\\d+)\\s*passed,\\s*(\\d+)\\s*failed,\\s*(\\d+)\\s*skipped"
            );
            Matcher matcher = pattern.matcher(output);
            
            if (matcher.find()) {
                int passed = Integer.parseInt(matcher.group(1));
                int failed = Integer.parseInt(matcher.group(2));
                int skipped = Integer.parseInt(matcher.group(3));
                int total = passed + failed + skipped;
                
                result.setTotalTests(total);
                result.setPassedTests(passed);
                result.setFailedTests(failed);
                result.setSkippedTests(skipped);
            }
            
            // 解析覆盖率
            Pattern coveragePattern = Pattern.compile("Statements\\s*:\\s*([\\d.]+)%");
            Matcher coverageMatcher = coveragePattern.matcher(output);
            if (coverageMatcher.find()) {
                result.setCoveragePercentage(Double.parseDouble(coverageMatcher.group(1)));
            }
            
        } catch (Exception e) {
            logger.error("Failed to parse Jest test result", e);
        }
        
        return testResultRepository.save(result);
    }
    
    /**
     * 解析集成测试结果
     */
    public TestResult parseIntegrationTestResult(PipelineExecution execution, String output) {
        TestResult result = new TestResult();
        result.setPipelineExecution(execution);
        result.setTestType(TestResult.TestType.INTEGRATION);
        
        // 使用类似的解析逻辑
        return parseMavenTestResult(execution, output);
    }
    
    /**
     * 解析 E2E 测试结果
     */
    public TestResult parseE2ETestResult(PipelineExecution execution, String output) {
        TestResult result = new TestResult();
        result.setPipelineExecution(execution);
        result.setTestType(TestResult.TestType.E2E);
        
        // 使用类似的解析逻辑
        return parseJestTestResult(execution, output);
    }
    
    /**
     * 从脚本执行输出中解析测试结果
     */
    public TestResult parseFromScriptOutput(PipelineExecution execution, String scriptId, String output) {
        if (scriptId.contains("maven") || scriptId.contains("test")) {
            if (scriptId.contains("integration")) {
                return parseIntegrationTestResult(execution, output);
            } else {
                return parseMavenTestResult(execution, output);
            }
        } else if (scriptId.contains("jest") || scriptId.contains("vitest") || scriptId.contains("e2e")) {
            return parseE2ETestResult(execution, output);
        }
        
        // 默认解析为单元测试
        return parseMavenTestResult(execution, output);
    }
}
