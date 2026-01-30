package com.heartsphere.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.*;
import com.heartsphere.admin.repository.*;
import com.heartsphere.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 流程执行服务
 */
@Service
public class PipelineExecutionService {
    
    private static final Logger logger = LoggerFactory.getLogger(PipelineExecutionService.class);
    
    @Autowired
    private PipelineExecutionRepository executionRepository;
    
    @Autowired
    private PipelineStepExecutionRepository stepExecutionRepository;
    
    @Autowired
    private DeploymentPipelineService pipelineService;
    
    @Autowired
    private PipelineExecutionEngine executionEngine;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 执行流程
     */
    @Transactional
    public PipelineExecutionResponse executePipeline(PipelineExecutionRequest request, SystemAdmin admin) {
        // 获取流程模板（已包含 steps，因为 getPipelineEntity 使用了 JOIN FETCH）
        DeploymentPipeline pipeline = pipelineService.getPipelineEntity(request.getPipelineId());
        
        // 确保 steps 已加载（在事务内访问一次，触发加载）
        if (pipeline.getSteps() != null) {
            pipeline.getSteps().size(); // 触发延迟加载
        }
        
        // 创建流程执行记录
        PipelineExecution execution = new PipelineExecution();
        execution.setPipeline(pipeline);
        execution.setStatus(PipelineExecution.ExecutionStatus.RUNNING);
        execution.setStartedAt(LocalDateTime.now());
        execution.setExecutedBy(admin);
        
        execution = executionRepository.save(execution);
        
        // 异步执行流程
        Map<String, Object> globalParameters = request.getParameters() != null ? request.getParameters() : Map.of();
        List<Long> skipSteps = request.getSkipSteps() != null ? request.getSkipSteps() : List.of();
        Map<String, String> envVars = request.getEnvironmentVariables() != null ? request.getEnvironmentVariables() : Map.of();
        executionEngine.executeAsync(execution, globalParameters, skipSteps, envVars);
        
        PipelineExecutionResponse response = new PipelineExecutionResponse();
        response.setExecutionId(execution.getId());
        response.setStatus(execution.getStatus().name());
        response.setMessage("流程执行已启动");
        
        return response;
    }
    
    /**
     * 获取流程执行状态
     */
    @Transactional(readOnly = true)
    public PipelineExecutionDTO getExecutionStatus(Long executionId) {
        // 使用 JOIN FETCH 立即加载 stepExecutions，避免 LazyInitializationException
        PipelineExecution execution = executionRepository.findByIdWithStepExecutions(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("流程执行记录不存在: " + executionId));
        
        // 在事务内触发 stepExecutions 加载，确保所有延迟加载的集合都已初始化
        if (execution.getStepExecutions() != null) {
            int size = execution.getStepExecutions().size(); // 触发延迟加载
            // 访问每个步骤执行，确保集合完全初始化
            execution.getStepExecutions().forEach(stepExecution -> {
                stepExecution.getId(); // 触发步骤执行的延迟加载属性
            });
            logger.info("PipelineExecution {} has {} step executions", executionId, size);
        } else {
            logger.warn("PipelineExecution {} has null step executions", executionId);
        }
        
        return toDTO(execution);
    }
    
    /**
     * 获取流程执行详情
     */
    @Transactional(readOnly = true)
    public PipelineExecutionDTO getExecutionDetail(Long executionId) {
        // 使用 JOIN FETCH 立即加载 stepExecutions，避免 LazyInitializationException
        PipelineExecution execution = executionRepository.findByIdWithStepExecutions(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("流程执行记录不存在: " + executionId));
        
        // 在事务内触发 stepExecutions 加载，确保所有延迟加载的集合都已初始化
        if (execution.getStepExecutions() != null) {
            int size = execution.getStepExecutions().size(); // 触发延迟加载
            // 访问每个步骤执行，确保集合完全初始化
            execution.getStepExecutions().forEach(stepExecution -> {
                stepExecution.getId(); // 触发步骤执行的延迟加载属性
            });
            logger.info("PipelineExecution {} has {} step executions", executionId, size);
        } else {
            logger.warn("PipelineExecution {} has null step executions", executionId);
        }
        
        return toDTO(execution);
    }
    
    /**
     * 取消流程执行
     */
    @Transactional
    public void cancelExecution(Long executionId, SystemAdmin admin) {
        PipelineExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("流程执行记录不存在: " + executionId));
        
        if (execution.getStatus() != PipelineExecution.ExecutionStatus.RUNNING) {
            throw new RuntimeException("流程不在运行中，无法取消");
        }
        
