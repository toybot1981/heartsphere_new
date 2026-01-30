package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 测试结果实体
 */
@Data
@Entity
@Table(name = "test_results", indexes = {
    @Index(name = "idx_pipeline_execution_id", columnList = "pipeline_execution_id"),
    @Index(name = "idx_test_type", columnList = "test_type"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class TestResult {
    
    /**
     * 测试类型
     */
    public enum TestType {
        UNIT,           // 单元测试
        INTEGRATION,    // 集成测试
        E2E,            // 端到端测试
        PERFORMANCE,    // 性能测试
        SECURITY        // 安全测试
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
     * 测试类型
     */
    @Column(name = "test_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private TestType testType;
    
    /**
     * 总测试数
     */
    @Column(name = "total_tests")
    private Integer totalTests;
    
    /**
     * 通过测试数
     */
    @Column(name = "passed_tests")
    private Integer passedTests;
    
    /**
     * 失败测试数
     */
    @Column(name = "failed_tests")
    private Integer failedTests;
    
    /**
     * 跳过测试数
     */
    @Column(name = "skipped_tests")
    private Integer skippedTests;
    
    /**
     * 测试覆盖率（百分比）
     */
    @Column(name = "coverage_percentage")
    private Double coveragePercentage;
    
    /**
     * 测试执行时长（秒）
     */
    @Column(name = "duration_seconds")
    private Long durationSeconds;
    
    /**
     * 测试结果详情（JSON格式）
     */
    @Column(name = "result_details", columnDefinition = "TEXT")
    private String resultDetails;
    
    /**
     * 测试报告文件路径
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
