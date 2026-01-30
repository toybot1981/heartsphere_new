package com.heartsphere.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.CodeScanResult;
import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.repository.CodeScanResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * 代码扫描结果解析器
 */
@Component
public class CodeScanResultParser {
    
    private static final Logger logger = LoggerFactory.getLogger(CodeScanResultParser.class);
    
    @Autowired
    private CodeScanResultRepository codeScanResultRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 解析 ESLint 扫描结果
     */
    public CodeScanResult parseESLintResult(PipelineExecution execution, String outputPath) {
        CodeScanResult result = new CodeScanResult();
        result.setPipelineExecution(execution);
        result.setScanTool(CodeScanResult.ScanTool.ESLINT);
        
        try {
            // TODO: 解析 ESLint JSON 输出
            // 示例：读取 ESLint JSON 报告文件
            if (outputPath != null && new File(outputPath).exists()) {
                try {
                    String jsonContent = new String(Files.readAllBytes(Paths.get(outputPath)));
                    // 解析 JSON 并提取问题统计
                    // result.setScore(...);
                    // result.setTotalIssues(...);
                    // result.setCriticalIssues(...);
                    logger.info("ESLint output file read: {} bytes", jsonContent.length());
                } catch (Exception e) {
                    logger.warn("Failed to read ESLint output file", e);
                }
            }
            
            // 临时实现：从输出中提取信息
            result.setScore(85.0);
            result.setTotalIssues(10);
            result.setCriticalIssues(0);
            result.setMajorIssues(2);
            result.setMinorIssues(8);
            
        } catch (Exception e) {
            logger.error("Failed to parse ESLint result", e);
            result.setScore(0.0);
        }
        
        return codeScanResultRepository.save(result);
    }
    
    /**
     * 解析 Checkstyle 扫描结果
     */
    public CodeScanResult parseCheckstyleResult(PipelineExecution execution, String outputPath) {
        CodeScanResult result = new CodeScanResult();
        result.setPipelineExecution(execution);
        result.setScanTool(CodeScanResult.ScanTool.CHECKSTYLE);
        
        try {
            // TODO: 解析 Checkstyle XML 输出
            // 示例：读取 Checkstyle XML 报告文件
            if (outputPath != null && new File(outputPath).exists()) {
                // 解析 XML 并提取问题统计
            }
            
            // 临时实现
            result.setScore(90.0);
            result.setTotalIssues(5);
            result.setCriticalIssues(0);
            result.setMajorIssues(1);
            result.setMinorIssues(4);
            
        } catch (Exception e) {
            logger.error("Failed to parse Checkstyle result", e);
            result.setScore(0.0);
        }
        
        return codeScanResultRepository.save(result);
    }
    
    /**
     * 解析 SonarQube 扫描结果
     */
    public CodeScanResult parseSonarQubeResult(PipelineExecution execution, String outputPath) {
        CodeScanResult result = new CodeScanResult();
        result.setPipelineExecution(execution);
        result.setScanTool(CodeScanResult.ScanTool.SONARQUBE);
        
        try {
            // TODO: 解析 SonarQube API 响应或报告文件
            // 示例：调用 SonarQube API 获取质量门禁结果
            
            // 临时实现
            result.setScore(88.0);
            result.setTotalIssues(15);
            result.setCriticalIssues(1);
            result.setMajorIssues(3);
            result.setMinorIssues(11);
            
        } catch (Exception e) {
            logger.error("Failed to parse SonarQube result", e);
            result.setScore(0.0);
        }
        
        return codeScanResultRepository.save(result);
    }
    
    /**
     * 从脚本执行输出中解析扫描结果
     */
    public CodeScanResult parseFromScriptOutput(PipelineExecution execution, String scriptId, String output) {
        CodeScanResult result = new CodeScanResult();
        result.setPipelineExecution(execution);
        
        // 根据脚本ID确定扫描工具类型
        if (scriptId.contains("eslint")) {
            result.setScanTool(CodeScanResult.ScanTool.ESLINT);
            return parseESLintResult(execution, null);
        } else if (scriptId.contains("checkstyle")) {
            result.setScanTool(CodeScanResult.ScanTool.CHECKSTYLE);
            return parseCheckstyleResult(execution, null);
        } else if (scriptId.contains("sonar")) {
            result.setScanTool(CodeScanResult.ScanTool.SONARQUBE);
            return parseSonarQubeResult(execution, null);
        }
        
        return null;
    }
}