        executionEngine.cancelExecution(executionId);
    }
    
    /**
     * 获取流程执行历史
     */
    @Transactional(readOnly = true)
    public Page<PipelineExecutionDTO> getExecutionHistory(Pageable pageable, Long pipelineId, Long executedById) {
        try {
            List<PipelineExecution> allExecutions;
            
            if (pipelineId != null) {
                // 使用 JOIN FETCH 立即加载 stepExecutions，避免 LazyInitializationException
                allExecutions = executionRepository.findByPipelineIdWithStepExecutions(pipelineId);
            } else if (executedById != null) {
                // 使用 JOIN FETCH 立即加载 stepExecutions，避免 LazyInitializationException
                allExecutions = executionRepository.findByExecutedByIdWithStepExecutions(executedById);
            } else {
                // 使用 JOIN FETCH 立即加载 stepExecutions，避免 LazyInitializationException
                allExecutions = executionRepository.findAllWithStepExecutions();
            }
            
            // 在事务内触发 stepExecutions 加载，确保所有延迟加载的集合都已初始化
            allExecutions.forEach(execution -> {
                if (execution.getStepExecutions() != null) {
                    int size = execution.getStepExecutions().size(); // 触发延迟加载
                    execution.getStepExecutions().forEach(stepExecution -> {
                        stepExecution.getId(); // 触发步骤执行的延迟加载属性
                    });
                }
            });
            
            // 手动分页（因为 JOIN FETCH 不能直接用于 Page 查询）
            int page = pageable.getPageNumber();
            int size = pageable.getPageSize();
            int start = page * size;
            int end = Math.min(start + size, allExecutions.size());
            // 使用 stream 和 skip/limit 进行安全分页
            List<PipelineExecution> pagedExecutions = allExecutions.stream()
                    .skip(start)
                    .limit(size)
                    .collect(Collectors.toList());
            
            // 转换为 DTO
            List<PipelineExecutionDTO> dtoList = pagedExecutions.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            
            // 创建分页结果
            return new PageImpl<>(
                    dtoList,
                    pageable,
                    allExecutions.size()
            );
        } catch (Exception e) {
            logger.error("获取流程执行历史失败", e);
            // 如果表不存在，返回空分页结果而不是抛出异常
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                logger.warn("数据库表不存在，返回空结果。请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
                return org.springframework.data.domain.Page.empty(pageable);
            }
            throw e;
        }
    }
    
    /**
     * 获取流程实体（供其他服务使用）
     */
    public PipelineExecution getExecutionEntity(Long executionId) {
        return executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("流程执行记录不存在: " + executionId));
    }
    
    /**
     * 转换为DTO
     * 注意：pipeline 已通过 JOIN FETCH 加载，但只访问基本属性（id, name），不访问 steps 集合
     * 这样可以避免 MultipleBagFetchException
     */
    private PipelineExecutionDTO toDTO(PipelineExecution execution) {
        PipelineExecutionDTO dto = new PipelineExecutionDTO();
        dto.setId(execution.getId());
        // pipeline 已通过 JOIN FETCH 加载，可以安全访问基本属性
        // 但不要访问 pipeline.getSteps()，因为那会触发另一个集合的加载
        DeploymentPipeline pipeline = execution.getPipeline();
        dto.setPipelineId(pipeline != null ? pipeline.getId() : null);
        dto.setPipelineName(pipeline != null ? pipeline.getName() : null);
        dto.setStatus(execution.getStatus().name());
        dto.setStartedAt(execution.getStartedAt());
        dto.setFinishedAt(execution.getFinishedAt());
        dto.setExecutedById(execution.getExecutedBy() != null ? execution.getExecutedBy().getId() : null);
        dto.setExecutedByUsername(execution.getExecutedBy() != null ? execution.getExecutedBy().getUsername() : null);
        dto.setDurationSeconds(execution.getDurationSeconds());
        
        // 转换步骤执行记录
        if (execution.getStepExecutions() != null && !execution.getStepExecutions().isEmpty()) {
            dto.setStepExecutions(execution.getStepExecutions().stream()
                    .map(this::stepExecutionToDTO)
                    .collect(Collectors.toList()));
            
            // 计算统计信息
            dto.setTotalSteps(execution.getStepExecutions().size());
            dto.setCompletedSteps((int) execution.getStepExecutions().stream()
                    .filter(se -> se.getStatus() != PipelineStepExecution.StepStatus.PENDING)
                    .count());
            dto.setSuccessSteps((int) execution.getStepExecutions().stream()
                    .filter(se -> se.getStatus() == PipelineStepExecution.StepStatus.SUCCESS)
                    .count());
            dto.setFailedSteps((int) execution.getStepExecutions().stream()
                    .filter(se -> se.getStatus() == PipelineStepExecution.StepStatus.FAILED)
                    .count());
        } else {
            // 确保 stepExecutions 字段不为 null（返回空列表）
            dto.setStepExecutions(java.util.Collections.emptyList());
            dto.setTotalSteps(0);
            dto.setCompletedSteps(0);
            dto.setSuccessSteps(0);
            dto.setFailedSteps(0);
        }
        
        return dto;
    }
    
    /**
     * 步骤执行记录转换为DTO
     */
    private PipelineStepExecutionDTO stepExecutionToDTO(PipelineStepExecution stepExecution) {
        PipelineStepExecutionDTO dto = new PipelineStepExecutionDTO();
        dto.setId(stepExecution.getId());
        dto.setPipelineExecutionId(stepExecution.getPipelineExecution() != null ? 
                stepExecution.getPipelineExecution().getId() : null);
        
        // 处理 step 为 null 的情况（错误步骤执行记录）
        if (stepExecution.getStep() == null) {
            dto.setStepName("流程初始化错误");
            dto.setStepId(null);
            dto.setScriptId(null);
            dto.setScriptName(null);
        } else {
            dto.setStepId(stepExecution.getStep().getId());
            dto.setStepName(stepExecution.getStep().getName());
            dto.setScriptId(stepExecution.getStep().getScriptId());
        }
        
        dto.setScriptExecutionId(stepExecution.getScriptExecution() != null ? 
                stepExecution.getScriptExecution().getId() : null);
        dto.setStatus(stepExecution.getStatus().name());
        dto.setStartedAt(stepExecution.getStartedAt());
        dto.setFinishedAt(stepExecution.getFinishedAt());
        dto.setError(stepExecution.getError());
        dto.setDurationSeconds(stepExecution.getDurationSeconds());
        
        // 获取脚本名称
        if (stepExecution.getScriptExecution() != null) {
            dto.setScriptName(stepExecution.getScriptExecution().getScriptName());
        }
        
        return dto;
    }
}
