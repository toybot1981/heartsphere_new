package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 自动修复记录实体
 */
@Data
@Entity
@Table(name = "auto_fix_records", indexes = {
    @Index(name = "idx_pipeline_execution_id", columnList = "pipeline_execution_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class AutoFixRecord {
    
    /**
     * 修复状态
     */
    public enum FixStatus {
        PENDING,        // 待处理
        PROPOSED,      // 已提议（等待审批）
        APPROVED,      // 已批准
        APPLIED,       // 已应用
        VERIFIED,      // 已验证
        FAILED,        // 失败
        REJECTED,      // 已拒绝
        ROLLED_BACK    // 已回滚
    }
    
    /**
     * 问题类型
     */
    public enum ProblemType {
        CODE_QUALITY,      // 代码质量
        TEST_FAILURE,      // 测试失败
        BUILD_FAILURE,     // 构建失败
        DEPLOYMENT_FAILURE, // 部署失败
        CONFIGURATION      // 配置问题
    }
    
    /**
     * 风险级别
     */
    public enum RiskLevel {
        LOW,     // 低风险
        MEDIUM,  // 中风险
        HIGH     // 高风险
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
     * 问题类型
     */
    @Column(name = "problem_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ProblemType problemType;
    
    /**
     * 问题描述
     */
    @Column(name = "problem_description", columnDefinition = "TEXT")
    private String problemDescription;
    
    /**
     * 问题详情（JSON格式）
     */
    @Column(name = "problem_details", columnDefinition = "TEXT")
    private String problemDetails;
    
    /**
     * 修复方案
     */
    @Column(name = "fix_solution", columnDefinition = "TEXT")
    private String fixSolution;
    
    /**
     * 修复详情（JSON格式）
     */
    @Column(name = "fix_details", columnDefinition = "TEXT")
    private String fixDetails;
    
    /**
     * 风险级别
     */
    @Column(name = "risk_level", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;
    
    /**
     * 修复状态
     */
    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private FixStatus status;
    
    /**
     * 修复前状态（JSON格式）
     */
    @Column(name = "before_state", columnDefinition = "TEXT")
    private String beforeState;
    
    /**
     * 修复后状态（JSON格式）
     */
    @Column(name = "after_state", columnDefinition = "TEXT")
    private String afterState;
    
    /**
     * 修复是否有效
     */
    @Column(name = "fix_effective")
    private Boolean fixEffective;
    
    /**
     * 修复验证结果
     */
    @Column(name = "verification_result", columnDefinition = "TEXT")
    private String verificationResult;
    
    /**
     * 审批人ID
     */
    @Column(name = "approved_by")
    private Long approvedBy;
    
    /**
     * 审批时间
     */
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    /**
     * 应用时间
     */
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
    
    /**
     * 验证时间
     */
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
