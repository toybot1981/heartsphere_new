package com.heartsphere.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.*;
import com.heartsphere.admin.entity.AutoFixRecord.*;
import com.heartsphere.admin.repository.AutoFixRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 自动修复服务
 */
@Service
public class AutoFixService {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoFixService.class);
    
    @Autowired
    private AutoFixRecordRepository autoFixRecordRepository;
    
    @Autowired
    private ProblemDetectionService problemDetectionService;
    
    @Autowired
    private CodeQualityFixer codeQualityFixer;
    
    @Autowired
    private TestFixer testFixer;
    
    @Autowired
    private ConfigurationFixer configurationFixer;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 检测并修复流程执行中的问题
     */
    @Transactional
    public List<AutoFixRecord> detectAndFix(PipelineExecution execution) {
        logger.info("开始检测和修复流程执行 {} 中的问题", execution.getId());
        
        // 检测问题
        List<ProblemDetectionService.DetectedProblem> problems = 
            problemDetectionService.detectProblems(execution);
        
        List<AutoFixRecord> fixRecords = new java.util.ArrayList<>();
        
        for (ProblemDetectionService.DetectedProblem problem : problems) {
            // 判断是否可以自动修复
            if (canAutoFix(problem)) {
                AutoFixRecord fixRecord = createFixRecord(execution, problem);
                
                // 根据风险级别决定是否需要审批
                if (problem.getRiskLevel() == RiskLevel.LOW) {
                    // 低风险问题直接应用
                    applyFix(fixRecord);
                } else {
                    // 中高风险问题需要审批
                    fixRecord.setStatus(FixStatus.PROPOSED);
                }
                
                fixRecord = autoFixRecordRepository.save(fixRecord);
                fixRecords.add(fixRecord);
            }
        }
        
        return fixRecords;
    }
    
    /**
     * 判断是否可以自动修复
     */
    private boolean canAutoFix(ProblemDetectionService.DetectedProblem problem) {
        // TODO: 根据问题类型和详情判断是否可以自动修复
        return true; // 临时实现
    }
    
    /**
     * 创建修复记录
     */
    private AutoFixRecord createFixRecord(PipelineExecution execution, 
                                          ProblemDetectionService.DetectedProblem problem) {
        AutoFixRecord record = new AutoFixRecord();
        record.setPipelineExecution(execution);
        record.setProblemType(problem.getProblemType());
        record.setProblemDescription(problem.getDescription());
        record.setRiskLevel(problem.getRiskLevel());
        record.setStatus(FixStatus.PENDING);
        
        try {
            record.setProblemDetails(objectMapper.writeValueAsString(problem.getDetails()));
        } catch (Exception e) {
            logger.warn("Failed to serialize problem details", e);
        }
        
        return record;
    }
    
    /**
     * 应用修复
     */
    @Transactional
    public void applyFix(AutoFixRecord fixRecord) {
        logger.info("应用修复记录 {}", fixRecord.getId());
        
        try {
            // 保存修复前状态
            saveBeforeState(fixRecord);
            
            // 根据问题类型选择修复器
            boolean success = false;
            String fixSolution = "";
            Map<String, Object> fixDetails = new HashMap<>();
            
            switch (fixRecord.getProblemType()) {
                case CODE_QUALITY:
                    success = codeQualityFixer.fix(fixRecord, fixDetails);
                    fixSolution = "代码质量修复";
                    break;
                case TEST_FAILURE:
                    success = testFixer.fix(fixRecord, fixDetails);
                    fixSolution = "测试修复";
                    break;
                case CONFIGURATION:
                    success = configurationFixer.fix(fixRecord, fixDetails);
                    fixSolution = "配置修复";
                    break;
                default:
                    logger.warn("未知的问题类型: {}", fixRecord.getProblemType());
            }
            
            if (success) {
                fixRecord.setStatus(FixStatus.APPLIED);
                fixRecord.setAppliedAt(LocalDateTime.now());
                fixRecord.setFixSolution(fixSolution);
                
                try {
                    fixRecord.setFixDetails(objectMapper.writeValueAsString(fixDetails));
                } catch (Exception e) {
                    logger.warn("Failed to serialize fix details", e);
                }
                
                // 保存修复后状态
                saveAfterState(fixRecord);
            } else {
                fixRecord.setStatus(FixStatus.FAILED);
            }
            
            autoFixRecordRepository.save(fixRecord);
            
        } catch (Exception e) {
            logger.error("Failed to apply fix", e);
            fixRecord.setStatus(FixStatus.FAILED);
            autoFixRecordRepository.save(fixRecord);
        }
    }
    
    /**
     * 保存修复前状态
     */
    private void saveBeforeState(AutoFixRecord fixRecord) {
        // TODO: 保存修复前的代码、配置等状态
        Map<String, Object> beforeState = new HashMap<>();
        beforeState.put("timestamp", LocalDateTime.now().toString());
        // ... 保存更多状态信息
        
        try {
            fixRecord.setBeforeState(objectMapper.writeValueAsString(beforeState));
        } catch (Exception e) {
            logger.warn("Failed to serialize before state", e);
        }
    }
    
    /**
     * 保存修复后状态
     */
    private void saveAfterState(AutoFixRecord fixRecord) {
        // TODO: 保存修复后的代码、配置等状态
        Map<String, Object> afterState = new HashMap<>();
        afterState.put("timestamp", LocalDateTime.now().toString());
        // ... 保存更多状态信息
        
        try {
            fixRecord.setAfterState(objectMapper.writeValueAsString(afterState));
        } catch (Exception e) {
            logger.warn("Failed to serialize after state", e);
        }
    }
    
    /**
     * 批准修复
     */
    @Transactional
    public void approveFix(Long fixRecordId, Long approvedBy) {
        AutoFixRecord fixRecord = autoFixRecordRepository.findById(fixRecordId)
            .orElseThrow(() -> new RuntimeException("修复记录不存在: " + fixRecordId));
        
        if (fixRecord.getStatus() != FixStatus.PROPOSED) {
            throw new RuntimeException("修复记录状态不正确，无法批准");
        }
        
        fixRecord.setApprovedBy(approvedBy);
        fixRecord.setApprovedAt(LocalDateTime.now());
        fixRecord.setStatus(FixStatus.APPROVED);
        autoFixRecordRepository.save(fixRecord);
        
        // 应用修复
        applyFix(fixRecord);
    }
    
    /**
     * 拒绝修复
     */
    @Transactional
    public void rejectFix(Long fixRecordId) {
        AutoFixRecord fixRecord = autoFixRecordRepository.findById(fixRecordId)
            .orElseThrow(() -> new RuntimeException("修复记录不存在: " + fixRecordId));
        
        if (fixRecord.getStatus() != FixStatus.PROPOSED) {
            throw new RuntimeException("修复记录状态不正确，无法拒绝");
        }
        
        fixRecord.setStatus(FixStatus.REJECTED);
        autoFixRecordRepository.save(fixRecord);
    }
    
    /**
     * 验证修复
     */
    @Transactional
    public void verifyFix(Long fixRecordId) {
        AutoFixRecord fixRecord = autoFixRecordRepository.findById(fixRecordId)
            .orElseThrow(() -> new RuntimeException("修复记录不存在: " + fixRecordId));
        
        if (fixRecord.getStatus() != FixStatus.APPLIED) {
            throw new RuntimeException("修复记录状态不正确，无法验证");
        }
        
        // TODO: 重新运行测试或流程，验证修复是否有效
        boolean effective = true; // 临时实现
        
        fixRecord.setFixEffective(effective);
        fixRecord.setVerifiedAt(LocalDateTime.now());
        fixRecord.setStatus(effective ? FixStatus.VERIFIED : FixStatus.FAILED);
        
        if (effective) {
            fixRecord.setVerificationResult("修复验证通过");
        } else {
            fixRecord.setVerificationResult("修复验证失败");
        }
        
        autoFixRecordRepository.save(fixRecord);
    }
    
    /**
     * 回滚修复
     */
    @Transactional
    public void rollbackFix(Long fixRecordId) {
        AutoFixRecord fixRecord = autoFixRecordRepository.findById(fixRecordId)
            .orElseThrow(() -> new RuntimeException("修复记录不存在: " + fixRecordId));
        
        // TODO: 恢复修复前的状态
        logger.info("回滚修复记录 {}", fixRecordId);
        
        fixRecord.setStatus(FixStatus.ROLLED_BACK);
        autoFixRecordRepository.save(fixRecord);
    }
}
