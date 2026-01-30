package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 代码扫描结果实体
 */
@Data
@Entity
@Table(name = "code_scan_results", indexes = {
    @Index(name = "idx_pipeline_execution_id", columnList = "pipeline_execution_id"),
    @Index(name = "idx_scan_tool", columnList = "scan_tool"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class CodeScanResult {
    
    /**
     * 扫描工具类型
     */
    public enum ScanTool {
        ESLINT,
        CHECKSTYLE,
        SONARQUBE
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 关联的流程执行ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_execution_id")
    private PipelineExecution pipelineExecution;
    
    /**
     * 扫描工具
     */
    @Column(name = "scan_tool", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ScanTool scanTool;
    
    /**
     * 扫描分数（0-100）
     */
    @Column(name = "score")
    private Double score;
    
    /**
     * 总问题数
     */
    @Column(name = "total_issues")
    private Integer totalIssues;
    
    /**
     * 严重问题数
     */
    @Column(name = "critical_issues")
    private Integer criticalIssues;
    
    /**
     * 高级问题数
     */
    @Column(name = "major_issues")
    private Integer majorIssues;
    
    /**
     * 次要问题数
     */
    @Column(name = "minor_issues")
    private Integer minorIssues;
    
    /**
     * 扫描结果详情（JSON格式）
     */
    @Column(name = "result_details", columnDefinition = "TEXT")
    private String resultDetails;
    
    /**
     * 扫描报告文件路径
     */
    @Column(name = "report_file_path", length = 500)
    private String reportFilePath;
    
    /**
     * 是否通过质量门禁
     */
    @Column(name = "quality_gate_passed")
    private Boolean qualityGatePassed;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
